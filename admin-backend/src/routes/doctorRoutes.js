const express = require("express");
const router = express.Router();
const {
  listDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  createDoctorLogin
} = require("../controllers/doctorController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// Doctors can view the doctor list (e.g. to see colleagues), but only staff/admin manage it
router.get("/", listDoctors);
router.post("/", requireRole("admin", "staff"), createDoctor);
router.put("/:id", requireRole("admin", "staff"), updateDoctor);
router.delete("/:id", requireRole("admin", "staff"), deleteDoctor);
router.post("/:id/login", requireRole("admin", "staff"), createDoctorLogin);

module.exports = router;
