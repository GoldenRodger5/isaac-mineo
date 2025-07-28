"""
GitHub API Router for Code Explainer Feature
Provides REST endpoints for GitHub repository interaction
"""

from fastapi import APIRouter, HTTPException, Query, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os

from app.services.github_service import github_service
from app.services.error_handler import error_handler
from app.services.auth_service import auth_service
from app.services.performance_service import performance_service


router = APIRouter()


class RepoRequest(BaseModel):
    repo_full_name: str
    branch: Optional[str] = None


class FileRequest(BaseModel):
    repo_full_name: str
    file_path: str
    branch: Optional[str] = None


class SearchRequest(BaseModel):
    repo_full_name: str
    query: str
    branch: Optional[str] = None


class CodeExplanationRequest(BaseModel):
    code: str
    mode: str = "explain"  # explain, summarize, teach
    file_context: Optional[Dict[str, Any]] = None
    selected_code: Optional[str] = None


@router.get("/github/repos")
async def get_user_repos(username: str = Query("GoldenRodger5", description="GitHub username")):
    """Get all repositories for a user"""
    try:
        repos = await github_service.get_user_repos(username)
        return {
            "success": True,
            "data": repos,
            "count": len(repos),
            "username": username
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/repos", "username": username})
        raise HTTPException(status_code=500, detail=f"Failed to fetch repositories: {str(e)}")


@router.get("/github/repo/{owner}/{repo}/tree")
async def get_repository_tree(
    owner: str = Path(..., description="Repository owner"),
    repo: str = Path(..., description="Repository name"),
    branch: Optional[str] = Query(None, description="Branch name (defaults to default branch)")
):
    """Get repository file tree"""
    try:
        repo_full_name = f"{owner}/{repo}"
        tree_data = await github_service.get_repo_tree(repo_full_name, branch)
        
        if not tree_data:
            raise HTTPException(status_code=404, detail="Repository not found or access denied")
        
        return {
            "success": True,
            "data": tree_data
        }
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/repo/tree", "repo": f"{owner}/{repo}"})
        raise HTTPException(status_code=500, detail=f"Failed to fetch repository tree: {str(e)}")


@router.get("/github/repo/{owner}/{repo}/file")
async def get_file_content(
    owner: str = Path(..., description="Repository owner"),
    repo: str = Path(..., description="Repository name"),
    file_path: str = Query(..., description="File path in repository"),
    branch: Optional[str] = Query(None, description="Branch name (defaults to default branch)")
):
    """Get file content from repository"""
    try:
        repo_full_name = f"{owner}/{repo}"
        file_data = await github_service.get_file_content(repo_full_name, file_path, branch)
        
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found or access denied")
        
        return {
            "success": True,
            "data": file_data
        }
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/file", "repo": f"{owner}/{repo}", "file": file_path})
        raise HTTPException(status_code=500, detail=f"Failed to fetch file content: {str(e)}")


@router.get("/github/repo/{owner}/{repo}/stats")
async def get_repository_stats(
    owner: str = Path(..., description="Repository owner"),
    repo: str = Path(..., description="Repository name")
):
    """Get repository statistics and metadata"""
    try:
        repo_full_name = f"{owner}/{repo}"
        stats = await github_service.get_repo_stats(repo_full_name)
        
        if not stats:
            raise HTTPException(status_code=404, detail="Repository not found or access denied")
        
        return {
            "success": True,
            "data": stats
        }
    except HTTPException:
        raise
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/stats", "repo": f"{owner}/{repo}"})
        raise HTTPException(status_code=500, detail=f"Failed to fetch repository stats: {str(e)}")


@router.post("/github/search")
async def search_repository_files(search_request: SearchRequest):
    """Search for files in a repository"""
    try:
        results = await github_service.search_files_in_repo(
            search_request.repo_full_name,
            search_request.query,
            search_request.branch
        )
        
        return {
            "success": True,
            "data": results,
            "count": len(results),
            "query": search_request.query
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/search", "repo": search_request.repo_full_name})
        raise HTTPException(status_code=500, detail=f"Failed to search repository: {str(e)}")


@router.get("/github/rate-limit")
async def get_rate_limit_status():
    """Get GitHub API rate limit status"""
    try:
        rate_limit = await github_service.get_rate_limit_status()
        return {
            "success": True,
            "data": rate_limit
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/rate-limit"})
        raise HTTPException(status_code=500, detail=f"Failed to get rate limit status: {str(e)}")


@router.get("/github/supported-extensions")
async def get_supported_file_extensions():
    """Get list of supported file extensions"""
    return {
        "success": True,
        "data": {
            "extensions": list(github_service.supported_extensions),
            "count": len(github_service.supported_extensions),
            "categories": {
                "programming": ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.kt', '.swift', '.dart'],
                "web": ['.html', '.css', '.scss', '.sass', '.less', '.vue', '.svelte'],
                "config": ['.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf'],
                "documentation": ['.md', '.rst', '.txt', '.adoc'],
                "scripts": ['.sh', '.bash', '.ps1', '.dockerfile']
            }
        }
    }


@router.get("/github/health")
async def github_service_health():
    """Health check for GitHub service"""
    try:
        # Check if GitHub token is configured
        github_token = os.getenv("GITHUB_API_TOKEN")
        if not github_token:
            return {
                "success": False,
                "status": "unhealthy",
                "message": "GitHub API token not configured"
            }
        
        # Check rate limit to verify token works
        rate_limit = await github_service.get_rate_limit_status()
        
        return {
            "success": True,
            "status": "healthy",
            "data": {
                "token_configured": True,
                "rate_limit": rate_limit,
                "supported_extensions": len(github_service.supported_extensions)
            }
        }
    except Exception as e:
        error_handler.log_error(e, {"endpoint": "/github/health"})
        return {
            "success": False,
            "status": "unhealthy",
            "message": str(e)
        }


@router.post("/github/explain-code")
async def explain_code(request: CodeExplanationRequest):
    """
    Generate AI explanation for code using Claude Sonnet 4 with caching and performance optimization
    """
    import time
    start_time = time.time()
    
    try:
        # Sanitize input
        sanitized_code = auth_service.sanitize_code_input(request.code)
        
        # Check for cached explanation first
        cached_explanation = await performance_service.get_cached_explanation(
            sanitized_code, 
            request.mode, 
            request.file_context
        )
        
        if cached_explanation:
            # Generate follow-up questions even for cached responses
            follow_up_questions = generate_follow_up_questions(
                sanitized_code, 
                request.mode, 
                request.file_context
            )
            
            return {
                "success": True,
                "data": {
                    "explanation": cached_explanation.get("explanation", ""),
                    "mode": request.mode,
                    "model": "claude-sonnet-4-20250514",
                    "cached": True,
                    "follow_up_questions": follow_up_questions,
                    "context": {
                        "file_path": request.file_context.get("path") if request.file_context else None,
                        "language": request.file_context.get("language") if request.file_context else None,
                        "has_selection": bool(request.selected_code)
                    }
                }
            }
        
        # Optimize code for analysis
        optimized_code = await performance_service.optimize_code_analysis(sanitized_code)
        
        # Import Anthropic client
        import anthropic
        import os
        
        anthropic_client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        
        # Generate contextual prompt based on mode and file context
        prompt = generate_explanation_prompt(
            optimized_code, 
            request.mode, 
            request.file_context, 
            request.selected_code
        )
        
        # Use Claude Sonnet 4 for code explanation with large token capacity for entire files
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",  # Latest Claude Sonnet model available
            max_tokens=16000,  # Increased to handle large files (400+ lines of code)
            temperature=0.3,  # Lower temperature for more focused code explanations
            system="""You are an expert code reviewer and software engineer with deep knowledge across multiple programming languages and frameworks. 

FORMATTING REQUIREMENTS:
- NO markdown headers (#) - use **bold text** for titles instead
- Use compact bullet points with minimal spacing: • Item (no extra lines)
- ALWAYS reference specific line numbers when discussing code: "The FastAPI initialization (lines 18-22) shows..."
- Use inline code formatting for short snippets: `app.add_middleware()`
- Include file paths when relevant: "In backend/app/main.py at line 15..."
- Structure sections clearly with **bold section titles**
- Keep explanations concise but technically precise

CONTENT REQUIREMENTS:
- Provide clear, detailed, and helpful code explanations
- Demonstrate both technical depth and practical insights
- Reference exact code locations and line numbers
- Explain the purpose and context of each code section""",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        response_text = response.content[0].text if response.content else "I'm having trouble analyzing this code right now."
        
        # Cache the explanation
        await performance_service.cache_explanation(
            sanitized_code,
            request.mode,
            response_text,
            request.file_context
        )
        
        # Record performance metrics
        duration = time.time() - start_time
        await performance_service.record_performance_metric(
            "explanation",
            duration,
            {
                "mode": request.mode,
                "code_length": len(request.code),
                "language": request.file_context.get("language") if request.file_context else None
            }
        )
        
        # Generate follow-up questions
        follow_up_questions = generate_follow_up_questions(
            optimized_code, 
            request.mode, 
            request.file_context
        )
        
        return {
            "success": True,
            "data": {
                "explanation": response_text,
                "mode": request.mode,
                "model": "claude-sonnet-4-20250514",
                "cached": False,
                "follow_up_questions": follow_up_questions,
                "context": {
                    "file_path": request.file_context.get("path") if request.file_context else None,
                    "language": request.file_context.get("language") if request.file_context else None,
                    "has_selection": bool(request.selected_code)
                }
            }
        }
        
    except Exception as e:
        error_handler.log_error(e, {
            "endpoint": "/github/explain-code",
            "mode": request.mode,
            "code_length": len(request.code),
            "model": "claude-sonnet-4-20250514"
        })
        raise HTTPException(status_code=500, detail=f"Failed to generate explanation: {str(e)}")


def generate_explanation_prompt(code: str, mode: str, file_context: Optional[Dict] = None, selected_code: Optional[str] = None) -> str:
    """Generate contextual prompts for different explanation modes with enhanced formatting"""
    
    # Mode-specific instructions with formatting requirements
    mode_instructions = {
        "explain": """Provide a technical code analysis for a mid-level developer reviewing a pull request.

FORMAT REQUIREMENTS:
• Use **bold text** for section titles (NO # headers)
• Reference specific line numbers: "The initialization code (lines 18-22) demonstrates..."
• Use compact bullet points: • Item (no extra spacing)
• Use inline code: `function_name()` for short snippets
• Include file path references: "In backend/app/main.py at line 25..."

CONTENT FOCUS:
• Purpose and functionality with exact line references
• Key logic and algorithms with code line citations
• System interactions and dependencies
• Code quality assessment and potential improvements""",
        
        "summarize": """Provide a concise, executive-level overview of this code.

FORMAT REQUIREMENTS:
• Use **bold text** for section titles (NO # headers)
• Reference key line ranges: "The core setup (lines 1-15) handles..."
• Use compact bullet points: • Item (no extra spacing)
• Use inline code: `class_name` for references
• Mention file context: "This main.py file (115 lines) serves as..."

CONTENT FOCUS:
• Main purpose and high-level functionality
• Key architectural components with line references
• Overall design patterns and structure
• Integration with larger application ecosystem""",
        
        "teach": """Explain this code as if teaching a programming student step-by-step.

FORMAT REQUIREMENTS:
• Use **bold text** for section titles (NO # headers)
• Reference specific lines for learning: "Look at line 38 where we see..."
• Use compact bullet points: • Item (no extra spacing)
• Use inline code: `variable_name` for concepts
• Provide line-by-line guidance: "Lines 25-30 show how to..."

CONTENT FOCUS:
• Basic concepts with exact line examples
• Step-by-step breakdown with line references
• Why each section is necessary (with line numbers)
• Learning opportunities and best practices shown
• Beginner-friendly explanations with code citations"""
    }
    
    # Build context information
    context_info = ""
    if file_context:
        total_lines = len(code.split('\n'))
        context_info = f"""
**File Context:**
• Path: {file_context.get('path', 'Unknown')}
• Language: {file_context.get('language', 'Unknown')}
• Total Lines: {total_lines}
• File Size: {file_context.get('size', 'Unknown')} bytes"""
    
    # Handle code selection vs full file
    code_context = ""
    if selected_code and selected_code != code:
        selected_lines = len(selected_code.split('\n'))
        total_lines = len(code.split('\n'))
        code_context = f"""
**Code Selection Analysis:**
Focus your explanation on the selected portion ({selected_lines} lines) within the context of the full file ({total_lines} lines).

**Selected Code:**
```{file_context.get('language', 'text') if file_context else 'text'}
{selected_code}
```

**Full File Context (for reference):**
```{file_context.get('language', 'text') if file_context else 'text'}
{code[:2000]}{'...' if len(code) > 2000 else ''}
```"""
    else:
        total_lines = len(code.split('\n'))
        code_context = f"""
**Complete File Analysis ({total_lines} lines):**
```{file_context.get('language', 'text') if file_context else 'text'}
{code}
```"""
    
    # Construct final prompt with formatting emphasis
    prompt = f"""{mode_instructions.get(mode, mode_instructions['explain'])}

{context_info}

{code_context}

REMEMBER: Always reference specific line numbers when discussing code sections. Use clean, professional formatting without markdown headers."""

    return prompt


def generate_follow_up_questions(code: str, mode: str, file_context: Optional[Dict] = None) -> List[str]:
    """Generate contextual follow-up questions based on code analysis"""
    
    # Base questions for all modes
    base_questions = []
    
    # Language-specific questions
    language = file_context.get("language", "").lower() if file_context else ""
    
    if "python" in language:
        base_questions.extend([
            "How could this code be optimized for better performance?",
            "What Python best practices are demonstrated here?",
            "Are there any potential security considerations?"
        ])
    elif "javascript" in language or "typescript" in language:
        base_questions.extend([
            "How would this work with different browser environments?",
            "What modern ES6+ features could improve this code?",
            "How does this handle asynchronous operations?"
        ])
    elif "java" in language:
        base_questions.extend([
            "What design patterns are being used here?",
            "How does this handle memory management?",
            "Are there any thread-safety considerations?"
        ])
    else:
        base_questions.extend([
            "What are the key design principles in this code?",
            "How would you test this implementation?",
            "What could be potential edge cases?"
        ])
    
    # Mode-specific questions
    if mode == "explain":
        base_questions.extend([
            "Can you explain any complex algorithms used here?",
            "How does this integrate with the rest of the application?",
            "What are the dependencies and external requirements?"
        ])
    elif mode == "summarize":
        base_questions.extend([
            "What are the main components we haven't discussed?",
            "How does this fit into the overall system architecture?",
            "What would be the impact of modifying this code?"
        ])
    elif mode == "teach":
        base_questions.extend([
            "What fundamental concepts should I understand first?",
            "Can you explain this step-by-step with examples?",
            "What are common mistakes beginners make with this pattern?"
        ])
    
    # File-specific questions
    if file_context and file_context.get("path"):
        file_path = file_context["path"]
        if "test" in file_path.lower():
            base_questions.append("What testing strategies are being used here?")
        elif "config" in file_path.lower():
            base_questions.append("How do these configuration settings affect the application?")
        elif "model" in file_path.lower() or "schema" in file_path.lower():
            base_questions.append("How does this data model relate to the business logic?")
    
    # Return a selection of the most relevant questions
    return base_questions[:4]  # Limit to 4 questions for better UX
