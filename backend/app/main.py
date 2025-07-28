from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uvicorn
import asyncio

# Import services
from app.services.error_handler import error_handler
from app.utils.pinecone_service import initialize_pinecone_indexes

# Load environment variables from root .env file
load_dotenv(dotenv_path='../.env')  # Load from project root
load_dotenv()  # Also check current directory

app = FastAPI(
    title="Isaac Mineo Portfolio API",
    description="Advanced Backend API with Multi-Index Knowledge Base, Hybrid Search, and AI Chatbot",
    version="3.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,https://isaac-mineo.vercel.app,https://isaacmineo.com,https://www.isaacmineo.com").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        print("🚀 Initializing Advanced Knowledge Base System...")
        await initialize_pinecone_indexes()
        print("✅ Multi-index knowledge base system ready")
        
        # Initialize cache manager
        from app.utils.cache_manager import CacheManager
        cache_manager = CacheManager()
        await cache_manager.connect()
        print("✅ Cache manager initialized")
    except Exception as e:
        print(f"❌ Error initializing services: {e}")

@app.get("/")
async def root():
    return {
        "message": "Isaac Mineo Advanced Portfolio API", 
        "status": "running", 
        "version": "3.0.0",
        "features": [
            "Multi-Index Knowledge Base",
            "Hybrid Search (Semantic + Keyword)",
            "Advanced Chunking",
            "text-embedding-3-large",
            "GPT-4o Integration"
        ]
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        health_data = error_handler.health_check()
        return health_data
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/health"})
        return {"status": "error", "message": "Health check failed"}

@app.get("/metrics")
async def get_metrics():
    """Get application metrics and performance data"""
    try:
        return {
            "performance": error_handler.get_performance_summary(),
            "errors": error_handler.get_error_summary(),
            "timestamp": error_handler.health_check()["timestamp"]
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/metrics"})
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")

# Import routers
from app.routers import chatbot
from app.routers import github_explainer

# Include routers
app.include_router(chatbot.router, prefix="/api", tags=["chatbot"])
app.include_router(github_explainer.router, prefix="/api", tags=["github", "code-explainer"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
