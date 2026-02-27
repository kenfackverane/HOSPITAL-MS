const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/PatientController");

router.get("/", ctrl.getPatients);
router.post("/", ctrl.createPatient);
router.put("/:id", ctrl.updatePatient);     // ✅ IMPORTANT
router.delete("/:id", ctrl.deletePatient);

module.exports = router;