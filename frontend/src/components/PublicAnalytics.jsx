import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

const PublicAnalytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPublicMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(loadPublicMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPublicMetrics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getPublicMetrics();
      
      if (data) {
        setMetrics(data);
        setError(null);
      } else {
        setError('Unable to load metrics');
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  };

  const formatPercentage = (num) => {
    return Math.round(num || 0) + '%';
  };

  if (loading && !metrics) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-5 h-5 bg-blue-500 rounded animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Portfolio Analytics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
              <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-5 h-5 bg-red-500 rounded"></div>
          <h3 className="text-lg font-semibold text-white">Portfolio Analytics</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadPublicMetrics}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
          <h3 className="text-lg font-semibold text-white">Portfolio Analytics</h3>
        </div>
        {metrics?.last_updated && (
          <span className="text-xs text-gray-400">
            Updated {new Date(metrics.last_updated * 1000).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Visitors */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-sm text-blue-300">Visitors</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics?.total_visitors)}
          </div>
        </div>

        {/* AI Interactions */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm text-purple-300">AI Chats</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics?.ai_interactions)}
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm text-green-300">Engagement</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(metrics?.engagement_rate)}
          </div>
        </div>

        {/* Popular Projects Count */}
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm text-orange-300">Projects</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.popular_projects?.length || 0}
          </div>
        </div>
      </div>

      {/* Popular Projects */}
      {metrics?.popular_projects && metrics.popular_projects.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Most Viewed Projects</h4>
          <div className="space-y-2">
            {metrics.popular_projects.slice(0, 3).map((project, index) => (
              <div key={project.name} 
                   className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">{project.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">{formatNumber(project.views)} views</span>
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (project.views / Math.max(...metrics.popular_projects.map(p => p.views))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Technologies */}
      {metrics?.top_technologies && metrics.top_technologies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Popular Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {metrics.top_technologies.slice(0, 5).map((tech) => (
              <div key={tech.name} 
                   className="flex items-center space-x-2 bg-gray-800/30 rounded-full px-3 py-1">
                <span className="text-white text-sm">{tech.name}</span>
                <span className="text-xs text-gray-400">{tech.interest}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparency Notice */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          🔒 Analytics data is anonymized and privacy-focused. No personal information is collected.
        </p>
      </div>
    </div>
  );
};

export default PublicAnalytics;
