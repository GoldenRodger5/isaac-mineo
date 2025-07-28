const BACKEND_URL = 'https://isaac-mineo-api.onrender.com';

console.log('🚀 PRODUCTION TEST - Enhanced FastAPI Chatbot');
console.log('Backend URL:', BACKEND_URL);

async function testProduction() {
    try {
        // Test 1: Session Creation & Entity Tracking
        console.log('\n📋 Test 1: Production Session Creation & Entity Tracking');
        const startTime1 = Date.now();
        
        const response1 = await fetch(`${BACKEND_URL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: "Tell me about the Nutrivize project you worked on"
            })
        });

        if (!response1.ok) {
            throw new Error(`HTTP error! status: ${response1.status}`);
        }

        const data1 = await response1.json();
        const time1 = Date.now() - startTime1;
        
        console.log(`✅ Response (${time1}ms, ${data1.response.length} chars)`);
        console.log(`📊 Session: ${data1.sessionId}`);
        console.log(`🔍 Search: ${data1.searchMethod || 'not specified'}`);
        console.log(`🏷️  Entities: ${JSON.stringify(data1.entities || {})}`);
        console.log(`💬 Length: ${data1.conversationLength || 0}`);

        const sessionId = data1.sessionId;

        // Test 2: Context Awareness
        console.log('\n📋 Test 2: Production Context Awareness');
        const startTime2 = Date.now();
        
        const response2 = await fetch(`${BACKEND_URL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: "What technologies were used in that project?",
                sessionId: sessionId
            })
        });

        if (!response2.ok) {
            throw new Error(`HTTP error! status: ${response2.status}`);
        }

        const data2 = await response2.json();
        const time2 = Date.now() - startTime2;
        
        console.log(`✅ Response (${time2}ms, ${data2.response.length} chars)`);
        console.log(`🏷️  Entities: ${JSON.stringify(data2.entities || {})}`);
        console.log(`🧠 Context: ${JSON.stringify(data2.contextUsed || [])}`);
        console.log(`💬 Length: ${data2.conversationLength || 0}`);

        // Test 3: Response Caching
        console.log('\n📋 Test 3: Production Response Caching');
        const startTime3 = Date.now();
        
        const response3 = await fetch(`${BACKEND_URL}/api/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: "Tell me about your experience with React",
                sessionId: sessionId
            })
        });

        if (!response3.ok) {
            throw new Error(`HTTP error! status: ${response3.status}`);
        }

        const data3 = await response3.json();
        const time3 = Date.now() - startTime3;
        
        console.log(`✅ Response (${time3}ms, ${data3.response.length} chars)`);
        console.log(`💾 Cached: ${data3.cached || false}`);
        console.log(`🔍 Search: ${data3.searchMethod || 'not specified'}`);

        // Summary
        console.log('\n============================================================');
        console.log('🏆 PRODUCTION TEST RESULTS');
        console.log('============================================================');
        
        const features = [
            { name: 'Session Management', working: !!sessionId },
            { name: 'Entity Tracking', working: !!(data1.entities || data2.entities) },
            { name: 'Context Awareness', working: !!(data2.contextUsed && data2.contextUsed.length > 0) },
            { name: 'Conversation Tracking', working: (data2.conversationLength || 0) > 1 },
            { name: 'RAG Vector Search', working: !!(data1.searchMethod || data3.searchMethod) },
            { name: 'Response Caching', working: data3.cached === true }
        ];

        let passCount = 0;
        features.forEach(feature => {
            const status = feature.working ? '✅ PASSED' : '❌ FAILED';
            console.log(`${status}: ${feature.name}`);
            if (feature.working) passCount++;
        });

        console.log(`\n🎯 Score: ${passCount}/${features.length} features working`);
        if (passCount < features.length) {
            console.log(`⚠️  ${features.length - passCount} features need attention`);
        } else {
            console.log('🎉 ALL ENHANCED FEATURES WORKING IN PRODUCTION!');
        }

    } catch (error) {
        console.error('❌ Production test failed:', error.message);
        console.error('Full error:', error);
    }
}

testProduction();
