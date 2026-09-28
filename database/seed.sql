-- MavizC.Ai — Sample seed data for development/testing
-- Run after schema.sql

INSERT INTO hospitals (id, name, address, phone) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Fortis Hospital', 'Chennai, TN', '+914412345678');

INSERT INTO doctors (hospital_id, name, specialty, available_slots) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dr. Anjali Mehta', 'Cardiologist',
     '[{"date":"2026-09-20","time":"10:00"},{"date":"2026-09-20","time":"14:00"},{"date":"2026-09-21","time":"11:00"}]'),
    ('11111111-1111-1111-1111-111111111111', 'Dr. Karthik Raman', 'General Physician',
     '[{"date":"2026-09-20","time":"09:30"},{"date":"2026-09-21","time":"16:00"}]');

INSERT INTO patients (name, phone_number, preferred_language) VALUES
    ('Priya Sundaram', '+919876543210', 'tamil'),
    ('Ravi Kumar', '+919876543211', 'english');

-- Sample admin login: email admin@mavizc.ai / password: Admin@123
-- (password_hash below is a bcrypt hash you should regenerate for real use — see auth notes)
INSERT INTO admin_users (hospital_id, email, password_hash, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@mavizc.ai',
     '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Q2rXK1O.1K5vB5yA5g9m9r5yqjeUu', 'admin');
