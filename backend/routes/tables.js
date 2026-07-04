const express = require("express");
const supabase = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", authRequired, requireRole("admin", "waiter"), async (req, res) => {
  const { data, error } = await supabase
    .from("tables_restaurant")
    .select("*")
    .order("number", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tables: data });
});

router.get("/public", async (req, res) => {
  const { data, error } = await supabase
    .from("tables_restaurant")
    .select("id, number, capacity")
    .order("number", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tables: data });
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { number, capacity = 2 } = req.body;
  if (!number) return res.status(400).json({ error: "Le numéro de table est requis." });
  
  const { data, error } = await supabase
    .from("tables_restaurant")
    .insert([{ number, capacity }])
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: "Ce numéro de table existe déjà." });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ table: data });
});

router.patch("/:id/status", authRequired, requireRole("admin", "waiter"), async (req, res) => {
  const { status } = req.body;
  if (!["libre", "reservee", "occupee", "encaissement"].includes(status)) {
    return res.status(400).json({ error: "Statut de table invalide." });
  }
  
  const { data, error } = await supabase
    .from("tables_restaurant")
    .update({ status })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Table introuvable." });
  res.json({ table: data });
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { error } = await supabase
    .from("tables_restaurant")
    .delete()
    .eq("id", req.params.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
