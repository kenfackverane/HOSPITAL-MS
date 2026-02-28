const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: __dirname + "/.env" });
console.log("MONGO_URI loaded?", !!process.env.MONGO_URI);

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const connectDB = require("./src/config/db");

const PatientRoutes = require("./src/routes/PatientRoutes.js");
const DoctorRoutes = require("./src/routes/DoctorRoutes.js");
const AppointmentRoutes = require("./src/routes/AppointmentRoutes.js");
const InvoiceRoutes = require("./src/routes/InvoiceRoutes.js");
const HistoryRoutes = require("./src/routes/HistoryRoutes.js");

const app = express();

// ✅ Load Swagger file
const swaggerDocument = YAML.load("./swagger.yaml");

// ✅ CORS (autorise Netlify + dev local)
app.use(
  cors({
    origin: [
      "https://verahospital.netlify.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Middlewares
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test route
app.get("/", (req, res) => res.json({ message: "Backend running ✅" }));

// Routes
app.use("/patients", PatientRoutes);
app.use("/patients", HistoryRoutes);
app.use("/doctors", DoctorRoutes);
app.use("/appointments", AppointmentRoutes);
app.use("/invoices", InvoiceRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});