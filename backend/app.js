// app.js
const express = require("express");
const cors = require("cors");

// (Optionnel) charge .env en local seulement
// require("dotenv").config();

const app = express();

/* =========================
   Middlewares
========================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   Health / Root routes
========================= */
app.get("/", (req, res) => {
  return res.json({ ok: true, msg: "API running" });
});

app.get("/api/health", (req, res) => {
  return res.json({ ok: true, msg: "API health OK" });
});

/* =========================
   Routes imports
   ✅ Adapte seulement le chemin si besoin
========================= */
let PatientRoutes, DoctorRoutes, AppointmentRoutes, InvoiceRoutes, HistoryRoutes;

try {
  PatientRoutes = require("./src/routes/PatientRoutes.js");
} catch (e) {
  console.warn("⚠️ PatientRoutes introuvable:", e.message);
}
try {
  DoctorRoutes = require("./src/routes/DoctorRoutes.js");
} catch (e) {
  console.warn("⚠️ DoctorRoutes introuvable:", e.message);
}
try {
  AppointmentRoutes = require("./src/routes/AppointmentRoutes.js");
} catch (e) {
  console.warn("⚠️ AppointmentRoutes introuvable:", e.message);
}
try {
  InvoiceRoutes = require("./src/routes/InvoiceRoutes.js");
} catch (e) {
  console.warn("⚠️ InvoiceRoutes introuvable:", e.message);
}
try {
  HistoryRoutes = require("./src/routes/HistoryRoutes.js");
} catch (e) {
  console.warn("⚠️ HistoryRoutes introuvable:", e.message);
}

/* =========================
   Routes mounting
========================= */
if (PatientRoutes) app.use("/api/patients", PatientRoutes);
if (DoctorRoutes) app.use("/api/doctors", DoctorRoutes);
if (AppointmentRoutes) app.use("/api/appointments", AppointmentRoutes);
if (InvoiceRoutes) app.use("/api/invoices", InvoiceRoutes);
if (HistoryRoutes) app.use("/api/history", HistoryRoutes);

/* =========================
   404 fallback
========================= */
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================
   Global error handler
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  return res.status(500).json({
    ok: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

module.exports = app;