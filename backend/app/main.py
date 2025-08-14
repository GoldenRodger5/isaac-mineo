from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uvicorn
import asyncio
from pathlib import Path

# Import services
from app.services.error_handler import error_handler
from app.utils.pinecone_service import initialize_pinecone_indexes
from app.middleware.auth_middleware import AuthMiddleware
from app.services.auth_service import auth_service
from app.services.performance_service import performance_service

# Load environment variables from project root .env file with robust path finding
def load_project_env():
    """Load environment variables from the project root .env file"""
    current_dir = Path(__file__).resolve()
    
    # Search for .env file in parent directories first (prioritize root .env)
    for parent in [current_dir.parent.parent.parent, current_dir.parent.parent, current_dir.parent]:
        env_file = parent / '.env'
        if env_file.exists():
            print(f"📄 Loading .env from: {env_file}")
            load_dotenv(env_file, override=True)  # Override any existing values
            return True
    
    print("⚠️ No .env file found in project directory tree")
    return False

# Load environment variables
load_project_env()

app = FastAPI(
    title="Isaac Mineo Portfolio API",
    description="Advanced Backend API with Multi-Index Knowledge Base, Hybrid Search, AI Chatbot, and Code Explainer",
    version="4.0.0"
)

# Configure CORS with explicit origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    "https://isaacmineo.com",
    "https://www.isaacmineo.com",
    "https://isaac-mineo.vercel.app", 
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
]

if allowed_origins_env:
    additional_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    allowed_origins.extend(additional_origins)

print(f"🌐 CORS Allowed Origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add authentication and performance middleware
app.add_middleware(AuthMiddleware)

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
        
        # Initialize auth service cache connection
        await auth_service.cache_manager.connect()
        print("✅ Authentication service initialized")
        
        # Initialize performance monitoring
        await performance_service.cache_manager.connect()
        print("✅ Performance monitoring initialized")
        
        # Initialize analytics service
        from app.services.analytics_service import analytics_service
        await analytics_service.cache_manager.connect()
        print("✅ Analytics service initialized")
        
        # Start performance cleanup task
        from app.services.enhanced_performance_service import periodic_cleanup
        asyncio.create_task(periodic_cleanup())
        print("✅ Performance cleanup task started")
        
    except Exception as e:
        print(f"❌ Error initializing services: {e}")
        error_handler.log_error(e, {"startup": True})

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

@app.options("/{path:path}")
async def options_handler(path: str, request: Request):
    """Handle CORS preflight requests explicitly"""
    origin = request.headers.get("origin")
    print(f"🌐 OPTIONS request from origin: {origin} for path: {path}")
    
    response_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "600"
    }
    
    return JSONResponse(
        content={"message": "CORS preflight OK"},
        headers=response_headers
    )

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
from app.routers import auth
from app.routers import analytics
from app.routers import voice
from app.routers import performance

# Include routers
app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(chatbot.router, prefix="/api", tags=["chatbot"])
app.include_router(github_explainer.router, prefix="/api", tags=["github", "code-explainer"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(voice.router, prefix="/api", tags=["voice"])
app.include_router(performance.router, prefix="/api", tags=["performance"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
