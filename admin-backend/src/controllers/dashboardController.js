const pool = require("../config/db");

async function summary(req, res) {
  const { hospital_id, role, doctor_id: ownDoctorId } = req.user;
  const isDoctor = role === "doctor";

  try {
    const todayParams = isDoctor ? [hospital_id, ownDoctorId] : [hospital_id];
    const todayQuery = `
      SELECT a.*, p.name AS patient_name, p.phone_number, d.name AS doctor_name
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.hospital_id = $1 AND a.appointment_date = CURRENT_DATE
      ${isDoctor ? "AND a.doctor_id = $2" : ""}
      ORDER BY a.appointment_time
    `;
    const today = await pool.query(todayQuery, todayParams);

    const weekParams = isDoctor ? [hospital_id, ownDoctorId] : [hospital_id];
    const weekQuery = `
      SELECT COUNT(*) FROM appointments
      WHERE hospital_id = $1 AND appointment_date >= CURRENT_DATE - INTERVAL '7 days'
      ${isDoctor ? "AND doctor_id = $2" : ""}
    `;
    const weekCount = await pool.query(weekQuery, weekParams);

    const response = {
      todays_appointments: today.rows,
      bookings_last_7_days: Number(weekCount.rows[0].count)
    };

    if (!isDoctor) {
      const doctorCount = await pool.query(
        "SELECT COUNT(*) FROM doctors WHERE hospital_id = $1",
        [hospital_id]
      );
      response.active_doctors = Number(doctorCount.rows[0].count);
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
}

module.exports = { summary };
