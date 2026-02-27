const router = require("express").Router();
const mongoose = require("mongoose");
const Patient = require("../models/Patient");

// GET /debug/patient-exists/:id
router.get("/patient-exists/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Vérifie si un patient avec cet _id existe VRAIMENT
    const exists = await Patient.exists({ _id: id });

    res.json({
      id,
      exists: !!exists,
      dbName: mongoose.connection.name,
      collection: Patient.collection.name
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;