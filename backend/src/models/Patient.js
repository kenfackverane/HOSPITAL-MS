const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },

    // ✅ Ajouts
    age: { type: Number, default: null },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "OTHER",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Patient || mongoose.model("Patient", patientSchema);