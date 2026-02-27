const express = require("express");
const router = express.Router();

const c = require("../controllers/doctorController"); // adapte le nom exact du fichier

if (!c || typeof c.getDoctors !== "function") {
  console.log("❌ doctorController import problem:", c);
  throw new Error("doctorController.getDoctors is not a function");
}

router.get("/", c.getDoctors);
router.post("/", c.createDoctor);
router.put("/:id", c.updateDoctor);      // si tu l’as ajouté
router.delete("/:id", c.deleteDoctor);

module.exports = router;