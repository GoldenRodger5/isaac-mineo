#!/usr/bin/env python3
"""
Knowledge Base Vectorization Script

This script processes documents from the knowledge-base directory and adds them
to the appropriate Pinecone vector indexes for semantic search.
"""

import os
import asyncio
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend app to the Python path
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.app.utils.pinecone_service import (
    initialize_pinecone_indexes,
    create_embedding,
    upsert_vectors,
    classify_content_for_indexing,
    create_vector_id,
    IndexType
)

class KnowledgeVectorizer:
    """Handles vectorization of knowledge base documents"""
    
    def __init__(self):
        self.knowledge_base_path = Path(__file__).parent / "knowledge-base"
        self.chunk_size = 1500  # Optimal chunk size for embeddings
        self.chunk_overlap = 200  # Overlap to maintain context
        
    def chunk_text(self, text: str, source: str) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks for vectorization"""
        chunks = []
        
        # Clean the text
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Normalize line breaks
        text = re.sub(r'[^\S\n]+', ' ', text)     # Normalize whitespace
        
        # Split by major sections first (headers)
        sections = re.split(r'\n(?=#+\s)', text)
        
        for section in sections:
            if len(section.strip()) < 50:  # Skip very short sections
                continue
                
            # If section is small enough, use as single chunk
            if len(section) <= self.chunk_size:
                chunks.append({
                    'content': section.strip(),
                    'source': source,
                    'chunk_type': 'section'
                })
            else:
                # Split long sections into smaller chunks
                section_chunks = self._split_long_text(section)
                for i, chunk in enumerate(section_chunks):
                    chunks.append({
                        'content': chunk.strip(),
                        'source': f"{source}_part_{i+1}",
                        'chunk_type': 'subsection'
                    })
        
        return chunks
    
    def _split_long_text(self, text: str) -> List[str]:
        """Split long text into overlapping chunks"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # Try to break at a sentence or paragraph boundary
            if end < len(text):
                # Look for paragraph break first
                break_point = text.rfind('\n\n', start, end)
                if break_point == -1:
                    # Look for sentence break
                    break_point = text.rfind('. ', start, end)
                if break_point == -1:
                    # Look for any line break
                    break_point = text.rfind('\n', start, end)
                if break_point != -1 and break_point > start:
                    end = break_point + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = max(start + self.chunk_size - self.chunk_overlap, end)
        
        return chunks
    
    async def process_document(self, file_path: Path) -> List[Dict[str, Any]]:
        """Process a single document and return vectors"""
        print(f"Processing: {file_path.name}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return []
        
        if not content.strip():
            print(f"Skipping empty file: {file_path}")
            return []
        
        # Extract metadata
        source = file_path.stem
        chunks = self.chunk_text(content, source)
        
        print(f"Created {len(chunks)} chunks from {file_path.name}")
        
        vectors = []
        
        for i, chunk in enumerate(chunks):
            try:
                # Create embedding
                embedding = await create_embedding(chunk['content'])
                
                # Classify content to determine index
                index_type = classify_content_for_indexing(chunk['content'], source)
                
                # Create unique ID
                vector_id = create_vector_id(chunk['content'], chunk['source'], index_type)
                
                # Create vector with metadata
                vector = {
                    'id': vector_id,
                    'values': embedding,
                    'metadata': {
                        'text': chunk['content'],
                        'source': chunk['source'],
                        'original_file': str(file_path),
                        'chunk_index': i,
                        'chunk_type': chunk['chunk_type'],
                        'index_type': index_type.value,
                        'char_count': len(chunk['content']),
                        'word_count': len(chunk['content'].split())
                    }
                }
                
                vectors.append((vector, index_type))
                
            except Exception as e:
                print(f"Error processing chunk {i} from {file_path}: {e}")
                continue
        
        return vectors
    
    async def vectorize_knowledge_base(self, specific_file: Optional[str] = None) -> None:
        """Vectorize all documents in the knowledge base"""
        print("🚀 Starting knowledge base vectorization...")
        
        # Initialize Pinecone indexes
        print("📊 Initializing Pinecone indexes...")
        await initialize_pinecone_indexes()
        
        # Get files to process
        if specific_file:
            files = [self.knowledge_base_path / specific_file]
            if not files[0].exists():
                print(f"❌ File not found: {files[0]}")
                return
        else:
            files = list(self.knowledge_base_path.glob("*.md"))
            files.extend(self.knowledge_base_path.glob("*.txt"))
        
        if not files:
            print("❌ No documents found in knowledge-base directory")
            return
        
        print(f"📄 Found {len(files)} document(s) to process")
        
        # Group vectors by index type
        vectors_by_index = {
            IndexType.PROJECTS: [],
            IndexType.PROFESSIONAL: [],
            IndexType.PERSONAL: []
        }
        
        total_vectors = 0
        
        # Process each file
        for file_path in files:
            vectors = await self.process_document(file_path)
            
            for vector, index_type in vectors:
                vectors_by_index[index_type].append(vector)
                total_vectors += 1
        
        print(f"📊 Created {total_vectors} total vectors")
        
        # Upload vectors to appropriate indexes
        for index_type, vectors in vectors_by_index.items():
            if vectors:
                print(f"⬆️  Uploading {len(vectors)} vectors to {index_type.value} index...")
                success = await upsert_vectors(vectors, index_type)
                
                if success:
                    print(f"✅ Successfully uploaded to {index_type.value}")
                else:
                    print(f"❌ Failed to upload to {index_type.value}")
            else:
                print(f"📝 No vectors for {index_type.value} index")
        
        print(f"🎉 Vectorization complete! Total vectors: {total_vectors}")

async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Vectorize knowledge base documents')
    parser.add_argument(
        '--file', 
        help='Specific file to vectorize (e.g., SignalFLowReadMe.md)', 
        default=None
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Vectorize all files in knowledge-base directory'
    )
    
    args = parser.parse_args()
    
    # Validate environment
    required_env_vars = ['OPENAI_API_KEY', 'PINECONE_API_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file or environment")
        return
    
    vectorizer = KnowledgeVectorizer()
    
    if args.file:
        await vectorizer.vectorize_knowledge_base(args.file)
    elif args.all:
        await vectorizer.vectorize_knowledge_base()
    else:
        # Default: just vectorize SignalFlow if no args provided
        await vectorizer.vectorize_knowledge_base("SignalFLowReadMe.md")

if __name__ == "__main__":
    asyncio.run(main())
