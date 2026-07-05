const express = require("express");
const multer = require("multer");
const { supabaseService } = require("../db/supabaseClient");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authRequired, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier." });

  const fileExt = req.file.originalname.split('.').pop();
  const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;

  const { data, error } = await supabaseService.storage
    .from("menu-images")
    .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

  if (error) {
    console.error("Erreur upload Supabase:", error);
    return res.status(500).json({ error: error.message });
  }

  const { data: publicUrlData } = supabaseService.storage
    .from("menu-images")
    .getPublicUrl(fileName);

  res.json({ imageUrl: publicUrlData.publicUrl });
});

module.exports = router;
