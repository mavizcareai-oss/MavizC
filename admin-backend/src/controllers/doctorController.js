const pool = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

async function listDoctors(req, res) {
  const { specialty } = req.query;
  const { hospital_id } = req.user;

  try {
    const params = [hospital_id];
    let query = "SELECT * FROM doctors WHERE hospital_id = $1";
    if (specialty) {
      params.push(`%${specialty}%`);
      query += " AND specialty ILIKE $2";
    }
    query += " ORDER BY name";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
}

async function createDoctor(req, res) {
  const { name, specialty, available_slots } = req.body;
  const { hospital_id } = req.user;

  if (!name || !specialty) {
    return res.status(400).json({ error: "Name and specialty are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctors (hospital_id, name, specialty, available_slots)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [hospital_id, name, specialty, JSON.stringify(available_slots || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create doctor" });
  }
}

async function updateDoctor(req, res) {
  const { id } = req.params;
  const { name, specialty, available_slots } = req.body;
  const { hospital_id } = req.user;

  try {
    const result = await pool.query(
      `UPDATE doctors
       SET name = COALESCE($1, name),
           specialty = COALESCE($2, specialty),
           available_slots = COALESCE($3, available_slots)
       WHERE id = $4 AND hospital_id = $5
       RETURNING *`,
      [name, specialty, available_slots ? JSON.stringify(available_slots) : null, id, hospital_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Doctor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
}

async function deleteDoctor(req, res) {
  const { id } = req.params;
  const { hospital_id } = req.user;

  try {
    const result = await pool.query(
      "DELETE FROM doctors WHERE id = $1 AND hospital_id = $2 RETURNING id",
      [id, hospital_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Doctor not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
}

async function createDoctorLogin(req, res) {
  const { id } = req.params; // doctor id
  const { email } = req.body;
  const { hospital_id } = req.user;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const doctor = await pool.query(
      "SELECT * FROM doctors WHERE id = $1 AND hospital_id = $2",
      [id, hospital_id]
    );
    if (!doctor.rows[0]) return res.status(404).json({ error: "Doctor not found" });

    const existing = await pool.query(
      "SELECT id FROM admin_users WHERE doctor_id = $1",
      [id]
    );
    if (existing.rows[0]) {
      return res.status(409).json({ error: "This doctor already has a login" });
    }

    // Generate a temporary password the admin can hand to the doctor
    const tempPassword = crypto.randomBytes(6).toString("base64").replace(/[/+=]/g, "").slice(0, 10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
      `INSERT INTO admin_users (hospital_id, email, password_hash, role, doctor_id)
       VALUES ($1, $2, $3, 'doctor', $4)
       RETURNING id, email, role, doctor_id`,
      [hospital_id, email, passwordHash, id]
    );

    res.status(201).json({
      login: result.rows[0],
      temporary_password: tempPassword,
      note: "Share this temporary password with the doctor securely. It is not stored anywhere and cannot be retrieved again — reset it if lost."
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "That email is already in use" });
    }
    res.status(500).json({ error: "Failed to create doctor login" });
  }
}

module.exports = { listDoctors, createDoctor, updateDoctor, deleteDoctor, createDoctorLogin };
