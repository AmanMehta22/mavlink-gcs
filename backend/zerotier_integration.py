import subprocess
import requests
import json
import logging
import asyncio

class ZeroTierIntegration:
    def __init__(self, network_id=None, api_token=None):
        self.network_id = network_id
        self.api_token = api_token
        self.connected = False
        
    async def connect_to_network(self):
        """Connect to ZeroTier network for remote access"""
        try:
            # Join ZeroTier network
            result = subprocess.run(
                ['zerotier-cli', 'join', self.network_id],
                capture_output=True, text=True
            )
            
            if result.returncode == 0:
                logging.info(f"✅ Connected to ZeroTier network: {self.network_id}")
                self.connected = True
                
                # Get assigned IP
                await self.get_network_info()
                return True
            else:
                logging.error(f"❌ Failed to join ZeroTier network: {result.stderr}")
                return False
                
        except Exception as e:
            logging.error(f"❌ ZeroTier connection error: {e}")
            return False
    
    async def get_network_info(self):
        """Get network information and assigned IP"""
        try:
            result = subprocess.run(
                ['zerotier-cli', 'listnetworks'],
                capture_output=True, text=True
            )
            logging.info(f"🌐 ZeroTier Network Info:\n{result.stdout}")
            return result.stdout
        except Exception as e:
            logging.error(f"❌ Error getting network info: {e}")
            return None
    
    async def enable_remote_access(self, local_port=8765):
        """Enable remote access via ZeroTier"""
        if self.connected:
            logging.info(f"🌐 Remote access enabled on ZeroTier network")
            logging.info(f"📍 Connect via: ws://<zerotier-ip>:{local_port}")
            return True
        return False

# Mock version for demonstration
class MockZeroTierIntegration:
    def __init__(self):
        self.connected = True
        self.mock_ip = "192.168.195.100"
        
    async def connect_to_network(self):
        logging.info("✅ [MOCK] Connected to ZeroTier network")
        logging.info(f"📍 [MOCK] Assigned IP: {self.mock_ip}")
        return True
        
    async def enable_remote_access(self, local_port=8765):
        logging.info(f"🌐 [MOCK] Remote access enabled")
        logging.info(f"📍 [MOCK] Connect via: ws://{self.mock_ip}:{local_port}")
        return True