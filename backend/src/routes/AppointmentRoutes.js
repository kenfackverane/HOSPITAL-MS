const router = require("express").Router();
const c = require("../controllers/AppointmentController");

router.get("/", c.getAppointments);
router.post("/", c.createAppointment);
router.delete("/:id", c.deleteAppointment);

module.exports = router;