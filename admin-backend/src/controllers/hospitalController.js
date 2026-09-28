const pool = require("../config/db");

async function listHospitals(req, res) {
  try {
    const result = await pool.query("SELECT * FROM hospitals ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
}

async function createHospital(req, res) {
  const { name, address, phone } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    const result = await pool.query(
      "INSERT INTO hospitals (name, address, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, address, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create hospital" });
  }
}

module.exports = { listHospitals, createHospital };
