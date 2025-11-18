import React, { useRef, useEffect, useState } from 'react';

const VideoStream = () => {
  const videoRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const startVideoStream = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Simulate WebRTC connection
      setTimeout(() => {
        setConnectionStatus('connected');
        setStreaming(true);
        
        // Simulate video stream
        if (videoRef.current) {
          videoRef.current.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              background: linear-gradient(45deg, #1e293b, #374151);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 18px;
              border-radius: 8px;
            ">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                <div>LIVE VIDEO STREAM</div>
                <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">
                  WebRTC Stream - 720p @ 30fps
                </div>
                <div style="font-size: 12px; opacity: 0.7;">
                  Latency: < 200ms
                </div>
              </div>
            </div>
          `;
        }
      }, 1000);
      
    } catch (error) {
      console.error('Video stream error:', error);
      setConnectionStatus('error');
    }
  };

  const stopVideoStream = () => {
    setStreaming(false);
    setConnectionStatus('disconnected');
    if (videoRef.current) {
      videoRef.current.innerHTML = '';
    }
  };

  return (
    <div className="data-card">
      <h3>Live Video Stream (WebRTC)</h3>
      
      <div className="video-controls" style={{ marginBottom: '15px' }}>
        {!streaming ? (
          <button 
            className="command-button"
            onClick={startVideoStream}
            style={{ backgroundColor: '#10b981' }}
          >
            Start Video Stream
          </button>
        ) : (
          <button 
            className="command-button"
            onClick={stopVideoStream}
            style={{ backgroundColor: '#ef4444' }}
          >
            Stop Video Stream
          </button>
        )}
        
        <span style={{ 
          marginLeft: '15px', 
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: 
            connectionStatus === 'connected' ? '#10b981' :
            connectionStatus === 'connecting' ? '#f59e0b' : '#6b7280',
          color: 'white'
        }}>
          {connectionStatus.toUpperCase()}
        </span>
      </div>

      <div 
        ref={videoRef}
        style={{
          width: '100%',
          height: '300px',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '16px'
        }}>
          Video stream will appear here
        </div>
      </div>

      <div style={{ 
        marginTop: '10px', 
        fontSize: '0.8rem', 
        color: '#94a3b8',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Protocol: WebRTC</span>
        <span>Status: {streaming ? 'LIVE' : 'READY'}</span>
        <span>Simulated Latency: {streaming ? '< 200ms' : 'N/A'}</span>
      </div>
    </div>
  );
};

export default VideoStream;