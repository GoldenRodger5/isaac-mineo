import os
import pinecone
import openai
from typing import Optional, List, Dict, Any
import hashlib

# Initialize Pinecone
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment="us-east-1-aws"  # Free tier environment
)

INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "isaac-info")

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def initialize_pinecone():
    """Initialize Pinecone index if it doesn't exist"""
    try:
        # Check if index exists
        existing_indexes = pinecone.list_indexes()
        
        if INDEX_NAME not in existing_indexes:
            # Create index if it doesn't exist
            pinecone.create_index(
                name=INDEX_NAME,
                dimension=1536,  # OpenAI embedding dimension
                metric='cosine'
            )
            print(f"Created index: {INDEX_NAME}")
        
        return pinecone.Index(INDEX_NAME)
    except Exception as error:
        print(f"Error initializing Pinecone: {error}")
        raise error

async def create_embedding(text: str) -> List[float]:
    """Create embeddings using OpenAI"""
    try:
        # Create embedding
        response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text.replace("\n", " ")
        )
        return response.data[0].embedding
    except Exception as error:
        print(f"Error creating embedding: {error}")
        raise error

async def search_knowledge_base(query: str, top_k: int = 5) -> str:
    """
    Search the knowledge base using vector similarity
    Returns formatted context string for the AI model
    """
    try:
        # Get index
        index = pinecone.Index(INDEX_NAME)
        
        # Create embedding for the query
        query_embedding = await create_embedding(query)
        
        # Search for similar vectors
        search_results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            include_values=False
        )
        
        # Extract and format relevant information
        context_parts = []
        for match in search_results.matches:
            if match.score > 0.7:  # Only include high-confidence matches
                metadata = match.metadata
                source = metadata.get('source', 'Unknown')
                content = metadata.get('text', '')
                
                # Format the context piece
                formatted_content = f"From {source}: {content}"
                context_parts.append(formatted_content)
        
        if context_parts:
            # Join all context pieces
            full_context = "\n\n".join(context_parts)
            return full_context
        else:
            return get_fallback_knowledge()
            
    except Exception as error:
        print(f"Error searching knowledge base: {error}")
        return get_fallback_knowledge()

def get_fallback_knowledge() -> str:
    """Fallback knowledge when vector search fails"""
    return """
    Isaac Mineo - Full-Stack Developer & AI Engineer
    
    TECHNICAL EXPERTISE:
    • Frontend: React 18, JavaScript/TypeScript, HTML5, CSS3, Responsive Design
    • Backend: FastAPI, Python, Node.js, RESTful APIs, WebSocket integration
    • Databases: MongoDB, Redis (caching), PostgreSQL
    • AI/ML: OpenAI APIs (GPT-4, DALL-E, Embeddings), Pinecone (vector search), LangChain
    • Cloud & DevOps: AWS, Vercel, Docker, Git/GitHub, CI/CD pipelines
    • Development Tools: VS Code, Postman, Chrome DevTools
    
    FEATURED PROJECT - NUTRIVIZE:
    AI-powered nutrition tracking application with computer vision capabilities:
    • Frontend: React with modern UI/UX design
    • Backend: FastAPI with MongoDB for data persistence
    • AI Integration: OpenAI GPT-4 Vision for food recognition and nutritional analysis
    • Real-time Features: WebSocket integration for live updates
    • Deployment: Production-ready with proper error handling and security
    
    PROFESSIONAL FOCUS:
    • Building intelligent, scalable web applications
    • AI integration and prompt engineering
    • Clean, maintainable code with best practices
    • Performance optimization and user experience
    • Full-stack development with modern technologies
    
    CAREER GOALS:
    Seeking backend, AI engineering, or full-stack roles with innovative teams in:
    • HealthTech and wellness applications
    • AI-powered productivity tools
    • Developer tooling and infrastructure
    • Startups focused on making real-world impact
    
    CONTACT: isaac@isaacmineo.com
    GITHUB: github.com/GoldenRodger5
    LINKEDIN: linkedin.com/in/isaacmineo
    """

async def upsert_vectors(vectors: List[Dict[str, Any]]) -> bool:
    """Upsert vectors to Pinecone index"""
    try:
        index = pinecone.Index(INDEX_NAME)
        
        # Format vectors for upsert
        formatted_vectors = []
        for vector in vectors:
            formatted_vectors.append((
                vector['id'],
                vector['values'],
                vector['metadata']
            ))
        
        # Upsert in batches
        batch_size = 100
        for i in range(0, len(formatted_vectors), batch_size):
            batch = formatted_vectors[i:i + batch_size]
            index.upsert(vectors=batch)
        
        return True
    except Exception as error:
        print(f"Error upserting vectors: {error}")
        return False

async def get_index_stats() -> Dict[str, Any]:
    """Get statistics about the Pinecone index"""
    try:
        index = pinecone.Index(INDEX_NAME)
        stats = index.describe_index_stats()
        return {
            'total_vectors': stats.total_vector_count,
            'dimension': stats.dimension,
            'index_fullness': stats.index_fullness,
            'namespaces': stats.namespaces
        }
    except Exception as error:
        print(f"Error getting index stats: {error}")
        return {}

def create_vector_id(content: str, source: str) -> str:
    """Create a unique ID for a vector based on content and source"""
    content_hash = hashlib.md5(f"{source}:{content}".encode()).hexdigest()
    return f"{source}_{content_hash[:8]}"
