-- OBD-II Vehicle Diagnostic Assistant
-- Database schema for SQLite
-- Run this file first, then run seed.sql.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT
);

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER CHECK (year IS NULL OR year BETWEEN 1886 AND 2100),
    trim TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diagnostic_codes (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    possible_causes TEXT NOT NULL,
    recommendation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS diagnostic_history (
    history_id INTEGER PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (code) REFERENCES diagnostic_codes(code)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id
    ON vehicles(user_id);

CREATE INDEX IF NOT EXISTS idx_history_vehicle_id
    ON diagnostic_history(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_history_code
    ON diagnostic_history(code);

CREATE INDEX IF NOT EXISTS idx_history_scanned_at
    ON diagnostic_history(scanned_at);

-- Optional curated diagnostic scenarios for demo vehicles.
-- These codes are NOT exclusive to the vehicle and do not imply a confirmed fault.
CREATE TABLE IF NOT EXISTS vehicle_code_examples (
    vehicle_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    scenario_note TEXT NOT NULL,
    PRIMARY KEY (vehicle_id, code),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (code) REFERENCES diagnostic_codes(code) ON DELETE CASCADE
);
