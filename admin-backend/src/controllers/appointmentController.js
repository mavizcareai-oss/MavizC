const pool = require("../config/db");

async function listAppointments(req, res) {
  const { hospital_id, role, doctor_id: ownDoctorId } = req.user;
  const { date, doctor_id, status } = req.query;

  try {
    const params = [hospital_id];
    let query = `
      SELECT a.*, p.name AS patient_name, p.phone_number, d.name AS doctor_name, d.specialty
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.hospital_id = $1
    `;

    if (role === "doctor") {
      // Doctors only ever see their own appointments — ignore any doctor_id query param
      params.push(ownDoctorId);
      query += ` AND a.doctor_id = $${params.length}`;
    } else if (doctor_id) {
      params.push(doctor_id);
      query += ` AND a.doctor_id = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND a.appointment_date = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }
    query += " ORDER BY a.appointment_date, a.appointment_time";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

async function createAppointment(req, res) {
  const { hospital_id } = req.user;
  const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: "patient_id, doctor_id, appointment_date, and appointment_time are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, status, source)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', 'admin')
       RETURNING *`,
      [patient_id, doctor_id, hospital_id, appointment_date, appointment_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
}

async function updateAppointment(req, res) {
  const { id } = req.params;
  const { hospital_id, role, doctor_id: ownDoctorId } = req.user;
  const { appointment_date, appointment_time, status } = req.body;

  try {
    const params = [appointment_date, appointment_time, status, id, hospital_id];
    let query = `
      UPDATE appointments
      SET appointment_date = COALESCE($1, appointment_date),
          appointment_time = COALESCE($2, appointment_time),
          status = COALESCE($3, status)
      WHERE id = $4 AND hospital_id = $5
    `;

    if (role === "doctor") {
      // A doctor can only update the status of their own appointments (e.g. mark completed)
      params.push(ownDoctorId);
      query += ` AND doctor_id = $${params.length}`;
    }
    query += " RETURNING *";

    const result = await pool.query(query, params);
    if (!result.rows[0]) return res.status(404).json({ error: "Appointment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
}

module.exports = { listAppointments, createAppointment, updateAppointment };
