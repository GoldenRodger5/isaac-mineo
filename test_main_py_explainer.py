#!/usr/bin/env python3
"""
Test AI Code Explainer with Isaac's main.py - Real World Test
Testing Claude Sonnet 4 with 16,000 token limit on actual project file
"""
import requests
import json
import time
import sys

# Configuration
# BASE_URL = "http://localhost:8000/api"  # Local testing
BASE_URL = "https://isaac-mineo-api.onrender.com/api"  # Production testing

# Your actual main.py content
MAIN_PY_CODE = '''from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uvicorn
import asyncio

# Import services
from app.services.error_handler import error_handler
from app.utils.pinecone_service import initialize_pinecone_indexes
from app.middleware.auth_middleware import AuthMiddleware
from app.services.auth_service import auth_service
from app.services.performance_service import performance_service

# Load environment variables from root .env file
load_dotenv(dotenv_path='../.env')  # Load from project root
load_dotenv()  # Also check current directory

app = FastAPI(
    title="Isaac Mineo Portfolio API",
    description="Advanced Backend API with Multi-Index Knowledge Base, Hybrid Search, AI Chatbot, and Code Explainer",
    version="4.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,https://isaac-mineo.vercel.app,https://isaacmineo.com,https://www.isaacmineo.com").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication and performance middleware
app.add_middleware(AuthMiddleware)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        print("🚀 Initializing Advanced Knowledge Base System...")
        await initialize_pinecone_indexes()
        print("✅ Multi-index knowledge base system ready")
        
        # Initialize cache manager
        from app.utils.cache_manager import CacheManager
        cache_manager = CacheManager()
        await cache_manager.connect()
        print("✅ Cache manager initialized")
        
        # Initialize auth service cache connection
        await auth_service.cache_manager.connect()
        print("✅ Authentication service initialized")
        
        # Initialize performance monitoring
        await performance_service.cache_manager.connect()
        print("✅ Performance monitoring initialized")
        
    except Exception as e:
        print(f"❌ Error initializing services: {e}")
        error_handler.log_error(e, {"startup": True})

@app.get("/")
async def root():
    return {
        "message": "Isaac Mineo Advanced Portfolio API", 
        "status": "running", 
        "version": "3.0.0",
        "features": [
            "Multi-Index Knowledge Base",
            "Hybrid Search (Semantic + Keyword)",
            "Advanced Chunking",
            "text-embedding-3-large",
            "GPT-4o Integration"
        ]
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        health_data = error_handler.health_check()
        return health_data
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/health"})
        return {"status": "error", "message": "Health check failed"}

@app.get("/metrics")
async def get_metrics():
    """Get application metrics and performance data"""
    try:
        return {
            "performance": error_handler.get_performance_summary(),
            "errors": error_handler.get_error_summary(),
            "timestamp": error_handler.health_check()["timestamp"]
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/metrics"})
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")

# Import routers
from app.routers import chatbot
from app.routers import github_explainer
from app.routers import auth

# Include routers
app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(chatbot.router, prefix="/api", tags=["chatbot"])
app.include_router(github_explainer.router, prefix="/api", tags=["github", "code-explainer"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)'''

def test_mode(mode, description):
    """Test a specific explanation mode"""
    print(f"\n{'='*60}")
    print(f"🧪 Testing {mode.upper()} Mode - {description}")
    print(f"{'='*60}")
    
    payload = {
        "code": MAIN_PY_CODE,
        "mode": mode,
        "file_context": {
            "path": "backend/app/main.py",
            "language": "python",
            "lines": len(MAIN_PY_CODE.split('\n')),
            "repo": "isaac-mineo"
        }
    }
    
    print(f"📊 Code Stats: {len(MAIN_PY_CODE)} characters, {len(MAIN_PY_CODE.split())} words, {payload['file_context']['lines']} lines")
    print(f"🎯 Testing Claude Sonnet 4 with 16,000 token limit...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/github/explain-code",
            json=payload,
            timeout=180,  # 3 minutes timeout
            headers={"Content-Type": "application/json"}
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get("success"):
                explanation = result['data']['explanation']
                
                print(f"\n✅ SUCCESS in {elapsed:.2f} seconds!")
                print(f"📖 Explanation length: {len(explanation):,} characters")
                print(f"📝 Word count: {len(explanation.split()):,} words")
                print(f"🤖 Model: {result['data'].get('model', 'Unknown')}")
                print(f"🎯 Mode: {result['data'].get('mode', 'Unknown')}")
                
                # Check for follow-up questions
                if result['data'].get('follow_up_questions'):
                    questions = result['data']['follow_up_questions']
                    print(f"❓ Follow-up questions: {len(questions)}")
                    for i, q in enumerate(questions[:2], 1):  # Show first 2
                        print(f"   {i}. {q}")
                
                # Check for caching
                if result['data'].get('cached'):
                    print("💾 Response was cached")
                else:
                    print("🔥 Fresh response from Claude")
                
                # Show preview of explanation
                print(f"\n📚 {mode.upper()} Explanation Preview:")
                print("-" * 50)
                preview = explanation[:500] + "..." if len(explanation) > 500 else explanation
                print(preview)
                
                return True
                
            else:
                print(f"❌ API returned success=false")
                print(f"Error: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"⏰ Request timed out after {elapsed:.2f} seconds")
        return False
        
    except requests.exceptions.RequestException as e:
        elapsed = time.time() - start_time
        print(f"❌ Request failed after {elapsed:.2f} seconds")
        print(f"Error: {e}")
        return False

def main():
    """Run comprehensive test of all modes"""
    print("🚀 AI Code Explainer - Real World Test with main.py")
    print(f"📍 Testing against: {BASE_URL}")
    print(f"📁 File: backend/app/main.py ({len(MAIN_PY_CODE.split())} words)")
    
    # Test all three modes
    modes = [
        ("explain", "Technical breakdown for developers"),
        ("summarize", "High-level overview"),
        ("teach", "Beginner-friendly educational explanation")
    ]
    
    results = {}
    total_start = time.time()
    
    for mode, description in modes:
        results[mode] = test_mode(mode, description)
        if mode != modes[-1][0]:  # Don't sleep after last test
            print("\n⏳ Waiting 2 seconds before next test...")
            time.sleep(2)
    
    total_elapsed = time.time() - total_start
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 TEST RESULTS SUMMARY")
    print(f"{'='*60}")
    print(f"⏱️  Total test time: {total_elapsed:.2f} seconds")
    
    for mode, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {mode.upper()} mode")
    
    success_count = sum(results.values())
    print(f"\n🎯 Overall: {success_count}/3 modes successful ({success_count/3*100:.1f}%)")
    
    if success_count == 3:
        print("🎉 All tests passed! Claude Sonnet 4 successfully analyzed your main.py!")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    main()
