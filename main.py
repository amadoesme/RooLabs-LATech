
import sqlite3
from pathlib import Path
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

    with get_db() as connection:

        schema_path = DB_DIR / "schema.sql"
        seed_path = DB_DIR / "seed.sql"

        if not schema_path.exists():
            raise RuntimeError("database/schema.sql is missing")

        connection.executescript(
            schema_path.read_text(encoding="utf-8")
        )

        # Handle older local databases without the trim column
        columns = connection.execute(
            "PRAGMA table_info(vehicles)"
        ).fetchall()

        column_names = [column["name"] for column in columns]

        if "trim" not in column_names:
            connection.execute(
                "ALTER TABLE vehicles ADD COLUMN trim TEXT"
            )

        # Seed only when the database is newly initialized
        existing_users = connection.execute(
            "SELECT COUNT(*) FROM users"
        ).fetchone()[0]

        if existing_users == 0:
            if not seed_path.exists():
                raise RuntimeError("database/seed.sql is missing")

            connection.executescript(
                seed_path.read_text(encoding="utf-8")
            )

        # Ensure the default demo vehicle exists
        vehicle = connection.execute(
            "SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?",
            (DEFAULT_VEHICLE_ID,)
        ).fetchone()

        if vehicle is None:
            raise RuntimeError(
                "Default demo vehicle is missing. "
                "Check database/seed.sql."
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
    service_date: str
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
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return vehicle


def format_vehicle_name(vehicle):

    return (
        f"{vehicle['year']} "
        f"{vehicle['make']} "
        f"{vehicle['model']} "
        f"{vehicle['trim'] or ''}"
    ).strip()


def format_response(title, vehicle_name, safety,
                    maintenance, causes, recommendation):

    return (
        f"{title}\n\n"
        f"Vehicle: {vehicle_name}\n\n"
        f"Safety: {safety}\n\n"
        f"Maintenance History: {maintenance}\n\n"
        f"Possible Causes: {causes}\n\n"
        f"Recommendation: {recommendation}"
    )


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

        vehicle = get_vehicle(
            connection,
            request.vehicle_id
        )

        vehicle_name = format_vehicle_name(vehicle)

        # ----------------------------------
        # OVERHEATING
        # ----------------------------------

        if (
            "overheat" in message
            or "overheating" in message
            or "running hot" in message
        ):

            coolant = connection.execute(
                """
                SELECT service_date, mileage
                FROM maintenance_history
                WHERE vehicle_id = ?
                  AND LOWER(service_type) LIKE '%coolant%'
                ORDER BY service_date DESC, maintenance_id DESC
                LIMIT 1
                """,
                (request.vehicle_id,)
            ).fetchone()

            if coolant:
                maintenance = (
                    f"Your last recorded coolant service "
                    f"was on {coolant['service_date']} "
                    f"at {coolant['mileage']:,} miles."
                    if coolant["mileage"] is not None
                    else (
                        "Your last recorded coolant service "
                        f"was on {coolant['service_date']}."
                    )
                )
            else:
                maintenance = (
                    "No previous coolant service "
                    "was found in your records."
                )

            status = "red"

            response = format_response(
                title="OVERHEATING WARNING",
                vehicle_name=vehicle_name,
                safety=(
                    "Pull over safely, turn off the engine, "
                    "and allow it to cool."
                ),
                maintenance=maintenance,
                causes=(
                    "Low coolant, coolant leaks, "
                    "thermostat issues, water pump problems, "
                    "or other cooling-system faults."
                ),
                recommendation=(
                    "Do not open the radiator cap while hot. "
                    "Arrange an inspection or tow before driving again."
                )
            )

        # ----------------------------------
        # BRAKES OR SMOKE
        # ----------------------------------

        elif "brake" in message or "smoke" in message:

            status = "red"

            response = format_response(
                title="CRITICAL SAFETY WARNING",
                vehicle_name=vehicle_name,
                safety=(
                    "Pull over safely and stop driving."
                ),
                maintenance=(
                    "Review your vehicle's maintenance records."
                ),
                causes=(
                    "Potential braking-system or mechanical problems."
                ),
                recommendation=(
                    "Contact roadside assistance or a mechanic. "
                    "Do not continue driving if the vehicle is unsafe."
                )
            )

        # ----------------------------------
        # CHECK ENGINE OR TIRE
        # ----------------------------------

        elif (
            "check engine" in message
            or "tire" in message
        ):

            status = "yellow"

            response = format_response(
                title="VEHICLE ATTENTION REQUIRED",
                vehicle_name=vehicle_name,
                safety=(
                    "Proceed with caution only if the vehicle "
                    "is operating normally and is safe to drive."
                ),
                maintenance=(
                    "Check your maintenance history "
                    "for related services."
                ),
                causes=(
                    "Possible engine, sensor, or tire-related issues."
                ),
                recommendation=(
                    "Have the vehicle inspected. "
                    "If the check engine light is flashing "
                    "or a tire is flat or unsafe, stop driving safely."
                )
            )

        # ----------------------------------
        # GREETING
        # ----------------------------------

        elif (
            "hello" in message
            or "i need help" in message
            or message in ("hi", "hey")
        ):

            status = "green"

            response = (
                "VEHICLE DIAGNOSTIC ASSISTANT\n\n"
                f"Vehicle: {vehicle_name}\n\n"
                "Hello! I'm here to help with your vehicle.\n\n"
                "Describe the issue you're experiencing, "
                "and I'll provide general safety guidance."
            )

        # ----------------------------------
        # UNKNOWN ISSUE
        # ----------------------------------

        else:

            status = "unknown"

            response = (
                "ADDITIONAL INFORMATION NEEDED\n\n"
                f"Vehicle: {vehicle_name}\n\n"
                "I couldn't determine the severity "
                "from your description.\n\n"
                "Please provide more details about "
                "what is happening with your vehicle.\n\n"
                "If the vehicle seems unsafe to operate, "
                "stop driving safely and seek professional assistance."
            )

        # ----------------------------------
        # SAVE CHAT HISTORY
        # ----------------------------------

        cursor = connection.execute(
            """
            INSERT INTO chatbot_history
            (vehicle_id, user_message, bot_response, status)
            VALUES (?, ?, ?, ?)
            """,
            (
                request.vehicle_id,
                request.message,
                response,
                status
            )
        )

        return {
            "message_id": cursor.lastrowid,
            "status": status,
            "response": response
        }


# ==========================================
# GET CHATBOT HISTORY
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
# GET MAINTENANCE HISTORY
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
                request.service_date,
                request.mileage,
                request.cost,
                request.notes
            )
        )

        return {
            "maintenance_id": cursor.lastrowid,
            "message": "Maintenance record saved successfully"
        }
