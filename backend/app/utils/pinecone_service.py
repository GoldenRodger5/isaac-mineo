import os
import pinecone
from pinecone import Pinecone, ServerlessSpec
import openai
from typing import Optional, List, Dict, Any, Tuple
import hashlib
import json
import re
from enum import Enum

# Import knowledge service
from app.services.knowledge_service import knowledge_service

# Multi-index configuration
class IndexType(Enum):
    PROJECTS = "isaac-projects"
    PROFESSIONAL = "isaac-professional" 
    PERSONAL = "isaac-personal"

INDEX_CONFIGS = {
    IndexType.PROJECTS: {
        "name": "isaac-projects",
        "description": "Technical projects, code, features, and development work"
    },
    IndexType.PROFESSIONAL: {
        "name": "isaac-professional", 
        "description": "Resume, skills, experience, education, and career information"
    },
    IndexType.PERSONAL: {
        "name": "isaac-personal",
        "description": "Personal background, interests, contact info, and personality"
    }
}

# Initialize clients as None, will be set up in initialize function
pc = None
openai_client = None

def initialize_clients():
    """Initialize Pinecone and OpenAI clients"""
    global pc, openai_client
    if pc is None:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    if openai_client is None:
        openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def initialize_pinecone_indexes():
    """Initialize all Pinecone indexes if they don't exist"""
    try:
        # Initialize clients first
        initialize_clients()
        
        existing_indexes = pc.list_indexes()
        index_names = [index.name for index in existing_indexes] if existing_indexes else []
        
        created_indexes = []
        
        for index_type in IndexType:
            index_name = INDEX_CONFIGS[index_type]["name"]
            
            if index_name not in index_names:
                # Create index with 3072 dimensions for text-embedding-3-large
                pc.create_index(
                    name=index_name,
                    dimension=3072,  # text-embedding-3-large dimension
                    metric='cosine',
                    spec={
                        'serverless': {
                            'cloud': 'aws',
                            'region': 'us-east-1'
                        }
                    }
                )
                created_indexes.append(index_name)
                print(f"Created index: {index_name}")
        
        if created_indexes:
            print(f"Successfully created {len(created_indexes)} new indexes")
        
        return {index_type: pc.Index(INDEX_CONFIGS[index_type]["name"]) for index_type in IndexType}
        
    except Exception as error:
        print(f"Error initializing Pinecone indexes: {error}")
        raise error

async def create_embedding(text: str) -> List[float]:
    """Create embeddings using OpenAI text-embedding-3-large"""
    try:
        # Ensure clients are initialized
        initialize_clients()
        
        # Create embedding with the best OpenAI model
        response = openai_client.embeddings.create(
            model="text-embedding-3-large",
            input=text.replace("\n", " "),
            dimensions=3072  # Use full dimension for best quality
        )
        return response.data[0].embedding
    except Exception as error:
        print(f"Error creating embedding: {error}")
        raise error

def classify_query(query: str) -> List[IndexType]:
    """Classify query to determine which indexes to search"""
    query_lower = query.lower()
    
    # Technical/project keywords
    project_keywords = [
        'project', 'code', 'github', 'repository', 'application', 'app', 'build', 'develop',
        'nutrivize', 'quizium', 'echopodcast', 'ai', 'fastapi', 'react', 'python', 'javascript',
        'technology', 'stack', 'framework', 'api', 'database', 'feature', 'implementation'
    ]
    
    # Professional keywords  
    professional_keywords = [
        'resume', 'cv', 'experience', 'work', 'job', 'career', 'skill', 'education', 'university',
        'degree', 'qualification', 'employment', 'professional', 'background', 'expertise'
    ]
    
    # Personal keywords
    personal_keywords = [
        'about', 'personal', 'hobby', 'interest', 'contact', 'email', 'phone', 'location',
        'personality', 'background', 'story', 'life', 'passion', 'goal', 'aspiration'
    ]
    
    # Score each category
    project_score = sum(1 for keyword in project_keywords if keyword in query_lower)
    professional_score = sum(1 for keyword in professional_keywords if keyword in query_lower)
    personal_score = sum(1 for keyword in personal_keywords if keyword in query_lower)
    
    # Determine which indexes to search
    indexes_to_search = []
    
    if project_score > 0:
        indexes_to_search.append(IndexType.PROJECTS)
    if professional_score > 0:
        indexes_to_search.append(IndexType.PROFESSIONAL)
    if personal_score > 0:
        indexes_to_search.append(IndexType.PERSONAL)
    
    # If no specific category detected, search all indexes
    if not indexes_to_search:
        indexes_to_search = list(IndexType)
    
    return indexes_to_search

async def semantic_search(query: str, index_type: IndexType, top_k: int = 3) -> List[Dict[str, Any]]:
    """Perform semantic vector search on specific index"""
    try:
        initialize_clients()
        index_name = INDEX_CONFIGS[index_type]["name"]
        index = pc.Index(index_name)
        
        # Create embedding for the query
        query_embedding = await create_embedding(query)
        
        # Search for similar vectors
        search_results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            include_values=False
        )
        
        # Format results
        results = []
        for match in search_results.matches:
            if match.score > 0.75:  # Higher threshold for better quality
                results.append({
                    'content': match.metadata.get('text', ''),
                    'source': match.metadata.get('source', ''),
                    'score': match.score,
                    'index_type': index_type.value,
                    'metadata': match.metadata
                })
        
        return results
        
    except Exception as error:
        print(f"Error in semantic search for {index_type.value}: {error}")
        return []

async def keyword_search(query: str, index_type: IndexType, top_k: int = 3) -> List[Dict[str, Any]]:
    """Perform keyword-based search using metadata filtering"""
    try:
        initialize_clients()
        index_name = INDEX_CONFIGS[index_type]["name"]
        index = pc.Index(index_name)
        
        # Extract keywords from query
        keywords = extract_keywords(query)
        
        results = []
        
        # Search for each keyword
        for keyword in keywords:
            # Create a simple embedding for keyword matching
            keyword_embedding = await create_embedding(keyword)
            
            # Search with keyword filter if metadata supports it
            search_results = index.query(
                vector=keyword_embedding,
                top_k=top_k,
                include_metadata=True,
                include_values=False
            )
            
            for match in search_results.matches:
                content = match.metadata.get('text', '').lower()
                if keyword.lower() in content:
                    results.append({
                        'content': match.metadata.get('text', ''),
                        'source': match.metadata.get('source', ''),
                        'score': match.score + 0.1,  # Boost for keyword match
                        'index_type': index_type.value,
                        'metadata': match.metadata,
                        'keyword_match': keyword
                    })
        
        # Remove duplicates and sort by score
        unique_results = {}
        for result in results:
            key = f"{result['source']}_{result['content'][:50]}"
            if key not in unique_results or result['score'] > unique_results[key]['score']:
                unique_results[key] = result
        
        return sorted(unique_results.values(), key=lambda x: x['score'], reverse=True)[:top_k]
        
    except Exception as error:
        print(f"Error in keyword search for {index_type.value}: {error}")
        return []

def extract_keywords(query: str) -> List[str]:
    """Extract meaningful keywords from query"""
    # Remove common stop words
    stop_words = {'what', 'how', 'when', 'where', 'why', 'who', 'is', 'are', 'was', 'were', 
                  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                  'of', 'with', 'by', 'can', 'could', 'does', 'do', 'tell', 'me', 'about'}
    
    # Extract words, remove punctuation, filter stop words
    words = re.findall(r'\b\w+\b', query.lower())
    keywords = [word for word in words if word not in stop_words and len(word) > 2]
    
    return keywords[:5]  # Limit to most important keywords

async def hybrid_search(query: str, top_k: int = 8) -> str:
    """
    Perform hybrid search combining semantic and keyword search across multiple indexes
    Returns formatted context string for the AI model
    """
    try:
        # Classify query to determine relevant indexes
        relevant_indexes = classify_query(query)
        
        all_results = []
        
        # Search each relevant index
        for index_type in relevant_indexes:
            # Semantic search
            semantic_results = await semantic_search(query, index_type, top_k//2)
            all_results.extend(semantic_results)
            
            # Keyword search
            keyword_results = await keyword_search(query, index_type, top_k//2)
            all_results.extend(keyword_results)
        
        # Fusion ranking: combine and re-rank results
        ranked_results = fusion_rank(all_results, query)
        
        # Format context for AI
        context_parts = []
        for result in ranked_results[:top_k]:
            formatted_content = format_context_piece(result)
            context_parts.append(formatted_content)
        
        if context_parts:
            full_context = "\n\n".join(context_parts)
            return full_context
        else:
            return get_fallback_knowledge()
            
    except Exception as error:
        print(f"Error in hybrid search: {error}")
        return get_fallback_knowledge()

def fusion_rank(results: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    """Advanced fusion ranking combining multiple signals"""
    if not results:
        return []
    
    # Remove duplicates
    unique_results = {}
    for result in results:
        key = f"{result['source']}_{result['content'][:100]}"
        if key not in unique_results or result['score'] > unique_results[key]['score']:
            unique_results[key] = result
    
    ranked_results = list(unique_results.values())
    
    # Apply additional ranking factors
    for result in ranked_results:
        # Boost based on index relevance
        if 'projects' in query.lower() and result['index_type'] == IndexType.PROJECTS.value:
            result['score'] += 0.1
        elif any(word in query.lower() for word in ['resume', 'experience', 'skill']) and result['index_type'] == IndexType.PROFESSIONAL.value:
            result['score'] += 0.1
        elif any(word in query.lower() for word in ['about', 'contact', 'personal']) and result['index_type'] == IndexType.PERSONAL.value:
            result['score'] += 0.1
        
        # Boost for keyword matches
        if 'keyword_match' in result:
            result['score'] += 0.05
        
        # Boost for longer content (more informative)
        content_length = len(result['content'])
        if content_length > 500:
            result['score'] += 0.02
    
    # Sort by final score
    return sorted(ranked_results, key=lambda x: x['score'], reverse=True)

def format_context_piece(result: Dict[str, Any]) -> str:
    """Format a search result for inclusion in AI context"""
    source = result['source']
    content = result['content']
    index_type = result['index_type']
    score = result['score']
    
    # Add context type prefix for AI understanding
    type_prefix = {
        IndexType.PROJECTS.value: "PROJECT INFO",
        IndexType.PROFESSIONAL.value: "PROFESSIONAL INFO", 
        IndexType.PERSONAL.value: "PERSONAL INFO"
    }.get(index_type, "INFO")
    
    return f"[{type_prefix}] From {source} (relevance: {score:.3f}):\n{content}"

def get_fallback_knowledge() -> str:
    """Fallback knowledge when vector search fails"""
    return knowledge_service.get_fallback_knowledge()

async def upsert_vectors(vectors: List[Dict[str, Any]], index_type: IndexType) -> bool:
    """Upsert vectors to specific Pinecone index"""
    try:
        initialize_clients()
        index_name = INDEX_CONFIGS[index_type]["name"]
        index = pc.Index(index_name)
        
        # Format vectors for upsert
        formatted_vectors = []
        for vector in vectors:
            formatted_vectors.append({
                'id': vector['id'],
                'values': vector['values'],
                'metadata': vector['metadata']
            })
        
        # Upsert in batches
        batch_size = 100
        for i in range(0, len(formatted_vectors), batch_size):
            batch = formatted_vectors[i:i + batch_size]
            index.upsert(vectors=batch)
        
        print(f"Upserted {len(formatted_vectors)} vectors to {index_name}")
        return True
    except Exception as error:
        print(f"Error upserting vectors to {index_type.value}: {error}")
        return False

async def get_all_index_stats() -> Dict[str, Any]:
    """Get statistics about all Pinecone indexes"""
    try:
        initialize_clients()
        all_stats = {}
        total_vectors = 0
        
        for index_type in IndexType:
            index_name = INDEX_CONFIGS[index_type]["name"]
            try:
                index = pc.Index(index_name)
                stats = index.describe_index_stats()
                
                index_stats = {
                    'total_vectors': stats.total_vector_count,
                    'dimension': stats.dimension,
                    'index_fullness': stats.index_fullness,
                    'namespaces': stats.namespaces
                }
                
                all_stats[index_name] = index_stats
                total_vectors += stats.total_vector_count
                
            except Exception as e:
                all_stats[index_name] = {'error': str(e)}
        
        all_stats['summary'] = {
            'total_indexes': len(IndexType),
            'total_vectors_across_all': total_vectors
        }
        
        return all_stats
    except Exception as error:
        print(f"Error getting index stats: {error}")
        return {}

def classify_content_for_indexing(content: str, source: str) -> IndexType:
    """Classify content to determine which index it belongs to"""
    content_lower = content.lower()
    source_lower = source.lower()
    
    # Project indicators
    project_indicators = [
        'project', 'repository', 'github', 'application', 'app', 'feature', 'technology',
        'framework', 'api', 'database', 'code', 'implementation', 'development',
        'nutrivize', 'quizium', 'echopodcast', 'fastapi', 'react', 'python'
    ]
    
    # Professional indicators
    professional_indicators = [
        'resume', 'cv', 'experience', 'education', 'university', 'degree', 'skill',
        'employment', 'work', 'career', 'qualification', 'transcript', 'gpa'
    ]
    
    # Count indicators
    project_score = sum(1 for indicator in project_indicators 
                       if indicator in content_lower or indicator in source_lower)
    professional_score = sum(1 for indicator in professional_indicators 
                           if indicator in content_lower or indicator in source_lower)
    
    # Classify based on scores and source patterns
    if 'readme' in source_lower or project_score > professional_score:
        return IndexType.PROJECTS
    elif any(word in source_lower for word in ['resume', 'cv', 'transcript']) or professional_score > project_score:
        return IndexType.PROFESSIONAL
    else:
        return IndexType.PERSONAL

def create_vector_id(content: str, source: str, index_type: IndexType) -> str:
    """Create a unique ID for a vector based on content, source, and index type"""
    content_hash = hashlib.md5(f"{source}:{content}".encode()).hexdigest()
    return f"{index_type.value}_{source}_{content_hash[:8]}"

# Maintain backward compatibility
async def search_knowledge_base(query: str, top_k: int = 8) -> str:
    """
    Backward compatible search function - now uses hybrid search
    """
    return await hybrid_search(query, top_k)
