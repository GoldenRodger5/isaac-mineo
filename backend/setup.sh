#!/bin/bash

# Quick Backend Setup Script
# Run this when you're ready to implement the backend

echo "🔧 Setting up backend for Isaac Mineo Portfolio..."

# Check if we're in the backend directory
if [ ! -f "README.md" ] || [ ! -f "requirements.example.txt" ]; then
    echo "❌ Please run this from the backend/ directory"
    exit 1
fi

# Copy example requirements
echo "📋 Setting up requirements.txt..."
cp requirements.example.txt requirements.txt

# Create basic FastAPI structure
echo "📁 Creating FastAPI structure..."

mkdir -p app/{routes,models,utils}

# Create main FastAPI app
cat > app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional

app = FastAPI(
    title="Isaac Mineo Portfolio API",
    description="Backend API for Isaac Mineo's portfolio website",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "https://isaacmineo.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ContactMessage(BaseModel):
    name: str
    email: str
    message: str
    interest: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    message: str

# Routes
@app.get("/", response_model=HealthResponse)
async def root():
    return HealthResponse(
        status="success",
        message="Isaac Mineo Portfolio API is running! 🚀"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="API is operational"
    )

@app.post("/contact")
async def submit_contact(message: ContactMessage):
    """Handle contact form submissions"""
    # TODO: Implement email sending logic
    # TODO: Store in database if needed
    
    print(f"📧 Contact form submission from {message.name} ({message.email})")
    print(f"Interest: {message.interest}")
    print(f"Message: {message.message}")
    
    return {
        "status": "success",
        "message": "Thank you for your message! I'll get back to you soon."
    }

@app.get("/projects")
async def get_projects():
    """Get dynamic project data"""
    # TODO: Implement database queries
    return {
        "status": "success",
        "projects": [
            {
                "name": "Nutrivize",
                "status": "live",
                "last_updated": "2025-01-15"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create environment file
cat > .env.example << 'EOF'
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256

# CORS
FRONTEND_URL=http://localhost:5174
PRODUCTION_URL=https://isaacmineo.com
EOF

echo "✅ Backend structure created!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Run '../start.sh' from the project root to start both frontend and backend"
echo "3. Visit http://localhost:8000 to see the API documentation"
echo ""
echo "🚀 Ready for development!"
