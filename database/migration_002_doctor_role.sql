-- MavizC.Ai — Migration: doctor login role
-- Run this after schema.sql (and after seed.sql if already applied)

ALTER TABLE admin_users
    ADD COLUMN doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE;

-- role is no longer just 'admin' | 'staff' — it can now also be 'doctor'
-- (no DB-level enum was used, so no constraint change needed)

CREATE INDEX idx_admin_users_doctor ON admin_users(doctor_id);
