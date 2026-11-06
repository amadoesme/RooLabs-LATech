PRAGMA foreign_keys = ON;

-- 1. Store user information
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT
);

-- 2. Store vehicles belonging to users
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- 3. Store diagnostic codes and their information
CREATE TABLE IF NOT EXISTS diagnostic_codes (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    severity TEXT NOT NULL
        CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    possible_causes TEXT NOT NULL,
    recommendation TEXT NOT NULL
);

-- 4. Store users' vehicle diagnostic history
CREATE TABLE IF NOT EXISTS diagnostic_history (
    history_id INTEGER PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id)
        ON DELETE CASCADE,

    FOREIGN KEY (code)
        REFERENCES diagnostic_codes(code)
        ON DELETE RESTRICT
);

-- Improve lookup performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id
    ON vehicles(user_id);

CREATE INDEX IF NOT EXISTS idx_history_vehicle_id
    ON diagnostic_history(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_history_code
    ON diagnostic_history(code);
