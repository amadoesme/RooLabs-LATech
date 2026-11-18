
import sqlite3
from pathlib import Path
from datetime import date, datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
DB_DIR = BASE_DIR / "database"
DB_PATH = DB_DIR / "diagnostics.db"

DEFAULT_VEHICLE_ID = 1


def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


# ==========================================
# DATABASE INITIALIZATION
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    DB_DIR.mkdir(parents=True, exist_ok=True)

    schema_path = DB_DIR / "schema.sql"
    seed_path = DB_DIR / "seed.sql"

    if not schema_path.exists():
        raise RuntimeError("database/schema.sql is missing")

    with get_db() as connection:
        connection.executescript(
            schema_path.read_text(encoding="utf-8")
        )

        # Support older databases missing the trim column
        columns = connection.execute(
            "PRAGMA table_info(vehicles)"
        ).fetchall()

        if "trim" not in [col["name"] for col in columns]:
            connection.execute(
                "ALTER TABLE vehicles ADD COLUMN trim TEXT"
            )

        # Seed a fresh database
        count = connection.execute(
            "SELECT COUNT(*) FROM users"
        ).fetchone()[0]

        if count == 0:
            if not seed_path.exists():
                raise RuntimeError("database/seed.sql is missing")

            connection.executescript(
                seed_path.read_text(encoding="utf-8")
            )

        vehicle = connection.execute(
            "SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?",
            (DEFAULT_VEHICLE_ID,)
        ).fetchone()

        if vehicle is None:
            raise RuntimeError(
                "Default Camry is missing from the database."
            )

    yield


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="OBD-II Vehicle Diagnostic Assistant",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODELS
# ==========================================

class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    vehicle_id: int = Field(default=DEFAULT_VEHICLE_ID, ge=1)


class MaintenanceRequest(BaseModel):
    vehicle_id: int = Field(default=DEFAULT_VEHICLE_ID, ge=1)
    service_type: str = Field(min_length=1)
    service_date: date
    mileage: int | None = Field(default=None, ge=0)
    cost: float | None = Field(default=None, ge=0)
    notes: str | None = None


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def get_vehicle(connection, vehicle_id):
    vehicle = connection.execute(
        """
        SELECT vehicle_id, make, model, year, trim
        FROM vehicles
        WHERE vehicle_id = ?
        """,
        (vehicle_id,)
    ).fetchone()

    if vehicle is None:
        raise HTTPException(404, "Vehicle not found")

    return vehicle


def vehicle_name(vehicle):
    return (
        f"{vehicle['year']} {vehicle['make']} "
        f"{vehicle['model']} {vehicle['trim'] or ''}"
    ).strip()


def latest_service(connection, vehicle_id, keywords):
    rows = connection.execute(
        """
        SELECT *
        FROM maintenance_history
        WHERE vehicle_id = ?
        ORDER BY service_date DESC, maintenance_id DESC
        """,
        (vehicle_id,)
    ).fetchall()

    for row in rows:
        service = row["service_type"].lower()
        if any(word in service for word in keywords):
            return row

    return None


def years_since(service_date):
    recorded = date.fromisoformat(service_date)
    today = date.today()
    return (
        today.year - recorded.year
        - ((today.month, today.day) <
           (recorded.month, recorded.day))
    )


def format_service_date(value):
    return date.fromisoformat(value).strftime("%B %d, %Y")


def make_item(item_id, name, status, reason, source, action):
    return {
        "id": item_id,
        "name": name,
        "status": status,
        "reason": reason,
        "source": source,
        "action": action
    }


# ==========================================
# MAINTENANCE STATUS LOGIC
# ==========================================

def calculate_maintenance_status(connection, vehicle_id):
    get_vehicle(connection, vehicle_id)

    items = []

    # ENGINE: Check stored diagnostic history
    engine_issue = connection.execute(
        """
        SELECT d.code, d.description
        FROM diagnostic_history h
        JOIN diagnostic_codes d ON h.code = d.code
        WHERE h.vehicle_id = ?
        ORDER BY h.scanned_at DESC, h.history_id DESC
        LIMIT 1
        """,
        (vehicle_id,)
    ).fetchone()

    if engine_issue:
        items.append(make_item(
            "engine",
            "Engine",
            "Needs Attention",
            f"Recorded diagnostic code: {engine_issue['code']}",
            "OBD-II diagnostic history",
            "Have the recorded issue inspected. "
            "Historical codes do not confirm a current fault."
        ))
    else:
        items.append(make_item(
            "engine",
            "Engine",
            "Not Checked",
            "No diagnostic history available",
            "No information available",
            "Run an OBD-II scan or record an inspection."
        ))

    # OIL: Demo rule - flag oil changes older than one year
    oil = latest_service(
        connection, vehicle_id, ["oil change", "engine oil"]
    )

    if oil:
        old = years_since(oil["service_date"]) >= 1
        items.append(make_item(
            "oil",
            "Oil",
            "Needs Attention" if old else "Good",
            f"Last oil change: {format_service_date(oil['service_date'])}",
            "Maintenance history",
            "Review oil service needs using mileage and "
            "manufacturer recommendations."
            if old else "Continue regular oil maintenance."
        ))
    else:
        items.append(make_item(
            "oil", "Oil", "Not Checked",
            "No oil change recorded",
            "No information available",
            "Add an oil change record."
        ))

    # TIRES
    tires = latest_service(
        connection, vehicle_id, ["tire", "tyre"]
    )

    if tires:
        items.append(make_item(
            "tires", "Tires", "Not Checked",
            f"Last tire service: {format_service_date(tires['service_date'])}",
            "Maintenance history",
            "Inspect tire pressure, tread, and condition. "
            "A service record alone cannot confirm tire safety."
        ))
    else:
        items.append(make_item(
            "tires", "Tires", "Not Checked",
            "No tire inspection recorded",
            "No information available",
            "Add a tire inspection record."
        ))

    # COOLANT: Demo rule - review service older than five years
    coolant = latest_service(
        connection, vehicle_id, ["coolant", "antifreeze"]
    )

    if coolant:
        old = years_since(coolant["service_date"]) >= 5
        items.append(make_item(
            "cooling",
            "Fluids / Cooling",
            "Needs Attention" if old else "Not Checked",
            f"Last coolant replacement: "
            f"{format_service_date(coolant['service_date'])}",
            "Maintenance history",
            "Review coolant replacement history and inspect "
            "the cooling system. The five-year threshold "
            "is a demo rule, not a universal service interval."
            if old else
            "Check coolant level and condition when the engine is cold."
        ))
    else:
        items.append(make_item(
            "cooling", "Fluids / Cooling", "Not Checked",
            "No coolant service recorded",
            "No information available",
            "Check the cooling system and add a service record."
        ))

    # BRAKES
    brakes = latest_service(
        connection, vehicle_id, ["brake"]
    )

    if brakes:
        items.append(make_item(
            "brakes", "Brakes", "Not Checked",
            f"Last brake service: {format_service_date(brakes['service_date'])}",
            "Maintenance history",
            "Verify brake condition with a current inspection."
        ))
    else:
        items.append(make_item(
            "brakes", "Brakes", "Not Checked",
            "No brake inspection recorded",
            "No information available",
            "Add a brake inspection record."
        ))

    # BATTERY
    battery = latest_service(
        connection, vehicle_id, ["battery"]
    )

    if battery:
        items.append(make_item(
            "battery", "Battery", "Not Checked",
            f"Last battery service: {format_service_date(battery['service_date'])}",
            "Maintenance history",
            "Check battery health with a current test."
        ))
    else:
        items.append(make_item(
            "battery", "Battery", "Not Checked",
            "No battery check recorded",
            "No information available",
            "Add a battery inspection record."
        ))

    return items


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/ping")
def ping():
    return {"message": "pong"}


# ==========================================
# CHATBOT
# ==========================================

@app.post("/chat")
def chat(request: ChatRequest):
    message = request.message.lower().strip()

    with get_db() as connection:
        vehicle = get_vehicle(connection, request.vehicle_id)
        name = vehicle_name(vehicle)

        if (
            "overheat" in message
            or "overheating" in message
            or "running hot" in message
        ):
            coolant = latest_service(
                connection,
                request.vehicle_id,
                ["coolant", "antifreeze"]
            )

            if coolant:
                maintenance = (
                    "Last recorded coolant replacement: "
                    f"{format_service_date(coolant['service_date'])}"
                )
            else:
                maintenance = "No coolant service recorded."

            status = "red"
            response = (
                "OVERHEATING WARNING\n\n"
                f"Vehicle: {name}\n\n"
                "Safety: Pull over safely and turn off the engine.\n\n"
                f"Maintenance History: {maintenance}\n\n"
                "Possible Causes: Low coolant, leaks, thermostat "
                "failure, or other cooling-system problems.\n\n"
                "Recommendation: Do not open the radiator cap "
                "while hot. Arrange an inspection or tow before "
                "driving again."
            )

        elif "brake" in message or "smoke" in message:
            status = "red"
            response = (
                "CRITICAL SAFETY WARNING\n\n"
                f"Vehicle: {name}\n\n"
                "Safety: Stop driving as soon as it is safe.\n\n"
                "Recommendation: Contact roadside assistance "
                "or a qualified mechanic."
            )

        elif "check engine" in message or "tire" in message:
            status = "yellow"
            response = (
                "VEHICLE ATTENTION REQUIRED\n\n"
                f"Vehicle: {name}\n\n"
                "Safety: Check whether the vehicle is safe "
                "before continuing.\n\n"
                "Recommendation: Arrange a professional inspection. "
                "If the check engine light is flashing or a tire "
                "is unsafe, stop driving safely."
            )

        elif (
            "hello" in message
            or "i need help" in message
            or message in ("hi", "hey")
        ):
            status = "green"
            response = (
                "VEHICLE DIAGNOSTIC ASSISTANT\n\n"
                f"Vehicle: {name}\n\n"
                "Hello! Describe what's happening with your car, "
                "and I'll provide general safety guidance."
            )

        else:
            status = "unknown"
            response = (
                "ADDITIONAL INFORMATION NEEDED\n\n"
                f"Vehicle: {name}\n\n"
                "Please describe the problem in more detail.\n\n"
                "If the vehicle appears unsafe, stop driving "
                "safely and seek professional assistance."
            )

        cursor = connection.execute(
            """
            INSERT INTO chatbot_history
            (vehicle_id, user_message, bot_response, status)
            VALUES (?, ?, ?, ?)
            """,
            (request.vehicle_id, request.message, response, status)
        )

        connection.commit()

        return {
            "message_id": cursor.lastrowid,
            "status": status,
            "response": response
        }


# ==========================================
# CHAT HISTORY
# ==========================================

@app.get("/vehicles/{vehicle_id}/chat-history")
def get_chat_history(vehicle_id: int):
    with get_db() as connection:
        get_vehicle(connection, vehicle_id)

        rows = connection.execute(
            """
            SELECT *
            FROM chatbot_history
            WHERE vehicle_id = ?
            ORDER BY created_at ASC, chat_id ASC
            """,
            (vehicle_id,)
        ).fetchall()

        return [dict(row) for row in rows]


# ==========================================
# MAINTENANCE HISTORY
# ==========================================

@app.get("/vehicles/{vehicle_id}/maintenance")
def get_maintenance(vehicle_id: int):
    with get_db() as connection:
        get_vehicle(connection, vehicle_id)

        rows = connection.execute(
            """
            SELECT *
            FROM maintenance_history
            WHERE vehicle_id = ?
            ORDER BY service_date DESC, maintenance_id DESC
            """,
            (vehicle_id,)
        ).fetchall()

        return [dict(row) for row in rows]


# ==========================================
# MAINTENANCE STATUS
# ==========================================

@app.get("/vehicles/{vehicle_id}/maintenance-status")
def get_maintenance_status(vehicle_id: int):
    with get_db() as connection:
        vehicle = get_vehicle(connection, vehicle_id)

        return {
            "vehicle_id": vehicle_id,
            "vehicle": vehicle_name(vehicle),
            "items": calculate_maintenance_status(
                connection, vehicle_id
            )
        }


# ==========================================
# ADD MAINTENANCE RECORD
# ==========================================

@app.post("/maintenance")
def add_maintenance(request: MaintenanceRequest):
    with get_db() as connection:
        get_vehicle(connection, request.vehicle_id)

        cursor = connection.execute(
            """
            INSERT INTO maintenance_history
            (
                vehicle_id,
                service_type,
                service_date,
                mileage,
                cost,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                request.vehicle_id,
                request.service_type,
                request.service_date.isoformat(),
                request.mileage,
                request.cost,
                request.notes
            )
        )

        connection.commit()

        return {
            "maintenance_id": cursor.lastrowid,
            "message": "Maintenance record saved successfully"
        }
