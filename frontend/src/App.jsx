import React, { useState, useEffect, useRef } from 'react'
import ConnectionStatus from './components/ConnectionStatus'
import TelemetryDisplay from './components/TelemetryDisplay'
import Charts from './components/Charts'
import MapView from './components/MapView'
import CommandPanel from './components/CommandPanel'
import VideoStream from './components/VideoStream'
import NetworkControls from './components/NetworkControls'
import './App.css'

function App() {
  const [telemetry, setTelemetry] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [websocket, setWebsocket] = useState(null)
  const [systemInfo, setSystemInfo] = useState(null)
  const telemetryHistory = useRef([])

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8765')
    
    ws.onopen = () => {
      console.log('Connected to GCS backend')
      setConnectionStatus('connected')
    }
    
    ws.onclose = () => {
      console.log('Disconnected from GCS backend')
      setConnectionStatus('disconnected')
      // Attempt reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('disconnected')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'system_info') {
          console.log('Received system info:', data)
          setSystemInfo(data)
        }
        else if (data.type === 'telemetry') {
          const newTelemetry = data.data
          setTelemetry(newTelemetry)
          
          // Keep last 100 data points for charts
          telemetryHistory.current.push({
            timestamp: data.timestamp,
            ...newTelemetry
          })
          if (telemetryHistory.current.length > 100) {
            telemetryHistory.current.shift()
          }
        }
        else if (data.type === 'network_update') {
          console.log('Network updated:', data.network)
          // Update telemetry with new network info
          setTelemetry(prev => prev ? { ...prev, network: data.network } : null)
        }
        else if (data.type === 'command_response') {
          console.log('Command response:', data)
          // Handle command responses if needed
        }
        
      } catch (error) {
        console.error('Error parsing WebSocket data:', error)
      }
    }
    
    setWebsocket(ws)
  }

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  const sendCommand = (command, params = {}) => {
    if (websocket && connectionStatus === 'connected') {
      const message = {
        type: 'command',
        command: command,
        params: params
      }
      websocket.send(JSON.stringify(message))
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🚁 MAVLink Ground Control Station</h1>
          <div className="subtitle">
            Advanced Cloud-Based GCS with MAVLink Protocol
          </div>
        </div>
        <div className="header-right">
          <ConnectionStatus status={connectionStatus} />
          {systemInfo && (
            <div className="feature-badges">
              {systemInfo.features?.mavlink && (
                <span className="feature-badge">MAVLink</span>
              )}
              {systemInfo.features?.zerotier_vpn && (
                <span className="feature-badge">ZeroTier VPN</span>
              )}
              {systemInfo.features?.video_streaming && (
                <span className="feature-badge">WebRTC Video</span>
              )}
            </div>
          )}
        </div>
      </header>
      
      <main className="app-main">
        <div className="dashboard-grid">
          {/* Left Panel - Controls and Status */}
          <div className="status-panel">
            <NetworkControls 
              websocket={websocket} 
              connectionStatus={connectionStatus}
              networkInfo={telemetry?.network}
            />
            
            <TelemetryDisplay telemetry={telemetry} />
            
            <CommandPanel 
              onSendCommand={sendCommand} 
              disabled={connectionStatus !== 'connected'}
            />

            {/* System Information Card */}
            <div className="data-card">
              <h3>System Information</h3>
              <div className="system-info">
                {systemInfo ? (
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Backend Version:</label>
                      <span>v1.0.0</span>
                    </div>
                    <div className="info-item">
                      <label>Protocol:</label>
                      <span>MAVLink v2.0</span>
                    </div>
                    <div className="info-item">
                      <label>WebSocket:</label>
                      <span className={connectionStatus === 'connected' ? 'status-connected' : 'status-disconnected'}>
                        {connectionStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Update Rate:</label>
                      <span>10 Hz</span>
                    </div>
                    {systemInfo.features && (
                      <>
                        <div className="info-item">
                          <label>VPN:</label>
                          <span className="status-connected">
                            {systemInfo.features.zerotier_vpn ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <div className="info-item">
                          <label>Video Stream:</label>
                          <span className="status-connected">
                            {systemInfo.features.video_streaming ? 'READY' : 'OFFLINE'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="loading-info">
                    Connecting to backend system...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Visualizations */}
          <div className="visualization-panel">
            <VideoStream />
            
            <Charts 
              telemetry={telemetry} 
              history={telemetryHistory.current} 
            />
            
            <MapView telemetry={telemetry} />

            {/* Network Status Card */}
            {telemetry?.network && (
              <div className="data-card">
                <h3>Network Status</h3>
                <div className="network-status-detailed">
                  <div className="network-metrics">
                    <div className="metric">
                      <div className="metric-label">Connection Type</div>
                      <div className="metric-value">{telemetry.network.type}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Latency</div>
                      <div className="metric-value">{telemetry.network.latency_ms}ms</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Bandwidth</div>
                      <div className="metric-value">{telemetry.network.bandwidth_mbps} Mbps</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Status</div>
                      <div className={`metric-value status-${telemetry.network.connected ? 'connected' : 'disconnected'}`}>
                        {telemetry.network.connected ? 'CONNECTED' : 'DISCONNECTED'}
                      </div>
                    </div>
                  </div>
                  
                  {telemetry.remote_access && (
                    <div className="remote-access-info">
                      <h4>Remote Access</h4>
                      <div className="remote-details">
                        <div>Protocol: {telemetry.remote_access.protocol}</div>
                        <div>Latency: {telemetry.remote_access.latency_ms}ms</div>
                        <div>Status: <span className="status-connected">ACTIVE</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer with connection info */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>MAVLink GCS v1.0.0</span>
            <span className="footer-separator">|</span>
            <span>WebSocket: ws://localhost:8765</span>
          </div>
          <div className="footer-right">
            <span>Status: </span>
            <span className={`status-${connectionStatus}`}>
              {connectionStatus.toUpperCase()}
            </span>
            <span className="footer-separator">|</span>
            <span>Clients: {websocket ? '1' : '0'}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App