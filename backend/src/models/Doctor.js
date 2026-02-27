const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialisation: { type: String, required: true, trim: true },
    telephone: { type: String, default: "", trim: true },
    disponibilite: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// ✅ SAFE export (évite OverwriteModelError)
module.exports = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);