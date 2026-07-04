const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", authRequired, requireRole("admin"), async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, active, created_at")
    .neq("role", "customer")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users: data });
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Nom, email, mot de passe et rôle sont requis." });
  }
  if (!["admin", "waiter", "cook"].includes(role)) {
    return res.status(400).json({ error: "Rôle invalide pour un compte employé." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  const { data: existing } = await supabase.from("users").select("id").eq("email", email.toLowerCase()).single();
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const { data, error } = await supabase
    .from("users")
    .insert([{ name: name.trim(), email: email.toLowerCase(), password_hash, role, active: true }])
    .select("id, name, email, role, active, created_at")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ user: data });
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (fetchError || !existing || existing.role === "customer") {
    return res.status(404).json({ error: "Employé introuvable." });
  }

  const { name = existing.name, role = existing.role, active = existing.active, password } = req.body;
  if (!["admin", "waiter", "cook"].includes(role)) {
    return res.status(400).json({ error: "Rôle invalide." });
  }
  if (req.user.id === Number(req.params.id) && active === false) {
    return res.status(400).json({ error: "Vous ne pouvez pas désactiver votre propre compte." });
  }

  const password_hash = password ? bcrypt.hashSync(password, 10) : existing.password_hash;

  const { data, error } = await supabase
    .from("users")
    .update({ name, role, active, password_hash })
    .eq("id", req.params.id)
    .select("id, name, email, role, active, created_at")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ user: data });
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  if (req.user.id === Number(req.params.id)) {
    return res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
  }
  const { data: existing } = await supabase.from("users").select("role").eq("id", req.params.id).single();
  if (!existing || existing.role === "customer") {
    return res.status(404).json({ error: "Employé introuvable." });
  }
  const { error } = await supabase.from("users").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
