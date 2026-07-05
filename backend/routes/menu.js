const express = require("express");
const { supabase, supabaseService } = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

// Récupérer tout le menu
router.get("/", async (req, res) => {
  const { data: menu, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("available", 1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ menu });
});

// Admin : Ajouter un plat
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { category_id, name, description, price, station, imageUrl } = req.body;
  const { data, error } = await supabaseService
    .from("menu_items")
    .insert([{ category_id, name, description, price, station, imageUrl, available: 1 }])
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ item: data });
});

// Admin : Modifier un plat
router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { category_id, name, description, price, station, available, imageUrl } = req.body;
  const { data, error } = await supabaseService
    .from("menu_items")
    .update({ category_id, name, description, price, station, available, imageUrl, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ item: data });
});

// Admin : Supprimer un plat
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { error } = await supabaseService
    .from("menu_items")
    .delete()
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;