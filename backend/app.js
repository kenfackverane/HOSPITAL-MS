// app.js
const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   CORS - Allow your deployed domains
========================= */
app.use(cors({
  origin: [
    "https://hospital-ms-huhk.vercel.app",  // Your frontend
    "https://verahospital.netlify.app",       // Original allowed
    "http://localhost:5173",                   // Dev local
    "http://localhost:3000"                     // Dev local
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

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
   Database connection for Vercel
========================= */
let isDbConnected = false;
const connectDB = require("./src/config/db");

const ensureDbConnection = async () => {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error("DB connection failed:", err);
      throw err;
    }
  }
};

app.use(async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Database connection failed" });
  }
});

/* =========================
   Routes imports
========================= */
let PatientRoutes, DoctorRoutes, AppointmentRoutes, InvoiceRoutes, HistoryRoutes;

try {
  PatientRoutes = require("./src/routes/PatientRoutes.js");
} catch (e) {
  console.warn("PatientRoutes not found:", e.message);
}
try {
  DoctorRoutes = require("./src/routes/DoctorRoutes.js");
} catch (e) {
  console.warn("DoctorRoutes not found:", e.message);
}
try {
  AppointmentRoutes = require("./src/routes/AppointmentRoutes.js");
} catch (e) {
  console.warn("AppointmentRoutes not found:", e.message);
}
try {
  InvoiceRoutes = require("./src/routes/InvoiceRoutes.js");
} catch (e) {
  console.warn("InvoiceRoutes not found:", e.message);
}
try {
  HistoryRoutes = require("./src/routes/HistoryRoutes.js");
} catch (e) {
  console.warn("HistoryRoutes not found:", e.message);
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
  console.error("Server error:", err);
  return res.status(500).json({
    ok: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

module.exports = app;