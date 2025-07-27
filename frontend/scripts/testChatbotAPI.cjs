#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

async function testChatbotAPI() {
    console.log('🔗 Testing full chatbot API endpoint...\n');
    
    try {
        // Test the actual API endpoint that the frontend uses
        const response = await fetch('http://localhost:3000/api/chatbot-ultimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': 'test-session-123'
            },
            body: JSON.stringify({
                question: "What are Isaac's main technical skills?",
                sessionId: 'test-session-123'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ API Response:');
        console.log('Response:', data.response);
        console.log('Session ID:', data.sessionId);
        console.log('Search Method:', data.searchMethod);
        console.log('Conversation Length:', data.conversationLength);
        console.log('Cached:', data.cached || false);
        console.log('Timestamp:', data.timestamp);
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('⚠️  Development server not running. Start it with: npm run dev');
            console.log('🧪 Testing knowledge base search directly instead...\n');
            
            // Test the knowledge base search function directly
            try {
                const { searchKnowledgeBase } = await import('../src/utils/pineconeEnhanced.js');
                const { OpenAI } = await import('openai');
                
                const openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
                
                const result = await searchKnowledgeBase("What are Isaac's main technical skills?", openai);
                console.log('✅ Knowledge Base Search Result:');
                console.log(result);
                
            } catch (searchError) {
                console.error('❌ Knowledge base search failed:', searchError.message);
            }
        } else {
            console.error('❌ API test failed:', error.message);
        }
    }
}

testChatbotAPI();
