const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// Middlewares
app.use(cors());
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
  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
});