const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true },

    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    doctorName: { type: String, required: true },

    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["PENDING","CONFIRMED","DONE","CANCELLED"], default: "PENDING" },
    reason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);