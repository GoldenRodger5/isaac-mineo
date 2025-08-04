import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';

const AdminAnalytics = ({ authToken, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadAdminAnalytics();
    
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(loadAdminAnalytics, 60000); // Refresh every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authToken, autoRefresh]);

  const loadAdminAnalytics = async () => {
    try {
      setLoading(!analytics); // Don't show loading on refresh if data exists
      const data = await analyticsService.getAdminAnalytics(authToken);
      
      if (data) {
        setAnalytics(data);
        setError(null);
      } else {
        setError('Access denied or failed to load analytics');
      }
    } catch (err) {
      setError('Failed to load admin analytics');
      console.error('Admin analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format) => {
    try {
      const data = await analyticsService.exportAnalytics(authToken, format);
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num?.toString() || '0';
  };

  const formatPercentage = (num) => Math.round(num || 0) + '%';

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'traffic', name: 'Traffic', icon: '🚦' },
    { id: 'behavior', name: 'Behavior', icon: '👥' },
    { id: 'ai', name: 'AI Chat', icon: '🤖' },
    { id: 'projects', name: 'Projects', icon: '💼' },
    { id: 'contact', name: 'Contact', icon: '📧' },
    { id: 'technical', name: 'Technical', icon: '⚙️' }
  ];

  if (loading && !analytics) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-4xl mx-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-blue-500 rounded animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">Loading Admin Analytics...</h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button 
                onClick={loadAdminAnalytics}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-400">👥</span>
            <span className="text-sm text-gray-300">Total Visitors</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(analytics?.traffic_analytics?.daily_visitors?.reduce((a, b) => a + (b.count || 0), 0) || 0)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-400">🤖</span>
            <span className="text-sm text-gray-300">AI Conversations</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(analytics?.ai_chat_insights?.total_conversations || 0)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-400">📊</span>
            <span className="text-sm text-gray-300">Engagement Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(analytics?.visitor_behavior?.engagement_rate || 0)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-orange-400">📧</span>
            <span className="text-sm text-gray-300">Contact Forms</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatNumber(analytics?.contact_analytics?.form_submissions || 0)}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Top Performance</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Session Duration: {formatNumber(analytics?.visitor_behavior?.average_session_duration || 0)}s avg</li>
              <li>• Pages per Session: {(analytics?.visitor_behavior?.pages_per_session || 0).toFixed(1)}</li>
              <li>• Bounce Rate: {formatPercentage(analytics?.visitor_behavior?.bounce_rate || 0)}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Activity</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Last Updated: {new Date(analytics?.last_updated * 1000).toLocaleString()}</li>
              <li>• Active Monitoring: {autoRefresh ? '✅ Enabled' : '❌ Disabled'}</li>
              <li>• Data Freshness: Live</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'traffic':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Traffic Analytics</h3>
            <p className="text-gray-400">Detailed traffic analytics will be displayed here.</p>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
              {JSON.stringify(analytics?.traffic_analytics, null, 2)}
            </pre>
          </div>
        );
      case 'behavior':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Visitor Behavior</h3>
            <p className="text-gray-400">User behavior patterns and journey analysis.</p>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
              {JSON.stringify(analytics?.visitor_behavior, null, 2)}
            </pre>
          </div>
        );
      case 'ai':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Chat Insights</h3>
            <p className="text-gray-400">AI chatbot usage statistics and popular topics.</p>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
              {JSON.stringify(analytics?.ai_chat_insights, null, 2)}
            </pre>
          </div>
        );
      case 'projects':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Performance</h3>
            <p className="text-gray-400">Project engagement and technology interest analysis.</p>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
              {JSON.stringify(analytics?.project_performance, null, 2)}
            </pre>
          </div>
        );
      case 'contact':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Analytics</h3>
            <p className="text-gray-400">Contact form interactions and conversion rates.</p>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
              {JSON.stringify(analytics?.contact_analytics, null, 2)}
            </pre>
          </div>
        );
      case 'technical':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Technical Metrics</h3>
            <p className="text-gray-400">Performance metrics and technical insights.</p>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300 overflow-auto">
              {JSON.stringify(analytics?.technical_metrics, null, 2)}
            </pre>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Analytics Dashboard</h2>
                <p className="text-sm text-gray-400">
                  Last updated: {analytics?.last_updated ? new Date(analytics.last_updated * 1000).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>
              <button
                onClick={() => exportData('json')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                📥 Export
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 min-w-max transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
