# main.py

from fastapi import FastAPI
from pydantic import BaseModel
import csv
import os

app = FastAPI(title="Telemetry API with Sensor Status")


# Telemetry model matching the CDR CSV format
class Telemetry(BaseModel):
    TEAM_ID: str
    MISSION_TIME: str
    PACKET_COUNT: int
    MODE: str
    STATE: str
    ALTITUDE: float
    AIR_SPEED: float
    HS_DEPLOYED: str
    PC_DEPLOYED: str
    TEMPERATURE: float
    PRESSURE: float
    VOLTAGE: float
    GPS_TIME: str
    GPS_ALTITUDE: float
    GPS_LATITUDE: float
    GPS_LONGITUDE: float
    GPS_SATS: int
    TILT_X: float
    TILT_Y: float
    ROT_Z: float
    CMD_ECHO: str

# Path to the CSV file
CSV_FILE = os.path.join(os.path.dirname(__file__), "telemetry.csv")

# Helper to read the latest row from the CSV file
def read_latest_telemetry():
    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")
    with open(CSV_FILE, "r") as f:
        reader = csv.reader(f)
        rows = list(reader)
        if len(rows) < 2:
            raise ValueError("No telemetry data available in CSV.")
        header = rows[0]
        last_row = rows[-1]
        # Map header to row
        data = dict(zip(header, last_row))
        # Convert types as needed
        return Telemetry(
            TEAM_ID=data["TEAM_ID"],
            MISSION_TIME=data["MISSION_TIME"],
            PACKET_COUNT=int(data["PACKET_COUNT"]),
            MODE=data["MODE"],
            STATE=data["STATE"],
            ALTITUDE=float(data["ALTITUDE"]),
            AIR_SPEED=float(data["AIR_SPEED"]),
            HS_DEPLOYED=data["HS_DEPLOYED"],
            PC_DEPLOYED=data["PC_DEPLOYED"],
            TEMPERATURE=float(data["TEMPERATURE"]),
            PRESSURE=float(data["PRESSURE"]),
            VOLTAGE=float(data["VOLTAGE"]),
            GPS_TIME=data["GPS_TIME"],
            GPS_ALTITUDE=float(data["GPS_ALTITUDE"]),
            GPS_LATITUDE=float(data["GPS_LATITUDE"]),
            GPS_LONGITUDE=float(data["GPS_LONGITUDE"]),
            GPS_SATS=int(data["GPS_SATS"]),
            TILT_X=float(data["TILT_X"]),
            TILT_Y=float(data["TILT_Y"]),
            ROT_Z=float(data["ROT_Z"]),
            CMD_ECHO=data["CMD_ECHO"]
        )

@app.get("/telemetry", response_model=Telemetry)
def get_telemetry():
    """
    Returns the latest telemetry data from the CSV file.
    """
    return read_latest_telemetry()
