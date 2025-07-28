const BACKEND_URL = 'https://isaac-mineo-api.onrender.com';

console.log('🔍 PRODUCTION SESSION DIAGNOSTIC TEST');

async function testSessionStorage() {
    try {
        // First request
        console.log('\n📋 Request 1: Creating new session');
        const response1 = await fetch(`${BACKEND_URL}/api/chatbot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: "Hello, what's your name?" })
        });

        const data1 = await response1.json();
        console.log(`Session ID: ${data1.sessionId}`);
        console.log(`Conversation Length: ${data1.conversationLength}`);
        console.log(`Response: ${data1.response.substring(0, 100)}...`);

        // Second request with same session
        console.log('\n📋 Request 2: Continuing same session');
        const response2 = await fetch(`${BACKEND_URL}/api/chatbot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: "What did I just ask you?",
                sessionId: data1.sessionId 
            })
        });

        const data2 = await response2.json();
        console.log(`Session ID: ${data2.sessionId}`);
        console.log(`Conversation Length: ${data2.conversationLength}`);
        console.log(`Context Used: ${JSON.stringify(data2.contextUsed)}`);
        console.log(`Response: ${data2.response.substring(0, 100)}...`);

        // Analysis
        console.log('\n🎯 DIAGNOSTIC RESULTS:');
        console.log(`✅ Session ID consistent: ${data1.sessionId === data2.sessionId}`);
        console.log(`${data2.conversationLength > 1 ? '✅' : '❌'} Conversation tracking: ${data2.conversationLength > 1 ? 'WORKING' : 'FAILED'}`);
        console.log(`${data2.contextUsed && data2.contextUsed.length > 0 ? '✅' : '❌'} Context awareness: ${data2.contextUsed && data2.contextUsed.length > 0 ? 'WORKING' : 'FAILED'}`);

        if (data2.conversationLength <= 1) {
            console.log('\n⚠️  Session storage appears to be failing in production');
            console.log('Possible causes:');
            console.log('- Redis connection issues');
            console.log('- Session cache not persisting between requests');
            console.log('- Cache manager not properly initialized');
        }

    } catch (error) {
        console.error('❌ Diagnostic test failed:', error.message);
    }
}

testSessionStorage();
