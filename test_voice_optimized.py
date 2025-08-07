#!/usr/bin/env python3
"""
Comprehensive Voice Implementation Test with Optimizations
Tests the enhanced voice implementation with proper timeouts and async handling
"""

import asyncio
import json
import time
import logging
import sys
import os
import subprocess
import socket
import signal
import requests
import websockets
from urllib.parse import urlparse
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from project root
def load_project_env():
    """Load environment variables from the project root .env file"""
    current_dir = Path(__file__).resolve()
    
    # Search for .env file in current directory and parent directories
    for parent in [current_dir.parent, current_dir.parent.parent]:
        env_file = parent / '.env'
        if env_file.exists():
            print(f"📄 Loading .env from: {env_file}")
            load_dotenv(env_file)
            return True
    
    print("⚠️ No .env file found in project directory tree")
    return False

# Load environment variables
load_project_env()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VoiceTestRunner:
    def __init__(self):
        self.base_url = None
        self.backend_process = None
        self.test_results = []
        self.backend_port = None
        
    def find_available_port(self, start_port=8000, max_attempts=50):
        """Find an available port starting from start_port"""
        for port in range(start_port, start_port + max_attempts):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('localhost', port))
                    return port
                except OSError:
                    continue
        raise RuntimeError(f"No available port found in range {start_port}-{start_port + max_attempts}")
    
    def start_backend(self):
        """Start the FastAPI backend on an available port"""
        try:
            # Find available port
            self.backend_port = self.find_available_port(8000)
            self.base_url = f"http://localhost:{self.backend_port}"
            
            logger.info(f"Starting backend on port {self.backend_port}")
            
            # Start backend process
            env = os.environ.copy()
            
            # Navigate to backend directory and start
            backend_dir = os.path.join(os.getcwd(), 'backend')
            if not os.path.exists(backend_dir):
                # Try current directory if no backend subdirectory
                backend_dir = os.getcwd()
            
            cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(self.backend_port)]
            
            self.backend_process = subprocess.Popen(
                cmd,
                cwd=backend_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid if hasattr(os, 'setsid') else None
            )
            
            # Wait for backend to start
            max_wait = 30
            wait_time = 0
            while wait_time < max_wait:
                try:
                    response = requests.get(f"{self.base_url}/health", timeout=2)
                    if response.status_code == 200:
                        logger.info(f"✅ Backend started successfully on port {self.backend_port}")
                        return True
                except requests.exceptions.RequestException:
                    pass
                
                time.sleep(1)
                wait_time += 1
            
            # If we get here, backend didn't start properly
            if self.backend_process:
                self.backend_process.terminate()
                self.backend_process = None
            
            raise RuntimeError(f"Backend failed to start within {max_wait} seconds")
            
        except Exception as e:
            logger.error(f"Failed to start backend: {e}")
            return False
    
    def stop_backend(self):
        """Stop the backend process"""
        if self.backend_process:
            try:
                # Try graceful shutdown first
                if hasattr(os, 'killpg'):
                    os.killpg(os.getpgid(self.backend_process.pid), signal.SIGTERM)
                else:
                    self.backend_process.terminate()
                
                # Wait for process to terminate
                try:
                    self.backend_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force kill if it doesn't terminate gracefully
                    if hasattr(os, 'killpg'):
                        os.killpg(os.getpgid(self.backend_process.pid), signal.SIGKILL)
                    else:
                        self.backend_process.kill()
                    self.backend_process.wait()
                
                logger.info("✅ Backend stopped successfully")
            except Exception as e:
                logger.error(f"Error stopping backend: {e}")
            finally:
                self.backend_process = None
    
    def record_test_result(self, test_name, passed, message="", execution_time=0.0, warning=False):
        """Record a test result"""
        result = {
            "test": test_name,
            "passed": passed,
            "warning": warning,
            "message": message,
            "execution_time": execution_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "⚠️ WARNING" if warning else ("✅ PASS" if passed else "❌ FAIL")
        logger.info(f"{status}: {test_name} ({execution_time:.2f}s) - {message}")
    
    async def test_voice_status(self):
        """Test voice service status endpoint"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/voice/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("voice_enabled"):
                    self.record_test_result(
                        "Voice Status Check", 
                        True, 
                        "Voice services enabled and configured",
                        time.time() - start_time
                    )
                else:
                    self.record_test_result(
                        "Voice Status Check", 
                        False, 
                        f"Voice services not enabled: {data.get('message', 'Unknown reason')}",
                        time.time() - start_time
                    )
            else:
                self.record_test_result(
                    "Voice Status Check", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}",
                    time.time() - start_time
                )
                
        except Exception as e:
            self.record_test_result(
                "Voice Status Check", 
                False, 
                f"Request failed: {str(e)}",
                time.time() - start_time
            )
    
    async def test_voice_synthesis_with_timeout(self):
        """Test voice synthesis endpoint with optimized timeout handling"""
        start_time = time.time()
        try:
            # Test with short text for faster synthesis
            test_data = {
                "text": "Hello, this is a test.",
                "session_id": "test_session_optimized",
                "return_audio": True
            }
            
            # Use longer timeout to account for API calls
            response = requests.post(
                f"{self.base_url}/voice/synthesize", 
                json=test_data,
                timeout=25  # Increased timeout
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("audio_url") and data["audio_url"].startswith("data:audio/"):
                    self.record_test_result(
                        "Voice Synthesis (Optimized)", 
                        True, 
                        f"Audio generated successfully in {execution_time:.2f}s",
                        execution_time
                    )
                else:
                    self.record_test_result(
                        "Voice Synthesis (Optimized)", 
                        False, 
                        "No audio URL returned or invalid format",
                        execution_time
                    )
            else:
                self.record_test_result(
                    "Voice Synthesis (Optimized)", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:200]}",
                    execution_time
                )
                
        except requests.exceptions.Timeout:
            self.record_test_result(
                "Voice Synthesis (Optimized)", 
                False, 
                f"Request timed out after {time.time() - start_time:.2f}s",
                time.time() - start_time
            )
        except Exception as e:
            self.record_test_result(
                "Voice Synthesis (Optimized)", 
                False, 
                f"Request failed: {str(e)}",
                time.time() - start_time
            )
    
    async def test_websocket_connection_with_timeout(self):
        """Test WebSocket connection with improved timeout handling"""
        start_time = time.time()
        try:
            # Ensure base_url is set
            if not self.base_url:
                self.record_test_result(
                    "WebSocket Connection (Optimized)", 
                    False, 
                    "Backend URL not available",
                    time.time() - start_time
                )
                return
                
            # Convert HTTP URL to WebSocket URL
            ws_url = self.base_url.replace("http://", "ws://") + "/voice/chat"
            
            # Test connection with timeout
            async with websockets.connect(
                ws_url,
                ping_interval=20,  # Ping every 20 seconds
                ping_timeout=10,   # Wait 10 seconds for pong
                close_timeout=5    # Close timeout
            ) as websocket:
                
                # Test initial connection
                try:
                    # Wait for initial status message
                    response = await asyncio.wait_for(websocket.recv(), timeout=10)
                    data = json.loads(response)
                    
                    if data.get("type") == "status":
                        connection_time = time.time() - start_time
                        
                        if data.get("voice_enabled"):
                            self.record_test_result(
                                "WebSocket Connection (Optimized)", 
                                True, 
                                f"Connected successfully in {connection_time:.2f}s",
                                connection_time
                            )
                            
                            # Test session start
                            await websocket.send(json.dumps({
                                "type": "start_session",
                                "session_id": "test_websocket_optimized"
                            }))
                            
                            # Test keepalive handling
                            await asyncio.sleep(2)
                            
                            # Test session end
                            await websocket.send(json.dumps({
                                "type": "end_session"
                            }))
                            
                        else:
                            self.record_test_result(
                                "WebSocket Connection (Optimized)", 
                                False, 
                                f"Voice not enabled: {data.get('message')}",
                                connection_time
                            )
                    else:
                        self.record_test_result(
                            "WebSocket Connection (Optimized)", 
                            False, 
                            f"Unexpected initial message: {data}",
                            time.time() - start_time
                        )
                        
                except asyncio.TimeoutError:
                    self.record_test_result(
                        "WebSocket Connection (Optimized)", 
                        False, 
                        "Timeout waiting for initial status message",
                        time.time() - start_time
                    )
                    
        except asyncio.TimeoutError:
            self.record_test_result(
                "WebSocket Connection (Optimized)", 
                False, 
                "WebSocket connection timeout",
                time.time() - start_time
            )
        except Exception as e:
            self.record_test_result(
                "WebSocket Connection (Optimized)", 
                False, 
                f"WebSocket error: {str(e)}",
                time.time() - start_time
            )
    
    async def test_concurrent_requests(self):
        """Test multiple concurrent voice requests"""
        start_time = time.time()
        try:
            tasks = []
            for i in range(3):  # Test 3 concurrent requests
                task_data = {
                    "text": f"Concurrent test {i+1}",
                    "session_id": f"concurrent_test_{i}",
                    "return_audio": False  # Text only for speed
                }
                
                async def make_request(data):
                    loop = asyncio.get_event_loop()
                    return await loop.run_in_executor(
                        None,
                        lambda: requests.post(
                            f"{self.base_url}/voice/synthesize",
                            json=data,
                            timeout=15
                        )
                    )
                
                tasks.append(make_request(task_data))
            
            # Execute all requests concurrently
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            successful = 0
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    logger.warning(f"Concurrent request {i+1} failed: {response}")
                else:
                    # Check if it's a valid response object
                    try:
                        if hasattr(response, 'status_code') and response.status_code == 200:
                            successful += 1
                        else:
                            logger.warning(f"Concurrent request {i+1} returned status: {getattr(response, 'status_code', 'unknown')}")
                    except Exception as e:
                        logger.warning(f"Concurrent request {i+1} response check failed: {e}")
            
            execution_time = time.time() - start_time
            
            if successful == len(tasks):
                self.record_test_result(
                    "Concurrent Requests", 
                    True, 
                    f"All {successful} requests succeeded",
                    execution_time
                )
            elif successful > 0:
                self.record_test_result(
                    "Concurrent Requests", 
                    False, 
                    f"Only {successful}/{len(tasks)} requests succeeded",
                    execution_time,
                    warning=True
                )
            else:
                self.record_test_result(
                    "Concurrent Requests", 
                    False, 
                    "All concurrent requests failed",
                    execution_time
                )
                
        except Exception as e:
            self.record_test_result(
                "Concurrent Requests", 
                False, 
                f"Test failed: {str(e)}",
                time.time() - start_time
            )
    
    async def run_all_tests(self):
        """Run all optimization tests"""
        logger.info("🚀 Starting optimized voice implementation tests...")
        
        # Environment check
        env_vars = ["DEEPGRAM_API_KEY", "ELEVENLABS_API_KEY", "OPENAI_API_KEY"]
        missing_vars = [var for var in env_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.warning(f"⚠️ Missing environment variables: {missing_vars}")
            self.record_test_result(
                "Environment Check", 
                False, 
                f"Missing: {', '.join(missing_vars)}",
                0,
                warning=True
            )
        else:
            self.record_test_result(
                "Environment Check", 
                True, 
                "All required environment variables present",
                0
            )
        
        # Start backend
        if not self.start_backend():
            logger.error("❌ Failed to start backend, aborting tests")
            return
        
        try:
            # Run tests
            await self.test_voice_status()
            await self.test_voice_synthesis_with_timeout()
            await self.test_websocket_connection_with_timeout()
            await self.test_concurrent_requests()
            
        finally:
            # Cleanup
            self.stop_backend()
    
    def generate_report(self):
        """Generate test report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        failed_tests = total_tests - passed_tests
        warnings = sum(1 for r in self.test_results if r.get("warning", False))
        
        report = {
            "test_suite": "Voice Implementation Optimization Tests",
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "warnings": warnings,
                "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%"
            },
            "backend_port": self.backend_port,
            "results": self.test_results
        }
        
        # Save report
        report_file = "voice_optimization_report.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "="*60)
        print("🎯 VOICE OPTIMIZATION TEST RESULTS")
        print("="*60)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️ Warnings: {warnings}")
        print(f"Success Rate: {report['summary']['success_rate']}")
        print(f"Backend Port: {self.backend_port}")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        if warnings > 0:
            print("\n⚠️ WARNINGS:")
            for result in self.test_results:
                if result.get("warning", False):
                    print(f"  • {result['test']}: {result['message']}")
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        print("="*60)
        
        return report

async def main():
    """Main test execution"""
    runner = VoiceTestRunner()
    try:
        await runner.run_all_tests()
        report = runner.generate_report()
        
        # Exit with appropriate code
        if report["summary"]["failed"] > 0:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
        runner.stop_backend()
        sys.exit(130)
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        runner.stop_backend()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
