// Performance Optimization Test Suite
// Tests the enhanced API client and performance improvements

const PRODUCTION_URL = 'https://isaac-mineo-api.onrender.com';

console.log('🚀 PERFORMANCE OPTIMIZATION TEST SUITE');
console.log('=====================================');

class PerformanceTestRunner {
  constructor() {
    this.results = {
      baselineTests: [],
      optimizedTests: [],
      cachingTests: [],
      batchingTests: []
    };
  }

  async runComprehensiveTests() {
    console.log('\n📊 Starting comprehensive performance tests...\n');

    // Test 1: Baseline performance (without optimizations)
    console.log('📋 Test 1: Baseline Performance');
    await this.testBaselinePerformance();

    // Test 2: Cache effectiveness
    console.log('\n📋 Test 2: Cache Performance');
    await this.testCachePerformance();

    // Test 3: Request deduplication
    console.log('\n📋 Test 3: Request Deduplication');
    await this.testRequestDeduplication();

    // Test 4: Batch processing
    console.log('\n📋 Test 4: Batch Processing');
    await this.testBatchProcessing();

    // Test 5: Concurrent requests
    console.log('\n📋 Test 5: Concurrent Request Handling');
    await this.testConcurrentRequests();

    // Generate performance report
    console.log('\n📊 PERFORMANCE OPTIMIZATION RESULTS');
    console.log('===================================');
    this.generatePerformanceReport();
  }

  async testBaselinePerformance() {
    const questions = [
      "What is Isaac's technical stack?",
      "Tell me about the Nutrivize project",
      "What kind of roles is Isaac looking for?",
      "What's Isaac's educational background?"
    ];

    const startTime = Date.now();
    const results = [];

    for (const question of questions) {
      const requestStart = Date.now();
      
      try {
        const response = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });

        const data = await response.json();
        const requestTime = Date.now() - requestStart;

        results.push({
          question: question.substring(0, 30) + '...',
          responseTime: requestTime,
          success: response.ok,
          cached: data.cached || false,
          responseLength: data.response?.length || 0
        });

        console.log(`   ⏱️  "${question.substring(0, 30)}...": ${requestTime}ms ${data.cached ? '(cached)' : ''}`)

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.push({
          question: question.substring(0, 30) + '...',
          responseTime: -1,
          success: false,
          error: error.message
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTime = results.filter(r => r.responseTime > 0)
                          .reduce((sum, r) => sum + r.responseTime, 0) / 
                    results.filter(r => r.responseTime > 0).length;

    this.results.baselineTests = {
      totalTime,
      avgTime: Math.round(avgTime),
      results,
      cacheHitRate: results.filter(r => r.cached).length / results.length * 100
    };

    console.log(`   📊 Total time: ${totalTime}ms | Avg: ${Math.round(avgTime)}ms | Cache hits: ${Math.round(this.results.baselineTests.cacheHitRate)}%`);
  }

  async testCachePerformance() {
    const testQuestion = "What is Isaac's technical stack?";
    
    // First request (should miss cache)
    console.log('   🔄 First request (cache miss)...');
    const firstStart = Date.now();
    
    const firstResponse = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: testQuestion })
    });
    
    const firstData = await firstResponse.json();
    const firstTime = Date.now() - firstStart;
    
    console.log(`      ⏱️  First request: ${firstTime}ms (cached: ${firstData.cached || false})`);
    
    // Wait a moment, then repeat the same question
    await this.sleep(1000);
    
    console.log('   💾 Second request (should hit cache)...');
    const secondStart = Date.now();
    
    const secondResponse = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: testQuestion })
    });
    
    const secondData = await secondResponse.json();
    const secondTime = Date.now() - secondStart;
    
    console.log(`      ⏱️  Second request: ${secondTime}ms (cached: ${secondData.cached || false})`);
    
    const improvement = firstTime > 0 ? ((firstTime - secondTime) / firstTime * 100) : 0;
    
    this.results.cachingTests = {
      firstRequestTime: firstTime,
      secondRequestTime: secondTime,
      improvementPercentage: Math.round(improvement),
      cacheWorking: secondData.cached === true || secondTime < firstTime * 0.8
    };

    console.log(`   📊 Cache improvement: ${Math.round(improvement)}% faster | Working: ${this.results.cachingTests.cacheWorking ? '✅' : '❌'}`);
  }

  async testRequestDeduplication() {
    const testQuestion = "Tell me about the Nutrivize project";
    const concurrentRequests = 3;
    
    console.log(`   🔄 Making ${concurrentRequests} identical concurrent requests...`);
    
    const startTime = Date.now();
    
    // Make identical concurrent requests
    const promises = Array(concurrentRequests).fill(null).map(() =>
      fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: testQuestion })
      }).then(r => r.json())
    );

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    // Check if all responses are identical (indicating deduplication worked)
    const allIdentical = results.every((result, index) => 
      index === 0 || result.response === results[0].response
    );
    
    // Check response times - should be similar if deduplicated
    const responseTimes = results.map(r => r.responseTime || totalTime / concurrentRequests);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    this.results.batchingTests = {
      concurrentRequests,
      totalTime,
      avgResponseTime: Math.round(avgResponseTime),
      allIdentical,
      deduplicationWorking: totalTime < (avgResponseTime * concurrentRequests * 0.8)
    };

    console.log(`   📊 ${concurrentRequests} requests in ${totalTime}ms | Identical responses: ${allIdentical ? '✅' : '❌'} | Deduplication: ${this.results.batchingTests.deduplicationWorking ? '✅' : '❌'}`);
  }

  async testBatchProcessing() {
    const questions = [
      "What programming languages does Isaac know?",
      "Tell me about his React experience",
      "What about Python skills?",
      "Any experience with databases?"
    ];
    
    console.log(`   🔄 Testing batch vs sequential processing...`);
    
    // Sequential processing
    const sequentialStart = Date.now();
    const sequentialResults = [];
    
    for (const question of questions) {
      const response = await fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      sequentialResults.push(await response.json());
    }
    
    const sequentialTime = Date.now() - sequentialStart;
    
    // Parallel processing
    const parallelStart = Date.now();
    
    const parallelPromises = questions.map(question =>
      fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      }).then(r => r.json())
    );
    
    const parallelResults = await Promise.all(parallelPromises);
    const parallelTime = Date.now() - parallelStart;
    
    const improvement = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    
    this.results.batchingTests = {
      ...this.results.batchingTests,
      sequentialTime,
      parallelTime,
      parallelImprovement: Math.round(improvement),
      parallelWorking: parallelTime < sequentialTime * 0.8
    };

    console.log(`   📊 Sequential: ${sequentialTime}ms | Parallel: ${parallelTime}ms | Improvement: ${Math.round(improvement)}%`);
  }

  async testConcurrentRequests() {
    const questions = [
      "What is Isaac's technical stack?",
      "Tell me about Nutrivize",
      "What roles is Isaac seeking?",
      "Educational background?",
      "Top skills?",
      "Project experience?"
    ];
    
    console.log(`   🔄 Testing ${questions.length} concurrent unique requests...`);
    
    const startTime = Date.now();
    
    const promises = questions.map((question, index) =>
      fetch(`${PRODUCTION_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, sessionId: `test_${index}_${Date.now()}` })
      }).then(async (response) => ({
        question: question.substring(0, 20) + '...',
        success: response.ok,
        responseTime: Date.now() - startTime, // Individual timing is complex with Promise.all
        data: await response.json()
      })).catch(error => ({
        question: question.substring(0, 20) + '...',
        success: false,
        error: error.message
      }))
    );

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const avgTimePerRequest = totalTime / questions.length;
    
    this.results.concurrentTests = {
      totalRequests: questions.length,
      successfulRequests: successCount,
      totalTime,
      avgTimePerRequest: Math.round(avgTimePerRequest),
      successRate: (successCount / questions.length) * 100
    };

    console.log(`   📊 ${successCount}/${questions.length} successful | ${totalTime}ms total | ${Math.round(avgTimePerRequest)}ms avg | Success rate: ${Math.round(this.results.concurrentTests.successRate)}%`);
  }

  generatePerformanceReport() {
    const baseline = this.results.baselineTests;
    const caching = this.results.cachingTests;
    const batching = this.results.batchingTests;
    const concurrent = this.results.concurrentTests || {};

    console.log('\n📈 OPTIMIZATION EFFECTIVENESS:');
    console.log('─────────────────────────────');
    
    // Caching effectiveness
    if (caching.improvementPercentage > 0) {
      console.log(`✅ Cache Performance: ${caching.improvementPercentage}% improvement`);
      console.log(`   First request: ${caching.firstRequestTime}ms → Second request: ${caching.secondRequestTime}ms`);
    } else {
      console.log(`⚠️  Cache Performance: No improvement detected`);
    }
    
    // Batch processing
    if (batching.parallelImprovement > 0) {
      console.log(`✅ Parallel Processing: ${batching.parallelImprovement}% improvement`);
      console.log(`   Sequential: ${batching.sequentialTime}ms → Parallel: ${batching.parallelTime}ms`);
    }
    
    // Request deduplication
    if (batching.deduplicationWorking) {
      console.log(`✅ Request Deduplication: Working effectively`);
    } else {
      console.log(`⚠️  Request Deduplication: Needs optimization`);
    }
    
    // Concurrent handling
    if (concurrent.successRate >= 90) {
      console.log(`✅ Concurrent Requests: ${Math.round(concurrent.successRate)}% success rate`);
    } else {
      console.log(`⚠️  Concurrent Requests: ${Math.round(concurrent.successRate || 0)}% success rate - needs improvement`);
    }

    console.log('\n🎯 PERFORMANCE SUMMARY:');
    console.log('─────────────────────');
    console.log(`Average Response Time: ${baseline?.avgTime || 'N/A'}ms`);
    console.log(`Cache Hit Rate: ${Math.round(baseline?.cacheHitRate || 0)}%`);
    console.log(`Parallel Processing Gain: ${batching?.parallelImprovement || 0}%`);
    console.log(`Cache Speed Improvement: ${caching?.improvementPercentage || 0}%`);
    
    // Overall score
    const scores = [
      caching?.improvementPercentage || 0,
      batching?.parallelImprovement || 0,
      concurrent?.successRate || 0,
      baseline?.cacheHitRate || 0
    ];
    
    const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    console.log(`\n🏆 Overall Performance Score: ${Math.round(overallScore)}/100`);
    
    if (overallScore >= 80) {
      console.log('🎉 EXCELLENT: System is highly optimized!');
    } else if (overallScore >= 60) {
      console.log('✅ GOOD: System shows solid performance optimizations');
    } else if (overallScore >= 40) {
      console.log('⚠️  FAIR: Some optimizations working, room for improvement');
    } else {
      console.log('❌ POOR: Optimizations need significant work');
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('──────────────────');
    
    if ((caching?.improvementPercentage || 0) < 30) {
      console.log('• Implement more aggressive caching strategies');
    }
    
    if ((batching?.parallelImprovement || 0) < 20) {
      console.log('• Optimize batch processing and request parallelization');
    }
    
    if ((concurrent?.successRate || 0) < 95) {
      console.log('• Improve concurrent request handling and error recovery');
    }
    
    if ((baseline?.avgTime || 0) > 800) {
      console.log('• Focus on reducing base response times');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-run the tests
async function runPerformanceTests() {
  const testRunner = new PerformanceTestRunner();
  await testRunner.runComprehensiveTests();
}

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  // Node.js - auto run
  async function runWithFetch() {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
    runPerformanceTests().catch(console.error);
  }
  runWithFetch();
} else {
  // Browser - make available globally
  window.runPerformanceTests = runPerformanceTests;
  console.log('🌐 Performance tests available. Run: runPerformanceTests()');
}
