import React from 'react';

const NetworkControls = ({ websocket, connectionStatus, networkInfo }) => {
  const switchNetwork = (networkType) => {
    if (websocket && connectionStatus === 'connected') {
      const message = {
        type: 'network_switch',
        network: networkType
      };
      websocket.send(JSON.stringify(message));
    }
  };

  return (
    <div className="data-card">
      <h3>Network Connectivity</h3>
      
      <div className="network-status" style={{ marginBottom: '15px' }}>
        {networkInfo && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <strong>Type:</strong> {networkInfo.type}
            </div>
            <div>
              <strong>Latency:</strong> {networkInfo.latency_ms}ms
            </div>
            <div>
              <strong>Bandwidth:</strong> {networkInfo.bandwidth_mbps} Mbps
            </div>
            <div>
              <strong>Status:</strong> 
              <span style={{ 
                color: networkInfo.connected ? '#10b981' : '#ef4444',
                marginLeft: '5px'
              }}>
                ●
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="network-controls">
        <h4>Switch Network Type:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['WIFI', 'LTE', 'FIVE_G', 'ETHERNET'].map(network => (
            <button
              key={network}
              className="command-button"
              style={{ 
                backgroundColor: '#8b5cf6',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              onClick={() => switchNetwork(network)}
              disabled={connectionStatus !== 'connected'}
            >
              {network.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '15px', 
        padding: '10px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '5px',
        fontSize: '0.8rem'
      }}>
        <strong>ZeroTier VPN:</strong> Enabled
        <br />
        <small>Remote access via secure VPN tunnel</small>
      </div>
    </div>
  );
};

export default NetworkControls;