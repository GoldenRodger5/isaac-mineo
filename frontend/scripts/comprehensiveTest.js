#!/usr/bin/env node

// Comprehensive Test Suite for Enhanced FastAPI Chatbot
// Tests: Session Management, Entity Tracking, Context Awareness, Caching, RAG

const API_BASE = 'https://isaac-mineo-api.onrender.com/api/chatbot';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEnhancedChatbot() {
  console.log('🧪 Testing Enhanced FastAPI Chatbot Features\n');
  console.log('Testing URL:', API_BASE);
  console.log('=' * 60);

  let sessionId = null;
  let testResults = {
    sessionManagement: false,
    entityTracking: false,
    contextAwareness: false,
    caching: false,
    ragSearch: false,
    conversationLength: false
  };

  try {
    // Test 1: Initial Question + Session Creation
    console.log('\n📋 Test 1: Session Management & RAG Search');
    console.log('Question: "Tell me about Nutrivize"');
    
    const response1 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Tell me about Nutrivize",
        sessionId: null
      })
    });

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }

    const data1 = await response1.json();
    sessionId = data1.sessionId;
    
    console.log(`✅ Response received (${data1.response.length} chars)`);
    console.log(`📊 Session ID: ${sessionId}`);
    console.log(`🔍 Search Method: ${data1.searchMethod}`);
    console.log(`💬 Conversation Length: ${data1.conversationLength}`);
    console.log(`🏷️  Entities: ${JSON.stringify(data1.entities || {})}`);
    
    // Validate Test 1
    if (sessionId && data1.searchMethod === 'vector_search') {
      testResults.sessionManagement = true;
      testResults.ragSearch = true;
      console.log('✅ Session Management: PASSED');
      console.log('✅ RAG Vector Search: PASSED');
    }

    if (data1.entities && data1.entities.projects && data1.entities.projects.includes('nutrivize')) {
      testResults.entityTracking = true;
      console.log('✅ Entity Tracking: PASSED');
    }

    // Test 2: Context-Aware Follow-up
    console.log('\n📋 Test 2: Context Awareness & Entity Tracking');
    console.log('Question: "What\'s the tech stack?" (should understand context = Nutrivize)');
    
    await sleep(1000); // Brief pause
    
    const response2 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "What's the tech stack?",
        sessionId: sessionId
      })
    });

    const data2 = await response2.json();
    
    console.log(`✅ Response received (${data2.response.length} chars)`);
    console.log(`🔍 Search Method: ${data2.searchMethod}`);
    console.log(`💬 Conversation Length: ${data2.conversationLength}`);
    console.log(`🏷️  Entities: ${JSON.stringify(data2.entities || {})}`);
    console.log(`🧠 Context Used: ${JSON.stringify(data2.contextUsed || [])}`);
    
    // Validate Test 2
    if (data2.conversationLength > data1.conversationLength) {
      testResults.conversationLength = true;
      console.log('✅ Conversation Length Tracking: PASSED');
    }

    if (data2.contextUsed && data2.contextUsed.length > 0) {
      testResults.contextAwareness = true;
      console.log('✅ Context Awareness: PASSED');
    }

    // Test 3: Caching Test (same question)
    console.log('\n📋 Test 3: Response Caching');
    console.log('Question: "Tell me about Nutrivize" (same as first - should be cached)');
    
    const startTime = Date.now();
    
    const response3 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Tell me about Nutrivize",
        sessionId: sessionId
      })
    });

    const data3 = await response3.json();
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Response received in ${responseTime}ms`);
    console.log(`🔍 Search Method: ${data3.searchMethod}`);
    console.log(`💾 Cached: ${data3.cached || false}`);
    
    // Validate Test 3
    if (data3.cached || data3.searchMethod === 'cached' || responseTime < 500) {
      testResults.caching = true;
      console.log('✅ Response Caching: PASSED');
    }

    // Test 4: Context Switch (different project)
    console.log('\n📋 Test 4: Context Switching');
    console.log('Question: "Tell me about EchoPod" (new context)');
    
    const response4 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Tell me about EchoPod",
        sessionId: sessionId
      })
    });

    const data4 = await response4.json();
    
    console.log(`✅ Response received (${data4.response.length} chars)`);
    console.log(`🏷️  Entities: ${JSON.stringify(data4.entities || {})}`);
    console.log(`💬 Conversation Length: ${data4.conversationLength}`);

    // Test 5: Follow-up with new context
    console.log('\n📋 Test 5: New Context Follow-up');
    console.log('Question: "What technologies does it use?" (should refer to EchoPod now)');
    
    const response5 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "What technologies does it use?",
        sessionId: sessionId
      })
    });

    const data5 = await response5.json();
    
    console.log(`✅ Response received (${data5.response.length} chars)`);
    console.log(`🧠 Context Used: ${JSON.stringify(data5.contextUsed || [])}`);
    console.log(`💬 Final Conversation Length: ${data5.conversationLength}`);

    // Results Summary
    console.log('\n' + '=' * 60);
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('=' * 60);
    
    const passed = Object.values(testResults).filter(Boolean).length;
    const total = Object.keys(testResults).length;
    
    for (const [feature, result] of Object.entries(testResults)) {
      const status = result ? '✅ PASSED' : '❌ FAILED';
      const featureName = feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${status}: ${featureName}`);
    }
    
    console.log(`\n🏆 Overall Score: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 ALL ENHANCED FEATURES WORKING PERFECTLY!');
    } else if (passed >= total * 0.8) {
      console.log('✅ Most features working - minor issues detected');
    } else {
      console.log('⚠️  Some issues detected - check individual test results');
    }

    // Feature Status
    console.log('\n🔧 FEATURE STATUS:');
    console.log(`📊 Session Management: ${testResults.sessionManagement ? 'Active' : 'Inactive'}`);
    console.log(`🏷️  Entity Tracking: ${testResults.entityTracking ? 'Active' : 'Inactive'}`);
    console.log(`🧠 Context Awareness: ${testResults.contextAwareness ? 'Active' : 'Inactive'}`);
    console.log(`💾 Response Caching: ${testResults.caching ? 'Active' : 'Inactive'}`);
    console.log(`🔍 RAG Vector Search: ${testResults.ragSearch ? 'Active' : 'Inactive'}`);
    console.log(`💬 Conversation Tracking: ${testResults.conversationLength ? 'Active' : 'Inactive'}`);

  } catch (error) {
    console.error(`\n❌ Test Suite Failed: ${error.message}`);
    console.log('\n💡 Possible Issues:');
    console.log('   - Backend server might be down');
    console.log('   - Network connectivity issues');
    console.log('   - API endpoint configuration problems');
    console.log('   - Environment variables not set correctly');
    
    process.exit(1);
  }
}

// Run the comprehensive test
testEnhancedChatbot();
