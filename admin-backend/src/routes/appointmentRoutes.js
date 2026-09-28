const express = require("express");
const router = express.Router();
const { listAppointments, createAppointment, updateAppointment } = require("../controllers/appointmentController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", listAppointments); // scoped by role inside the controller
router.post("/", requireRole("admin", "staff"), createAppointment);
router.put("/:id", updateAppointment); // doctors may update status on their own appointments only (enforced in controller)

module.exports = router;
