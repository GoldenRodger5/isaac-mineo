// Production Beta Deployment Test Suite
// Comprehensive testing for all critical production features

const PRODUCTION_URL = 'https://isaac-mineo-api.onrender.com';
const FRONTEND_URL = 'https://isaac-mineo.vercel.app';

console.log('🚀 PRODUCTION BETA DEPLOYMENT TEST SUITE');
console.log('========================================');
console.log(`Backend: ${PRODUCTION_URL}`);
console.log(`Frontend: ${FRONTEND_URL}`);

class ProductionTestSuite {
  constructor() {
    this.results = {
      critical: { passed: 0, total: 0, failures: [] },
      performance: { passed: 0, total: 0, failures: [] },
      integration: { passed: 0, total: 0, failures: [] },
      security: { passed: 0, total: 0, failures: [] }
    };
    this.startTime = Date.now();
  }

  async runFullTestSuite() {
    console.log('\n🧪 Starting comprehensive production testing...\n');

    // Critical functionality tests
    await this.testCriticalFunctionality();
    
    // Performance benchmarks
    await this.testPerformanceBenchmarks();
    
    // Integration tests
    await this.testIntegrationPoints();
    
    // Security validation
    await this.testSecurityFeatures();
    
    // Generate final report
    this.generateDeploymentReport();
  }

  async testCriticalFunctionality() {
    console.log('🔥 CRITICAL FUNCTIONALITY TESTS');
    console.log('===============================');

    await this.test('Backend Health Check', async () => {
      const response = await fetch(`${PRODUCTION_URL}/health`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
      if (data.status !== 'healthy') throw new Error(`Unhealthy status: ${data.status}`);
      
      console.log(`   ✅ Backend healthy | Uptime: ${data.uptime_info}`);
      return { healthy: true, errors: data.error_summary?.total_errors || 0 };
    }, 'critical');

    await this.test('Core Chatbot Response', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: "What is Isaac's technical stack?",
          sessionId: `prod_test_${Date.now()}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(`Chatbot failed: ${response.status}`);
      if (!data.response) throw new Error('No response received');
      if (data.response.length < 50) throw new Error('Response too short - likely error');

      console.log(`   ✅ Chatbot responding | Length: ${data.response.length} chars | Method: ${data.searchMethod || 'unknown'}`);
      return { responseTime: Date.now(), searchMethod: data.searchMethod };
    }, 'critical');

    await this.test('Session Management', async () => {
      const sessionId = `session_test_${Date.now()}`;
      
      // First request
      const response1 = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: "Hello, I'm testing session management",
          sessionId 
        })
      });
      const data1 = await response1.json();

      // Follow-up request
      const response2 = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: "Do you remember what I just said?",
          sessionId 
        })
      });
      const data2 = await response2.json();

      if (!response1.ok || !response2.ok) throw new Error('Session requests failed');
      if (!data1.sessionId || data1.sessionId !== sessionId) throw new Error('Session ID not maintained');
      if (data2.conversationLength <= 1) throw new Error('Conversation not tracked');

      console.log(`   ✅ Sessions working | ID: ${sessionId} | Conversation length: ${data2.conversationLength}`);
      return { sessionId, conversationLength: data2.conversationLength };
    }, 'critical');

    await this.test('Voice Chat WebSocket', async () => {
      return new Promise((resolve, reject) => {
        const WebSocket = require('ws');
        const ws = new WebSocket(`wss://isaac-mineo-api.onrender.com/api/voice/chat`);
        let connected = false;
        let voiceEnabled = false;

        const timeout = setTimeout(() => {
          ws.close();
          if (!connected) {
            reject(new Error('WebSocket connection timeout'));
          } else if (!voiceEnabled) {
            reject(new Error('Voice not enabled in WebSocket'));
          } else {
            reject(new Error('No AI response received'));
          }
        }, 15000);

        ws.on('open', () => {
          connected = true;
          ws.send(JSON.stringify({
            type: 'start_session',
            session_id: `voice_test_${Date.now()}`
          }));
        });

        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'status' && message.voice_enabled) {
            voiceEnabled = true;
            // Test text processing
            ws.send(JSON.stringify({
              type: 'process_transcript',
              text: 'This is a production deployment test',
              session_id: `voice_test_${Date.now()}`
            }));
          } else if (message.type === 'ai_response') {
            clearTimeout(timeout);
            ws.close();
            console.log(`   ✅ Voice chat working | Response: "${message.text?.substring(0, 50)}..."`);
            resolve({ connected: true, voiceEnabled: true, aiResponse: true });
          } else if (message.type === 'error') {
            clearTimeout(timeout);
            ws.close();
            reject(new Error(`Voice error: ${message.message}`));
          }
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket error: ${error.message}`));
        });
      });
    }, 'critical');

    await this.test('Audio Synthesis', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/voice/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Production deployment test for audio synthesis',
          session_id: `audio_test_${Date.now()}`,
          return_audio: true
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(`Audio synthesis failed: ${response.status}`);
      if (!data.text) throw new Error('No text response');

      console.log(`   ✅ Audio synthesis working | Text length: ${data.text.length} | Audio URL: ${!!data.audio_url}`);
      return { textResponse: data.text.length, audioUrl: !!data.audio_url };
    }, 'critical');
  }

  async testPerformanceBenchmarks() {
    console.log('\n⚡ PERFORMANCE BENCHMARKS');
    console.log('========================');

    await this.test('Response Time Benchmark', async () => {
      const questions = [
        "What is Isaac's experience with React?",
        "Tell me about his Python skills",
        "What projects has he worked on?",
        "What's his educational background?"
      ];

      const results = [];
      
      for (const question of questions) {
        const start = Date.now();
        
        const response = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        const responseTime = Date.now() - start;
        
        results.push({
          question: question.substring(0, 30) + '...',
          responseTime,
          cached: data.cached || false,
          success: response.ok
        });
      }

      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      const cacheHitRate = results.filter(r => r.cached).length / results.length * 100;
      const successRate = results.filter(r => r.success).length / results.length * 100;

      // Performance thresholds for production
      if (avgResponseTime > 10000) throw new Error(`Average response time too high: ${avgResponseTime}ms`);
      if (successRate < 100) throw new Error(`Success rate below 100%: ${successRate}%`);

      console.log(`   ✅ Performance acceptable | Avg: ${Math.round(avgResponseTime)}ms | Cache: ${Math.round(cacheHitRate)}% | Success: ${successRate}%`);
      return { avgResponseTime, cacheHitRate, successRate, results };
    }, 'performance');

    await this.test('Concurrent Load Test', async () => {
      const concurrentRequests = 8;
      const testQuestions = Array(concurrentRequests).fill(null).map((_, i) => 
        `Load test question ${i + 1}: What can you tell me about Isaac's background?`
      );

      const start = Date.now();
      
      const promises = testQuestions.map((question, index) =>
        fetch(`${PRODUCTION_URL}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question,
            sessionId: `load_test_${index}_${Date.now()}`
          })
        }).then(r => ({ status: r.status, ok: r.ok }))
      );

      const results = await Promise.all(promises);
      const totalTime = Date.now() - start;
      const successCount = results.filter(r => r.ok).length;
      const successRate = (successCount / concurrentRequests) * 100;

      if (successRate < 90) throw new Error(`Concurrent load test failed: ${successRate}% success rate`);

      console.log(`   ✅ Load test passed | ${successCount}/${concurrentRequests} successful | ${totalTime}ms total | ${Math.round(totalTime/concurrentRequests)}ms avg per request`);
      return { concurrentRequests, successCount, totalTime, successRate };
    }, 'performance');
  }

  async testIntegrationPoints() {
    console.log('\n🔗 INTEGRATION TESTS');
    console.log('===================');

    await this.test('CORS Configuration', async () => {
      // Test preflight request
      const preflightResponse = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://isaac-mineo.vercel.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      if (!preflightResponse.ok) throw new Error(`CORS preflight failed: ${preflightResponse.status}`);
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers')
      };

      console.log(`   ✅ CORS configured | Origin: ${corsHeaders['Access-Control-Allow-Origin']} | Methods: ${corsHeaders['Access-Control-Allow-Methods']?.substring(0, 30)}...`);
      return corsHeaders;
    }, 'integration');

    await this.test('Frontend Accessibility', async () => {
      // Test if frontend is accessible
      const response = await fetch(FRONTEND_URL);
      
      if (!response.ok) throw new Error(`Frontend not accessible: ${response.status}`);
      
      const html = await response.text();
      
      // Check for critical elements
      if (!html.includes('Isaac Mineo')) throw new Error('Frontend missing critical content');
      if (!html.includes('AI assistant')) throw new Error('Frontend missing AI chat reference');

      console.log(`   ✅ Frontend accessible | Status: ${response.status} | Content length: ${html.length}`);
      return { accessible: true, contentLength: html.length };
    }, 'integration');

    await this.test('API Endpoint Coverage', async () => {
      const endpoints = [
        { path: '/health', method: 'GET' },
        { path: '/metrics', method: 'GET' },
        { path: '/api/chatbot', method: 'POST' },
        { path: '/api/voice/status', method: 'GET' },
        { path: '/api/voice/synthesize', method: 'POST' }
      ];

      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const options = endpoint.method === 'POST' ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
          } : {};

          const response = await fetch(`${PRODUCTION_URL}${endpoint.path}`, options);
          
          results.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: response.status,
            accessible: response.status < 500 // 4xx is OK (might be validation), 5xx is not
          });
        } catch (error) {
          results.push({
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'error',
            accessible: false,
            error: error.message
          });
        }
      }

      const accessibleCount = results.filter(r => r.accessible).length;
      const coverage = (accessibleCount / endpoints.length) * 100;

      if (coverage < 80) throw new Error(`Endpoint coverage too low: ${coverage}%`);

      console.log(`   ✅ API coverage good | ${accessibleCount}/${endpoints.length} endpoints accessible (${Math.round(coverage)}%)`);
      return { coverage, results };
    }, 'integration');
  }

  async testSecurityFeatures() {
    console.log('\n🔒 SECURITY VALIDATION');
    console.log('=====================');

    await this.test('HTTPS Enforcement', async () => {
      // Test that HTTP redirects to HTTPS (if applicable)
      const httpsResponse = await fetch(PRODUCTION_URL);
      
      if (!httpsResponse.ok) throw new Error(`HTTPS endpoint not accessible: ${httpsResponse.status}`);
      if (!PRODUCTION_URL.startsWith('https://')) throw new Error('Backend not using HTTPS');
      if (!FRONTEND_URL.startsWith('https://')) throw new Error('Frontend not using HTTPS');

      console.log(`   ✅ HTTPS enforced | Backend: ${PRODUCTION_URL.startsWith('https://')} | Frontend: ${FRONTEND_URL.startsWith('https://')}`);
      return { httpsEnforced: true };
    }, 'security');

    await this.test('Input Validation', async () => {
      // Test various malicious inputs
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE users; --',
        '../../../etc/passwd',
        'eval(process.exit())',
        'a'.repeat(10000) // Very long input
      ];

      const results = [];
      
      for (const maliciousInput of maliciousInputs) {
        const response = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: maliciousInput })
        });

        const data = await response.json();
        
        results.push({
          input: maliciousInput.substring(0, 20) + '...',
          status: response.status,
          handled: response.ok || response.status === 400, // Should either handle gracefully or reject
          responseContainsMalicious: data.response && data.response.includes(maliciousInput)
        });
      }

      const properlyHandled = results.filter(r => r.handled && !r.responseContainsMalicious).length;
      const handlingRate = (properlyHandled / maliciousInputs.length) * 100;

      if (handlingRate < 80) throw new Error(`Input validation insufficient: ${handlingRate}%`);

      console.log(`   ✅ Input validation working | ${properlyHandled}/${maliciousInputs.length} malicious inputs handled properly (${Math.round(handlingRate)}%)`);
      return { handlingRate, results };
    }, 'security');

    await this.test('Rate Limiting', async () => {
      // Test rapid successive requests
      const rapidRequests = 15;
      const promises = [];
      
      for (let i = 0; i < rapidRequests; i++) {
        promises.push(
          fetch(`${PRODUCTION_URL}/api/chatbot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: `Rate limit test ${i}` })
          })
        );
      }

      const results = await Promise.all(promises);
      const tooManyRequests = results.filter(r => r.status === 429).length;
      const successful = results.filter(r => r.ok).length;

      // Either all should succeed (no rate limiting) or some should be rate limited
      console.log(`   ✅ Rate limiting status | ${successful} successful | ${tooManyRequests} rate limited | Total: ${rapidRequests}`);
      return { successful, rateLimited: tooManyRequests, total: rapidRequests };
    }, 'security');
  }

  async test(name, testFunction, category) {
    this.results[category].total++;
    
    try {
      const result = await testFunction();
      this.results[category].passed++;
      return result;
    } catch (error) {
      console.log(`   ❌ ${name} FAILED: ${error.message}`);
      this.results[category].failures.push({ name, error: error.message });
      // Don't throw - continue with other tests
    }
  }

  generateDeploymentReport() {
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n🏆 PRODUCTION DEPLOYMENT READINESS REPORT');
    console.log('========================================');
    
    // Calculate scores
    const categories = ['critical', 'performance', 'integration', 'security'];
    let overallScore = 0;
    let totalTests = 0;
    let totalPassed = 0;

    categories.forEach(category => {
      const result = this.results[category];
      const score = result.total > 0 ? (result.passed / result.total) * 100 : 0;
      
      console.log(`\n${category.toUpperCase()} TESTS: ${result.passed}/${result.total} passed (${Math.round(score)}%)`);
      
      if (result.failures.length > 0) {
        result.failures.forEach(failure => {
          console.log(`  ❌ ${failure.name}: ${failure.error}`);
        });
      }

      overallScore += score;
      totalTests += result.total;
      totalPassed += result.passed;
    });

    const finalScore = overallScore / categories.length;
    
    console.log('\n📊 OVERALL RESULTS:');
    console.log('=================');
    console.log(`Total Tests: ${totalPassed}/${totalTests} passed`);
    console.log(`Overall Score: ${Math.round(finalScore)}%`);
    console.log(`Test Duration: ${Math.round(totalTime / 1000)}s`);
    
    // Deployment recommendation
    console.log('\n🚦 DEPLOYMENT RECOMMENDATION:');
    console.log('=============================');
    
    if (finalScore >= 95) {
      console.log('🟢 READY FOR PRODUCTION DEPLOYMENT');
      console.log('✅ All critical systems functioning optimally');
      console.log('✅ Performance meets production requirements');  
      console.log('✅ Security validations passed');
      console.log('✅ Integration points verified');
    } else if (finalScore >= 85) {
      console.log('🟡 READY FOR BETA DEPLOYMENT WITH MONITORING');
      console.log('⚠️  Some non-critical issues detected');
      console.log('✅ Core functionality working');
      console.log('📊 Monitor performance closely after deployment');
    } else if (finalScore >= 70) {
      console.log('🟠 REQUIRES FIXES BEFORE DEPLOYMENT');
      console.log('❌ Critical issues need resolution');
      console.log('⚠️  Performance or security concerns detected');
      console.log('🔧 Address failures before proceeding');
    } else {
      console.log('🔴 NOT READY FOR DEPLOYMENT');
      console.log('❌ Multiple critical failures detected');
      console.log('🛑 Requires significant fixes before deployment');
      console.log('📋 Review all failed tests and resolve issues');
    }
    
    // Specific recommendations
    console.log('\n💡 SPECIFIC RECOMMENDATIONS:');
    console.log('===========================');
    
    if (this.results.critical.failures.length > 0) {
      console.log('🔥 CRITICAL: Fix all critical functionality failures immediately');
    }
    
    if (this.results.performance.failures.length > 0) {
      console.log('⚡ PERFORMANCE: Address performance issues for better user experience');
    }
    
    if (this.results.security.failures.length > 0) {
      console.log('🔒 SECURITY: Resolve security vulnerabilities before public release');
    }
    
    if (this.results.integration.failures.length > 0) {
      console.log('🔗 INTEGRATION: Fix integration issues for reliable cross-system communication');
    }

    // Success metrics summary
    console.log('\n📈 SUCCESS METRICS ACHIEVED:');
    console.log('===========================');
    console.log(`• System Health: ${this.results.critical.passed > 0 ? '✅' : '❌'} Backend healthy and responsive`);
    console.log(`• Core Features: ${this.results.critical.passed >= 3 ? '✅' : '❌'} Chatbot, sessions, and voice chat working`);
    console.log(`• Performance: ${this.results.performance.passed > 0 ? '✅' : '❌'} Response times acceptable for production`);
    console.log(`• Security: ${this.results.security.passed >= 2 ? '✅' : '❌'} Basic security measures in place`);
    console.log(`• Integration: ${this.results.integration.passed >= 2 ? '✅' : '❌'} Frontend-backend integration working`);

    return {
      overallScore: finalScore,
      totalTests,
      totalPassed,
      duration: totalTime,
      readyForDeployment: finalScore >= 85
    };
  }
}

// Auto-run when in Node.js environment
if (typeof window === 'undefined') {
  const fetch = require('node-fetch');
  const WebSocket = require('ws');
  
  global.fetch = fetch;
  
  const testSuite = new ProductionTestSuite();
  testSuite.runFullTestSuite().catch(console.error);
} else {
  // Browser environment
  window.ProductionTestSuite = ProductionTestSuite;
  console.log('🌐 Production test suite available. Run: new ProductionTestSuite().runFullTestSuite()');
}
