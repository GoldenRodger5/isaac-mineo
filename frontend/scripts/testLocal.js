#!/usr/bin/env node

// Local Test for Enhanced Features
const API_BASE = 'http://localhost:8001/api/chatbot';

async function testLocalEnhanced() {
  console.log('🧪 Testing Enhanced Features Locally\n');
  
  try {
    // Test 1: Entity Extraction
    console.log('📋 Test 1: Entity Extraction');
    const response1 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Tell me about Nutrivize",
        sessionId: null
      })
    });

    const data1 = await response1.json();
    console.log(`Session ID: ${data1.sessionId}`);
    console.log(`Entities: ${JSON.stringify(data1.entities)}`);
    console.log(`Conversation Length: ${data1.conversationLength}`);
    
    // Test 2: Context Awareness
    console.log('\n📋 Test 2: Context Awareness');
    const response2 = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "What's the tech stack?",
        sessionId: data1.sessionId
      })
    });

    const data2 = await response2.json();
    console.log(`Entities: ${JSON.stringify(data2.entities)}`);
    console.log(`Context Used: ${JSON.stringify(data2.contextUsed)}`);
    console.log(`Conversation Length: ${data2.conversationLength}`);
    
    if (data2.conversationLength > data1.conversationLength) {
      console.log('✅ Conversation tracking working!');
    } else {
      console.log('❌ Conversation tracking issue');
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

testLocalEnhanced();
