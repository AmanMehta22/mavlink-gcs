import asyncio
import json
import math
import random
from datetime import datetime

class MockMAVLinkHandler:
    def __init__(self):
        self.telemetry_data = {
            'connected': True,
            'heartbeat': {
                'flight_mode': 'AUTO',
                'system_status': 'ACTIVE',
                'base_mode': 217,
                'custom_mode': 4
            },
            'position': {
                'latitude': 47.3769,
                'longitude': 8.5417,
                'altitude': 100.0,
                'relative_altitude': 100.0,
                'heading': 45.0,
                'ground_speed': 15.0
            },
            'battery': {
                'remaining': 87,
                'voltage': 12.6,
                'current': 8.5
            },
            'attitude': {
                'roll': 2.1,
                'pitch': 1.2,
                'yaw': 45.0
            },
            'status': {
                'airspeed': 18.0,
                'ground_speed': 15.0,
                'climb_rate': 0.5
            }
        }
        self.counter = 0
    
    async def generate_mock_data(self):
        """Generate realistic mock telemetry data with more movement"""
        # Start from a known position
        base_lat = 47.3769
        base_lon = 8.5417
        altitude = 100.0
        
        while True:
            # Create circular movement pattern
            angle = self.counter * 0.05  # Slower movement
            radius = 0.001  # About 100m radius
            
            # Calculate new position (circular pattern)
            new_lat = base_lat + math.cos(angle) * radius
            new_lon = base_lon + math.sin(angle) * radius
            
            # Update position with more noticeable movement
            self.telemetry_data['position']['latitude'] = new_lat
            self.telemetry_data['position']['longitude'] = new_lon
            self.telemetry_data['position']['altitude'] = altitude + math.sin(self.counter * 0.1) * 20
            self.telemetry_data['position']['relative_altitude'] = self.telemetry_data['position']['altitude']
            self.telemetry_data['position']['ground_speed'] = 8 + math.sin(self.counter * 0.2) * 4
            self.telemetry_data['position']['heading'] = (angle * 180 / math.pi) % 360
            
            # Simulate battery drain (very slow)
            self.telemetry_data['battery']['remaining'] = max(0, 87 - (self.counter * 0.001))
            self.telemetry_data['battery']['voltage'] = 12.6 - (self.counter * 0.0001)
            
            # Simulate attitude changes
            self.telemetry_data['attitude']['roll'] = math.sin(self.counter * 0.2) * 5
            self.telemetry_data['attitude']['pitch'] = math.cos(self.counter * 0.15) * 3
            self.telemetry_data['attitude']['yaw'] = (angle * 180 / math.pi) % 360
            
            # Update status
            self.telemetry_data['status']['airspeed'] = self.telemetry_data['position']['ground_speed'] + 2
            self.telemetry_data['status']['climb_rate'] = math.cos(self.counter * 0.1) * 2
            
            self.counter += 1
            await asyncio.sleep(0.2)  # 5 Hz update rate (slower for visible movement)
    
    def get_telemetry_data(self):
        return self.telemetry_data