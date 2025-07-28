#!/usr/bin/env node

// Quick test to verify the chatbot-ultimate API is working
async function quickTest() {
  console.log('🔍 Quick API Test...\n');
  
  const baseURL = 'https://isaac-mineo-api.onrender.com/api';
  console.log(`Testing: ${baseURL}/chatbot`);

  try {
    const response = await fetch(`${baseURL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: "Tell me about Nutrivize",
        sessionId: null
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response received!');
    console.log(`🤖 Response: ${data.response.substring(0, 100)}...`);
    console.log(`📊 Session ID: ${data.sessionId}`);
    console.log(`🔍 Search Method: ${data.searchMethod}`);
    console.log(`💬 Conversation Length: ${data.conversationLength}`);
    
    // Test follow-up question
    console.log('\n🔄 Testing follow-up question...');
    
    const followUpResponse = await fetch(`${baseURL}/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: "What's the tech stack?",
        sessionId: data.sessionId
      }),
    });

    const followUpData = await followUpResponse.json();
    console.log(`🤖 Follow-up: ${followUpData.response.substring(0, 100)}...`);
    console.log(`💬 Conversation Length: ${followUpData.conversationLength}`);
    
    console.log('\n🎉 Enhanced context chatbot is working!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log('\n💡 This might be expected if the backend is not running');
    console.log('   Try testing locally or check backend deployment');
  }
}

quickTest();
