const express = require("express");
const { supabase, supabaseService } = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();
// Dashboard dynamique pour les indicateurs clés
router.get("/dashboard", authRequired, async (req, res) => {
  const role = req.user.role;

  // 1. Ventes du jour (pour Admin)
  const today = new Date().toISOString().split('T')[0];
  const { data: salesData } = await supabaseService
    .from("orders")
    .select("total")
    .neq("status", "cancelled")
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);
  
  const totalSales = salesData ? salesData.reduce((sum, o) => sum + o.total, 0) : 0;

  // 2. Commandes actives
  const { count: activeOrdersCount } = await supabaseService
    .from("orders")
    .select("*", { count: 'exact', head: true })
    .not("status", "in", "(served,cancelled)");

  // 3. Tables occupées
  const { count: occupiedTablesCount } = await supabaseService
    .from("tables_restaurant")
    .select("*", { count: 'exact', head: true })
    .eq("status", "occupee");
    
  const { count: totalTablesCount } = await supabaseService
    .from("tables_restaurant")
    .select("*", { count: 'exact', head: true });

  // 4. Ingrédients critiques
  const { count: criticalStockCount } = await supabaseService
    .from("ingredients")
    .select("*", { count: 'exact', head: true })
    .filter("quantity", "lte", "threshold");

  res.json({
    role,
    sales: totalSales.toFixed(2),
    activeOrders: activeOrdersCount || 0,
    tableOccupancy: `${occupiedTablesCount || 0}/${totalTablesCount || 0}`,
    criticalStock: criticalStockCount || 0
  });
});

// Cas d'utilisation "Générer rapports" — bilans financiers et statistiques.
router.get("/summary", authRequired, requireRole("admin"), async (req, res) => {
  const { from, to } = req.query;
  const start = from || "1970-01-01";
  const end = to || "2999-12-31";

  const { data: orders } = await supabaseService
    .from("orders")
    .select("*")
    .neq("status", "cancelled")
    .gte("created_at", start)
    .lte("created_at", end);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const paidRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const averageTicket = orderCount ? revenue / orderCount : 0;

  const byDay = {};
  orders.forEach((o) => {
    const day = o.created_at.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + o.total;
  });

  // Top Items
  const orderIds = orders.map(o => o.id);
  const { data: orderItems } = await supabaseService
    .from("order_items")
    .select("name, quantity, price")
    .in("order_id", orderIds);
    
  const itemMap = {};
  orderItems.forEach(oi => {
      if(!itemMap[oi.name]) itemMap[oi.name] = { name: oi.name, quantity: 0, revenue: 0 };
      itemMap[oi.name].quantity += oi.quantity;
      itemMap[oi.name].revenue += oi.quantity * oi.price;
  });
  
  const topItemsRows = Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  const { data: lowStock } = await supabaseService
    .from("ingredients")
    .select("*")
    .filter("quantity", "lte", "threshold")
    .order("quantity", { ascending: true });

  res.json({
    revenue: Math.round(revenue * 100) / 100,
    paidRevenue: Math.round(paidRevenue * 100) / 100,
    orderCount,
    averageTicket: Math.round(averageTicket * 100) / 100,
    revenueByDay: Object.entries(byDay).map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 })),
    topItems: topItemsRows,
    lowStock: lowStock || [],
  });
});

module.exports = router;