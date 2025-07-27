import os
import json
from typing import List, Dict, Any
from pathlib import Path

class KnowledgeBaseService:
    """Centralized knowledge base service that consolidates all Isaac information"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent.parent.parent
        self.knowledge_sources = {
            'main': self.base_path / 'knowledge-base' / 'isaac-mineo-complete.md',
            'frontend_about': self.base_path / 'frontend' / 'src' / 'data' / 'knowledge-base' / 'about_me.txt',
            'frontend_tech': self.base_path / 'frontend' / 'src' / 'data' / 'knowledge-base' / 'tech_stack.txt',
            'frontend_projects': self.base_path / 'frontend' / 'src' / 'data' / 'knowledge-base' / 'projects.txt',
            'frontend_career': self.base_path / 'frontend' / 'src' / 'data' / 'knowledge-base' / 'career_goals.txt',
        }
        self._knowledge_cache = None
    
    def get_complete_knowledge(self) -> str:
        """Get the complete knowledge base as a single string"""
        if self._knowledge_cache is None:
            self._load_knowledge()
        return self._knowledge_cache
    
    def _load_knowledge(self) -> None:
        """Load and consolidate all knowledge sources"""
        knowledge_parts = []
        
        # Load main knowledge base
        main_kb_path = self.knowledge_sources['main']
        if main_kb_path.exists():
            with open(main_kb_path, 'r', encoding='utf-8') as f:
                knowledge_parts.append(f.read())
        
        # Load frontend knowledge base files as supplementary
        for source_name, file_path in self.knowledge_sources.items():
            if source_name != 'main' and file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if content.strip():
                            knowledge_parts.append(f"\n\n--- Additional {source_name} Information ---\n{content}")
                except Exception as e:
                    print(f"Warning: Could not load {source_name}: {e}")
        
        # Combine all knowledge
        self._knowledge_cache = "\n".join(knowledge_parts)
    
    def get_fallback_knowledge(self) -> str:
        """Get essential fallback knowledge when files aren't available"""
        return """
        Isaac Mineo - Full-Stack Developer & AI Engineer
        
        TECHNICAL EXPERTISE:
        • Frontend: React 18, JavaScript/TypeScript, Tailwind CSS, Vite
        • Backend: FastAPI, Python, Node.js, RESTful APIs
        • AI/ML: OpenAI APIs (GPT-4, Embeddings), Claude API, Pinecone vector search
        • Databases: MongoDB, Redis, PostgreSQL, Firebase
        • Cloud: Vercel, Render, AWS, Docker deployment
        
        FEATURED PROJECT - NUTRIVIZE:
        AI-powered nutrition tracking application:
        • Frontend: React PWA with offline capabilities
        • Backend: FastAPI with MongoDB and Redis
        • AI: OpenAI GPT-4 Vision for food recognition
        • Live at: https://nutrivize.vercel.app
        
        PROFESSIONAL FOCUS:
        • Building intelligent, scalable web applications
        • AI integration and automation
        • Clean, maintainable code with performance optimization
        • Full-stack development with modern technologies
        
        CAREER GOALS:
        Seeking backend, AI engineering, or full-stack roles in:
        • HealthTech and wellness applications
        • AI-powered productivity tools  
        • Developer tooling and infrastructure
        • Innovative startups with real-world impact
        
        CONTACT:
        • Email: IsaacMineo@gmail.com
        • GitHub: https://github.com/GoldenRodger5
        • LinkedIn: https://linkedin.com/in/isaacmineo
        • Portfolio: https://isaacmineo.com
        """
    
    def get_knowledge_for_query(self, query: str) -> str:
        """Get relevant knowledge based on query context"""
        query_lower = query.lower()
        complete_knowledge = self.get_complete_knowledge()
        
        # If we have the complete knowledge, return it
        if complete_knowledge and len(complete_knowledge.strip()) > 100:
            return complete_knowledge
        
        # Otherwise return fallback
        return self.get_fallback_knowledge()
    
    def search_knowledge_chunks(self, query: str, max_chunks: int = 3) -> List[str]:
        """Search for specific knowledge chunks relevant to the query"""
        knowledge = self.get_complete_knowledge()
        
        # Simple keyword-based chunking (can be enhanced with vector search)
        query_lower = query.lower()
        chunks = []
        
        # Split knowledge into sections
        sections = knowledge.split('---')
        
        for section in sections:
            section_lower = section.lower()
            # Score based on keyword matches
            score = 0
            
            query_words = query_lower.split()
            for word in query_words:
                if len(word) > 2:  # Skip short words
                    score += section_lower.count(word)
            
            if score > 0:
                chunks.append((score, section.strip()))
        
        # Sort by relevance and return top chunks
        chunks.sort(reverse=True, key=lambda x: x[0])
        return [chunk[1] for chunk in chunks[:max_chunks]]
    
    def get_structured_knowledge(self) -> Dict[str, Any]:
        """Get knowledge in structured format for API responses"""
        return {
            "personal": {
                "name": "Isaac Mineo",
                "email": "IsaacMineo@gmail.com",
                "github": "https://github.com/GoldenRodger5",
                "linkedin": "https://linkedin.com/in/isaacmineo",
                "portfolio": "https://isaacmineo.com"
            },
            "skills": {
                "frontend": ["React 18", "JavaScript/TypeScript", "Tailwind CSS", "Vite"],
                "backend": ["FastAPI", "Python", "Node.js", "RESTful APIs"],
                "ai": ["OpenAI APIs", "Claude API", "Pinecone", "Vector Search"],
                "databases": ["MongoDB", "Redis", "PostgreSQL", "Firebase"],
                "cloud": ["Vercel", "Render", "AWS", "Docker"]
            },
            "projects": {
                "nutrivize": {
                    "name": "Nutrivize",
                    "description": "AI-powered nutrition tracking application",
                    "url": "https://nutrivize.vercel.app",
                    "technologies": ["React", "FastAPI", "MongoDB", "Redis", "OpenAI"],
                    "status": "Live"
                },
                "portfolio": {
                    "name": "AI Development Portfolio",
                    "description": "Modern portfolio with AI chatbot integration",
                    "url": "https://isaacmineo.com",
                    "technologies": ["React", "Vite", "Tailwind", "FastAPI"],
                    "status": "Live"
                }
            },
            "career": {
                "seeking": ["Backend Engineer", "AI Engineer", "Full-Stack Developer"],
                "interests": ["HealthTech", "AI Tools", "Developer Tooling", "Startups"],
                "availability": "Open to new opportunities"
            }
        }

# Create singleton instance
knowledge_service = KnowledgeBaseService()
