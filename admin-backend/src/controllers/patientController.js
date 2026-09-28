const pool = require("../config/db");

async function listPatients(req, res) {
  const { search } = req.query;

  try {
    const params = [];
    let query = "SELECT * FROM patients";
    if (search) {
      params.push(`%${search}%`);
      query += " WHERE name ILIKE $1 OR phone_number ILIKE $1";
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
}

async function getPatient(req, res) {
  const { id } = req.params;
  const { hospital_id } = req.user;

  try {
    const patient = await pool.query("SELECT * FROM patients WHERE id = $1", [id]);
    if (!patient.rows[0]) return res.status(404).json({ error: "Patient not found" });

    const appointments = await pool.query(
      `SELECT a.*, d.name AS doctor_name, d.specialty
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.patient_id = $1 AND a.hospital_id = $2
       ORDER BY a.appointment_date DESC`,
      [id, hospital_id]
    );

    res.json({ ...patient.rows[0], appointments: appointments.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
}

module.exports = { listPatients, getPatient };
