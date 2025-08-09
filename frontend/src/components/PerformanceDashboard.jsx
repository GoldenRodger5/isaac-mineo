import React, { useState, useEffect, useRef } from 'react';
import { optimizedApiClient } from '../services/optimizedApiClient';

const PerformanceDashboard = ({ isOpen, onClose }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadPerformanceData();
      
      if (autoRefresh) {
        intervalRef.current = setInterval(() => {
          loadPerformanceData();
          updateRealTimeMetrics();
        }, 5000); // Update every 5 seconds
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, autoRefresh]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // Get client-side metrics
      const clientMetrics = optimizedApiClient.getPerformanceReport();
      
      // Get server-side metrics (if available)
      const serverMetrics = await fetchServerMetrics();
      
      setPerformanceData({
        client: clientMetrics,
        server: serverMetrics,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServerMetrics = async () => {
    try {
      // This would call your backend performance endpoint
      const response = await fetch('/api/performance/metrics');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Server metrics unavailable:', error);
    }
    return null;
  };

  const updateRealTimeMetrics = () => {
    setRealTimeMetrics({
      timestamp: new Date().toLocaleTimeString(),
      clientMetrics: optimizedApiClient.getPerformanceReport(),
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    });
  };

  const clearAllCaches = () => {
    optimizedApiClient.clearAllCaches();
    loadPerformanceData();
  };

  const preloadFrequentData = () => {
    optimizedApiClient.preloadFrequentData();
    setTimeout(loadPerformanceData, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">Performance Dashboard</h2>
            <span className="text-xs text-gray-400">Real-time monitoring</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                autoRefresh 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            
            <button
              onClick={loadPerformanceData}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
            >
              Refresh Now
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading performance data...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Real-time Status Bar */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Real-time Status</h3>
                <span className="text-xs text-gray-400">
                  Last updated: {realTimeMetrics.timestamp || 'Never'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {performanceData?.client?.totalRequests || 0}
                  </div>
                  <div className="text-xs text-gray-400">Total Requests</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {performanceData?.client?.cacheHitRate || '0%'}
                  </div>
                  <div className="text-xs text-gray-400">Cache Hit Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {performanceData?.client?.averageResponseTime || '0ms'}
                  </div>
                  <div className="text-xs text-gray-400">Avg Response</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {performanceData?.client?.pendingRequests || 0}
                  </div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
              </div>
            </div>

            {/* Client Performance */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Client Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Caching Efficiency</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Cache Hits</span>
                      <span className="text-xs text-green-400">{performanceData?.client?.cacheHitRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Memory Hits</span>
                      <span className="text-xs text-blue-400">{performanceData?.client?.memoryHitRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Deduplication</span>
                      <span className="text-xs text-purple-400">{performanceData?.client?.deduplicationRate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Memory Usage</h4>
                  {realTimeMetrics.memoryUsage ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Used</span>
                        <span className="text-xs text-white">{realTimeMetrics.memoryUsage.used} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Total</span>
                        <span className="text-xs text-white">{realTimeMetrics.memoryUsage.total} MB</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full"
                          style={{ 
                            width: `${(realTimeMetrics.memoryUsage.used / realTimeMetrics.memoryUsage.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Memory API unavailable</p>
                  )}
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Cache Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Memory Cache</span>
                      <span className="text-xs text-white">{performanceData?.client?.memoryCacheSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Pending Requests</span>
                      <span className="text-xs text-yellow-400">{performanceData?.client?.pendingRequests || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Performance */}
            {performanceData?.server && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Server Performance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Response Times</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Average</span>
                        <span className="text-xs text-white">
                          {performanceData.server.performance?.avg_response_time_ms}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Recent Requests (1h)</span>
                        <span className="text-xs text-blue-400">
                          {performanceData.server.performance?.recent_requests_1h}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Cache Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Hit Rate</span>
                        <span className="text-xs text-green-400">
                          {performanceData.server.performance?.cache_hit_rate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Memory Cache</span>
                        <span className="text-xs text-purple-400">
                          {performanceData.server.performance?.memory_cache_hit_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Actions</h3>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={clearAllCaches}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  🗑️ Clear All Caches
                </button>
                
                <button
                  onClick={preloadFrequentData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  🚀 Preload Frequent Data
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  🔄 Full Refresh
                </button>
              </div>
            </div>

            {/* Optimization Recommendations */}
            {performanceData?.server?.optimization?.recommended_optimizations && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Optimization Recommendations</h3>
                
                <div className="space-y-2">
                  {performanceData.server.optimization.recommended_optimizations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Information */}
            <div className="bg-gray-800 rounded-lg p-4">
              <details className="text-white">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  🔧 Debug Information
                </summary>
                <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(performanceData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
