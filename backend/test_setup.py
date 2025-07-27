#!/usr/bin/env python3
"""
Test script to verify the FastAPI backend setup
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_imports():
    """Test that all required packages can be imported"""
    try:
        import fastapi
        import uvicorn
        import openai
        import pinecone
        import redis
        from dotenv import load_dotenv
        import pydantic
        print("✅ All required packages imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_env_variables():
    """Test that environment variables can be loaded"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        required_vars = [
            'OPENAI_API_KEY',
            'PINECONE_API_KEY',
            'PINECONE_INDEX_NAME',
            'REDIS_URL'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Missing environment variables: {missing_vars}")
            return False
        else:
            print("✅ All required environment variables found")
            return True
            
    except Exception as e:
        print(f"❌ Error loading environment variables: {e}")
        return False

def test_app_import():
    """Test that the FastAPI app can be imported"""
    try:
        from app.main import app
        print("✅ FastAPI app imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Error importing FastAPI app: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing FastAPI backend setup...\n")
    
    tests = [
        ("Package Imports", test_imports),
        ("Environment Variables", test_env_variables),
        ("FastAPI App Import", test_app_import)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        result = test_func()
        results.append(result)
        print()
    
    if all(results):
        print("🎉 All tests passed! Backend is ready to run.")
        print("\nTo start the server, run:")
        print("cd /Users/isaacmineo/Main/projects/isaac-mineo/backend")
        print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
