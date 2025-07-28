#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testEnhancedSessionContext() {
  console.log('🧪 Testing Enhanced Session Context Chatbot...\n');

  const API_BASE = 'https://isaac-mineo-api.onrender.com/api/chatbot';

async function testEnhancedSessionContext() {
  console.log('🧪 Testing Enhanced Session Context Chatbot...
');
  
  try {
    console.log(`🔗 API Base: ${API_BASE}`);
    
    // Test 1: Initial question about Nutrivize
    console.log('📋 Test 1: Initial question about Nutrivize');
    const response1 = await fetch(API_BASE, {

  console.log(`🔗 Testing API at: ${baseURL}`);

  // Test conversation flow to demonstrate context awareness
  const conversationFlow = [
    "Tell me about Nutrivize",
    "What's the tech stack?", // Should understand this refers to Nutrivize
    "How does the food recognition work?", // Should maintain Nutrivize context
    "What other projects has Isaac worked on?",
    "Tell me about Quizium", // New context
    "What technologies were used?", // Should now refer to Quizium
  ];

  let sessionId = null;

  for (let i = 0; i < conversationFlow.length; i++) {
    const question = conversationFlow[i];
    console.log(`\n${i + 1}. 👤 User: "${question}"`);

    try {
      const response = await fetch(`${baseURL}/chatbot-ultimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update session ID for next request
      if (data.sessionId) {
        sessionId = data.sessionId;
      }

      console.log(`🤖 AI: ${data.response}`);
      console.log(`📊 Context: ${data.searchMethod} | Conversation: ${data.conversationLength} exchanges`);
      
      if (data.cached) {
        console.log('💾 Response was cached');
      }

      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎯 Test Analysis:');
  console.log('✅ Look for context-aware responses where follow-up questions');
  console.log('   like "What\'s the tech stack?" correctly infer the subject');
  console.log('✅ Session should maintain conversation flow across questions');
  console.log('✅ Entity tracking should remember mentioned projects/topics');
  
  console.log(`\n📝 Session ID used: ${sessionId}`);
  console.log('\n🎉 Enhanced session context test completed!');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted, shutting down gracefully...');
  process.exit(0);
});

testEnhancedSessionContext().catch(console.error);
