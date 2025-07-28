console.log('🔧 PRODUCTION REDIS DIAGNOSTIC TEST');

async function testRedisConnectivity() {
    try {
        // Test Redis connectivity through cache manager health check
        console.log('\n📋 Testing Redis connectivity...');
        
        const response = await fetch('https://isaac-mineo-api.onrender.com/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const healthData = await response.json();
        console.log('Health check response:', JSON.stringify(healthData, null, 2));

        // Test a simple cache operation
        console.log('\n📋 Testing cache functionality...');
        
        const testResponse = await fetch('https://isaac-mineo-api.onrender.com/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: "Test cache" })
        });

        const testData = await testResponse.json();
        console.log(`Response cached: ${testData.cached}`);
        console.log(`Session created: ${!!testData.sessionId}`);

        // Immediate follow-up to test session retrieval
        const followUpResponse = await fetch('https://isaac-mineo-api.onrender.com/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: "Previous test",
                sessionId: testData.sessionId 
            })
        });

        const followUpData = await followUpResponse.json();
        console.log(`Follow-up conversation length: ${followUpData.conversationLength}`);
        
        if (followUpData.conversationLength <= 1) {
            console.log('\n❌ REDIS/CACHE ISSUE CONFIRMED');
            console.log('Session data is not persisting between requests');
            console.log('This indicates Redis connection or cache manager issues in production');
        } else {
            console.log('\n✅ Redis appears to be working correctly');
        }

    } catch (error) {
        console.error('❌ Redis diagnostic failed:', error.message);
    }
}

testRedisConnectivity();
