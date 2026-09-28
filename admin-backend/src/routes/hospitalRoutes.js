const express = require("express");
const router = express.Router();
const { listHospitals, createHospital } = require("../controllers/hospitalController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", listHospitals);
router.post("/", requireRole("admin"), createHospital);

module.exports = router;
