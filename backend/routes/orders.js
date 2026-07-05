const express = require("express");
const { supabase, supabaseService } = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = ["pending", "preparing", "ready", "served", "cancelled"];

async function serializeOrder(order) {
  const { data: items, error } = await supabaseService
    .from("order_items")
    .select("id, menu_item_id, name, price, quantity, station")
    .eq("order_id", order.id);
  
  if (error) return { ...order, items: [] };
  return { ...order, items };
}

// Déduit le stock des ingrédients selon la fiche technique de chaque plat commandé.
async function deductStockForOrder(orderId, resolvedItems) {
  for (const { menuItem, quantity } of resolvedItems) {
    const { data: recipe } = await supabaseService
      .from("recipe_items")
      .select("ingredient_id, quantity")
      .eq("menu_item_id", menuItem.id);
    
    if (!recipe) continue;

    for (const line of recipe) {
      const { data: ingredient } = await supabaseService
        .from("ingredients")
        .select("*")
        .eq("id", line.ingredient_id)
        .single();
      
      if (!ingredient) continue;
      
      const consumed = line.quantity * quantity;
      const newQuantity = Math.max(0, ingredient.quantity - consumed);
      
      await supabaseService
        .from("ingredients")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", ingredient.id);
        
      await supabaseService
        .from("stock_movements")
        .insert([{ ingredient_id: ingredient.id, change: -consumed, reason: `Commande #${orderId}` }]);
    }
  }
}

// Cas d'utilisation "Passer commande" — client (pour soi) ou serveur (pour une table).
router.post("/", authRequired, requireRole("customer", "waiter", "admin"), async (req, res) => {
  const {
    items,
    customer_name,
    customer_phone,
    customer_address = "",
    table_id = null,
    order_type = "sur_place",
    notes = "",
    payment_method = "cash",
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Le panier est vide." });
  }
  if (!customer_name || !customer_phone) {
    return res.status(400).json({ error: "Nom et téléphone du client sont requis." });
  }
  if (!["sur_place", "emporter", "livraison"].includes(order_type)) {
    return res.status(400).json({ error: "Type de commande invalide." });
  }
  if (order_type === "livraison" && !customer_address) {
    return res.status(400).json({ error: "L'adresse est requise pour une livraison." });
  }
  if (!["cash", "card"].includes(payment_method)) {
    return res.status(400).json({ error: "Mode de paiement invalide." });
  }

  const resolvedItems = [];
  let total = 0;

  for (const cartItem of items) {
    const { data: menuItem } = await supabaseService
      .from("menu_items")
      .select("*")
      .eq("id", cartItem.menu_item_id)
      .eq("available", 1)
      .single();
      
    if (!menuItem) {
      return res.status(400).json({ error: `Le plat #${cartItem.menu_item_id} n'est plus disponible.` });
    }
    const quantity = Math.max(1, parseInt(cartItem.quantity, 10) || 1);
    total += menuItem.price * quantity;
    resolvedItems.push({ menuItem, quantity });
  }

  const waiterId = req.user.role === "waiter" ? req.user.id : (req.body.waiter_id || null);
  const userId = req.user.role === "customer" ? req.user.id : (req.body.user_id || null);

  const { data: order, error: orderError } = await supabaseService
    .from("orders")
    .insert([{
      user_id: userId,
      table_id,
      waiter_id: waiterId,
      customer_name,
      customer_phone,
      customer_address,
      order_type,
      notes,
      payment_method,
      total: Math.round(total * 100) / 100
    }])
    .select()
    .single();

  if (orderError) return res.status(500).json({ error: orderError.message });

  const orderItems = resolvedItems.map(({ menuItem, quantity }) => ({
    order_id: order.id,
    menu_item_id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    quantity,
    station: menuItem.station
  }));
  
  await supabaseService.from("order_items").insert(orderItems);
  await deductStockForOrder(order.id, resolvedItems);
  
  if (table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'occupee' }).eq("id", table_id);
  }

  res.status(201).json({ order: await serializeOrder(order) });
});

// Liste des commandes. Filtrage selon le rôle :
router.get("/", authRequired, async (req, res) => {
  const { status, active_only } = req.query;
  let query = supabaseService.from("orders").select("*");

  if (req.user.role === "customer") {
    query = query.eq("user_id", req.user.id);
  } else if (req.user.role === "cook") {
    query = query.in("status", ["pending", "preparing"]);
  }

  if (status) query = query.eq("status", status);
  if (active_only) query = query.not("status", "in", "(served,cancelled)");

  const { data: orders, error } = await query.order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  const serializedOrders = await Promise.all(orders.map(serializeOrder));
  res.json({ orders: serializedOrders });
});

router.get("/:id", authRequired, async (req, res) => {
  const { data: order, error } = await supabaseService
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  if (error || !order) return res.status(404).json({ error: "Commande introuvable." });
  if (req.user.role === "customer" && order.user_id !== req.user.id) {
    return res.status(403).json({ error: "Vous n'avez pas accès à cette commande." });
  }
  res.json({ order: await serializeOrder(order) });
});

router.patch("/:id/status", authRequired, requireRole("admin", "waiter", "cook"), async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Statut invalide." });
  }
  
  const { data: existing, error: findError } = await supabaseService
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  if (findError || !existing) return res.status(404).json({ error: "Commande introuvable." });

  if (req.user.role === "cook" && !["preparing", "ready"].includes(status)) {
    return res.status(403).json({ error: "Le cuisinier ne peut faire passer la commande qu'en préparation ou prête." });
  }

  await supabaseService
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id);

  if (status === "served" && existing.table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'encaissement' }).eq("id", existing.table_id);
  }
  if (status === "cancelled" && existing.table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'libre' }).eq("id", existing.table_id);
  }

  const { data: order } = await supabaseService
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  res.json({ order: await serializeOrder(order) });
});

router.post("/:id/pay", authRequired, requireRole("admin", "waiter", "customer"), async (req, res) => {
  const { data: existing, error: findError } = await supabaseService
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  if (findError || !existing) return res.status(404).json({ error: "Commande introuvable." });
  
  if (req.user.role === "customer" && existing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Vous n'avez pas accès à cette commande." });
  }
  if (existing.payment_status === "paid") {
    return res.status(400).json({ error: "Cette commande est déjà payée." });
  }

  await supabaseService
    .from("orders")
    .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
    .eq("id", req.params.id);
    
  if (existing.table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'libre' }).eq("id", existing.table_id);
  }

  const { data: order } = await supabaseService
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  res.json({ order: await serializeOrder(order) });
});

module.exports = router;