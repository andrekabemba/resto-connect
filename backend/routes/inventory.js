const express = require("express");
const supabase = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

// Cas d'utilisation "Gérer inventaire" — suivi et contrôle des stocks.
router.get("/", authRequired, requireRole("admin"), async (req, res) => {
  const { data: ingredients, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ingredients });
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, unit = "unité", quantity = 0, threshold = 0 } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Le nom de l'ingrédient est requis." });
  }
  const { data: ingredient, error } = await supabase
    .from("ingredients")
    .insert([{ name: name.trim(), unit, quantity, threshold }])
    .select()
    .single();
  if (error) return res.status(409).json({ error: "Cet ingrédient existe déjà." });
  res.status(201).json({ ingredient });
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { data: existing, error: findError } = await supabase
    .from("ingredients")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (findError || !existing) return res.status(404).json({ error: "Ingrédient introuvable." });

  const { name = existing.name, unit = existing.unit, threshold = existing.threshold } = req.body;
  const { data: ingredient, error } = await supabase
    .from("ingredients")
    .update({ name, unit, threshold, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ingredient });
});

// Mouvement de stock manuel : réception de marchandise, perte, correction d'inventaire...
router.post("/:id/movement", authRequired, requireRole("admin"), async (req, res) => {
  const { data: existing, error: findError } = await supabase
    .from("ingredients")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (findError || !existing) return res.status(404).json({ error: "Ingrédient introuvable." });

  const { change, reason = "" } = req.body;
  const delta = parseFloat(change);
  if (Number.isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: "La variation de stock doit être un nombre non nul." });
  }

  const newQuantity = Math.max(0, existing.quantity + delta);
  
  const { error: updateError } = await supabase
    .from("ingredients")
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq("id", req.params.id);
  if (updateError) return res.status(500).json({ error: updateError.message });

  await supabase.from("stock_movements").insert([{ ingredient_id: req.params.id, change: delta, reason }]);

  const { data: ingredient } = await supabase
    .from("ingredients")
    .select("*")
    .eq("id", req.params.id)
    .single();
  res.json({ ingredient });
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { error } = await supabase.from("ingredients").delete().eq("id", req.params.id);
  if (error) return res.status(404).json({ error: "Ingrédient introuvable." });
  res.json({ success: true });
});

// Fiche technique d'un plat : ingrédients et quantités nécessaires.
router.get("/recipe/:menuItemId", authRequired, requireRole("admin"), async (req, res) => {
  const { data: recipe, error } = await supabase
    .from("recipe_items")
    .select("id, ingredient_id, quantity, ingredients(name, unit)")
    .eq("menu_item_id", req.params.menuItemId);
    
  if (error) return res.status(500).json({ error: error.message });
  
  const formattedRecipe = recipe.map(item => ({
      ...item,
      name: item.ingredients.name,
      unit: item.ingredients.unit
  }));
  res.json({ recipe: formattedRecipe });
});

router.put("/recipe/:menuItemId", authRequired, requireRole("admin"), async (req, res) => {
  const { items } = req.body; // [{ ingredient_id, quantity }]
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "La fiche technique doit être une liste d'ingrédients." });
  }

  await supabase.from("recipe_items").delete().eq("menu_item_id", req.params.menuItemId);
  
  const insertItems = items
    .filter(item => item.ingredient_id && item.quantity > 0)
    .map(item => ({
        menu_item_id: req.params.menuItemId,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity
    }));
    
  if (insertItems.length > 0) {
      await supabase.from("recipe_items").insert(insertItems);
  }

  const { data: recipe } = await supabase
    .from("recipe_items")
    .select("id, ingredient_id, quantity, ingredients(name, unit)")
    .eq("menu_item_id", req.params.menuItemId);
    
  const formattedRecipe = recipe.map(item => ({
      ...item,
      name: item.ingredients.name,
      unit: item.ingredients.unit
  }));
  res.json({ recipe: formattedRecipe });
});

module.exports = router;
