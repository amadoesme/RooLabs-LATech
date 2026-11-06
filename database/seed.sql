-- OBD-II Vehicle Diagnostic Assistant
-- Sample/reference data for local development and demo testing.
-- Run schema.sql before this file.
-- The diagnostic-code descriptions and possible causes are illustrative;
-- verify automotive details before presenting them as authoritative.

INSERT OR IGNORE INTO diagnostic_codes
    (code, description, severity, possible_causes, recommendation)
VALUES
    ('P0301', 'Cylinder 1 Misfire Detected', 'High',
     'Worn spark plug; faulty ignition coil; fuel delivery issue',
     'Inspect ignition components and fuel delivery; confirm the cause before replacing parts'),

    ('P0420', 'Catalyst System Efficiency Below Threshold (Bank 1)', 'Medium',
     'Catalytic converter deterioration; exhaust leak; oxygen sensor issue',
     'Check for exhaust leaks and review oxygen-sensor readings before evaluating the catalytic converter'),

    ('P0171', 'System Too Lean (Bank 1)', 'Medium',
     'Vacuum leak; low fuel pressure; mass airflow sensor issue',
     'Inspect for intake/vacuum leaks and check fuel delivery and sensor readings'),

    ('P0455', 'Evaporative Emission System Leak Detected (Gross Leak)', 'Low',
     'Loose or damaged fuel cap; EVAP hose leak; faulty purge or vent component',
     'Check the fuel cap and inspect the EVAP system for leaks'),

    ('P0128', 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)', 'Medium',
     'Thermostat stuck open; coolant temperature sensor issue; low coolant',
     'Check coolant level and temperature readings; inspect the thermostat and sensor'),

    ('P0442', 'Evaporative Emission System Leak Detected (Small Leak)', 'Low',
     'Fuel cap seal issue; small EVAP hose leak; EVAP component leak',
     'Check the fuel cap seal and inspect EVAP hoses and components'),

    ('P0401', 'Exhaust Gas Recirculation Flow Insufficient Detected', 'Medium',
     'Blocked EGR passage; faulty EGR valve; sensor or wiring issue',
     'Inspect EGR passages, valve operation, and related wiring'),

    ('P0113', 'Intake Air Temperature Sensor 1 Circuit High Input', 'Medium',
     'Disconnected sensor; damaged wiring; faulty intake air temperature sensor',
     'Inspect the sensor connector and wiring, then verify sensor readings'),

    ('P0500', 'Vehicle Speed Sensor Malfunction', 'Medium',
     'Faulty vehicle speed sensor; damaged wiring; signal or connector issue',
     'Inspect the speed-sensor circuit and connectors and confirm the signal'),

    ('P0700', 'Transmission Control System Malfunction Indicator Requested', 'High',
     'Transmission control system has reported a fault; underlying codes may be stored separately',
     'Retrieve transmission-specific codes and have the underlying issue diagnosed');

-- Optional fictional demo users and vehicles.
-- These are fake records only; do not use real personal information.
INSERT OR IGNORE INTO users (user_id, email, name)
VALUES
    (1, 'alex.demo@example.com', 'Alex Demo'),
    (2, 'sam.demo@example.com', 'Sam Demo');

INSERT OR IGNORE INTO vehicles (vehicle_id, user_id, make, model, year)
VALUES
    (1, 1, 'Toyota', 'Camry', 2015),
    (2, 1, 'Honda', 'Civic', 2018),
    (3, 2, 'Ford', 'Focus', 2019);

-- Example history rows for testing the joins and history view.
INSERT INTO diagnostic_history (vehicle_id, code, scanned_at, notes)
SELECT 1, 'P0301', '2026-10-30 10:00:00', 'Fictional demo scan'
WHERE NOT EXISTS (
    SELECT 1 FROM diagnostic_history
    WHERE vehicle_id = 1 AND code = 'P0301' AND notes = 'Fictional demo scan'
);

INSERT INTO diagnostic_history (vehicle_id, code, scanned_at, notes)
SELECT 1, 'P0420', '2026-10-31 14:30:00', 'Fictional demo scan'
WHERE NOT EXISTS (
    SELECT 1 FROM diagnostic_history
    WHERE vehicle_id = 1 AND code = 'P0420' AND notes = 'Fictional demo scan'
);

INSERT INTO diagnostic_history (vehicle_id, code, scanned_at, notes)
SELECT 3, 'P0171', '2026-10-31 15:00:00', 'Fictional demo scan'
WHERE NOT EXISTS (
    SELECT 1 FROM diagnostic_history
    WHERE vehicle_id = 3 AND code = 'P0171' AND notes = 'Fictional demo scan'
);

-- Additional illustrative codes for the 2015 Toyota Camry SE demo.
INSERT OR IGNORE INTO diagnostic_codes (code,description,severity,possible_causes,recommendation) VALUES
    ('P0300', 'Random/Multiple Cylinder Misfire Detected', 'High', 'Spark plugs; ignition coils; fuel delivery problems; intake air leaks', 'Check misfire data and inspect ignition, fuel, and intake systems'),
    ('P0441', 'Evaporative Emission System Incorrect Purge Flow', 'Low', 'Purge valve issue; EVAP hose problem; control circuit fault', 'Inspect EVAP purge valve operation, hoses, and related wiring'),
    ('P0138', 'O2 Sensor Circuit High Voltage (Bank 1 Sensor 2)', 'Medium', 'Oxygen sensor issue; wiring fault; exhaust or fuel mixture issue', 'Check downstream oxygen sensor data and wiring before replacing components'),
    ('P0011', 'A Camshaft Position Timing Over-Advanced or System Performance (Bank 1)', 'High', 'Oil condition or level issue; variable valve timing control issue; timing-related fault', 'Check oil condition and level and inspect variable valve timing operation'),
    ('P0012', 'A Camshaft Position Timing Over-Retarded (Bank 1)', 'High', 'Oil condition or level issue; variable valve timing control issue; timing-related fault', 'Check oil condition and level and inspect variable valve timing operation');

-- The trim field is part of the updated schema.
UPDATE vehicles SET make='Toyota', model='Camry', year=2015, trim='SE'
WHERE vehicle_id=1 AND user_id=1;

-- Curated demo scenarios, not manufacturer-specific code definitions.
INSERT OR IGNORE INTO vehicle_code_examples (vehicle_id,code,scenario_note) VALUES
    (1, 'P0300', 'Example of a possible engine misfire code'),
    (1, 'P0301', 'Example of a cylinder-specific misfire code'),
    (1, 'P0420', 'Example of a catalyst-efficiency code'),
    (1, 'P0171', 'Example of a lean-mixture code'),
    (1, 'P0455', 'Example of an EVAP leak code'),
    (1, 'P0441', 'Example of an EVAP purge-flow code'),
    (1, 'P0138', 'Example of a downstream oxygen-sensor circuit code'),
    (1, 'P0011', 'Example of a camshaft timing performance code'),
    (1, 'P0012', 'Example of a camshaft timing performance code'),
    (1, 'P0128', 'Example of a coolant-temperature/thermostat code');
