from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.post("/chat")
def chat(request: ChatRequest):
    message = request.message.lower()
     if "hello" in message or "i need help" in message:
        return {
            "status": "green",
            "response": "Hello! I’m here to help. Tell me what is happening with your car."
        }

    elif "brake" in message or "smoke" in message:
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