const express = require("express");
const supabase = require("../db/supabaseClient");
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
  const { category_id, name, description, price, station } = req.body;
  const { data, error } = await supabase
    .from("menu_items")
    .insert([{ category_id, name, description, price, station }])
    .select("id")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

module.exports = router;
