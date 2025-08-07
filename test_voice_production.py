#!/usr/bin/env python3
"""
Final Voice Implementation Production Test
Tests all voice features for production readiness
"""

import requests
import time
import logging
import sys
import os
import subprocess
import socket
import json
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)
    print(f"📄 Loaded .env from: {env_file.absolute()}")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionVoiceTest:
    def __init__(self):
        self.base_url = None
        self.backend_process = None
        self.backend_port = None
        self.test_results = []
        
    def find_available_port(self, start_port=8000, max_attempts=50):
        """Find an available port starting from start_port"""
        for port in range(start_port, start_port + max_attempts):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                try:
                    s.bind(('localhost', port))
                    return port
                except OSError:
                    continue
        raise RuntimeError(f"No available port found")
    
    def start_backend(self):
        """Start the FastAPI backend"""
        try:
            self.backend_port = self.find_available_port(8000)
            self.base_url = f"http://localhost:{self.backend_port}"
            
            logger.info(f"Starting backend on port {self.backend_port}")
            
            backend_dir = Path('backend')
            if not backend_dir.exists():
                backend_dir = Path('.')
            
            cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(self.backend_port)]
            
            self.backend_process = subprocess.Popen(
                cmd,
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait for backend to start
            for _ in range(30):
                try:
                    response = requests.get(f"{self.base_url}/health", timeout=2)
                    if response.status_code == 200:
                        logger.info(f"✅ Backend started successfully on port {self.backend_port}")
                        return True
                except:
                    pass
                time.sleep(1)
            
            raise RuntimeError("Backend failed to start")
            
        except Exception as e:
            logger.error(f"Failed to start backend: {e}")
            return False
    
    def stop_backend(self):
        """Stop the backend process"""
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
                logger.info("✅ Backend stopped successfully")
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
                self.backend_process.wait()
            except Exception as e:
                logger.error(f"Error stopping backend: {e}")
            finally:
                self.backend_process = None
    
    def record_result(self, test_name, passed, message="", execution_time=0.0):
        """Record a test result"""
        result = {
            "test": test_name,
            "passed": passed,
            "message": message,
            "execution_time": execution_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{status}: {test_name} ({execution_time:.2f}s) - {message}")
    
    def test_environment_complete(self):
        """Test complete environment setup"""
        start_time = time.time()
        
        required_vars = ["DEEPGRAM_API_KEY", "ELEVENLABS_API_KEY", "OPENAI_API_KEY", "ELEVENLABS_VOICE_ID"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            self.record_result(
                "Complete Environment", 
                False, 
                f"Missing: {', '.join(missing_vars)}",
                time.time() - start_time
            )
        else:
            self.record_result(
                "Complete Environment", 
                True, 
                "All voice environment variables configured",
                time.time() - start_time
            )
    
    def test_voice_service_status(self):
        """Test voice service status"""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}/api/voice/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("voice_enabled"):
                    self.record_result(
                        "Voice Service Status", 
                        True, 
                        "Voice services enabled and ready",
                        time.time() - start_time
                    )
                else:
                    self.record_result(
                        "Voice Service Status", 
                        False, 
                        f"Voice services disabled: {data.get('message')}",
                        time.time() - start_time
                    )
            else:
                self.record_result(
                    "Voice Service Status", 
                    False, 
                    f"HTTP {response.status_code}",
                    time.time() - start_time
                )
                
        except Exception as e:
            self.record_result(
                "Voice Service Status", 
                False, 
                f"Request failed: {str(e)}",
                time.time() - start_time
            )
    
    def test_fast_synthesis(self):
        """Test fast voice synthesis with short text"""
        start_time = time.time()
        try:
            test_data = {
                "text": "Quick test message.",
                "session_id": "prod_test_fast",
                "return_audio": True
            }
            
            response = requests.post(
                f"{self.base_url}/api/voice/synthesize", 
                json=test_data,
                timeout=15
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                audio_url = data.get("audio_url", "")
                if audio_url and audio_url.startswith("data:audio/"):
                    audio_size_kb = len(audio_url) / 1024
                    self.record_result(
                        "Fast Audio Synthesis", 
                        True, 
                        f"Generated {audio_size_kb:.1f}KB audio in {execution_time:.2f}s",
                        execution_time
                    )
                else:
                    self.record_result(
                        "Fast Audio Synthesis", 
                        False, 
                        "No valid audio generated",
                        execution_time
                    )
            else:
                self.record_result(
                    "Fast Audio Synthesis", 
                    False, 
                    f"HTTP {response.status_code}",
                    execution_time
                )
                
        except Exception as e:
            self.record_result(
                "Fast Audio Synthesis", 
                False, 
                f"Request failed: {str(e)}",
                time.time() - start_time
            )
    
    def test_production_synthesis(self):
        """Test production-style voice synthesis"""
        start_time = time.time()
        try:
            test_data = {
                "text": "Hello! I'm Isaac's portfolio assistant. I can help you learn about his technical projects and professional experience. What would you like to know?",
                "session_id": "prod_test_full",
                "return_audio": True
            }
            
            response = requests.post(
                f"{self.base_url}/api/voice/synthesize", 
                json=test_data,
                timeout=35
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                audio_url = data.get("audio_url", "")
                if audio_url and audio_url.startswith("data:audio/"):
                    audio_size_kb = len(audio_url) / 1024
                    self.record_result(
                        "Production Audio Synthesis", 
                        True, 
                        f"Generated {audio_size_kb:.1f}KB audio in {execution_time:.2f}s",
                        execution_time
                    )
                else:
                    self.record_result(
                        "Production Audio Synthesis", 
                        False, 
                        "No valid audio generated",
                        execution_time
                    )
            else:
                self.record_result(
                    "Production Audio Synthesis", 
                    False, 
                    f"HTTP {response.status_code}",
                    execution_time
                )
                
        except Exception as e:
            self.record_result(
                "Production Audio Synthesis", 
                False, 
                f"Request failed: {str(e)}",
                time.time() - start_time
            )
    
    def test_text_fallback(self):
        """Test text-only fallback"""
        start_time = time.time()
        try:
            test_data = {
                "text": "Testing text-only fallback mode.",
                "session_id": "prod_test_text",
                "return_audio": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/voice/synthesize", 
                json=test_data,
                timeout=15
            )
            
            execution_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("text") and data.get("session_id"):
                    self.record_result(
                        "Text Fallback Mode", 
                        True, 
                        f"Text response in {execution_time:.2f}s",
                        execution_time
                    )
                else:
                    self.record_result(
                        "Text Fallback Mode", 
                        False, 
                        "Invalid response format",
                        execution_time
                    )
            else:
                self.record_result(
                    "Text Fallback Mode", 
                    False, 
                    f"HTTP {response.status_code}",
                    execution_time
                )
                
        except Exception as e:
            self.record_result(
                "Text Fallback Mode", 
                False, 
                f"Request failed: {str(e)}",
                time.time() - start_time
            )
    
    def run_all_tests(self):
        """Run all production tests"""
        logger.info("🚀 Starting PRODUCTION voice implementation tests...")
        
        # Test environment
        self.test_environment_complete()
        
        # Start backend
        if not self.start_backend():
            logger.error("❌ Failed to start backend, aborting tests")
            return
        
        try:
            # Run tests
            self.test_voice_service_status()
            self.test_text_fallback()
            self.test_fast_synthesis()
            self.test_production_synthesis()
            
        finally:
            # Cleanup
            self.stop_backend()
    
    def generate_report(self):
        """Generate production test report"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        failed_tests = total_tests - passed_tests
        
        # Calculate performance metrics
        synthesis_tests = [r for r in self.test_results if "synthesis" in r["test"].lower()]
        avg_synthesis_time = sum(r["execution_time"] for r in synthesis_tests) / len(synthesis_tests) if synthesis_tests else 0
        
        report = {
            "test_suite": "Production Voice Implementation Tests",
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
                "avg_synthesis_time": f"{avg_synthesis_time:.2f}s"
            },
            "backend_port": self.backend_port,
            "production_ready": failed_tests == 0,
            "results": self.test_results
        }
        
        # Save report
        report_file = "voice_production_test_report.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        print("\n" + "="*70)
        print("🎯 PRODUCTION VOICE TEST RESULTS")
        print("="*70)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {report['summary']['success_rate']}")
        print(f"Average Synthesis Time: {report['summary']['avg_synthesis_time']}")
        print(f"Production Ready: {'✅ YES' if report['production_ready'] else '❌ NO'}")
        print(f"Backend Port: {self.backend_port}")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        print("="*70)
        
        return report

def main():
    """Main test execution"""
    tester = ProductionVoiceTest()
    try:
        tester.run_all_tests()
        report = tester.generate_report()
        
        # Exit with appropriate code
        if report["production_ready"]:
            print("\n🎉 Voice implementation is PRODUCTION READY!")
            sys.exit(0)
        else:
            print("\n⚠️ Voice implementation needs fixes before production deployment")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
        tester.stop_backend()
        sys.exit(130)
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        tester.stop_backend()
        sys.exit(1)

if __name__ == "__main__":
    main()
