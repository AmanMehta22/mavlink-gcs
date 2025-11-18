import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers - IMPORTANT!
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom drone icon
const createDroneIcon = (heading = 0) => {
  return L.divIcon({
    className: 'drone-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        transform: rotate(${heading}deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to update map view when position changes
function MapUpdater({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && position.latitude && position.longitude) {
      const newCenter = [position.latitude, position.longitude];
      map.setView(newCenter, map.getZoom());
    }
  }, [position, map]);

  return null;
}

const MapView = ({ telemetry }) => {
  const markerRef = useRef();
  const position = telemetry?.position;
  
  const hasValidPosition = position && 
    typeof position.latitude === 'number' && 
    typeof position.longitude === 'number' &&
    !isNaN(position.latitude) && 
    !isNaN(position.longitude);

  // Default center (Zurich, Switzerland)
  const defaultCenter = [47.3769, 8.5417];
  const currentCenter = hasValidPosition 
    ? [position.latitude, position.longitude]
    : defaultCenter;

  // Update marker position when telemetry changes
  useEffect(() => {
    if (markerRef.current && hasValidPosition) {
      const newLatLng = L.latLng(position.latitude, position.longitude);
      markerRef.current.setLatLng(newLatLng);
    }
  }, [position, hasValidPosition]);

  return (
    <div className="data-card">
      <h3>Vehicle Position</h3>
      <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={currentCenter}
          zoom={hasValidPosition ? 16 : 10}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {hasValidPosition && (
            <>
              <MapUpdater position={position} />
              <Marker
                position={[position.latitude, position.longitude]}
                icon={createDroneIcon(position.heading || 0)}
                ref={markerRef}
              >
                <Popup>
                  <div style={{ color: 'black', minWidth: '200px' }}>
                    <strong>🚁 Vehicle Position</strong>
                    <br />
                    <strong>Lat:</strong> {position.latitude.toFixed(6)}
                    <br />
                    <strong>Lon:</strong> {position.longitude.toFixed(6)}
                    <br />
                    <strong>Alt:</strong> {position.altitude?.toFixed(1) || 'N/A'} m
                    <br />
                    <strong>Speed:</strong> {position.ground_speed?.toFixed(1) || 'N/A'} m/s
                    <br />
                    <strong>Heading:</strong> {position.heading?.toFixed(1) || 'N/A'}°
                    {telemetry?.heartbeat?.flight_mode && (
                      <>
                        <br />
                        <strong>Mode:</strong> {telemetry.heartbeat.flight_mode}
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            </>
          )}
          
          {!hasValidPosition && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              zIndex: 1000
            }}>
              Waiting for GPS position data...
              <br />
              <small>Make sure backend is sending position data</small>
            </div>
          )}
        </MapContainer>
      </div>
      
      {/* Position debug info */}
      <div style={{ 
        marginTop: '10px', 
        fontSize: '0.8rem', 
        color: '#94a3b8',
        background: 'rgba(0,0,0,0.2)',
        padding: '8px',
        borderRadius: '4px'
      }}>
        <strong>Debug Info:</strong> 
        {hasValidPosition ? (
          ` Lat: ${position.latitude.toFixed(6)}, Lon: ${position.longitude.toFixed(6)}`
        ) : (
          ' No valid position data received'
        )}
      </div>
    </div>
  );
};

export default MapView;