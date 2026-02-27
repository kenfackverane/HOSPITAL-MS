const mongoose = require("mongoose");

const patientHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["CONSULTATION", "EXAM", "TREATMENT", "HOSPITALIZATION", "NOTE", "OTHER"],
      default: "CONSULTATION",
    },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    treatment: { type: String, default: "" },
    eventDate: { type: Date, required: true },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PatientHistory ||
  mongoose.model("PatientHistory", patientHistorySchema);