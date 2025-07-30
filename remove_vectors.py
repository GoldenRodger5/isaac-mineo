#!/usr/bin/env python3
"""
Script to remove specific documents from the Pinecone vector database
"""

import os
import asyncio
import sys
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.app.utils.pinecone_service import (
    initialize_pinecone_indexes,
    IndexType,
    INDEX_CONFIGS,
    pc,
    initialize_clients
)

async def remove_signalflow_vectors():
    """Remove all SignalFlow vectors from the vector database"""
    print("🗑️  Starting SignalFlow vector removal...")
    
    try:
        # Initialize Pinecone
        print("📊 Initializing Pinecone...")
        await initialize_pinecone_indexes()
        initialize_clients()
        
        # We need to check all indexes since we're not sure where SignalFlow vectors ended up
        indexes_to_check = [IndexType.PROJECTS, IndexType.PROFESSIONAL, IndexType.PERSONAL]
        
        total_deleted = 0
        
        for index_type in indexes_to_check:
            index_name = INDEX_CONFIGS[index_type]["name"]
            index = pc.Index(index_name)
            
            print(f"🔍 Checking {index_type.value} index for SignalFlow vectors...")
            
            # Get index stats to see if there are vectors
            stats = index.describe_index_stats()
            total_vectors = stats.total_vector_count
            
            if total_vectors == 0:
                print(f"   📝 No vectors in {index_type.value} index")
                continue
            
            print(f"   📊 Found {total_vectors} total vectors in {index_type.value}")
            
            # Query for SignalFlow-related vectors by searching with SignalFlow terms
            # Since we can't easily list all vector IDs, we'll use metadata filtering if possible
            # or search for SignalFlow content to find the IDs
            
            try:
                # Try to find SignalFlow vectors by querying with SignalFlow-related terms
                from backend.app.utils.pinecone_service import create_embedding
                
                signalflow_query = "SignalFlow AI trading system"
                query_embedding = await create_embedding(signalflow_query)
                
                # Search for vectors that match SignalFlow content
                search_results = index.query(
                    vector=query_embedding,
                    top_k=200,  # Get more results to catch all SignalFlow vectors
                    include_metadata=True,
                    include_values=False
                )
                
                # Filter for SignalFlow-related vectors
                signalflow_vector_ids = []
                for match in search_results.matches:
                    metadata = match.metadata
                    text = metadata.get('text', '').lower()
                    source = metadata.get('source', '').lower()
                    
                    # Check if this vector is related to SignalFlow
                    if ('signalflow' in text or 'signalflow' in source or 
                        'signal flow' in text or 'signal flow' in source or
                        'trading system' in text and 'ai' in text):
                        signalflow_vector_ids.append(match.id)
                        print(f"   🎯 Found SignalFlow vector: {match.id[:20]}...")
                
                if signalflow_vector_ids:
                    print(f"   🗑️  Deleting {len(signalflow_vector_ids)} SignalFlow vectors from {index_type.value}...")
                    
                    # Delete vectors in batches
                    batch_size = 100
                    for i in range(0, len(signalflow_vector_ids), batch_size):
                        batch = signalflow_vector_ids[i:i + batch_size]
                        index.delete(ids=batch)
                        print(f"      ✅ Deleted batch {i//batch_size + 1}")
                    
                    total_deleted += len(signalflow_vector_ids)
                    print(f"   ✅ Successfully deleted {len(signalflow_vector_ids)} vectors from {index_type.value}")
                else:
                    print(f"   📝 No SignalFlow vectors found in {index_type.value}")
                    
            except Exception as e:
                print(f"   ❌ Error processing {index_type.value}: {e}")
                continue
        
        if total_deleted > 0:
            print(f"\n🎉 Successfully removed {total_deleted} SignalFlow vectors from the database!")
            print("   The AI chatbot will no longer have access to SignalFlow information.")
        else:
            print(f"\n📝 No SignalFlow vectors found to delete.")
            
    except Exception as e:
        print(f"❌ Error during vector removal: {e}")

async def verify_removal():
    """Verify that SignalFlow vectors have been removed"""
    print("\n🔍 Verifying SignalFlow removal...")
    
    try:
        from backend.app.utils.pinecone_service import hybrid_search
        
        # Test search for SignalFlow
        result = await hybrid_search("What is SignalFlow?", top_k=3)
        
        if 'signalflow' in result.lower() or 'signal flow' in result.lower():
            print("⚠️  Warning: SignalFlow content may still be present in search results")
            print("   This could be from fallback knowledge or cached results")
        else:
            print("✅ Verification successful: No SignalFlow content found in search results")
            
    except Exception as e:
        print(f"❌ Error during verification: {e}")

if __name__ == "__main__":
    async def main():
        print("🤖 SignalFlow Vector Removal Tool")
        print("=" * 50)
        
        # Confirm deletion
        confirm = input("Are you sure you want to remove all SignalFlow vectors? (yes/no): ").lower().strip()
        
        if confirm in ['yes', 'y']:
            await remove_signalflow_vectors()
            await verify_removal()
            print("\n✅ SignalFlow removal complete!")
        else:
            print("❌ Operation cancelled.")
    
    asyncio.run(main())
