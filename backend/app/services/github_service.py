"""
GitHub Service for Code Explainer Feature
Handles GitHub API interactions with caching and rate limiting
"""

import asyncio
import aiohttp
import base64
import os
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import json
import re
from urllib.parse import urlparse

from backend.app.utils.cache_manager import CacheManager
from backend.app.services.error_handler import error_handler


class GitHubService:
    """Service for interacting with GitHub API with intelligent caching and rate limiting"""
    
    def __init__(self):
        self.api_token = os.getenv("GITHUB_API_TOKEN")
        self.base_url = "https://api.github.com"
        self.cache_manager = CacheManager()
        self.headers = {
            "Authorization": f"token {self.api_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Isaac-Mineo-Portfolio/1.0"
        }
        
        # File type configuration
        self.supported_extensions = {
            # Programming languages
            '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.cs', '.php',
            '.rb', '.go', '.rs', '.kt', '.swift', '.dart', '.scala', '.clj', '.hs',
            
            # Web technologies
            '.html', '.css', '.scss', '.sass', '.less', '.vue', '.svelte',
            
            # Configuration files
            '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
            
            # Documentation
            '.md', '.rst', '.txt', '.adoc',
            
            # Scripts and configs
            '.sh', '.bash', '.ps1', '.dockerfile', '.docker-compose.yml',
            '.makefile', '.cmake', '.gradle', '.pom.xml'
        }
        
        # Rate limiting
        self.rate_limit_remaining = 5000
        self.rate_limit_reset = None
        self.request_queue = asyncio.Queue(maxsize=100)
        
    async def _make_request(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make authenticated request to GitHub API with rate limiting"""
        try:
            # Check rate limits
            if self.rate_limit_remaining <= 10:
                error_handler.log_error(
                    Exception("GitHub API rate limit low"),
                    {"remaining": self.rate_limit_remaining, "url": url}
                )
                return None
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params) as response:
                    # Update rate limit info
                    self.rate_limit_remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
                    
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 404:
                        return None
                    elif response.status == 403:
                        error_handler.log_error(
                            Exception("GitHub API rate limit exceeded"),
                            {"status": response.status, "url": url}
                        )
                        return None
                    else:
                        response.raise_for_status()
                        
        except Exception as e:
            error_handler.log_error(e, {"github_api_url": url})
            return None

    async def get_user_repos(self, username: str = "GoldenRodger5") -> List[Dict]:
        """Get all repositories for a user (public and private)"""
        cache_key = f"github_repos_{username}"
        
        # Check cache first
        cached_repos = await self.cache_manager.get(cache_key)
        if cached_repos:
            return json.loads(cached_repos)
        
        repos = []
        page = 1
        per_page = 100
        
        while True:
            url = f"{self.base_url}/user/repos"
            params = {
                "affiliation": "owner",
                "sort": "updated",
                "direction": "desc", 
                "per_page": per_page,
                "page": page
            }
            
            response = await self._make_request(url, params)
            if not response:
                break
                
            if not response:  # Empty page
                break
                
            repos.extend(response)
            
            if len(response) < per_page:  # Last page
                break
                
            page += 1
        
        # Filter and format repos
        formatted_repos = []
        for repo in repos:
            formatted_repos.append({
                "name": repo["name"],
                "full_name": repo["full_name"], 
                "description": repo.get("description", ""),
                "language": repo.get("language", ""),
                "private": repo["private"],
                "updated_at": repo["updated_at"],
                "size": repo["size"],
                "default_branch": repo["default_branch"]
            })
        
        # Cache for 1 hour
        await self.cache_manager.set(cache_key, json.dumps(formatted_repos), expire=3600)
        
        return formatted_repos

    async def get_repo_tree(self, repo_full_name: str, branch: Optional[str] = None) -> Optional[Dict]:
        """Get repository file tree with supported files only"""
        if not branch:
            # Get default branch
            repo_info = await self._make_request(f"{self.base_url}/repos/{repo_full_name}")
            if not repo_info:
                return None
            branch = repo_info["default_branch"]
        
        cache_key = f"github_tree_{repo_full_name}_{branch}"
        
        # Check cache first
        cached_tree = await self.cache_manager.get(cache_key)
        if cached_tree:
            return json.loads(cached_tree)
        
        # Get tree recursively
        url = f"{self.base_url}/repos/{repo_full_name}/git/trees/{branch}"
        params = {"recursive": "1"}
        
        response = await self._make_request(url, params)
        if not response:
            return None
        
        # Filter supported files
        supported_files = []
        for item in response.get("tree", []):
            if item["type"] == "blob":  # File, not directory
                file_path = item["path"]
                _, ext = os.path.splitext(file_path.lower())
                
                # Check if supported extension
                if ext in self.supported_extensions or file_path.lower() in [
                    "makefile", "dockerfile", "readme", "license"
                ]:
                    supported_files.append({
                        "path": file_path,
                        "type": "file",
                        "sha": item["sha"],
                        "size": item.get("size", 0),
                        "extension": ext
                    })
        
        tree_data = {
            "repo": repo_full_name,
            "branch": branch,
            "files": supported_files,
            "total_files": len(supported_files)
        }
        
        # Cache for 30 minutes
        await self.cache_manager.set(cache_key, json.dumps(tree_data), expire=1800)
        
        return tree_data

    async def get_file_content(self, repo_full_name: str, file_path: str, branch: Optional[str] = None) -> Optional[Dict]:
        """Get file content with metadata"""
        cache_key = f"github_file_{repo_full_name}_{file_path}_{branch or 'default'}"
        
        # Check cache first
        cached_content = await self.cache_manager.get(cache_key)
        if cached_content:
            return json.loads(cached_content)
        
        if not branch:
            # Get default branch
            repo_info = await self._make_request(f"{self.base_url}/repos/{repo_full_name}")
            if not repo_info:
                return None
            branch = repo_info["default_branch"]
        
        url = f"{self.base_url}/repos/{repo_full_name}/contents/{file_path}"
        params = {"ref": branch}
        
        response = await self._make_request(url, params)
        if not response:
            return None
        
        try:
            # Decode base64 content
            content_base64 = response["content"]
            content_bytes = base64.b64decode(content_base64)
            
            # Try to decode as UTF-8
            try:
                content = content_bytes.decode('utf-8')
            except UnicodeDecodeError:
                # If not UTF-8, it might be binary - skip for now
                return None
            
            file_data = {
                "path": file_path,
                "content": content,
                "size": response["size"],
                "sha": response["sha"],
                "encoding": response["encoding"],
                "language": self._detect_language(file_path),
                "lines": len(content.split('\n')),
                "repo": repo_full_name,
                "branch": branch
            }
            
            # Cache for 15 minutes (files change more frequently)
            await self.cache_manager.set(cache_key, json.dumps(file_data), expire=900)
            
            return file_data
            
        except Exception as e:
            error_handler.log_error(e, {"file_path": file_path, "repo": repo_full_name})
            return None

    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        _, ext = os.path.splitext(file_path.lower())
        
        language_map = {
            '.py': 'python',
            '.js': 'javascript', 
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.php': 'php',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust',
            '.kt': 'kotlin',
            '.swift': 'swift',
            '.dart': 'dart',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.json': 'json',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.md': 'markdown',
            '.sh': 'bash',
            '.dockerfile': 'dockerfile'
        }
        
        return language_map.get(ext, 'text')

    async def search_files_in_repo(self, repo_full_name: str, query: str, branch: Optional[str] = None) -> List[Dict]:
        """Search for files in repository by name or content"""
        # Use GitHub search API
        search_query = f"repo:{repo_full_name} {query}"
        url = f"{self.base_url}/search/code"
        params = {"q": search_query, "per_page": 50}
        
        response = await self._make_request(url, params)
        if not response:
            return []
        
        results = []
        for item in response.get("items", []):
            results.append({
                "path": item["path"],
                "name": item["name"],
                "repository": item["repository"]["full_name"],
                "score": item.get("score", 0)
            })
        
        return results

    async def get_repo_stats(self, repo_full_name: str) -> Optional[Dict]:
        """Get repository statistics and metadata"""
        cache_key = f"github_stats_{repo_full_name}"
        
        # Check cache first
        cached_stats = await self.cache_manager.get(cache_key)
        if cached_stats:
            return json.loads(cached_stats)
        
        url = f"{self.base_url}/repos/{repo_full_name}"
        response = await self._make_request(url)
        
        if not response:
            return None
        
        # Get language breakdown
        languages_url = f"{self.base_url}/repos/{repo_full_name}/languages"
        languages = await self._make_request(languages_url)
        
        stats = {
            "name": response["name"],
            "full_name": response["full_name"],
            "description": response.get("description", ""),
            "language": response.get("language", ""),
            "languages": languages or {},
            "size": response["size"],
            "stars": response["stargazers_count"],
            "forks": response["forks_count"],
            "open_issues": response["open_issues_count"],
            "created_at": response["created_at"],
            "updated_at": response["updated_at"],
            "default_branch": response["default_branch"],
            "private": response["private"]
        }
        
        # Cache for 2 hours
        await self.cache_manager.set(cache_key, json.dumps(stats), expire=7200)
        
        return stats

    async def get_rate_limit_status(self) -> Dict:
        """Get current rate limit status"""
        url = f"{self.base_url}/rate_limit"
        response = await self._make_request(url)
        
        if response:
            return response["rate"]
        
        return {
            "limit": 5000,
            "remaining": self.rate_limit_remaining,
            "reset": self.rate_limit_reset
        }


# Singleton instance
github_service = GitHubService()
