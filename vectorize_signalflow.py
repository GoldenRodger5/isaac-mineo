#!/usr/bin/env python3
"""
Script to vectorize and ingest the SignalFlow README into the knowledge base
Uses the existing Pinecone infrastructure
"""

import os
import sys
import asyncio
from pathlib import Path
from typing import List, Dict, Any

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

from backend.app.utils.pinecone_service import (
    create_embedding,
    upsert_vectors,
    classify_content_for_indexing,
    create_vector_id,
    IndexType,
    initialize_pinecone_indexes
)

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks for better vectorization"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk_words = words[i:i + chunk_size]
        chunk = ' '.join(chunk_words)
        if chunk.strip():
            chunks.append(chunk.strip())
    
    return chunks

def preprocess_markdown(content: str) -> str:
    """Clean and preprocess markdown content"""
    # Remove excessive whitespace
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Skip empty lines with only whitespace
        if line.strip():
            # Remove markdown formatting but keep content readable
            line = line.replace('**', '').replace('*', '')
            line = line.replace('`', '').replace('#', '')
            line = line.replace('---', '')
            cleaned_lines.append(line.strip())
    
    return '\n'.join(cleaned_lines)

async def vectorize_signalflow_readme():
    """Main function to vectorize the SignalFlow README"""
    
    # Path to the SignalFlow README
    readme_path = Path(__file__).parent / "knowledge-base" / "SignalFLowReadMe.md"
    
    if not readme_path.exists():
        print(f"❌ SignalFlow README not found at: {readme_path}")
        return False
    
    print("🚀 Starting SignalFlow README vectorization...")
    
    try:
        # Initialize Pinecone indexes
        print("📊 Initializing Pinecone indexes...")
        await initialize_pinecone_indexes()
        
        # Read the README content
        print("📖 Reading SignalFlow README...")
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Preprocess content
        print("🧹 Preprocessing content...")
        cleaned_content = preprocess_markdown(content)
        
        # Chunk the content
        print("✂️ Chunking content...")
        chunks = chunk_text(cleaned_content, chunk_size=800, overlap=150)
        print(f"📝 Created {len(chunks)} chunks")
        
        # Classify content to determine target index
        source = "SignalFLowReadMe.md"
        index_type = classify_content_for_indexing(cleaned_content, source)
        print(f"🎯 Content classified as: {index_type.value}")
        
        # Create vectors for each chunk
        print("🔮 Creating embeddings...")
        vectors = []
        
        for i, chunk in enumerate(chunks):
            try:
                # Create embedding
                embedding = await create_embedding(chunk)
                
                # Create vector metadata
                vector_id = create_vector_id(chunk, f"{source}_chunk_{i}", index_type)
                
                vector = {
                    'id': vector_id,
                    'values': embedding,
                    'metadata': {
                        'text': chunk,
                        'source': source,
                        'chunk_index': i,
                        'total_chunks': len(chunks),
                        'project_name': 'SignalFlow',
                        'project_type': 'AI Trading System',
                        'content_type': 'project_documentation'
                    }
                }
                
                vectors.append(vector)
                print(f"✅ Created embedding for chunk {i+1}/{len(chunks)}")
                
            except Exception as e:
                print(f"❌ Failed to create embedding for chunk {i}: {e}")
                continue
        
        # Upsert vectors to Pinecone
        if vectors:
            print(f"📤 Uploading {len(vectors)} vectors to Pinecone...")
            success = await upsert_vectors(vectors, index_type)
            
            if success:
                print(f"🎉 Successfully vectorized SignalFlow README!")
                print(f"📊 Added {len(vectors)} vectors to {index_type.value} index")
                print(f"🔍 The AI chat can now answer questions about SignalFlow")
                return True
            else:
                print("❌ Failed to upload vectors to Pinecone")
                return False
        else:
            print("❌ No vectors created successfully")
            return False
            
    except Exception as e:
        print(f"❌ Error during vectorization: {e}")
        return False

async def test_search():
    """Test search functionality after vectorization"""
    from backend.app.utils.pinecone_service import hybrid_search
    
    print("\n🔍 Testing search functionality...")
    
    test_queries = [
        "What is SignalFlow?",
        "AI trading system features",
        "Kelly Criterion position sizing",
        "multi-agent architecture"
    ]
    
    for query in test_queries:
        print(f"\n🔎 Query: {query}")
        try:
            results = await hybrid_search(query, top_k=2)
            if results and len(results) > 10:
                preview = results[:200] + "..." if len(results) > 200 else results
                print(f"✅ Found relevant content: {preview}")
            else:
                print("❌ No relevant content found")
        except Exception as e:
            print(f"❌ Search failed: {e}")

if __name__ == "__main__":
    async def main():
        print("🤖 SignalFlow Knowledge Base Vectorization Tool")
        print("=" * 50)
        
        # Vectorize the README
        success = await vectorize_signalflow_readme()
        
        if success:
            # Test the search functionality
            await test_search()
            print("\n🎉 SignalFlow is now part of your AI knowledge base!")
        else:
            print("\n❌ Vectorization failed. Please check the logs above.")
    
    # Run the async main function
    asyncio.run(main())
