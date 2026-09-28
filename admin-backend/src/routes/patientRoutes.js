const express = require("express");
const router = express.Router();
const { listPatients, getPatient } = require("../controllers/patientController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", requireRole("admin", "staff"), listPatients);
router.get("/:id", requireRole("admin", "staff"), getPatient);

module.exports = router;
