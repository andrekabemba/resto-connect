const express = require("express");
const { supabase, supabaseService } = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public : liste des catégories (pour le menu)
router.get("/", async (req, res) => {
  const { data: categories, error } = await supabaseService
    .from("categories")
    .select("*")
    .order("position", { ascending: true })
    .order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ categories });
});

// Admin : créer, modifier, supprimer
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, position = 0 } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Le nom de la catégorie est requis." });
  }
  
  const { data: category, error } = await supabaseService
    .from("categories")
    .insert([{ name: name.trim(), position }])
    .select()
    .single();
    
  if (error) return res.status(409).json({ error: "Cette catégorie existe déjà." });
  res.status(201).json({ category });
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { data: existing, error: findError } = await supabaseService
    .from("categories")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (findError || !existing) return res.status(404).json({ error: "Catégorie introuvable." });

  const { name = existing.name, position = existing.position } = req.body;

  const { data: category, error } = await supabaseService
    .from("categories")
    .update({ name, position })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ category });
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { error: findError } = await supabaseService
    .from("categories")
    .delete()
    .eq("id", req.params.id);

  if (findError) return res.status(404).json({ error: "Catégorie introuvable." });
  res.json({ success: true });
});

module.exports = router;
