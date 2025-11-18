#!/usr/bin/env python3
import asyncio
import websockets
import json
import logging
from mock_mavlink_handler import MockMAVLinkHandler
from zerotier_integration import MockZeroTierIntegration
from network_manager import NetworkManager

class AdvancedGCSWebSocketServer:
    def __init__(self, host='0.0.0.0', port=8765):
        self.host = host
        self.port = port
        self.mavlink_handler = MockMAVLinkHandler()
        self.zerotier = MockZeroTierIntegration()
        self.network_manager = NetworkManager()
        self.connected_clients = set()
        
    async def start(self):
        """Start advanced GCS server with all features"""
        logging.info("🚀 Starting Advanced MAVLink GCS Server")
        
        # Start ZeroTier integration
        await self.zerotier.connect_to_network()
        await self.zerotier.enable_remote_access(self.port)
        
        # Start network condition simulation
        asyncio.create_task(self.network_manager.simulate_network_conditions())
        
        # Start MAVLink data generation
        asyncio.create_task(self.mavlink_handler.generate_mock_data())
        
        # Start WebSocket server
        start_server = websockets.serve(self.handle_client, self.host, self.port)
        await start_server
        
        logging.info(f"🌐 Advanced WebSocket server started on ws://{self.host}:{self.port}")
        logging.info("📡 Features enabled: MAVLink, ZeroTier VPN, Network Simulation")
        
        # Start telemetry broadcasting
        await self.broadcast_telemetry()
    
    async def handle_client(self, websocket, path):
        """Handle client connections with advanced features"""
        self.connected_clients.add(websocket)
        client_count = len(self.connected_clients)
        logging.info(f"📱 New client connected. Total clients: {client_count}")
        
        try:
            # Send system info including network status
            system_info = {
                'type': 'system_info',
                'features': {
                    'mavlink': True,
                    'zerotier_vpn': True,
                    'network_simulation': True,
                    'video_streaming': True
                },
                'network': self.network_manager.get_network_info()
            }
            await websocket.send(json.dumps(system_info))
            
            # Handle client messages
            async for message in websocket:
                await self.handle_client_message(websocket, message)
                
        except websockets.exceptions.ConnectionClosed:
            logging.info("📱 Client disconnected")
        finally:
            self.connected_clients.remove(websocket)
    
    async def handle_client_message(self, websocket, message):
        """Handle advanced client commands"""
        try:
            data = json.loads(message)
            
            if data.get('type') == 'network_switch':
                network_type = data.get('network')
                self.network_manager.switch_network(network_type)
                
                response = {
                    'type': 'network_update',
                    'network': self.network_manager.get_network_info()
                }
                await websocket.send(json.dumps(response))
                
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON message: {e}")
    
    async def broadcast_telemetry(self):
        """Broadcast telemetry with network info"""
        while True:
            if self.connected_clients:
                # Get telemetry data
                telemetry_data = self.mavlink_handler.get_telemetry_data()
                
                # Add network information
                enhanced_data = {
                    **telemetry_data,
                    'network': self.network_manager.get_network_info(),
                    'remote_access': {
                        'enabled': True,
                        'protocol': 'ZeroTier VPN',
                        'latency_ms': self.network_manager.latency
                    }
                }
                
                message = {
                    'type': 'telemetry',
                    'data': enhanced_data,
                    'timestamp': asyncio.get_event_loop().time()
                }
                
                message_json = json.dumps(message)
                
                # Send to all clients with simulated network delay
                if self.network_manager.latency > 0:
                    await asyncio.sleep(self.network_manager.latency / 1000)
                
                tasks = [
                    client.send(message_json) 
                    for client in self.connected_clients
                ]
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
            
            await asyncio.sleep(0.1)

async def main():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    server = AdvancedGCSWebSocketServer()
    await server.start()

if __name__ == "__main__":
    asyncio.run(main())