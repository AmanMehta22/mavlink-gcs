#!/usr/bin/env python3
import asyncio
import logging
from websocket_server import GCSWebSocketServer

async def main():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('gcs_backend.log'),
            logging.StreamHandler()
        ]
    )
    
    logging.info("Starting MAVLink GCS Backend Server")
    
    try:
        server = GCSWebSocketServer(host='0.0.0.0', port=8765)
        await server.start()
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error(f"Server error: {e}")

if __name__ == "__main__":
    asyncio.run(main())