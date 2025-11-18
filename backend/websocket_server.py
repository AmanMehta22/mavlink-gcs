import asyncio
import websockets
import json
import logging
from mavlink_handler import MAVLinkHandler

class GCSWebSocketServer:
    def __init__(self, host='localhost', port=8765):
        self.host = host
        self.port = port
        self.mavlink_handler = MAVLinkHandler()
        self.connected_clients = set()
        
    async def start(self):
        """Start the WebSocket server and MAVLink connection"""
        # Connect to MAVLink
        await self.mavlink_handler.connect()
        
        # Start MAVLink message reading
        asyncio.create_task(self.mavlink_handler.read_messages())
        
        # Start WebSocket server
        start_server = websockets.serve(self.handle_client, self.host, self.port)
        await start_server
        logging.info(f"WebSocket server started on ws://{self.host}:{self.port}")
        
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
            
            # Handle incoming messages from client
            async for message in websocket:
                await self.handle_client_message(websocket, message)
                
        except websockets.exceptions.ConnectionClosed:
            logging.info("Client disconnected")
        finally:
            self.connected_clients.remove(websocket)
            logging.info(f"Client removed. Total clients: {len(self.connected_clients)}")
    
    async def handle_client_message(self, websocket, message):
        """Handle messages from WebSocket clients"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'command':
                command = data.get('command')
                params = data.get('params', {})
                
                success = self.mavlink_handler.send_command(command, **params)
                
                # Send command response back to client
                response = {
                    'type': 'command_response',
                    'command': command,
                    'success': success
                }
                await websocket.send(json.dumps(response))
                
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON message: {e}")
    
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
    
    server = GCSWebSocketServer()
    await server.start()
    
    # Keep the server running
    await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())