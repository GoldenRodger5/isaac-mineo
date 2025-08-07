#!/usr/bin/env python3
"""
Test with a simple voice response bypass
"""

import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_file = Path('.env')
if env_file.exists():
    load_dotenv(env_file)

def test_simple_voice():
    """Test with bypassing the complex AI system"""
    base_url = "http://localhost:8001"
    
    # Test simple text
    test_text = "Hello! I can help you learn about Isaac's projects and experience."
    
    # Direct synthesis test - if we had a direct endpoint
    print(f"Testing synthesis of: {test_text}")
    print(f"Text length: {len(test_text)} characters ({len(test_text.split())} words)")
    
    # Estimate: this should take about 4-6 seconds for ElevenLabs
    print("This should synthesize in under 10 seconds...")

if __name__ == "__main__":
    test_simple_voice()
