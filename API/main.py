# main.py
from fastapi import FastAPI
from pydantic import BaseModel
import random
import time

app = FastAPI(title="Telemetry API with Sensor Status")

# Define models for parts of the telemetry data
class GNSS(BaseModel):
    lat: float
    lng: float

class Gyro(BaseModel):
    pitch: float
    yaw: float
    roll: float

class Acceleration(BaseModel):
    x: float
    y: float
    z: float

# You can also define a dedicated model for sensor statuses if desired:
class SensorStatus(BaseModel):
    gnss: str
    altimetry: str
    pressure: str
    temperature: str
    gyro: str
    power: str
    airQuality: str

# The main telemetry model includes sensor status and a system state.
class Telemetry(BaseModel):
    timestamp: float
    altitude: float
    temperature: float
    pressure: float
    humidity: float
    battery: float
    gnss: GNSS
    gyro: Gyro
    acceleration: Acceleration
    airQuality: float
    sensor_status: SensorStatus
    system_state: int

@app.get("/telemetry", response_model=Telemetry)
def get_telemetry():
    timestamp = time.time()
    # Simulate sensor values
    altitude = 100 - random.uniform(0, 10)  # simulate descent
    temperature = 25 + random.uniform(-1, 1)
    pressure = 1013 + random.uniform(-5, 5)
    humidity = 50 + random.uniform(-3, 3)
    battery = 100 - random.uniform(0, 1)
    airQuality = 10 + random.uniform(-2, 2)
    gnss = GNSS(
        lat=28.6139 + random.uniform(-0.0001, 0.0001),
        lng=77.209 + random.uniform(-0.0001, 0.0001)
    )
    gyro = Gyro(
        pitch=random.uniform(0, 360),
        yaw=random.uniform(0, 360),
        roll=random.uniform(0, 360)
    )
    acceleration = Acceleration(
        x=random.uniform(-2, 2),
        y=random.uniform(-2, 2),
        z=random.uniform(-2, 2)
    )

    # Compute sensor statuses based on thresholds (adjust these thresholds as needed):
    sensor_status = SensorStatus(
        gnss="ACTIVE",  # Assume GNSS is always active
        altimetry="ERROR" if altitude < 50 else "ACTIVE",
        pressure="ERROR" if pressure < 1000 or pressure > 1020 else "ACTIVE",
        temperature="ERROR" if temperature < 0 or temperature > 40 else "ACTIVE",
        gyro="ACTIVE",  # Assume gyro is always active (or add logic)
        power="ERROR" if battery < 20 else "ACTIVE",
        airQuality="ERROR" if airQuality > 35 else "ACTIVE"
    )

    # For simulation, set system_state to 0 (you can modify this as needed)
    system_state = 0

    return Telemetry(
        timestamp=timestamp,
        altitude=altitude,
        temperature=temperature,
        pressure=pressure,
        humidity=humidity,
        battery=battery,
        gnss=gnss,
        gyro=gyro,
        acceleration=acceleration,
        airQuality=airQuality,
        sensor_status=sensor_status,
        system_state=system_state
    )
