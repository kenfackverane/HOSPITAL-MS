// app.js
const express = require("express");
const cors = require("cors");
// const connectDatabase = require("./utils/database"); // si tu as une fonction de connexion
// require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ tes routes
// app.use("/api/patients", require("./routes/patients"));
// ...

app.get("/", (req, res) => res.json({ ok: true, msg: "API running" }));

module.exports = app;