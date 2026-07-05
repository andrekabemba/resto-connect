const express = require("express");
const { supabase, supabaseService } = require("../db/supabaseClient");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

// Cas d'utilisation "Gérer réservation" — planifier, modifier, annuler.
router.post("/", authRequired, requireRole("customer"), async (req, res) => {
  const { table_id, customer_name, customer_phone, party_size, reservation_time, notes = "" } = req.body;

  if (!customer_name || !customer_phone || !party_size || !reservation_time) {
    return res.status(400).json({ error: "Nom, téléphone, nombre de convives et horaire sont requis." });
  }

  const { data: reservation, error } = await supabaseService
    .from("reservations")
    .insert([{
        user_id: req.user.id,
        table_id: table_id || null,
        customer_name,
        customer_phone,
        party_size,
        reservation_time,
        notes
    }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });

  if (table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'reservee' }).eq("id", table_id);
  }

  res.status(201).json({ reservation });
});

router.get("/", authRequired, async (req, res) => {
  let query = supabaseService.from("reservations").select("*");
  if (req.user.role === "customer") {
    query = query.eq("user_id", req.user.id);
  } else if (!["admin", "waiter"].includes(req.user.role)) {
    return res.status(403).json({ error: "Accès non autorisé." });
  }
  
  const { data: reservations, error } = await query.order("reservation_time", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  
  res.json({ reservations });
});

router.put("/:id", authRequired, async (req, res) => {
  const { data: existing, error: findError } = await supabaseService
    .from("reservations")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  if (findError || !existing) return res.status(404).json({ error: "Réservation introuvable." });
  if (req.user.role === "customer" && existing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres réservations." });
  }

  const {
    party_size = existing.party_size,
    reservation_time = existing.reservation_time,
    notes = existing.notes,
    table_id = existing.table_id,
  } = req.body;

  const { data: reservation, error } = await supabaseService
    .from("reservations")
    .update({ party_size, reservation_time, notes, table_id })
    .eq("id", req.params.id)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reservation });
});

router.patch("/:id/status", authRequired, async (req, res) => {
  const { status } = req.body;
  if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    return res.status(400).json({ error: "Statut invalide." });
  }
  
  const { data: existing, error: findError } = await supabaseService
    .from("reservations")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  if (findError || !existing) return res.status(404).json({ error: "Réservation introuvable." });
  
  if (req.user.role === "customer" && existing.user_id !== req.user.id) {
    return res.status(403).json({ error: "Vous ne pouvez annuler que vos propres réservations." });
  }
  if (req.user.role === "customer" && status !== "cancelled") {
    return res.status(403).json({ error: "Vous pouvez uniquement annuler votre réservation." });
  }

  await supabaseService
    .from("reservations")
    .update({ status })
    .eq("id", req.params.id);

  if (status === "cancelled" && existing.table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'libre' }).eq("id", existing.table_id);
  }
  if (status === "confirmed" && existing.table_id) {
    await supabaseService.from("tables_restaurant").update({ status: 'reservee' }).eq("id", existing.table_id);
  }

  const { data: reservation } = await supabaseService
    .from("reservations")
    .select("*")
    .eq("id", req.params.id)
    .single();
    
  res.json({ reservation });
});

module.exports = router;