import React from 'react'

const TelemetryDisplay = ({ telemetry }) => {
  if (!telemetry) {
    return (
      <div className="data-card">
        <h3>Waiting for telemetry data...</h3>
      </div>
    )
  }

  const { heartbeat, position, battery, attitude, status } = telemetry

  return (
    <div className="telemetry-display">
      <div className="data-card">
        <h3>Flight Status</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <label>Flight Mode:</label>
            <span className="value">{heartbeat.flight_mode || 'UNKNOWN'}</span>
          </div>
          <div className="telemetry-item">
            <label>System Status:</label>
            <span className="value">{heartbeat.system_status || 'N/A'}</span>
          </div>
          <div className="telemetry-item">
            <label>Arm Status:</label>
            <span className="value">
              {heartbeat.base_mode & 0x80 ? 'ARMED' : 'DISARMED'}
            </span>
          </div>
        </div>
      </div>

      <div className="data-card">
        <h3>Position & Altitude</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <label>Latitude:</label>
            <span className="value">{position.latitude?.toFixed(6) || 'N/A'}</span>
          </div>
          <div className="telemetry-item">
            <label>Longitude:</label>
            <span className="value">{position.longitude?.toFixed(6) || 'N/A'}</span>
          </div>
          <div className="telemetry-item">
            <label>Altitude:</label>
            <span className="value">{position.altitude?.toFixed(1) || 'N/A'} m</span>
          </div>
          <div className="telemetry-item">
            <label>Relative Alt:</label>
            <span className="value">{position.relative_altitude?.toFixed(1) || 'N/A'} m</span>
          </div>
        </div>
      </div>

      <div className="data-card">
        <h3>Movement & Speed</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <label>Ground Speed:</label>
            <span className="value">{position.ground_speed?.toFixed(1) || 'N/A'} m/s</span>
          </div>
          <div className="telemetry-item">
            <label>Air Speed:</label>
            <span className="value">{status.airspeed?.toFixed(1) || 'N/A'} m/s</span>
          </div>
          <div className="telemetry-item">
            <label>Heading:</label>
            <span className="value">{position.heading?.toFixed(1) || 'N/A'}°</span>
          </div>
          <div className="telemetry-item">
            <label>Climb Rate:</label>
            <span className="value">{status.climb_rate?.toFixed(1) || 'N/A'} m/s</span>
          </div>
        </div>
      </div>

      <div className="data-card">
        <h3>Attitude</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <label>Roll:</label>
            <span className="value">{attitude.roll?.toFixed(1) || 'N/A'}°</span>
          </div>
          <div className="telemetry-item">
            <label>Pitch:</label>
            <span className="value">{attitude.pitch?.toFixed(1) || 'N/A'}°</span>
          </div>
          <div className="telemetry-item">
            <label>Yaw:</label>
            <span className="value">{attitude.yaw?.toFixed(1) || 'N/A'}°</span>
          </div>
        </div>
      </div>

      <div className="data-card">
        <h3>Battery</h3>
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <label>Remaining:</label>
            <span className="value">{battery.remaining || 'N/A'}%</span>
          </div>
          <div className="telemetry-item">
            <label>Voltage:</label>
            <span className="value">{battery.voltage?.toFixed(2) || 'N/A'} V</span>
          </div>
          <div className="telemetry-item">
            <label>Current:</label>
            <span className="value">{battery.current?.toFixed(2) || 'N/A'} A</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelemetryDisplay