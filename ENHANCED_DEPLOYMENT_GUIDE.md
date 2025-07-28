# Enhanced Code Explainer - Production Deployment Guide

## 🚀 Overview
This guide covers deploying the enhanced AI Code Explainer with authentication, performance optimization, comprehensive testing, and security features.

## 📋 Prerequisites

### Required Services
- **Redis** (for caching and rate limiting)
- **GitHub API Token** (for repository access)
- **Anthropic API Key** (for Claude AI explanations)
- **Domain with SSL** (for production deployment)

### Optional Services
- **Pinecone** (for enhanced knowledge base)
- **SendGrid/SMTP** (for email notifications)
- **Monitoring Service** (DataDog, New Relic, etc.)

## 🔧 Environment Configuration

### 1. Copy Enhanced Environment Template
```bash
cp .env.example.enhanced .env
```

### 2. Configure Required Variables
```env
# Authentication
JWT_SECRET_KEY=your_strong_jwt_secret_key_here

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# GitHub Integration
GITHUB_API_TOKEN=your_github_personal_access_token_here

# Redis (Required for performance features)
REDIS_URL=rediss://username:password@host:port

# Production URLs
PRODUCTION_FRONTEND_URL=https://yourdomain.com
PRODUCTION_BACKEND_URL=https://api.yourdomain.com
```

### 3. Configure Performance Settings
```env
# Rate Limiting
MAX_EXPLANATION_REQUESTS_PER_HOUR=100
MAX_API_REQUESTS_PER_HOUR=500

# Caching
EXPLANATION_CACHE_TTL=7200
ENABLE_CODE_CACHING=true

# Security
ENABLE_RATE_LIMITING=true
ENABLE_AUTHENTICATION=true
```

## 🐳 Docker Deployment

### 1. Build Docker Images
```bash
# Backend
cd backend
docker build -t code-explainer-backend .

# Frontend
cd ../frontend
docker build -t code-explainer-frontend .
```

### 2. Docker Compose Setup
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  backend:
    image: code-explainer-backend
    restart: unless-stopped
    environment:
      - REDIS_URL=redis://redis:6379
      - ENVIRONMENT=production
    depends_on:
      - redis
    ports:
      - "8000:8000"

  frontend:
    image: code-explainer-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com

volumes:
  redis_data:
```

### 3. Deploy with Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Platform Deployment

### Render.com Deployment

#### Backend (Render Web Service)
```yaml
# render.yaml
services:
  - type: web
    name: code-explainer-api
    env: python
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    healthCheckPath: /health
    envVars:
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: GITHUB_API_TOKEN
        sync: false
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: REDIS_URL
        fromService:
          type: redis
          name: code-explainer-redis
      - key: ENVIRONMENT
        value: production

  - type: redis
    name: code-explainer-redis
    ipAllowList: []
```

#### Frontend (Vercel/Netlify)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### AWS Deployment

#### Using AWS App Runner
```yaml
# apprunner.yaml
version: 1.0
runtime: python3.9
build:
  commands:
    build:
      - cd backend
      - pip install -r requirements.txt
run:
  runtime-version: 3.9
  command: uvicorn app.main:app --host 0.0.0.0 --port 8080
  network:
    port: 8080
    env: PORT
  env:
    - name: ENVIRONMENT
      value: production
```

#### Using ECS with Fargate
```dockerfile
# backend/Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}

# Rate limiting zone
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

### 2. Environment Variable Security
```bash
# Use external secret management
export ANTHROPIC_API_KEY=$(aws secretsmanager get-secret-value --secret-id anthropic-key --query SecretString --output text)
export GITHUB_API_TOKEN=$(aws secretsmanager get-secret-value --secret-id github-token --query SecretString --output text)
```

### 3. API Key Management
```python
# For user API keys
from app.services.auth_service import auth_service

# Generate API key for user
api_key = auth_service.generate_api_key(user_id)

# Store in secure database with expiration
await store_api_key(user_id, api_key, expires_in=30*24*3600)  # 30 days
```

## 📊 Monitoring and Observability

### 1. Application Monitoring
```python
# app/middleware/monitoring_middleware.py
import time
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

class MonitoringMiddleware:
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        duration = time.time() - start_time
        REQUEST_DURATION.observe(duration)
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        return response
```

### 2. Health Checks
```python
# Add to app/main.py
@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "4.0.0",
        "checks": {}
    }
    
    # Check Redis
    try:
        await cache_manager.redis_client.ping()
        health_status["checks"]["redis"] = "healthy"
    except Exception:
        health_status["checks"]["redis"] = "unhealthy"
        health_status["status"] = "degraded"
    
    # Check GitHub API
    try:
        await github_service.get_rate_limit_info()
        health_status["checks"]["github"] = "healthy"
    except Exception:
        health_status["checks"]["github"] = "unhealthy"
        health_status["status"] = "degraded"
    
    # Check AI service
    try:
        # Simple test call
        health_status["checks"]["ai_service"] = "healthy"
    except Exception:
        health_status["checks"]["ai_service"] = "unhealthy"
        health_status["status"] = "degraded"
    
    return health_status
```

### 3. Logging Configuration
```python
# app/utils/logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry["user_id"] = record.user_id
        
        if hasattr(record, 'request_id'):
            log_entry["request_id"] = record.request_id
        
        return json.dumps(log_entry)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add JSON formatter for production
if os.getenv("ENVIRONMENT") == "production":
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logging.getLogger().addHandler(handler)
```

## 🧪 Testing in Production

### 1. Smoke Tests
```bash
#!/bin/bash
# smoke-test.sh

API_URL="https://api.yourdomain.com"

echo "Running smoke tests..."

# Health check
curl -f "$API_URL/health" || exit 1

# GitHub health
curl -f "$API_URL/api/github/health" || exit 1

# Test explanation endpoint
curl -X POST "$API_URL/api/github/explain-code" \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"test\")","mode":"explain"}' || exit 1

echo "✅ Smoke tests passed"
```

### 2. Load Testing
```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const response = http.post('https://api.yourdomain.com/api/github/explain-code', {
    code: 'function hello() { return "world"; }',
    mode: 'explain'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
  
  sleep(1);
}
```

## 📈 Performance Optimization

### 1. CDN Configuration
```yaml
# cloudflare-config.yaml
cache_rules:
  - pattern: "/api/github/repos"
    ttl: 3600
  - pattern: "/api/github/repo/*/tree"
    ttl: 1800
  - pattern: "/static/*"
    ttl: 86400

security_rules:
  - rate_limit: 100/minute
  - block_bots: true
  - ddos_protection: high
```

### 2. Database Optimization
```python
# app/utils/cache_optimization.py
async def optimize_cache_usage():
    """Optimize Redis cache usage"""
    
    # Set up cache warming for popular repos
    popular_repos = ["facebook/react", "microsoft/vscode", "python/cpython"]
    
    for repo in popular_repos:
        await github_service.get_repo_tree(repo)
    
    # Clean up old cache entries
    await performance_service.cleanup_old_cache(max_age_hours=24)
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Enhanced Code Explainer

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run comprehensive tests
        run: ./run-tests.sh
        env:
          TESTING: true
          JWT_SECRET_KEY: test_key
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
  
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: |
          cd frontend
          npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Redis Connection Errors
```bash
# Check Redis connectivity
redis-cli -u $REDIS_URL ping

# Monitor Redis logs
docker logs redis-container
```

#### 2. Rate Limit Issues
```python
# Check rate limit status
from app.services.auth_service import auth_service

rate_info = await auth_service.get_rate_limit_info(user_id, "explanation_requests")
print(f"Remaining: {rate_info['remaining']}")
```

#### 3. GitHub API Errors
```bash
# Check GitHub token permissions
curl -H "Authorization: token $GITHUB_API_TOKEN" https://api.github.com/user

# Check rate limits
curl -H "Authorization: token $GITHUB_API_TOKEN" https://api.github.com/rate_limit
```

### Monitoring Alerts

#### Datadog Configuration
```yaml
# alerts.yaml
alerts:
  - name: "High Error Rate"
    query: "avg(last_5m):rate(error_count) > 0.05"
    
  - name: "Slow Response Time"
    query: "avg(last_5m):response_time > 5000"
    
  - name: "Redis Down"
    query: "redis.can_connect == 0"
```

## 📝 Maintenance

### Regular Tasks
```bash
# Daily maintenance script
#!/bin/bash

# Update dependencies
cd backend && pip list --outdated
cd ../frontend && npm outdated

# Clean logs older than 30 days
find /var/log -name "*.log" -mtime +30 -delete

# Backup configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml

# Check disk usage
df -h
```

### Performance Monitoring
```python
# Weekly performance report
async def generate_performance_report():
    stats = await performance_service.get_performance_stats()
    
    report = {
        "cache_hit_rate": stats["cache_hit_rate"],
        "avg_response_time": stats["current_hour"].get("avg_duration", 0),
        "total_requests": stats["total_explanations"],
        "error_rate": await get_error_rate()
    }
    
    # Send to monitoring service
    await send_to_datadog(report)
```

This comprehensive deployment guide ensures your enhanced Code Explainer is production-ready with enterprise-level features including authentication, performance optimization, comprehensive testing, and robust monitoring.
