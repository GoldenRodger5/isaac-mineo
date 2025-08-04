/**
 * Analytics Service for Portfolio Frontend
 * Handles visitor tracking, metrics display, and admin analytics
 */

import { apiClient } from './apiClient.js';

class AnalyticsService {
  constructor() {
    this.baseURL = apiClient.getApiBaseUrl();
    this.visitorId = null;
    this.sessionStartTime = Date.now();
    this.currentPage = 'about';
    this.pageStartTime = Date.now();
    
    // Initialize visitor tracking
    this.initializeVisitor();
  }

  /**
   * Initialize visitor tracking
   */
  async initializeVisitor() {
    try {
      // Check if visitor ID is already stored
      this.visitorId = localStorage.getItem('portfolio_visitor_id');
      
      if (!this.visitorId) {
        // Track new visitor
        const response = await fetch(`${this.baseURL}/analytics/track/visitor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            referrer: document.referrer,
            location: {
              href: window.location.href,
              pathname: window.location.pathname,
              search: window.location.search
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          this.visitorId = data.visitor_id;
          localStorage.setItem('portfolio_visitor_id', this.visitorId);
          console.log('📊 Visitor tracking initialized:', this.visitorId);
        }
      } else {
        console.log('📊 Returning visitor:', this.visitorId);
      }
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  /**
   * Track page/tab navigation
   */
  async trackPageView(page, tab = null) {
    if (!this.visitorId) return;

    try {
      // Calculate time spent on previous page
      const timeSpent = Date.now() - this.pageStartTime;
      
      await fetch(`${this.baseURL}/analytics/track/page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: this.visitorId,
          page: page,
          tab: tab,
          previous_page: this.currentPage,
          duration: timeSpent,
          timestamp: new Date().toISOString()
        })
      });

      // Update current tracking
      this.currentPage = page;
      this.pageStartTime = Date.now();
      
      console.log(`📊 Page view tracked: ${page}${tab ? `/${tab}` : ''}`);
    } catch (error) {
      console.error('Page tracking error:', error);
    }
  }

  /**
   * Track AI chat interactions
   */
  async trackAIInteraction(interactionData) {
    if (!this.visitorId) return;

    try {
      await fetch(`${this.baseURL}/analytics/track/ai-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: this.visitorId,
          type: interactionData.type || 'chat',
          question: interactionData.question || '',
          session_length: Date.now() - this.sessionStartTime,
          timestamp: new Date().toISOString()
        })
      });

      console.log('📊 AI interaction tracked:', interactionData.type);
    } catch (error) {
      console.error('AI interaction tracking error:', error);
    }
  }

  /**
   * Track project engagement
   */
  async trackProjectInterest(projectData) {
    if (!this.visitorId) return;

    try {
      await fetch(`${this.baseURL}/analytics/track/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: this.visitorId,
          project: projectData.project,
          action: projectData.action || 'view',
          technologies: projectData.technologies || [],
          timestamp: new Date().toISOString()
        })
      });

      console.log('📊 Project interest tracked:', projectData.project, projectData.action);
    } catch (error) {
      console.error('Project tracking error:', error);
    }
  }

  /**
   * Track contact form interactions
   */
  async trackContactInteraction(contactData) {
    if (!this.visitorId) return;

    try {
      await fetch(`${this.baseURL}/analytics/track/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: this.visitorId,
          action: contactData.action,
          interest: contactData.interest || '',
          timestamp: new Date().toISOString()
        })
      });

      console.log('📊 Contact interaction tracked:', contactData.action);
    } catch (error) {
      console.error('Contact tracking error:', error);
    }
  }

  /**
   * Get public analytics metrics
   */
  async getPublicMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/public/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Public metrics error:', error);
      return null;
    }
  }

  /**
   * Get admin analytics (requires authentication)
   */
  async getAdminAnalytics(authToken) {
    try {
      const response = await fetch(`${this.baseURL}/analytics/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Admin analytics error:', error);
      return null;
    }
  }

  /**
   * Export analytics data (admin only)
   */
  async exportAnalytics(authToken, format = 'json') {
    try {
      const response = await fetch(`${this.baseURL}/analytics/admin/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Export analytics error:', error);
      return null;
    }
  }

  /**
   * Track custom events
   */
  async trackCustomEvent(eventName, eventData = {}) {
    console.log(`📊 Custom event: ${eventName}`, eventData);
    
    // Map custom events to specific tracking methods
    switch (eventName) {
      case 'resume_download':
        await this.trackProjectInterest({
          project: 'resume',
          action: 'download',
          ...eventData
        });
        break;
        
      case 'github_link_click':
        await this.trackProjectInterest({
          project: eventData.project || 'unknown',
          action: 'github_click',
          ...eventData
        });
        break;
        
      case 'demo_link_click':
        await this.trackProjectInterest({
          project: eventData.project || 'unknown',
          action: 'demo_click',
          ...eventData
        });
        break;
        
      case 'email_click':
        await this.trackContactInteraction({
          action: 'email_click',
          ...eventData
        });
        break;
        
      default:
        // Generic tracking could be implemented here
        console.log(`📊 Unhandled custom event: ${eventName}`);
    }
  }

  /**
   * Get session metrics
   */
  getSessionMetrics() {
    return {
      visitor_id: this.visitorId,
      session_duration: Date.now() - this.sessionStartTime,
      current_page: this.currentPage,
      page_duration: Date.now() - this.pageStartTime
    };
  }

  /**
   * Privacy-safe visitor info
   */
  getVisitorInfo() {
    return {
      visitor_id: this.visitorId,
      is_returning: localStorage.getItem('portfolio_visitor_id') !== null,
      session_start: new Date(this.sessionStartTime).toISOString(),
      current_page: this.currentPage
    };
  }
}

// Create global analytics instance
const analyticsService = new AnalyticsService();

export default analyticsService;
