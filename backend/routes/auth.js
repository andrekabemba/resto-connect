const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../db/supabaseClient");
const { authRequired, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Inscription publique : toujours en tant que client. Les comptes du
// personnel (gestionnaire, serveur, cuisinier) sont créés par un gestionnaire
// via /api/users.
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nom, email et mot de passe sont requis." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();
  
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const { data: user, error } = await supabase
    .from("users")
    .insert([{ name, email: email.toLowerCase(), password_hash: hash, role: "customer" }])
    .select("id, name, email, role")
    .single();

  if (error) {
    console.error("Erreur Supabase lors de l'inscription :", error);
    return res.status(500).json({ 
      error: "Impossible de créer le compte pour le moment. Veuillez réessayer." 
    });
  }
  
  const token = signToken(user);
  res.status(201).json({ user, token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis." });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }
  if (!user.active) {
    return res.status(403).json({ error: "Ce compte a été désactivé." });
  }

  const token = signToken(user);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

router.get("/me", authRequired, async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", req.user.id)
    .single();

  if (error || !user) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.json({ user });
});

// La déconnexion est gérée côté client (suppression du token) ; cette route
// existe pour matérialiser explicitement le cas d'utilisation "Se déconnecter".
router.post("/logout", authRequired, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
