require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const menuRoutes = require("./routes/menu");
const inventoryRoutes = require("./routes/inventory");
const tableRoutes = require("./routes/tables");
const reservationRoutes = require("./routes/reservations");
const orderRoutes = require("./routes/orders");
const reportRoutes = require("./routes/reports");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`API RestoConnect en écoute sur http://localhost:${PORT}`);
});
