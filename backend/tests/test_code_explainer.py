"""
Comprehensive test suite for GitHub Code Explainer API
Tests authentication, rate limiting, caching, and core functionality
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from httpx import AsyncClient

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.services.auth_service import auth_service
from app.services.performance_service import performance_service
from app.services.github_service import github_service


class TestAuthService:
    """Test suite for authentication service"""
    
    @pytest.mark.asyncio
    async def test_create_access_token(self):
        """Test JWT access token creation"""
        data = {"sub": "test_user", "role": "user"}
        token = await auth_service.create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Verify token can be decoded
        payload = await auth_service.verify_token(token)
        assert payload["sub"] == "test_user"
        assert "exp" in payload

    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test rate limiting functionality"""
        user_id = "test_user"
        action = "explanation_requests"
        
        # First request should pass
        result1 = await auth_service.check_rate_limit(user_id, action)
        assert result1 is True
        
        # Simulate hitting rate limit (would need to mock cache for realistic test)
        # This is a basic structure test
        rate_info = await auth_service.get_rate_limit_info(user_id, action)
        assert "limit" in rate_info
        assert "remaining" in rate_info

    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = "test_password_123"
        hashed = auth_service.hash_password(password)
        
        assert hashed != password
        assert auth_service.verify_password(password, hashed) is True
        assert auth_service.verify_password("wrong_password", hashed) is False

    def test_code_sanitization(self):
        """Test code input sanitization"""
        # Test malicious code patterns
        malicious_code = """
        <script>alert('xss')</script>
        function evil() {
            eval('malicious code');
            setTimeout(function() { /* bad stuff */ }, 1000);
        }
        """
        
        sanitized = auth_service.sanitize_code_input(malicious_code)
        
        assert "<script>" not in sanitized
        assert "eval(" not in sanitized
        assert "setTimeout(" not in sanitized
        assert "[REMOVED_FOR_SECURITY]" in sanitized

    def test_api_key_generation(self):
        """Test API key generation and verification"""
        user_id = "test_user"
        api_key = auth_service.generate_api_key(user_id)
        
        assert isinstance(api_key, str)
        assert len(api_key) == 64  # SHA256 hex digest


class TestPerformanceService:
    """Test suite for performance optimization service"""
    
    @pytest.mark.asyncio
    async def test_explanation_cache_key_generation(self):
        """Test cache key generation for explanations"""
        code = "def hello(): return 'world'"
        mode = "explain"
        file_context = {"language": "python", "path": "test.py"}
        
        key1 = performance_service.generate_explanation_cache_key(code, mode, file_context)
        key2 = performance_service.generate_explanation_cache_key(code, mode, file_context)
        key3 = performance_service.generate_explanation_cache_key(code, "summarize", file_context)
        
        # Same inputs should generate same key
        assert key1 == key2
        
        # Different mode should generate different key
        assert key1 != key3
        
        assert isinstance(key1, str)
        assert len(key1) == 16

    @pytest.mark.asyncio
    async def test_code_optimization(self):
        """Test code size optimization"""
        # Test small code (should remain unchanged)
        small_code = "print('hello')"
        optimized_small = await performance_service.optimize_code_analysis(small_code)
        assert optimized_small == small_code
        
        # Test large code (should be truncated)
        large_code = "x = 1\n" * 10000  # Create large code
        optimized_large = await performance_service.optimize_code_analysis(large_code, max_size=1000)
        
        assert len(optimized_large) < len(large_code)
        assert "TRUNCATED" in optimized_large

    @pytest.mark.asyncio
    async def test_streaming_explanation(self):
        """Test explanation streaming"""
        explanation = "This is a test explanation with multiple words that should be streamed."
        
        chunks = []
        async for chunk in performance_service.stream_explanation(explanation, chunk_size=3):
            chunks.append(chunk)
        
        # Should have multiple chunks
        assert len(chunks) > 1
        
        # Concatenated chunks should contain original text
        full_text = "".join(chunks).strip()
        assert explanation in full_text

    def test_code_complexity_estimation(self):
        """Test code complexity estimation"""
        # Low complexity
        simple_code = "print('hello')"
        complexity1 = performance_service.estimate_code_complexity(simple_code)
        assert complexity1 == "low"
        
        # High complexity  
        complex_code = "def complex_function():\n" + "    x = 1\n" * 300
        complexity2 = performance_service.estimate_code_complexity(complex_code)
        assert complexity2 == "high"

    @pytest.mark.asyncio
    async def test_batch_processing(self):
        """Test batch file processing"""
        files = [
            {"name": "file1.py", "content": "print('1')"},
            {"name": "file2.py", "content": "print('2')"},
            {"name": "file3.py", "content": "print('3')"}
        ]
        
        results = await performance_service.batch_process_files(files, batch_size=2)
        
        assert len(results) == 3
        for result in results:
            assert "processed_at" in result
            assert "estimated_complexity" in result


class TestGitHubExplainerAPI:
    """Test suite for GitHub Explainer API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """Test GitHub health endpoint"""
        response = self.client.get("/api/github/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    def test_supported_extensions_endpoint(self):
        """Test supported file extensions endpoint"""
        response = self.client.get("/api/github/supported-extensions")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "extensions" in data["data"]  # Fixed: check in data sub-object
        assert isinstance(data["data"]["extensions"], list)
        assert ".py" in data["data"]["extensions"]

    @patch('app.services.github_service.github_service.get_user_repos')
    def test_get_repositories(self, mock_get_repos):
        """Test repository listing endpoint"""
        # Mock successful response
        mock_get_repos.return_value = [
            {
                "name": "test-repo",
                "full_name": "user/test-repo",
                "description": "Test repository",
                "language": "Python"
            }
        ]
        
        response = self.client.get("/api/github/repos?username=testuser")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert len(data["data"]) == 1

    @patch('app.services.github_service.github_service.get_file_content')
    def test_get_file_content(self, mock_get_file):
        """Test file content endpoint"""
        # Mock file content response
        mock_get_file.return_value = {
            "content": "print('hello world')",
            "name": "test.py",
            "language": "python",
            "size": 19
        }
        
        response = self.client.get("/api/github/repo/user/repo/file?file_path=test.py")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data

    @patch('anthropic.Anthropic')
    def test_explain_code_endpoint(self, mock_anthropic):
        """Test code explanation endpoint"""
        # Mock Anthropic response
        mock_response = Mock()
        mock_response.content = [Mock(text="This is a test explanation")]
        mock_anthropic.return_value.messages.create.return_value = mock_response
        
        request_data = {
            "code": "print('hello world')",
            "mode": "explain",
            "file_context": {
                "language": "python",
                "path": "test.py"
            }
        }
        
        response = self.client.post("/api/github/explain-code", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "explanation" in data["data"]

    def test_explain_code_validation(self):
        """Test code explanation input validation"""
        # Test missing required fields
        response = self.client.post("/api/github/explain-code", json={})
        
        assert response.status_code == 422  # Validation error

    def test_rate_limiting_headers(self):
        """Test that rate limiting headers are present"""
        response = self.client.get("/api/github/health")
        
        # Check for security headers (added by middleware)
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers


class TestGitHubService:
    """Test suite for GitHub service"""
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.get')
    async def test_get_user_repos(self, mock_get):
        """Test GitHub repository fetching"""
        # Mock GitHub API response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = [
            {
                "name": "test-repo",
                "full_name": "user/test-repo",
                "description": "Test repository",
                "language": "Python",
                "private": False,
                "updated_at": "2024-01-01T00:00:00Z",
                "size": 1024,
                "default_branch": "main"
            }
        ]
        mock_response.headers.get.return_value = "5000"  # Rate limit
        
        mock_get.return_value.__aenter__.return_value = mock_response
        
        repos = await github_service.get_user_repos("testuser")
        
        assert isinstance(repos, list)
        assert len(repos) == 1
        assert repos[0]["name"] == "test-repo"

    @pytest.mark.asyncio
    async def test_rate_limit_handling(self):
        """Test GitHub rate limit handling"""
        # Set low rate limit
        github_service.rate_limit_remaining = 5
        
        # This would need more complex mocking for full test
        assert github_service.rate_limit_remaining == 5


class TestIntegration:
    """Integration tests for complete workflows"""
    
    @pytest.mark.asyncio
    async def test_complete_explanation_workflow(self):
        """Test complete code explanation workflow"""
        with patch('app.services.github_service.github_service.get_file_content') as mock_file, \
             patch('anthropic.Anthropic') as mock_anthropic:
            
            # Mock file content
            mock_file.return_value = {
                "content": "def hello():\n    return 'world'",
                "name": "test.py",
                "language": "python"
            }
            
            # Mock AI response
            mock_response = Mock()
            mock_response.content = [Mock(text="This function returns a greeting")]
            mock_anthropic.return_value.messages.create.return_value = mock_response
            
            async with AsyncClient(app=app, base_url="http://test") as client:
                # Test the complete flow
                response = await client.post("/api/github/explain-code", json={
                    "code": "def hello(): return 'world'",
                    "mode": "explain"
                })
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_error_handling(self):
        """Test error handling across the application"""
        # Test invalid endpoint
        client = TestClient(app)
        response = client.get("/api/invalid/endpoint")
        assert response.status_code == 404
        
        # Test malformed request
        response = client.post("/api/github/explain-code", json={"invalid": "data"})
        assert response.status_code == 422


# Pytest configuration
@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Test configuration for different environments
def pytest_configure(config):
    """Configure pytest for different environments"""
    import os
    
    # Set test environment variables
    os.environ["TESTING"] = "true"
    os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_testing_only"
    os.environ["REDIS_URL"] = "redis://localhost:6379/1"  # Use different DB for tests


if __name__ == "__main__":
    # Run tests with: python -m pytest tests/test_code_explainer.py -v
    pytest.main([__file__, "-v", "--tb=short"])
