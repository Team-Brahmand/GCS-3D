// app/GCSDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Terminal from "@/components/Terminal";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CanSat from "@/CanSat"; // A simple red cylinder simulation of the CanSat
import PositionGraph from "@/components/PositionGraph";
import { Sun, Moon } from "lucide-react";

// Dummy launch station coordinates (for relative positioning)
const LAUNCH_LAT = 28.6139;
const LAUNCH_LNG = 77.209;
const LAUNCH_ALT = 1000;

const GCSDashboard: React.FC = () => {
  // Dark mode toggling via next-themes
  const { theme, setTheme } = useTheme();

  // Sensor data states
  const [altitude, setAltitude] = useState(LAUNCH_ALT);
  const [temperature, setTemperature] = useState(25);
  const [pressure, setPressure] = useState(1013);
  const [humidity, setHumidity] = useState(50);
  const [battery, setBattery] = useState(100);
  const [gnssLat, setGnssLat] = useState(LAUNCH_LAT);
  const [gnssLng, setGnssLng] = useState(LAUNCH_LNG);
  const [gyroOrientation, setGyroOrientation] = useState({
    pitch: 0,
    yaw: 0,
    roll: 0,
  });
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [airQuality, setAirQuality] = useState(10);
  const [systemState, setSystemState] = useState(0); // For example purposes

  // Telemetry chart data history – now includes pressure
  const [chartData, setChartData] = useState<
    {
      time: number;
      altitude: number;
      temperature: number;
      humidity: number;
      pressure: number;
    }[]
  >([]);

  // Sensor statuses (for color coding)
  const SENSOR_STATUS = { ACTIVE: "green", ERROR: "red", STANDBY: "blue" };
  const [status, setStatus] = useState({
    GNSS: SENSOR_STATUS.ACTIVE,
    Altimetry: SENSOR_STATUS.ACTIVE,
    Pressure: SENSOR_STATUS.ACTIVE,
    Temperature: SENSOR_STATUS.ACTIVE,
    Gyro: SENSOR_STATUS.ACTIVE,
    Power: SENSOR_STATUS.ACTIVE,
    AirQuality: SENSOR_STATUS.ACTIVE,
  });

  // Relative location for 3D simulation (difference from launch position)
  const [relativeLocation, setRelativeLocation] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  // State to choose third graph metric: "humidity" or "pressure"
  const [thirdMetric, setThirdMetric] = useState<"humidity" | "pressure">(
    "humidity"
  );

  // Simulate sensor updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Update sensor values (simulate sensor data)
      setAltitude((prev) => Math.max(0, prev - 5 + (Math.random() - 0.5) * 10));
      setTemperature((prev) => prev + (Math.random() - 0.5));
      setPressure((prev) => 1013 + (Math.random() - 0.5) * 5);
      setHumidity((prev) =>
        Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3))
      );
      setBattery((prev) => Math.max(0, prev - 0.2 - Math.random() * 0.2));
      setGnssLat((prev) => prev + (Math.random() - 0.5) * 0.0001);
      setGnssLng((prev) => prev + (Math.random() - 0.5) * 0.0001);
      setGyroOrientation((prev) => ({
        pitch: (prev.pitch + Math.random() * 5) % 360,
        yaw: (prev.yaw + Math.random() * 5) % 360,
        roll: (prev.roll + Math.random() * 5) % 360,
      }));
      setAcceleration(() => ({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
      }));
      setAirQuality((prev) => Math.max(0, prev + (Math.random() - 0.5) * 2));

      // Update telemetry history (keep last 20 data points)
      setChartData((prevData) => [
        ...prevData.slice(-19),
        {
          time: prevData.length,
          altitude: parseFloat(altitude.toFixed(2)),
          temperature: parseFloat(temperature.toFixed(2)),
          humidity: parseFloat(humidity.toFixed(2)),
          pressure: parseFloat(pressure.toFixed(2)),
        },
      ]);

      // Calculate relative location (approximate conversion: degrees to meters)
      setRelativeLocation({
        x: (gnssLng - LAUNCH_LNG) * 111320,
        y: altitude - LAUNCH_ALT,
        z: (gnssLat - LAUNCH_LAT) * 110540,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gnssLng, gnssLat, altitude, temperature, humidity, pressure]);

  const handleSendCommand = (command: string) => {
    console.log("Command sent to client:", command);
  };

  const handleCalibrate = () => {
    setAltitude(LAUNCH_ALT);
    setTemperature(25);
    setPressure(1013);
    setHumidity(50);
    setBattery(100);
    setGnssLat(LAUNCH_LAT);
    setGnssLng(LAUNCH_LNG);
    setGyroOrientation({ pitch: 0, yaw: 0, roll: 0 });
    setAirQuality(10);
  };

  return (
    <div className="h-screen p-2 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-2 flex justify-between items-center">
        <h1 className="text-xl font-bold">GCS Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Dark Mode</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-6 w-6 text-yellow-500" />
            ) : (
              <Moon className="h-6 w-6 text-blue-500" />
            )}
          </button>
        </div>
      </header>

      {/* Grid Layout: 2 columns × 3 rows */}
      <div className="grid grid-cols-2 grid-rows-3 gap-2 h-[calc(100%-2.5rem)]">
        {/* SENSOR READOUTS (Row 1, Col 1) */}
        <div className="overflow-auto p-1">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Readouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p>
                    <strong>GNSS</strong>{" "}
                    <span style={{ color: status.GNSS }}>●</span>
                  </p>
                  <p>Lat: {gnssLat.toFixed(6)}°</p>
                  <p>Lng: {gnssLng.toFixed(6)}°</p>
                </div>
                <div>
                  <p>
                    <strong>Altimetry</strong>{" "}
                    <span style={{ color: status.Altimetry }}>●</span>
                  </p>
                  <p>{altitude.toFixed(2)} m</p>
                </div>
                <div>
                  <p>
                    <strong>Pressure</strong>{" "}
                    <span style={{ color: status.Pressure }}>●</span>
                  </p>
                  <p>{pressure.toFixed(2)} hPa</p>
                </div>
                <div>
                  <p>
                    <strong>Temperature</strong>{" "}
                    <span style={{ color: status.Temperature }}>●</span>
                  </p>
                  <p>{temperature.toFixed(2)} °C</p>
                </div>
                <div>
                  <p>
                    <strong>Gyro / Accel</strong>{" "}
                    <span style={{ color: status.Gyro }}>●</span>
                  </p>
                  <p>Pitch: {gyroOrientation.pitch.toFixed(2)}°</p>
                  <p>Yaw: {gyroOrientation.yaw.toFixed(2)}°</p>
                  <p>Roll: {gyroOrientation.roll.toFixed(2)}°</p>
                  <p>
                    Accel: {acceleration.x.toFixed(2)},{" "}
                    {acceleration.y.toFixed(2)}, {acceleration.z.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Power</strong>{" "}
                    <span style={{ color: status.Power }}>●</span>
                  </p>
                  <p>{battery.toFixed(2)}%</p>
                </div>
                <div>
                  <p>
                    <strong>Air Quality (PM2.5)</strong>{" "}
                    <span style={{ color: status.AirQuality }}>●</span>
                  </p>
                  <p>{airQuality.toFixed(2)} µg/m³</p>
                </div>
              </div>
              <div className="mt-1 text-xs font-bold">
                System State: BOOT (simulated)
              </div>
              <div className="mt-1">
                <Button onClick={handleCalibrate} size="sm">
                  Calibrate Sensors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TELEMETRY CHARTS (Row 1, Col 2) */}
        <div className="overflow-auto p-1">
          <Card>
            <CardHeader>
              <CardTitle>Telemetry Charts</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Toggle for third metric */}
              <div className="flex justify-end mb-2 space-x-2">
                <Button
                  size="sm"
                  variant={thirdMetric === "humidity" ? "default" : "outline"}
                  onClick={() => setThirdMetric("humidity")}
                >
                  Humidity
                </Button>
                <Button
                  size="sm"
                  variant={thirdMetric === "pressure" ? "default" : "outline"}
                  onClick={() => setThirdMetric("pressure")}
                >
                  Pressure
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Altitude Graph */}
                <div className="border p-1">
                  <h2 className="text-xs font-bold text-center">
                    Altitude (m)
                  </h2>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                        domain={[0, 1100]}
                      />
                      <Tooltip wrapperStyle={{ fontSize: "10px" }} />
                      <Line
                        type="monotone"
                        dataKey="altitude"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Temperature Graph */}
                <div className="border p-1">
                  <h2 className="text-xs font-bold text-center">
                    Temperature (°C)
                  </h2>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                        domain={["dataMin - 5", "dataMax + 5"]}
                      />
                      <Tooltip wrapperStyle={{ fontSize: "10px" }} />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Third Graph: Humidity or Pressure */}
                <div className="border p-1">
                  <h2 className="text-xs font-bold text-center">
                    {thirdMetric === "humidity"
                      ? "Humidity (%)"
                      : "Pressure (hPa)"}
                  </h2>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={{ stroke: "#ccc" }}
                        tickLine={{ stroke: "#ccc" }}
                        domain={
                          thirdMetric === "humidity" ? [0, 100] : [1000, 1020]
                        }
                      />
                      <Tooltip wrapperStyle={{ fontSize: "10px" }} />
                      <Line
                        type="monotone"
                        dataKey={thirdMetric}
                        stroke={
                          thirdMetric === "humidity" ? "#ffc658" : "#ff7300"
                        }
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D SIMULATION OF THE CANSAT (Row 2, Col 1) */}
        <div className="overflow-auto p-1">
          <Card>
            <CardHeader>
              <CardTitle>3D Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <Canvas camera={{ position: [5, 5, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls />
                <CanSat
                  position={[0, 0, 0]}
                  rotation={[
                    (gyroOrientation.pitch * Math.PI) / 180,
                    (gyroOrientation.yaw * Math.PI) / 180,
                    (gyroOrientation.roll * Math.PI) / 180,
                  ]}
                />
                <gridHelper args={[1, 1]} />
              </Canvas>
            </CardContent>
          </Card>
        </div>

        {/* 3D POSITION GRAPH (Row 2, Col 2) */}
        <div className="overflow-auto p-1">
          <Card>
            <CardHeader>
              <CardTitle>3D Position Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <PositionGraph
                position={{
                  x: relativeLocation.x / 100000, // adjust scale as needed
                  y: relativeLocation.y / 100, // adjust scale as needed
                  z: relativeLocation.z / 100000,
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* TERMINAL (Row 3, spanning both columns) */}
        <div className="col-span-2 overflow-auto p-1">
          <Card>
            <CardHeader>
              <CardTitle>Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <Terminal onSendCommand={handleSendCommand} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GCSDashboard;
