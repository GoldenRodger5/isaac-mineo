#!/usr/bin/env python3
"""
Comprehensive Voice Implementation Test & Deployment Checker
- Finds available port automatically
- Tests all voice components thoroughly
- Ensures best practices are followed
- Ready for production deployment
"""

import asyncio
import websockets
import json
import requests
import sys
import socket
import subprocess
import time
import os
from datetime import datetime
from pathlib import Path

class VoiceImplementationTester:
    def __init__(self):
        self.backend_port = None
        self.backend_process = None
        self.base_url = None
        self.project_root = Path(__file__).parent
        self.test_results = []
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        colored_message = self._colorize_message(message, status)
        print(f"[{timestamp}] [{status}] {colored_message}")
        
        self.test_results.append({
            "timestamp": timestamp,
            "status": status,
            "message": message
        })
    
    def _colorize_message(self, message, status):
        colors = {
            "SUCCESS": "\033[92m",  # Green
            "ERROR": "\033[91m",    # Red
            "WARNING": "\033[93m",  # Yellow
            "INFO": "\033[94m",     # Blue
            "RESET": "\033[0m"      # Reset
        }
        color = colors.get(status, colors["INFO"])
        return f"{color}{message}{colors['RESET']}"
    
    def find_available_port(self, start_port=8000, max_attempts=10):
        """Find an available port starting from start_port"""
        for port in range(start_port, start_port + max_attempts):
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(('localhost', port))
                    return port
            except OSError:
                continue
        raise Exception(f"No available ports found in range {start_port}-{start_port + max_attempts}")
    
    def setup_environment(self):
        """Load environment variables from .env file"""
        env_file = self.project_root / ".env"
        if not env_file.exists():
            self.log("❌ .env file not found", "ERROR")
            return False
        
        env_vars = {}
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
        
        # Update current environment
        os.environ.update(env_vars)
        
        # Check required keys
        required_keys = ['DEEPGRAM_API_KEY', 'ELEVENLABS_API_KEY', 'OPENAI_API_KEY']
        missing_keys = [key for key in required_keys if not os.environ.get(key)]
        
        if missing_keys:
            self.log(f"❌ Missing environment variables: {missing_keys}", "ERROR")
            return False
        
        self.log("✅ Environment variables loaded successfully", "SUCCESS")
        return True
    
    def start_backend(self):
        """Start the backend server on an available port"""
        try:
            self.backend_port = self.find_available_port()
            self.base_url = f"http://localhost:{self.backend_port}"
            
            self.log(f"🚀 Starting backend on port {self.backend_port}", "INFO")
            
            # Prepare the command
            backend_dir = self.project_root / "backend"
            cmd = [
                sys.executable, "-m", "uvicorn", 
                "app.main:app", 
                "--host", "0.0.0.0", 
                "--port", str(self.backend_port),
                "--reload"
            ]
            
            # Start the backend process
            self.backend_process = subprocess.Popen(
                cmd,
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=os.environ.copy()
            )
            
            # Wait for backend to start
            max_wait = 30
            for i in range(max_wait):
                try:
                    response = requests.get(f"{self.base_url}/health", timeout=1)
                    if response.status_code == 200:
                        self.log(f"✅ Backend started successfully on port {self.backend_port}", "SUCCESS")
                        return True
                except:
                    time.sleep(1)
            
            self.log("❌ Backend failed to start within 30 seconds", "ERROR")
            return False
            
        except Exception as e:
            self.log(f"❌ Failed to start backend: {e}", "ERROR")
            return False
    
    def cleanup_backend(self):
        """Clean up the backend process"""
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            self.log("🛑 Backend process cleaned up", "INFO")
    
    def test_backend_health(self):
        """Test backend health endpoint"""
        self.log("Testing backend health...", "INFO")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Backend healthy: {data.get('status')}", "SUCCESS")
                return True
            else:
                self.log(f"❌ Backend health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Backend health error: {e}", "ERROR")
            return False
    
    def test_voice_status(self):
        """Test voice service status"""
        self.log("Testing voice status endpoint...", "INFO")
        try:
            response = requests.get(f"{self.base_url}/api/voice/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Voice Status: {data}", "SUCCESS")
                
                # Validate required fields
                required_fields = ['voice_enabled', 'deepgram_available', 'elevenlabs_available']
                for field in required_fields:
                    if field not in data:
                        self.log(f"❌ Missing field in voice status: {field}", "ERROR")
                        return False
                
                if not data.get('voice_enabled'):
                    self.log("❌ Voice services not enabled", "ERROR")
                    return False
                
                return True
            else:
                self.log(f"❌ Voice status failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Voice status error: {e}", "ERROR")
            return False
    
    def test_voice_synthesis(self):
        """Test voice synthesis functionality"""
        self.log("Testing voice synthesis endpoint...", "INFO")
        try:
            payload = {
                "text": "This is a comprehensive test of the voice synthesis functionality for Isaac's portfolio assistant.",
                "session_id": "comprehensive-test-session",
                "return_audio": True
            }
            response = requests.post(
                f"{self.base_url}/api/voice/synthesize",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log("✅ Voice synthesis successful", "SUCCESS")
                
                # Validate response structure
                required_fields = ['text', 'session_id']
                for field in required_fields:
                    if field not in data:
                        self.log(f"❌ Missing field in synthesis response: {field}", "ERROR")
                        return False
                
                self.log(f"📝 Response text length: {len(data.get('text', ''))}", "INFO")
                self.log(f"🔊 Audio URL present: {bool(data.get('audio_url'))}", "INFO")
                
                return True
            else:
                self.log(f"❌ Voice synthesis failed: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Voice synthesis error: {e}", "ERROR")
            return False
    
    async def test_websocket_connection(self):
        """Test WebSocket voice chat connection"""
        self.log("Testing WebSocket voice connection...", "INFO")
        try:
            ws_url = f"ws://localhost:{self.backend_port}/api/voice/chat"
            
            async with websockets.connect(ws_url) as websocket:
                self.log("✅ WebSocket connected successfully", "SUCCESS")
                
                # Send start session message
                start_message = {
                    "type": "start_session",
                    "session_id": "comprehensive-websocket-test-session"
                }
                await websocket.send(json.dumps(start_message))
                self.log("📤 Sent start session message", "INFO")
                
                # Wait for status response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10)
                    data = json.loads(response)
                    self.log(f"📥 Received: {data}", "SUCCESS")
                    
                    # Validate response
                    if data.get('type') == 'status' and data.get('voice_enabled'):
                        self.log("✅ Voice chat session initialized successfully", "SUCCESS")
                        return True
                    else:
                        self.log(f"❌ Unexpected WebSocket response: {data}", "ERROR")
                        return False
                        
                except asyncio.TimeoutError:
                    self.log("❌ WebSocket response timeout", "ERROR")
                    return False
                    
        except Exception as e:
            self.log(f"❌ WebSocket connection error: {e}", "ERROR")
            return False
    
    def test_voice_endpoints_security(self):
        """Test voice endpoints for security best practices"""
        self.log("Testing voice endpoint security...", "INFO")
        
        # Test CORS headers
        try:
            response = requests.options(f"{self.base_url}/api/voice/status")
            cors_headers = [h for h in response.headers.keys() if 'access-control' in h.lower()]
            if cors_headers:
                self.log("✅ CORS headers present", "SUCCESS")
            else:
                self.log("⚠️ CORS headers missing", "WARNING")
        except Exception as e:
            self.log(f"❌ CORS test failed: {e}", "ERROR")
        
        # Test rate limiting (if implemented)
        self.log("Testing rate limiting...", "INFO")
        rapid_requests = []
        for i in range(5):
            try:
                start_time = time.time()
                response = requests.get(f"{self.base_url}/api/voice/status", timeout=2)
                end_time = time.time()
                rapid_requests.append({
                    "status_code": response.status_code,
                    "response_time": end_time - start_time
                })
            except:
                pass
        
        if len(rapid_requests) >= 5:
            avg_response_time = sum(r["response_time"] for r in rapid_requests) / len(rapid_requests)
            self.log(f"📊 Average response time: {avg_response_time:.3f}s", "INFO")
            
            # Check if any requests were rate limited (429 status)
            rate_limited = any(r["status_code"] == 429 for r in rapid_requests)
            if rate_limited:
                self.log("✅ Rate limiting is active", "SUCCESS")
            else:
                self.log("⚠️ No rate limiting detected", "WARNING")
        
        return True
    
    def test_voice_error_handling(self):
        """Test error handling in voice endpoints"""
        self.log("Testing voice error handling...", "INFO")
        
        # Test invalid JSON
        try:
            response = requests.post(
                f"{self.base_url}/api/voice/synthesize",
                data="invalid json",
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            if response.status_code in [400, 422]:
                self.log("✅ Invalid JSON handled correctly", "SUCCESS")
            else:
                self.log(f"⚠️ Unexpected response to invalid JSON: {response.status_code}", "WARNING")
        except Exception as e:
            self.log(f"❌ Error testing invalid JSON: {e}", "ERROR")
        
        # Test missing required fields
        try:
            response = requests.post(
                f"{self.base_url}/api/voice/synthesize",
                json={"invalid": "data"},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            if response.status_code in [400, 422]:
                self.log("✅ Missing fields handled correctly", "SUCCESS")
            else:
                self.log(f"⚠️ Unexpected response to missing fields: {response.status_code}", "WARNING")
        except Exception as e:
            self.log(f"❌ Error testing missing fields: {e}", "ERROR")
        
        return True
    
    def validate_frontend_integration(self):
        """Validate frontend voice components"""
        self.log("Validating frontend voice integration...", "INFO")
        
        frontend_files = [
            "frontend/src/components/VoiceChat.jsx",
            "frontend/src/components/MobileChatInterface.jsx",
            "frontend/src/services/voiceService.js"
        ]
        
        all_files_exist = True
        for file_path in frontend_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                self.log(f"✅ Found: {file_path}", "SUCCESS")
                
                # Basic content validation
                with open(full_path, 'r') as f:
                    content = f.read()
                    
                if file_path.endswith('.jsx'):
                    # Check for React best practices
                    if 'useState' in content and 'useEffect' in content:
                        self.log(f"✅ {file_path}: React hooks detected", "SUCCESS")
                    else:
                        self.log(f"⚠️ {file_path}: Missing React hooks", "WARNING")
                        
                elif file_path.endswith('.js'):
                    # Check for service patterns
                    if 'class' in content or 'export' in content:
                        self.log(f"✅ {file_path}: Service pattern detected", "SUCCESS")
                    else:
                        self.log(f"⚠️ {file_path}: Service pattern unclear", "WARNING")
            else:
                self.log(f"❌ Missing: {file_path}", "ERROR")
                all_files_exist = False
        
        return all_files_exist
    
    def generate_deployment_report(self):
        """Generate a comprehensive deployment readiness report"""
        self.log("Generating deployment readiness report...", "INFO")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "test_summary": {
                "total_tests": len([r for r in self.test_results if r["status"] in ["SUCCESS", "ERROR"]]),
                "passed": len([r for r in self.test_results if r["status"] == "SUCCESS"]),
                "failed": len([r for r in self.test_results if r["status"] == "ERROR"]),
                "warnings": len([r for r in self.test_results if r["status"] == "WARNING"])
            },
            "deployment_ready": False,
            "recommendations": [],
            "test_details": self.test_results
        }
        
        # Determine deployment readiness
        critical_failures = [r for r in self.test_results if r["status"] == "ERROR"]
        if not critical_failures:
            report["deployment_ready"] = True
            report["recommendations"].append("✅ All critical tests passed - ready for deployment")
        else:
            report["deployment_ready"] = False
            report["recommendations"].append("❌ Critical failures detected - resolve before deployment")
        
        # Add specific recommendations
        warnings = [r for r in self.test_results if r["status"] == "WARNING"]
        if warnings:
            report["recommendations"].append(f"⚠️ {len(warnings)} warnings detected - review recommended")
        
        # Save report
        report_file = self.project_root / "voice_deployment_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.log(f"📄 Deployment report saved: {report_file}", "SUCCESS")
        return report
    
    async def run_comprehensive_tests(self):
        """Run all voice implementation tests"""
        self.log("🎤 Starting Comprehensive Voice Implementation Tests", "INFO")
        self.log("=" * 60, "INFO")
        
        try:
            # Setup
            if not self.setup_environment():
                return False
            
            if not self.start_backend():
                return False
            
            # Core functionality tests
            tests = [
                ("Backend Health", self.test_backend_health),
                ("Voice Status", self.test_voice_status),
                ("Voice Synthesis", self.test_voice_synthesis),
                ("WebSocket Connection", self.test_websocket_connection),
                ("Voice Security", self.test_voice_endpoints_security),
                ("Error Handling", self.test_voice_error_handling),
                ("Frontend Integration", self.validate_frontend_integration)
            ]
            
            for test_name, test_func in tests:
                self.log(f"Running {test_name} test...", "INFO")
                try:
                    if asyncio.iscoroutinefunction(test_func):
                        result = await test_func()
                    else:
                        result = test_func()
                    
                    if result:
                        self.log(f"✅ {test_name}: PASSED", "SUCCESS")
                    else:
                        self.log(f"❌ {test_name}: FAILED", "ERROR")
                except Exception as e:
                    self.log(f"❌ {test_name}: ERROR - {e}", "ERROR")
            
            # Generate final report
            report = self.generate_deployment_report()
            
            # Summary
            self.log("=" * 60, "INFO")
            self.log("🎤 Comprehensive Voice Test Summary", "INFO")
            self.log(f"Total Tests: {report['test_summary']['total_tests']}", "INFO")
            self.log(f"Passed: {report['test_summary']['passed']}", "SUCCESS")
            self.log(f"Failed: {report['test_summary']['failed']}", "ERROR" if report['test_summary']['failed'] > 0 else "INFO")
            self.log(f"Warnings: {report['test_summary']['warnings']}", "WARNING" if report['test_summary']['warnings'] > 0 else "INFO")
            
            if report["deployment_ready"]:
                self.log("🎉 DEPLOYMENT READY: Voice implementation is production-ready!", "SUCCESS")
            else:
                self.log("⚠️ NOT READY: Voice implementation needs fixes before deployment", "WARNING")
            
            return report["deployment_ready"]
            
        finally:
            self.cleanup_backend()

def main():
    """Main entry point"""
    tester = VoiceImplementationTester()
    
    try:
        result = asyncio.run(tester.run_comprehensive_tests())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        tester.log("Test interrupted by user", "WARNING")
        tester.cleanup_backend()
        sys.exit(1)
    except Exception as e:
        tester.log(f"Test runner failed: {e}", "ERROR")
        tester.cleanup_backend()
        sys.exit(1)

if __name__ == "__main__":
    main()
