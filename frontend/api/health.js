import { healthCheck } from '../src/utils/pineconeEnhanced.js';
import cacheManager from '../src/utils/cacheManager.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize cache connection
    await cacheManager.connect();
    
    // Get health status
    const health = await healthCheck();
    
    // Additional system checks
    const systemHealth = {
      ...health,
      api: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasPineconeKey: !!process.env.PINECONE_API_KEY,
        hasRedisUrl: !!process.env.REDIS_URL
      }
    };

    // Determine overall health status
    const isHealthy = health.pinecone.connected && health.cache.connected;
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: isHealthy ? 'healthy' : 'degraded',
      ...systemHealth
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
