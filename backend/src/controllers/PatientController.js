const Patient = require("../models/Patient");

exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, age, gender } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "firstName and lastName are required" });
    }

    const created = await Patient.create({
      firstName,
      lastName,
      phone: phone || "",
      address: address || "",
      age: age === "" || age === undefined ? null : Number(age),
      gender: ["MALE", "FEMALE", "OTHER"].includes(gender) ? gender : "OTHER",
    });

    res.status(201).json({ message: "Patient created ✅", patient: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, age, gender } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "firstName and lastName are required" });
    }

    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        phone: phone || "",
        address: address || "",
        age: age === "" || age === undefined ? null : Number(age),
        gender: ["MALE", "FEMALE", "OTHER"].includes(gender) ? gender : "OTHER",
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Patient not found" });
    res.json({ message: "Patient updated ✅", patient: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};