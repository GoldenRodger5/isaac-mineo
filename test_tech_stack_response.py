#!/usr/bin/env python3
"""
Test script to verify enhanced tech stack responses
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.services.ultra_fast_search import UltraFastSearchService

async def test_tech_stack_responses():
    """Test the enhanced tech stack fallback responses"""
    
    search_service = UltraFastSearchService()
    
    print("🧪 Testing Enhanced Tech Stack Responses\n")
    
    # Test various tech stack queries
    test_queries = [
        "What is your tech stack?",
        "What technologies do you use?",
        "Tell me about Isaac's technical skills",
        "What programming languages does Isaac know?",
        "What's Isaac's technology expertise?"
    ]
    
    for query in test_queries:
        print(f"Query: {query}")
        print("=" * 50)
        
        # Test detailed response
        detailed_response = search_service._get_fast_fallback(query.lower(), "detailed")
        print("DETAILED RESPONSE:")
        print(detailed_response)
        print("\n" + "-" * 50 + "\n")
        
        # Test simple response
        simple_response = search_service._get_fast_fallback(query.lower(), "simple")
        print("SIMPLE RESPONSE:")
        print(simple_response)
        print("\n" + "=" * 70 + "\n")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_tech_stack_responses())
