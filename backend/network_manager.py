import asyncio
import random
import logging
from enum import Enum

class NetworkType(Enum):
    WIFI = "WiFi"
    LTE = "4G/LTE"
    FIVE_G = "5G"
    ETHERNET = "Ethernet"

class NetworkManager:
    def __init__(self):
        self.current_network = NetworkType.WIFI
        self.latency = 50  # ms
        self.bandwidth = 100  # Mbps
        self.connected = True
        
    async def simulate_network_conditions(self):
        """Simulate different network conditions"""
        while True:
            # Simulate network variability
            if self.current_network == NetworkType.LTE:
                self.latency = random.randint(30, 100)
                self.bandwidth = random.randint(10, 50)
            elif self.current_network == NetworkType.WIFI:
                self.latency = random.randint(10, 50)
                self.bandwidth = random.randint(50, 100)
            elif self.current_network == NetworkType.FIVE_G:
                self.latency = random.randint(5, 20)
                self.bandwidth = random.randint(100, 200)
                
            await asyncio.sleep(5)
    
    def switch_network(self, network_type):
        """Switch between different network types"""
        self.current_network = network_type
        logging.info(f"🔄 Switched to {network_type.value} network")
        
    def get_network_info(self):
        """Get current network information"""
        return {
            'type': self.current_network.value,
            'latency_ms': self.latency,
            'bandwidth_mbps': self.bandwidth,
            'connected': self.connected
        }