import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root ():
    return {"message":"F1 Dashboard is running!"}

@app.get("/drivers")
def get_drivers():
    response = requests.get(
        "https://api.openf1.org/v1/drivers",
        params={"session_key": 9523}
    )
    return response.json()