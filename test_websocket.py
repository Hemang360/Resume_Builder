#!/usr/bin/env python3
"""
WebSocket Test Script for Resume Builder

This script tests the WebSocket functionality by:
1. Creating a test resume
2. Connecting to the WebSocket
3. Making updates to the resume
4. Verifying WebSocket messages are received

Usage:
    python test_websocket.py
"""

import asyncio
import json
import websockets
import requests
import time
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000"
WS_BASE_URL = "ws://localhost:8000"

class WebSocketTester:
    def __init__(self):
        self.resume_id = None
        self.messages_received = []
        
    async def create_test_resume(self) -> str:
        """Create a test resume via API"""
        print("Creating test resume...")
        
        resume_data = {
            "content": {
                "personalInfo": {
                    "firstName": "Test",
                    "lastName": "User",
                    "email": "test@example.com"
                },
                "summary": "Test resume for WebSocket testing"
            }
        }
        
        response = requests.post(f"{API_BASE_URL}/api/resumes/", json=resume_data)
        response.raise_for_status()
        
        resume = response.json()
        self.resume_id = resume["id"]
        print(f"Created resume with ID: {self.resume_id}")
        return self.resume_id
    
    async def test_websocket_connection(self):
        """Test WebSocket connection and message handling"""
        if not self.resume_id:
            raise ValueError("No resume ID available")
            
        ws_url = f"{WS_BASE_URL}/ws/resume/{self.resume_id}/"
        print(f"Connecting to WebSocket: {ws_url}")
        
        try:
            async with websockets.connect(ws_url) as websocket:
                print("WebSocket connected successfully!")
                
                # Send ping message
                ping_message = {"type": "ping"}
                await websocket.send(json.dumps(ping_message))
                print("Sent ping message")
                
                # Wait for pong response
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                message = json.loads(response)
                print(f"Received message: {message}")
                
                if message.get("type") == "pong":
                    print("✅ Ping/Pong test passed!")
                else:
                    print("❌ Ping/Pong test failed!")
                
                # Request resume data
                get_resume_message = {"type": "get_resume"}
                await websocket.send(json.dumps(get_resume_message))
                print("Requested resume data")
                
                # Wait for resume data
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                message = json.loads(response)
                print(f"Received resume data: {message.get('type', 'unknown')}")
                
                if message.get("type") == "resume_data":
                    print("✅ Resume data test passed!")
                else:
                    print("❌ Resume data test failed!")
                
                # Test resume update broadcasting
                print("Testing resume update broadcasting...")
                await self.update_resume_via_api()
                
                # Wait for update message
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    message = json.loads(response)
                    print(f"Received update message: {message.get('type', 'unknown')}")
                    
                    if message.get("type") == "resume_update":
                        print("✅ Resume update broadcasting test passed!")
                    else:
                        print("❌ Resume update broadcasting test failed!")
                        
                except asyncio.TimeoutError:
                    print("❌ Resume update broadcasting test failed - timeout!")
                
        except Exception as e:
            print(f"❌ WebSocket connection failed: {e}")
            raise
    
    async def update_resume_via_api(self):
        """Update resume via REST API to trigger WebSocket broadcast"""
        if not self.resume_id:
            raise ValueError("No resume ID available")
            
        print("Updating resume via API...")
        
        update_data = {
            "content": {
                "personalInfo": {
                    "firstName": "Updated",
                    "lastName": "User",
                    "email": "updated@example.com"
                },
                "summary": "Updated resume for WebSocket testing"
            }
        }
        
        response = requests.patch(f"{API_BASE_URL}/api/resumes/{self.resume_id}/", json=update_data)
        response.raise_for_status()
        print("Resume updated successfully!")
    
    async def cleanup(self):
        """Clean up test data"""
        if self.resume_id:
            print(f"Cleaning up test resume: {self.resume_id}")
            # Note: Delete is disabled in the API, so we just log the ID
            print("Note: Resume deletion is disabled in the API")
    
    async def run_tests(self):
        """Run all WebSocket tests"""
        try:
            print("🚀 Starting WebSocket tests...")
            print("=" * 50)
            
            # Create test resume
            await self.create_test_resume()
            
            # Test WebSocket connection
            await self.test_websocket_connection()
            
            print("=" * 50)
            print("✅ All WebSocket tests completed!")
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            raise
        finally:
            await self.cleanup()

async def main():
    """Main test function"""
    tester = WebSocketTester()
    await tester.run_tests()

if __name__ == "__main__":
    print("WebSocket Test Script for Resume Builder")
    print("Make sure the Django server is running on http://localhost:8000")
    print("Make sure Redis is running")
    print()
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"\nTest failed with error: {e}")
        exit(1)
