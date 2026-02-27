const Doctor = require("../models/Doctor");

// GET /doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /doctors
exports.createDoctor = async (req, res) => {
  try {
    const { name, specialisation, telephone, disponibilite } = req.body;

    if (!name || !specialisation) {
      return res.status(400).json({ error: "name and specialisation are required" });
    }

    const created = await Doctor.create({
      name,
      specialisation,
      telephone: telephone || "",
      disponibilite: disponibilite || "",
    });

    res.status(201).json({ message: "Doctor created ✅", doctor: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialisation, telephone, disponibilite } = req.body;

    const updated = await Doctor.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),
        ...(specialisation !== undefined && { specialisation }),
        ...(telephone !== undefined && { telephone }),
        ...(disponibilite !== undefined && { disponibilite }),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({ message: "Doctor updated ✅", doctor: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /doctors/:id
exports.deleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Doctor not found" });

    res.json({ message: "Doctor deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};