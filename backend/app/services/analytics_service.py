"""
Analytics Service for Portfolio Dashboard
Provides visitor analytics, engagement metrics, and insights
"""

import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict, Counter
import hashlib
import re

from app.utils.cache_manager import CacheManager
from app.services.error_handler import error_handler


class AnalyticsService:
    """Service for handling portfolio analytics and insights"""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.cache_prefix = "analytics"
        self.visitor_prefix = "visitor"
        self.session_prefix = "session"
        
        # Cache duration settings
        self.cache_duration = {
            "public_metrics": 300,  # 5 minutes
            "admin_metrics": 60,    # 1 minute  
            "visitor_data": 86400,  # 24 hours
            "session_data": 3600    # 1 hour
        }
    
    async def track_visitor(self, visitor_data: Dict[str, Any]) -> str:
        """Track a new visitor and return visitor ID"""
        try:
            # Create visitor fingerprint (anonymized)
            visitor_ip = visitor_data.get('ip', 'unknown')
            user_agent = visitor_data.get('user_agent', '')
            
            # Create hash for privacy
            visitor_hash = hashlib.sha256(
                f"{visitor_ip}:{user_agent}".encode()
            ).hexdigest()[:16]
            
            visitor_id = f"visitor_{visitor_hash}"
            
            # Store visitor data
            visitor_key = f"{self.visitor_prefix}:{visitor_id}"
            existing_data = await self.cache_manager.get(visitor_key)
            
            if existing_data:
                # Update existing visitor
                data = json.loads(existing_data)
                data['last_visit'] = time.time()
                data['visit_count'] = data.get('visit_count', 1) + 1
            else:
                # New visitor
                data = {
                    'visitor_id': visitor_id,
                    'first_visit': time.time(),
                    'last_visit': time.time(),
                    'visit_count': 1,
                    'referrer': visitor_data.get('referrer', ''),
                    'location': visitor_data.get('location', {}),
                    'device_type': self._detect_device_type(user_agent),
                    'browser': self._detect_browser(user_agent)
                }
            
            await self.cache_manager.set(
                visitor_key, 
                json.dumps(data), 
                expire=self.cache_duration["visitor_data"]
            )
            
            # Update daily visitor count
            today = datetime.now().strftime('%Y-%m-%d')
            daily_key = f"{self.cache_prefix}:daily_visitors:{today}"
            await self._increment_counter(daily_key, expire=86400)
            
            return visitor_id
            
        except Exception as e:
            error_handler.log_error(e, {"function": "track_visitor"})
            return f"visitor_anonymous_{int(time.time())}"
    
    async def track_page_view(self, visitor_id: str, page_data: Dict[str, Any]) -> None:
        """Track page view analytics"""
        try:
            page_key = f"{self.cache_prefix}:page_views"
            page = page_data.get('page', 'unknown')
            tab = page_data.get('tab', 'about')
            
            # Track page views
            await self._increment_counter(f"{page_key}:{page}", expire=86400)
            await self._increment_counter(f"{page_key}:tabs:{tab}", expire=86400)
            
            # Track visitor journey
            journey_key = f"{self.visitor_prefix}:{visitor_id}:journey"
            journey_data = {
                'page': page,
                'tab': tab,
                'timestamp': time.time(),
                'duration': page_data.get('duration', 0)
            }
            
            # Append to journey (keep last 20 pages)
            existing_journey = await self.cache_manager.get(journey_key)
            if existing_journey:
                journey = json.loads(existing_journey)
            else:
                journey = []
            
            journey.append(journey_data)
            journey = journey[-20:]  # Keep last 20 entries
            
            await self.cache_manager.set(
                journey_key,
                json.dumps(journey),
                expire=self.cache_duration["visitor_data"]
            )
            
        except Exception as e:
            error_handler.log_error(e, {"function": "track_page_view"})
    
    async def track_ai_interaction(self, visitor_id: str, interaction_data: Dict[str, Any]) -> None:
        """Track AI chat interactions"""
        try:
            # Track AI usage stats
            ai_key = f"{self.cache_prefix}:ai_interactions"
            await self._increment_counter(ai_key, expire=86400)
            
            # Track interaction type
            interaction_type = interaction_data.get('type', 'chat')
            await self._increment_counter(f"{ai_key}:{interaction_type}", expire=86400)
            
            # Track popular questions (anonymized)
            question = interaction_data.get('question', '')
            if question:
                # Extract key topics from question
                topics = self._extract_topics(question)
                for topic in topics:
                    await self._increment_counter(f"{ai_key}:topics:{topic}", expire=86400)
            
            # Track session length
            session_length = interaction_data.get('session_length', 0)
            if session_length > 0:
                await self._update_average(f"{ai_key}:avg_session_length", session_length)
                
        except Exception as e:
            error_handler.log_error(e, {"function": "track_ai_interaction"})
    
    async def track_project_interest(self, visitor_id: str, project_data: Dict[str, Any]) -> None:
        """Track project engagement"""
        try:
            project_name = project_data.get('project', 'unknown')
            action = project_data.get('action', 'view')  # view, github_click, demo_click
            
            # Track project popularity
            project_key = f"{self.cache_prefix}:projects:{project_name}"
            await self._increment_counter(f"{project_key}:{action}", expire=86400)
            
            # Track technology interest
            technologies = project_data.get('technologies', [])
            for tech in technologies:
                tech_key = f"{self.cache_prefix}:technologies:{tech.lower()}"
                await self._increment_counter(tech_key, expire=86400)
                
        except Exception as e:
            error_handler.log_error(e, {"function": "track_project_interest"})
    
    async def track_contact_interaction(self, visitor_id: str, contact_data: Dict[str, Any]) -> None:
        """Track contact form interactions"""
        try:
            contact_key = f"{self.cache_prefix}:contact"
            action = contact_data.get('action', 'form_view')  # form_view, form_submit, email_click
            
            await self._increment_counter(f"{contact_key}:{action}", expire=86400)
            
            # Track interest categories
            interest = contact_data.get('interest', '')
            if interest:
                await self._increment_counter(f"{contact_key}:interests:{interest}", expire=86400)
                
        except Exception as e:
            error_handler.log_error(e, {"function": "track_contact_interaction"})
    
    async def get_public_metrics(self) -> Dict[str, Any]:
        """Get sanitized metrics safe for public display"""
        try:
            cache_key = f"{self.cache_prefix}:public_metrics"
            cached = await self.cache_manager.get(cache_key)
            
            if cached:
                return json.loads(cached)
            
            # Calculate public metrics
            metrics = {
                'total_visitors': await self._get_total_visitors(),
                'popular_projects': await self._get_popular_projects(limit=3),
                'top_technologies': await self._get_top_technologies(limit=5),
                'ai_interactions': await self._get_ai_interaction_count(),
                'engagement_rate': await self._calculate_engagement_rate(),
                'last_updated': int(time.time())
            }
            
            # Cache the results
            await self.cache_manager.set(
                cache_key,
                json.dumps(metrics),
                expire=self.cache_duration["public_metrics"]
            )
            
            return metrics
            
        except Exception as e:
            error_handler.log_error(e, {"function": "get_public_metrics"})
            return self._get_fallback_public_metrics()
    
    async def get_admin_analytics(self, admin_user_id: str) -> Dict[str, Any]:
        """Get detailed analytics for admin users only"""
        try:
            # Verify admin access (you can extend this with proper auth)
            if not await self._verify_admin_access(admin_user_id):
                raise PermissionError("Unauthorized access to admin analytics")
            
            cache_key = f"{self.cache_prefix}:admin_analytics"
            cached = await self.cache_manager.get(cache_key)
            
            if cached:
                return json.loads(cached)
            
            # Calculate detailed analytics
            analytics = {
                'traffic_analytics': await self._get_traffic_analytics(),
                'visitor_behavior': await self._get_visitor_behavior(),
                'ai_chat_insights': await self._get_ai_chat_insights(),
                'project_performance': await self._get_project_performance(),
                'contact_analytics': await self._get_contact_analytics(),
                'technical_metrics': await self._get_technical_metrics(),
                'time_analytics': await self._get_time_analytics(),
                'last_updated': int(time.time())
            }
            
            # Cache the results
            await self.cache_manager.set(
                cache_key,
                json.dumps(analytics),
                expire=self.cache_duration["admin_metrics"]
            )
            
            return analytics
            
        except Exception as e:
            error_handler.log_error(e, {"function": "get_admin_analytics"})
            return {"error": "Failed to load admin analytics"}
    
    # Helper methods
    
    async def _increment_counter(self, key: str, expire: int = 3600) -> None:
        """Increment a counter in cache"""
        try:
            current = await self.cache_manager.get(key)
            count = int(current) if current else 0
            await self.cache_manager.set(key, str(count + 1), expire=expire)
        except Exception:
            await self.cache_manager.set(key, "1", expire=expire)
    
    async def _update_average(self, key: str, value: float) -> None:
        """Update running average"""
        try:
            data_key = f"{key}:data"
            existing = await self.cache_manager.get(data_key)
            
            if existing:
                data = json.loads(existing)
                data['total'] += value
                data['count'] += 1
                data['average'] = data['total'] / data['count']
            else:
                data = {'total': value, 'count': 1, 'average': value}
            
            await self.cache_manager.set(data_key, json.dumps(data), expire=86400)
        except Exception as e:
            error_handler.log_error(e, {"function": "_update_average"})
    
    def _detect_device_type(self, user_agent: str) -> str:
        """Detect device type from user agent"""
        user_agent = user_agent.lower()
        if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
            return 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            return 'tablet'
        else:
            return 'desktop'
    
    def _detect_browser(self, user_agent: str) -> str:
        """Detect browser from user agent"""
        user_agent = user_agent.lower()
        if 'chrome' in user_agent:
            return 'chrome'
        elif 'firefox' in user_agent:
            return 'firefox'
        elif 'safari' in user_agent:
            return 'safari'
        elif 'edge' in user_agent:
            return 'edge'
        else:
            return 'other'
    
    def _extract_topics(self, question: str) -> List[str]:
        """Extract key topics from AI chat questions"""
        # Simple topic extraction based on keywords
        topics = []
        question_lower = question.lower()
        
        topic_keywords = {
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'claude'],
            'projects': ['project', 'nutrivize', 'quizium', 'signalflow', 'portfolio'],
            'skills': ['skill', 'technology', 'programming', 'development'],
            'experience': ['experience', 'work', 'job', 'career', 'background'],
            'education': ['education', 'college', 'university', 'degree', 'study'],
            'contact': ['contact', 'hire', 'email', 'reach', 'collaborate']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in question_lower for keyword in keywords):
                topics.append(topic)
        
        return topics if topics else ['general']
    
    async def _verify_admin_access(self, user_id: str) -> bool:
        """Verify if user has admin access"""
        # Simple check - in production, this would check against your auth system
        admin_users = ['isaac@isaacmineo.com', 'admin']
        return user_id in admin_users
    
    async def _get_total_visitors(self) -> int:
        """Get total visitor count"""
        try:
            # Sum up daily visitors for the last 30 days
            total = 0
            for i in range(30):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                daily_key = f"{self.cache_prefix}:daily_visitors:{date}"
                count = await self.cache_manager.get(daily_key)
                if count:
                    total += int(count)
            return total
        except Exception:
            return 0
    
    async def _get_popular_projects(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get most popular projects"""
        try:
            projects = ['nutrivize', 'quizium', 'signalflow', 'echopodcast', 'portfolio']
            project_stats = []
            
            for project in projects:
                view_key = f"{self.cache_prefix}:projects:{project}:view"
                views = await self.cache_manager.get(view_key)
                if views:
                    project_stats.append({
                        'name': project.title(),
                        'views': int(views)
                    })
            
            # Sort by views and return top projects
            project_stats.sort(key=lambda x: x['views'], reverse=True)
            return project_stats[:limit]
        except Exception:
            return []
    
    async def _get_top_technologies(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get most popular technologies"""
        try:
            # This would be populated by track_project_interest
            tech_pattern = f"{self.cache_prefix}:technologies:*"
            # For now, return mock data - in production, scan cache keys
            return [
                {'name': 'React', 'interest': 85},
                {'name': 'Python', 'interest': 78},
                {'name': 'FastAPI', 'interest': 65},
                {'name': 'AI/ML', 'interest': 92},
                {'name': 'JavaScript', 'interest': 70}
            ][:limit]
        except Exception:
            return []
    
    async def _get_ai_interaction_count(self) -> int:
        """Get total AI interactions"""
        try:
            ai_key = f"{self.cache_prefix}:ai_interactions"
            count = await self.cache_manager.get(ai_key)
            return int(count) if count else 0
        except Exception:
            return 0
    
    async def _calculate_engagement_rate(self) -> float:
        """Calculate visitor engagement rate"""
        try:
            # Simple engagement calculation
            total_visitors = await self._get_total_visitors()
            ai_interactions = await self._get_ai_interaction_count()
            
            if total_visitors > 0:
                return min(100, (ai_interactions / total_visitors) * 100)
            return 0.0
        except Exception:
            return 0.0
    
    def _get_fallback_public_metrics(self) -> Dict[str, Any]:
        """Fallback metrics when cache fails"""
        return {
            'total_visitors': 0,
            'popular_projects': [],
            'top_technologies': [],
            'ai_interactions': 0,
            'engagement_rate': 0.0,
            'last_updated': int(time.time())
        }
    
    # Admin-only detailed analytics methods
    
    async def _get_traffic_analytics(self) -> Dict[str, Any]:
        """Get detailed traffic analytics"""
        return {
            'daily_visitors': await self._get_daily_visitor_trend(),
            'referrer_sources': await self._get_referrer_breakdown(),
            'device_breakdown': await self._get_device_breakdown(),
            'browser_stats': await self._get_browser_stats()
        }
    
    async def _get_visitor_behavior(self) -> Dict[str, Any]:
        """Get visitor behavior patterns"""
        return {
            'average_session_duration': await self._get_avg_session_duration(),
            'pages_per_session': await self._get_pages_per_session(),
            'popular_user_journeys': await self._get_popular_journeys(),
            'bounce_rate': await self._get_bounce_rate()
        }
    
    async def _get_ai_chat_insights(self) -> Dict[str, Any]:
        """Get AI chat analytics"""
        return {
            'total_conversations': await self._get_ai_interaction_count(),
            'popular_topics': await self._get_popular_ai_topics(),
            'avg_conversation_length': await self._get_avg_conversation_length(),
            'user_satisfaction': await self._get_ai_satisfaction_score()
        }
    
    async def _get_project_performance(self) -> Dict[str, Any]:
        """Get project engagement analytics"""
        return {
            'project_views': await self._get_popular_projects(limit=10),
            'github_clicks': await self._get_github_clicks(),
            'demo_interactions': await self._get_demo_clicks(),
            'technology_interest': await self._get_top_technologies(limit=10)
        }
    
    async def _get_contact_analytics(self) -> Dict[str, Any]:
        """Get contact form analytics"""
        return {
            'form_views': await self._get_contact_metric('form_view'),
            'form_submissions': await self._get_contact_metric('form_submit'),
            'interest_breakdown': await self._get_interest_breakdown(),
            'conversion_rate': await self._get_contact_conversion_rate()
        }
    
    async def _get_technical_metrics(self) -> Dict[str, Any]:
        """Get technical performance metrics"""
        return {
            'page_load_times': await self._get_page_performance(),
            'error_rates': await self._get_error_rates(),
            'api_response_times': await self._get_api_performance(),
            'cache_hit_rates': await self._get_cache_performance()
        }
    
    async def _get_time_analytics(self) -> Dict[str, Any]:
        """Get time-based analytics"""
        return {
            'hourly_traffic': await self._get_hourly_traffic(),
            'weekly_patterns': await self._get_weekly_patterns(),
            'peak_usage_times': await self._get_peak_times(),
            'seasonal_trends': await self._get_seasonal_trends()
        }
    
    # Placeholder implementations for admin analytics
    # These would be fully implemented based on your specific tracking needs
    
    async def _get_daily_visitor_trend(self) -> List[Dict[str, Any]]:
        """Get daily visitor trend for last 30 days"""
        return []  # Implementation placeholder
    
    async def _get_referrer_breakdown(self) -> Dict[str, int]:
        """Get traffic sources breakdown"""
        return {}  # Implementation placeholder
    
    async def _get_device_breakdown(self) -> Dict[str, int]:
        """Get device type breakdown"""
        return {}  # Implementation placeholder
    
    async def _get_browser_stats(self) -> Dict[str, int]:
        """Get browser usage stats"""
        return {}  # Implementation placeholder
    
    async def _get_avg_session_duration(self) -> float:
        """Get average session duration"""
        return 0.0  # Implementation placeholder
    
    async def _get_pages_per_session(self) -> float:
        """Get average pages per session"""
        return 0.0  # Implementation placeholder
    
    async def _get_popular_journeys(self) -> List[List[str]]:
        """Get most common user journeys"""
        return []  # Implementation placeholder
    
    async def _get_bounce_rate(self) -> float:
        """Get bounce rate percentage"""
        return 0.0  # Implementation placeholder
    
    async def _get_popular_ai_topics(self) -> List[Dict[str, Any]]:
        """Get most popular AI chat topics"""
        return []  # Implementation placeholder
    
    async def _get_avg_conversation_length(self) -> float:
        """Get average AI conversation length"""
        return 0.0  # Implementation placeholder
    
    async def _get_ai_satisfaction_score(self) -> float:
        """Get AI satisfaction score"""
        return 0.0  # Implementation placeholder
    
    async def _get_github_clicks(self) -> Dict[str, int]:
        """Get GitHub link clicks by project"""
        return {}  # Implementation placeholder
    
    async def _get_demo_clicks(self) -> Dict[str, int]:
        """Get demo clicks by project"""
        return {}  # Implementation placeholder
    
    async def _get_contact_metric(self, metric: str) -> int:
        """Get contact form metric"""
        return 0  # Implementation placeholder
    
    async def _get_interest_breakdown(self) -> Dict[str, int]:
        """Get contact interest breakdown"""
        return {}  # Implementation placeholder
    
    async def _get_contact_conversion_rate(self) -> float:
        """Get contact form conversion rate"""
        return 0.0  # Implementation placeholder
    
    async def _get_page_performance(self) -> Dict[str, float]:
        """Get page performance metrics"""
        return {}  # Implementation placeholder
    
    async def _get_error_rates(self) -> Dict[str, float]:
        """Get error rates"""
        return {}  # Implementation placeholder
    
    async def _get_api_performance(self) -> Dict[str, float]:
        """Get API performance metrics"""
        return {}  # Implementation placeholder
    
    async def _get_cache_performance(self) -> Dict[str, float]:
        """Get cache performance metrics"""
        return {}  # Implementation placeholder
    
    async def _get_hourly_traffic(self) -> List[Dict[str, Any]]:
        """Get hourly traffic patterns"""
        return []  # Implementation placeholder
    
    async def _get_weekly_patterns(self) -> List[Dict[str, Any]]:
        """Get weekly traffic patterns"""
        return []  # Implementation placeholder
    
    async def _get_peak_times(self) -> Dict[str, Any]:
        """Get peak usage times"""
        return {}  # Implementation placeholder
    
    async def _get_seasonal_trends(self) -> List[Dict[str, Any]]:
        """Get seasonal traffic trends"""
        return []  # Implementation placeholder


# Global analytics service instance
analytics_service = AnalyticsService()
