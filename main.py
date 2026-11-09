from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

# Allows the mobile frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
class MaintenanceRecord(BaseModel):
    issue: str
    status: str
    recommendation: str

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.post("/chat")
def chat(request: ChatRequest):
    message = request.message.lower()

    if "brake" in message or "smoke" in message:
        return {
            "status": "red",
            "response": "Pull over immediately and call for assistance or a tow."
        }

    elif "check engine" in message or "tire" in message:
        return {
            "status": "yellow",
            "response": "Proceed with caution and drive to a mechanic."
        }

    else:
        return {
            "status": "green",
            "response": "You may continue driving, but monitor the issue."
        }
maintenance_history = []

@app.post("/maintenance")
def save_maintenance(record: MaintenanceRecord):
    saved_record = {
        "issue": record.issue,
        "status": record.status,
        "recommendation": record.recommendation,
        "date": datetime.now().isoformat()
    }

    maintenance_history.append(saved_record)

    return saved_record


@app.get("/maintenance")
def get_maintenance():
    return maintenance_history