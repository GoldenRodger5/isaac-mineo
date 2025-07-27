#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

async function testLiveChatbot() {
    console.log('🤖 Testing Live Chatbot with Knowledge Base Integration...\n');
    
    const testQuestions = [
        "What makes Isaac a strong backend developer?",
        "Can you tell me about Isaac's AI experience?", 
        "What educational background does Isaac have?",
        "How would Isaac fit into a startup environment?"
    ];
    
    for (let i = 0; i < testQuestions.length; i++) {
        const question = testQuestions[i];
        console.log(`\n📝 Question ${i + 1}: "${question}"`);
        console.log('─'.repeat(60));
        
        try {
            const response = await fetch('http://localhost:5174/api/chatbot-ultimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': 'test-session-live'
                },
                body: JSON.stringify({
                    question: question,
                    sessionId: 'test-session-live'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('✅ Response:');
            console.log(data.response);
            console.log(`\n📊 Metadata:`);
            console.log(`   Search Method: ${data.searchMethod}`);
            console.log(`   Cached: ${data.cached || false}`);
            console.log(`   Conversation Length: ${data.conversationLength}`);
            
            // Wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ Error for question ${i + 1}:`, error.message);
        }
    }
    
    console.log('\n🎯 Analysis:');
    console.log('Look for:');
    console.log('- Professional, conversational tone');
    console.log('- Specific details from knowledge base');
    console.log('- Synthesized responses, not raw data');
    console.log('- Context-aware answers');
}

testLiveChatbot();
