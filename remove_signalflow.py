#!/usr/bin/env python3
"""
Simple script to remove SignalFlow vectors using existing Pinecone infrastructure
"""

import os
import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

async def remove_signalflow_simple():
    """Remove SignalFlow vectors using direct Pinecone operations"""
    print("🗑️  Removing SignalFlow vectors...")
    
    try:
        import pinecone
        from pinecone import Pinecone
        
        # Initialize Pinecone client
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        
        # Check existing indexes
        indexes = pc.list_indexes()
        index_names = [idx.name for idx in indexes]
        
        print(f"📊 Found indexes: {index_names}")
        
        # Common SignalFlow index names based on your system
        target_indexes = ['isaac-projects', 'isaac-professional', 'isaac-personal']
        
        total_deleted = 0
        
        for index_name in target_indexes:
            if index_name in index_names:
                print(f"\n🔍 Processing index: {index_name}")
                index = pc.Index(index_name)
                
                # Get index stats
                stats = index.describe_index_stats()
                print(f"   📊 Total vectors in index: {stats.total_vector_count}")
                
                if stats.total_vector_count == 0:
                    print(f"   📝 Index {index_name} is empty, skipping...")
                    continue
                
                # Since we can't easily query by metadata, we'll search for SignalFlow content
                # Create a simple embedding for SignalFlow to find related vectors
                import openai
                openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                
                # Create embedding for SignalFlow search
                response = openai_client.embeddings.create(
                    model="text-embedding-3-large",
                    input="SignalFlow AI trading system multi-agent architecture",
                    dimensions=3072
                )
                search_embedding = response.data[0].embedding
                
                # Search for SignalFlow vectors
                search_results = index.query(
                    vector=search_embedding,
                    top_k=200,
                    include_metadata=True,
                    include_values=False
                )
                
                # Find SignalFlow-related vector IDs
                signalflow_ids = []
                for match in search_results.matches:
                    metadata = match.metadata or {}
                    text = metadata.get('text', '').lower()
                    source = metadata.get('source', '').lower()
                    original_file = metadata.get('original_file', '').lower()
                    
                    # Check if this is a SignalFlow vector
                    is_signalflow = (
                        'signalflow' in text or 
                        'signalflow' in source or
                        'signalflow' in original_file or
                        'signal flow' in text or
                        ('trading system' in text and 'ai' in text and 'agent' in text)
                    )
                    
                    if is_signalflow:
                        signalflow_ids.append(match.id)
                        print(f"   🎯 Found SignalFlow vector: {match.id[:30]}...")
                
                # Delete SignalFlow vectors
                if signalflow_ids:
                    print(f"   🗑️  Deleting {len(signalflow_ids)} SignalFlow vectors...")
                    
                    # Delete in batches of 100 (Pinecone limit)
                    batch_size = 100
                    for i in range(0, len(signalflow_ids), batch_size):
                        batch = signalflow_ids[i:i + batch_size]
                        index.delete(ids=batch)
                        print(f"      ✅ Deleted batch {i//batch_size + 1}")
                    
                    total_deleted += len(signalflow_ids)
                    print(f"   ✅ Deleted {len(signalflow_ids)} vectors from {index_name}")
                else:
                    print(f"   📝 No SignalFlow vectors found in {index_name}")
            else:
                print(f"   ⚠️  Index {index_name} not found")
        
        print(f"\n🎉 Removal complete! Deleted {total_deleted} total SignalFlow vectors")
        
        if total_deleted > 0:
            print("✅ SignalFlow information has been removed from your AI knowledge base")
        else:
            print("📝 No SignalFlow vectors were found to remove")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🤖 SignalFlow Vector Removal Tool (Simple)")
    print("=" * 50)
    
    # Run the removal
    asyncio.run(remove_signalflow_simple())
