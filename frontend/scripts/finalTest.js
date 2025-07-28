#!/usr/bin/env node

// Final Comprehensive Test for All Enhanced Features
const API_BASE = 'http://localhost:8001/api/chatbot';

async function finalTest() {
  console.log('🎯 FINAL COMPREHENSIVE TEST - Enhanced FastAPI Chatbot\n');
  
  const results = {
    sessionManagement: false,
    entityTracking: false,
    contextAwareness: false,
    conversationTracking: false,
    ragSearch: false,
    caching: false
  };

  try {
    // Test 1: Initial question with entity extraction
    console.log('📋 Test 1: Session Creation & Entity Tracking');
    const start1 = Date.now();
    const response1 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Tell me about Nutrivize",
        sessionId: null
      })
    });

    const data1 = await response1.json();
    const time1 = Date.now() - start1;
    
    console.log(`✅ Response (${time1}ms, ${data1.response.length} chars)`);
    console.log(`📊 Session: ${data1.sessionId}`);
    console.log(`🔍 Search: ${data1.searchMethod}`);
    console.log(`🏷️  Entities: ${JSON.stringify(data1.entities)}`);
    console.log(`💬 Length: ${data1.conversationLength}`);
    
    // Validate
    if (data1.sessionId && data1.searchMethod === 'vector_search') {
      results.sessionManagement = true;
      results.ragSearch = true;
    }
    if (data1.entities && data1.entities.projects && data1.entities.projects.includes('nutrivize')) {
      results.entityTracking = true;
    }

    // Test 2: Context-aware follow-up
    console.log('\n📋 Test 2: Context Awareness');
    const start2 = Date.now();
    const response2 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "What's the tech stack?",
        sessionId: data1.sessionId
      })
    });

    const data2 = await response2.json();
    const time2 = Date.now() - start2;
    
    console.log(`✅ Response (${time2}ms, ${data2.response.length} chars)`);
    console.log(`🏷️  Entities: ${JSON.stringify(data2.entities)}`);
    console.log(`🧠 Context: ${JSON.stringify(data2.contextUsed)}`);
    console.log(`💬 Length: ${data2.conversationLength}`);
    
    // Validate
    if (data2.conversationLength > data1.conversationLength) {
      results.conversationTracking = true;
    }
    if (data2.contextUsed && data2.contextUsed.length > 0) {
      results.contextAwareness = true;
    }

    // Test 3: Caching test
    console.log('\n📋 Test 3: Response Caching');
    const start3 = Date.now();
    const response3 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Tell me about Nutrivize", // Same question
        sessionId: data1.sessionId
      })
    });

    const data3 = await response3.json();
    const time3 = Date.now() - start3;
    
    console.log(`✅ Response (${time3}ms, ${data3.response.length} chars)`);
    console.log(`💾 Cached: ${data3.cached || false}`);
    console.log(`🔍 Search: ${data3.searchMethod}`);
    
    // Validate (faster response or explicitly cached)
    if (data3.cached || time3 < time1 * 0.5) {
      results.caching = true;
    }

    // Results Summary
    console.log('\n' + '='.repeat(60));
    console.log('🏆 FINAL TEST RESULTS');
    console.log('='.repeat(60));
    
    const features = [
      ['Session Management', results.sessionManagement],
      ['Entity Tracking', results.entityTracking],
      ['Context Awareness', results.contextAwareness],
      ['Conversation Tracking', results.conversationTracking],
      ['RAG Vector Search', results.ragSearch],
      ['Response Caching', results.caching]
    ];

    let passed = 0;
    for (const [feature, result] of features) {
      const status = result ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status}: ${feature}`);
      if (result) passed++;
    }
    
    console.log(`\n🎯 Score: ${passed}/${features.length} features working`);
    
    if (passed === features.length) {
      console.log('🎉 ALL ENHANCED FEATURES WORKING PERFECTLY!');
      console.log('✅ Ready for production deployment!');
    } else {
      console.log(`⚠️  ${features.length - passed} features need attention`);
    }

  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
  }
}

finalTest();
