const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");

exports.getPatientHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const appointments = await Appointment.find({ patientId: req.params.id }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ patientId: req.params.id }).sort({ createdAt: -1 });

    res.json({ patient, appointments, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};