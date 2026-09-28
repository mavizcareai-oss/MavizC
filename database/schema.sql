-- MavizC.Ai — Database Schema
-- Run this on your Supabase / PostgreSQL project.
-- Shared by both the admin backend and the n8n chatbot workflow.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- Hospitals / branches
-- ─────────────────────────────────────────────
CREATE TABLE hospitals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    address     TEXT,
    phone       VARCHAR(20),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Doctors
-- ─────────────────────────────────────────────
CREATE TABLE doctors (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name             VARCHAR(150) NOT NULL,
    specialty        VARCHAR(100) NOT NULL,
    available_slots  JSONB NOT NULL DEFAULT '[]',  -- e.g. [{"date":"2026-09-20","time":"10:00"}, ...]
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);

-- ─────────────────────────────────────────────
-- Patients (clients)
-- ─────────────────────────────────────────────
CREATE TABLE patients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(150) NOT NULL,
    phone_number        VARCHAR(20) NOT NULL UNIQUE,
    preferred_language  VARCHAR(20) DEFAULT 'english', -- 'english' | 'tamil'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_phone ON patients(phone_number);

-- ─────────────────────────────────────────────
-- Appointments
-- ─────────────────────────────────────────────
CREATE TABLE appointments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id       UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    appointment_date  DATE NOT NULL,
    appointment_time  TIME NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled | completed
    source            VARCHAR(20) NOT NULL DEFAULT 'whatsapp',  -- whatsapp | admin
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- ─────────────────────────────────────────────
-- Chat memory (used only by the n8n AI agent)
-- ─────────────────────────────────────────────
CREATE TABLE chat_memory (
    session_key  VARCHAR(30) PRIMARY KEY,   -- patient's phone number
    messages     JSONB NOT NULL DEFAULT '[]',
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Admin users (staff / admin login)
-- ─────────────────────────────────────────────
CREATE TABLE admin_users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id    UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    role           VARCHAR(20) NOT NULL DEFAULT 'staff', -- 'admin' | 'staff'
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
