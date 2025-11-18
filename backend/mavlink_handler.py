import asyncio
import logging
from pymavlink import mavutil
import json
import math

class MAVLinkHandler:
    def __init__(self, connection_string='udp:127.0.0.1:14550'):
        self.connection_string = connection_string
        self.master = None
        self.telemetry_data = {
            'connected': False,
            'heartbeat': {},
            'position': {},
            'attitude': {},
            'battery': {},
            'status': {}
        }
        
    async def connect(self):
        """Connect to MAVLink source"""
        try:
            logging.info(f"Connecting to MAVLink: {self.connection_string}")
            self.master = mavutil.mavlink_connection(self.connection_string)
            self.master.wait_heartbeat()
            logging.info("Heartbeat received! Connected to vehicle.")
            self.telemetry_data['connected'] = True
            return True
        except Exception as e:
            logging.error(f"Connection failed: {e}")
            self.telemetry_data['connected'] = False
            return False
    
    def parse_heartbeat(self, msg):
        """Parse HEARTBEAT message"""
        base_mode = msg.base_mode
        custom_mode = msg.custom_mode
        system_status = msg.system_status
        
        # Determine flight mode
        flight_mode = "UNKNOWN"
        if hasattr(msg, 'custom_mode'):
            # PX4 flight modes
            if custom_mode == 0:
                flight_mode = "MANUAL"
            elif custom_mode == 4:
                flight_mode = "HOLD"
            elif custom_mode == 5:
                flight_mode = "LOITER"
            elif custom_mode == 10:
                flight_mode = "AUTO"
            elif custom_mode == 12:
                flight_mode = "RTL"
            elif custom_mode == 14:
                flight_mode = "LAND"
            elif custom_mode == 15:
                flight_mode = "TAKEOFF"
        
        self.telemetry_data['heartbeat'] = {
            'type': msg.type,
            'autopilot': msg.autopilot,
            'base_mode': base_mode,
            'custom_mode': custom_mode,
            'system_status': system_status,
            'flight_mode': flight_mode,
            'mavlink_version': msg.mavlink_version
        }
    
    def parse_global_position_int(self, msg):
        """Parse GLOBAL_POSITION_INT message"""
        lat = msg.lat / 1e7  # Convert from degE7 to degrees
        lon = msg.lon / 1e7  # Convert from degE7 to degrees
        alt = msg.alt / 1000.0  # Convert from mm to meters
        relative_alt = msg.relative_alt / 1000.0  # Convert from mm to meters
        
        self.telemetry_data['position'] = {
            'latitude': lat,
            'longitude': lon,
            'altitude': alt,
            'relative_altitude': relative_alt,
            'heading': msg.hdg / 100.0 if msg.hdg != 0 else 0,  # Convert from centidegrees
            'ground_speed': math.sqrt(msg.vx**2 + msg.vy**2) / 100.0,  # Convert from cm/s to m/s
            'velocity_x': msg.vx / 100.0,
            'velocity_y': msg.vy / 100.0,
            'velocity_z': msg.vz / 100.0
        }
    
    def parse_vfr_hud(self, msg):
        """Parse VFR_HUD message"""
        self.telemetry_data['status'].update({
            'airspeed': msg.airspeed,
            'ground_speed': msg.groundspeed,
            'heading': msg.heading,
            'throttle': msg.throttle,
            'altitude': msg.alt,
            'climb_rate': msg.climb
        })
    
    def parse_sys_status(self, msg):
        """Parse SYS_STATUS message"""
        battery_remaining = msg.battery_remaining if msg.battery_remaining != -1 else 0
        voltage = msg.voltage_battery / 1000.0 if msg.voltage_battery != 0 else 0
        current = msg.current_battery / 100.0 if msg.current_battery != -1 else 0
        
        self.telemetry_data['battery'] = {
            'remaining': battery_remaining,
            'voltage': voltage,
            'current': current,
            'power_consumed': 0  # Can be calculated from other fields
        }
    
    def parse_attitude(self, msg):
        """Parse ATTITUDE message"""
        roll_deg = math.degrees(msg.roll)
        pitch_deg = math.degrees(msg.pitch)
        yaw_deg = math.degrees(msg.yaw)
        
        self.telemetry_data['attitude'] = {
            'roll': roll_deg,
            'pitch': pitch_deg,
            'yaw': yaw_deg,
            'rollspeed': math.degrees(msg.rollspeed),
            'pitchspeed': math.degrees(msg.pitchspeed),
            'yawspeed': math.degrees(msg.yawspeed)
        }
    
    async def read_messages(self):
        """Continuously read and parse MAVLink messages"""
        while True:
            try:
                if self.master:
                    msg = self.master.recv_match(blocking=False)
                    if msg:
                        msg_type = msg.get_type()
                        
                        if msg_type == 'HEARTBEAT':
                            self.parse_heartbeat(msg)
                        elif msg_type == 'GLOBAL_POSITION_INT':
                            self.parse_global_position_int(msg)
                        elif msg_type == 'VFR_HUD':
                            self.parse_vfr_hud(msg)
                        elif msg_type == 'SYS_STATUS':
                            self.parse_sys_status(msg)
                        elif msg_type == 'ATTITUDE':
                            self.parse_attitude(msg)
                        
                await asyncio.sleep(0.01)  # Small delay to prevent CPU overload
                
            except Exception as e:
                logging.error(f"Error reading MAVLink message: {e}")
                await asyncio.sleep(1)
    
    def get_telemetry_data(self):
        """Get current telemetry data"""
        return self.telemetry_data
    
    def send_command(self, command_type, **kwargs):
        """Send commands to the vehicle"""
        try:
            if command_type == 'TAKEOFF':
                self.master.mav.command_long_send(
                    self.master.target_system, self.master.target_component,
                    mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, 0,
                    0, 0, 0, 0, 0, 0, 10)  # Takeoff to 10 meters
            elif command_type == 'LAND':
                self.master.mav.command_long_send(
                    self.master.target_system, self.master.target_component,
                    mavutil.mavlink.MAV_CMD_NAV_LAND, 0,
                    0, 0, 0, 0, 0, 0, 0)
            elif command_type == 'RTL':
                self.master.mav.command_long_send(
                    self.master.target_system, self.master.target_component,
                    mavutil.mavlink.MAV_CMD_NAV_RETURN_TO_LAUNCH, 0,
                    0, 0, 0, 0, 0, 0, 0)
                    
            return True
        except Exception as e:
            logging.error(f"Command failed: {e}")
            return False