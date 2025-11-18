import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Charts = ({ telemetry, history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="data-card">
        <h3>Telemetry Charts</h3>
        <p>Waiting for data...</p>
      </div>
    )
  }

  const chartData = history.map((point, index) => ({
    time: index,
    altitude: point.position?.relative_altitude || 0,
    groundSpeed: point.position?.ground_speed || 0,
    airSpeed: point.status?.airspeed || 0,
    climbRate: point.status?.climb_rate || 0,
    battery: point.battery?.remaining || 0
  }))

  return (
    <div className="data-card">
      <h3>Telemetry Charts</h3>
      <div className="charts-container">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="altitude" stroke="#3b82f6" name="Altitude (m)" />
            <Line type="monotone" dataKey="climbRate" stroke="#10b981" name="Climb Rate (m/s)" />
          </LineChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="groundSpeed" stroke="#f59e0b" name="Ground Speed (m/s)" />
            <Line type="monotone" dataKey="airSpeed" stroke="#ef4444" name="Air Speed (m/s)" />
          </LineChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="battery" stroke="#8b5cf6" name="Battery %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Charts