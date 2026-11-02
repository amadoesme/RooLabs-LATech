-- Insert sample diagnostic codes
-- These entries are for development and demonstration.

INSERT OR IGNORE INTO diagnostic_codes
    (code, description, severity, possible_causes, recommendation)
VALUES
(
    'P0301',
    'Cylinder 1 Misfire Detected',
    'High',
    'Worn spark plug; faulty ignition coil; fuel delivery issue',
    'Inspect ignition components and fuel delivery before replacing parts'
),
(
    'P0420',
    'Catalyst System Efficiency Below Threshold (Bank 1)',
    'Medium',
    'Catalytic converter deterioration; exhaust leak; oxygen sensor issue',
    'Check for exhaust leaks and review oxygen sensor readings'
),
(
    'P0171',
    'System Too Lean (Bank 1)',
    'Medium',
    'Vacuum leak; low fuel pressure; mass airflow sensor issue',
    'Inspect for intake leaks and check fuel delivery and sensor readings'
),
(
    'P0455',
    'Evaporative Emission System Leak Detected (Gross Leak)',
    'Low',
    'Loose fuel cap; damaged EVAP hose; faulty EVAP component',
    'Check the fuel cap and inspect the EVAP system for leaks'
),
(
    'P0128',
    'Coolant Thermostat Temperature Below Regulating Temperature',
    'Medium',
    'Thermostat stuck open; coolant temperature sensor issue',
    'Check coolant level and temperature readings and inspect the thermostat'
),
(
    'P0442',
    'Evaporative Emission System Leak Detected (Small Leak)',
    'Low',
    'Fuel cap seal issue; small EVAP hose leak; leaking EVAP component',
    'Check the fuel cap seal and inspect EVAP hoses'
),
(
    'P0401',
    'Exhaust Gas Recirculation Flow Insufficient Detected',
    'Medium',
    'Blocked EGR passage; faulty EGR valve; wiring issue',
    'Inspect EGR passages, valve operation, and wiring'
),
(
    'P0113',
    'Intake Air Temperature Sensor Circuit High Input',
    'Medium',
    'Disconnected sensor; damaged wiring; faulty temperature sensor',
    'Inspect the sensor connector and wiring'
),
(
    'P0500',
    'Vehicle Speed Sensor Malfunction',
    'Medium',
    'Faulty speed sensor; damaged wiring; connector issue',
    'Inspect the speed sensor circuit and verify its signal'
),
(
    'P0700',
    'Transmission Control System Malfunction Indicator Requested',
    'High',
    'Transmission control system has reported a fault',
    'Retrieve transmission-specific codes to investigate the underlying issue'
);

-- Optional fictional users for testing
INSERT OR IGNORE INTO users (user_id, email, name)
VALUES
    (1, 'alex.demo@example.com', 'Alex Demo'),
    (2, 'sam.demo@example.com', 'Sam Demo');

-- Optional fictional vehicles for testing
INSERT OR IGNORE INTO vehicles
    (vehicle_id, user_id, make, model, year)
VALUES
    (1, 1, 'Toyota', 'Camry', 2020),
    (2, 1, 'Honda', 'Civic', 2018),
    (3, 2, 'Ford', 'Focus', 2019);

-- Optional example diagnostic history
INSERT INTO diagnostic_history
    (vehicle_id, code, scanned_at, notes)
SELECT
    1, 'P0301', '2026-10-30 10:00:00', 'Fictional demo scan'
WHERE NOT EXISTS (
    SELECT 1 FROM diagnostic_history
    WHERE vehicle_id = 1
      AND code = 'P0301'
      AND notes = 'Fictional demo scan'
);

INSERT INTO diagnostic_history
    (vehicle_id, code, scanned_at, notes)
SELECT
    1, 'P0420', '2026-10-31 14:30:00', 'Fictional demo scan'
WHERE NOT EXISTS (
    SELECT 1 FROM diagnostic_history
    WHERE vehicle_id = 1
      AND code = 'P0420'
      AND notes = 'Fictional demo scan'
);

INSERT INTO diagnostic_history
    (vehicle_id, code, scanned_at, notes)
SELECT
    3, 'P0171', '2026-10-31 15:00:00', 'Fictional demo scan'
WHERE NOT EXISTS (
    SELECT 1 FROM diagnostic_history
    WHERE vehicle_id = 3
      AND code = 'P0171'
      AND notes = 'Fictional demo scan'
);

