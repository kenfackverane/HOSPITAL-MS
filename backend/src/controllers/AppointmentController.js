const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

exports.getAppointments = async (req, res) => {
  try {
    const rows = await Appointment.find().sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, status, reason } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: "patientId, doctorId, date, time are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const created = await Appointment.create({
      patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId,
      doctorName: doctor.name,
      date,
      time,
      status: status || "PENDING",
      reason: reason || "",
    });

    res.status(201).json({ message: "Appointment created ✅", appointment: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};