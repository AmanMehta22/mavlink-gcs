#!/usr/bin/env python3
import asyncio
import websockets
import json
import logging
from mock_mavlink_handler import MockMAVLinkHandler

class MockGCSWebSocketServer:
    def __init__(self, host='localhost', port=8765):
        self.host = host
        self.port = port
        self.mavlink_handler = MockMAVLinkHandler()
        self.connected_clients = set()
        
    async def start(self):
        """Start the mock WebSocket server"""
        # Start mock data generation
        asyncio.create_task(self.mavlink_handler.generate_mock_data())
        
        # Start WebSocket server
        start_server = websockets.serve(self.handle_client, self.host, self.port)
        await start_server
        logging.info(f"Mock WebSocket server started on ws://{self.host}:{self.port}")
        
        # Start telemetry broadcasting
        asyncio.create_task(self.broadcast_telemetry())
    
    async def handle_client(self, websocket, path):
        """Handle new WebSocket client connections"""
        self.connected_clients.add(websocket)
        logging.info(f"New client connected. Total clients: {len(self.connected_clients)}")
        
        try:
            # Send initial telemetry data
            initial_data = {
                'type': 'initial',
                'data': self.mavlink_handler.get_telemetry_data()
            }
            await websocket.send(json.dumps(initial_data))
            
            # Keep connection alive
            await websocket.wait_closed()
                
        except websockets.exceptions.ConnectionClosed:
            logging.info("Client disconnected")
        finally:
            self.connected_clients.remove(websocket)
            logging.info(f"Client removed. Total clients: {len(self.connected_clients)}")
    
    async def broadcast_telemetry(self):
        """Broadcast telemetry data to all connected clients"""
        while True:
            if self.connected_clients:
                telemetry_data = self.mavlink_handler.get_telemetry_data()
                message = {
                    'type': 'telemetry',
                    'data': telemetry_data,
                    'timestamp': asyncio.get_event_loop().time()
                }
                
                message_json = json.dumps(message)
                
                # Send to all connected clients
                tasks = [
                    client.send(message_json) 
                    for client in self.connected_clients
                ]
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
            
            await asyncio.sleep(0.1)  # 10 Hz update rate

async def main():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    logging.info("Starting Mock MAVLink GCS Backend Server")
    
    try:
        server = MockGCSWebSocketServer(host='0.0.0.0', port=8765)
        await server.start()
        
        # Keep the server running
        await asyncio.Future()
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error(f"Server error: {e}")

if __name__ == "__main__":
    asyncio.run(main())