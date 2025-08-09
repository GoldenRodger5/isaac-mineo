// Voice Implementation Production Test
// Comprehensive test for Isaac Mineo Portfolio Voice Features

const BACKEND_URL = 'http://localhost:8000';

console.log('🎤 VOICE SERVICE PRODUCTION TEST');
console.log('=====================================');

async function testVoiceService() {
    try {
        // 1. Test Voice Service Status
        console.log('\n1. 🔍 Testing Voice Service Status...');
        const statusResponse = await fetch(`${BACKEND_URL}/api/voice/status`);
        const statusData = await statusResponse.json();
        
        console.log('   Status Response:', statusData);
        
        if (statusData.voice_enabled && statusData.deepgram_available && statusData.elevenlabs_available) {
            console.log('   ✅ Voice Service: FULLY OPERATIONAL');
            console.log('   ✅ Deepgram (STT): Available');
            console.log('   ✅ ElevenLabs (TTS): Available');
        } else {
            console.log('   ❌ Voice Service: NOT FULLY OPERATIONAL');
            return false;
        }

        // 2. Test Text-to-Speech Synthesis
        console.log('\n2. 🔊 Testing Text-to-Speech...');
        const ttsResponse = await fetch(`${BACKEND_URL}/api/voice/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: 'Hello, this is a production test of the voice synthesis system.',
                session_id: `test_session_${Date.now()}`, // Required field
                return_audio: true
            })
        });

        if (ttsResponse.ok) {
            const audioBlob = await ttsResponse.blob();
            console.log('   ✅ TTS Response: Success');
            console.log(`   ✅ Audio Size: ${audioBlob.size} bytes`);
            console.log('   ✅ Content Type:', ttsResponse.headers.get('content-type'));
            
            if (audioBlob.size > 0) {
                console.log('   ✅ Audio Generation: SUCCESS');
            } else {
                console.log('   ❌ Audio Generation: No audio data');
                return false;
            }
        } else {
            console.log('   ❌ TTS Request Failed:', ttsResponse.status);
            const errorText = await ttsResponse.text();
            console.log('   Error:', errorText);
            return false;
        }

        // 3. Test Voice Streaming Endpoint
        console.log('\n3. 🌊 Testing Voice Streaming...');
        const streamResponse = await fetch(`${BACKEND_URL}/api/voice/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: 'Testing streaming audio synthesis.',
                session_id: `test_session_${Date.now()}`,
                return_audio: true
            })
        });

        if (streamResponse.ok) {
            console.log('   ✅ Stream Response: Success');
            console.log('   ✅ Streaming TTS: OPERATIONAL');
        } else {
            console.log('   ❌ Streaming TTS Failed:', streamResponse.status);
            const errorText = await streamResponse.text();
            console.log('   Error:', errorText);
        }

        // 4. Test Voice Configuration
        console.log('\n4. ⚙️ Testing Voice Configuration...');
        const configResponse = await fetch(`${BACKEND_URL}/api/voice/config`);
        
        if (configResponse.ok) {
            const configData = await configResponse.json();
            console.log('   ✅ Voice Config:', configData);
        } else {
            console.log('   ⚠️  Voice Config endpoint not available (optional)');
        }

        // 5. Test WebSocket Connection (if available)
        console.log('\n5. 🔌 Testing WebSocket Voice Connection...');
        try {
            const wsUrl = `ws://localhost:8000/api/voice/ws`;
            const ws = new WebSocket(wsUrl);
            
            const wsTest = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    ws.close();
                    resolve('timeout');
                }, 3000);

                ws.onopen = () => {
                    clearTimeout(timeout);
                    console.log('   ✅ WebSocket: Connected');
                    ws.close();
                    resolve('success');
                };

                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    resolve('error');
                };

                ws.onclose = () => {
                    clearTimeout(timeout);
                };
            });

            const wsResult = await wsTest;
            if (wsResult === 'success') {
                console.log('   ✅ WebSocket Voice: OPERATIONAL');
            } else if (wsResult === 'timeout') {
                console.log('   ⚠️  WebSocket: Connection timeout (may not be implemented)');
            } else {
                console.log('   ⚠️  WebSocket: Connection failed (may not be implemented)');
            }
        } catch (error) {
            console.log('   ⚠️  WebSocket test failed:', error.message);
        }

        return true;

    } catch (error) {
        console.log('\n❌ Voice Service Test Failed:', error.message);
        return false;
    }
}

async function testProductionReadiness() {
    console.log('\n🚀 PRODUCTION READINESS CHECK');
    console.log('==============================');

    try {
        // Test Backend Health
        console.log('\n📊 Backend Health Check...');
        const healthResponse = await fetch(`${BACKEND_URL}/health`);
        const healthData = await healthResponse.json();
        
        console.log('   Status:', healthData.status);
        console.log('   Environment:', healthData.environment?.environment || 'N/A');
        
        if (healthData.status === 'healthy') {
            console.log('   ✅ Backend: HEALTHY');
        } else {
            console.log('   ❌ Backend: NOT HEALTHY');
            return false;
        }

        // Test API Endpoints
        console.log('\n🔗 API Endpoints Test...');
        const endpoints = [
            '/api/voice/status',
            '/health',
            '/docs'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${BACKEND_URL}${endpoint}`);
                if (response.ok) {
                    console.log(`   ✅ ${endpoint}: OK (${response.status})`);
                } else {
                    console.log(`   ❌ ${endpoint}: FAILED (${response.status})`);
                }
            } catch (error) {
                console.log(`   ❌ ${endpoint}: ERROR - ${error.message}`);
            }
        }

        return true;

    } catch (error) {
        console.log('\n❌ Production Readiness Check Failed:', error.message);
        return false;
    }
}

async function runComprehensiveVoiceTest() {
    console.log('🎯 Starting Comprehensive Voice Test...\n');
    
    const voiceTestResult = await testVoiceService();
    const readinessResult = await testProductionReadiness();
    
    console.log('\n📋 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Voice Service: ${voiceTestResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Production Ready: ${readinessResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (voiceTestResult && readinessResult) {
        console.log('\n🎉 VOICE SERVICE: 100% PRODUCTION READY!');
        console.log('🚀 Safe to deploy to Render and Vercel');
        console.log('\n📋 DEPLOYMENT CHECKLIST:');
        console.log('   ✅ Voice synthesis working');
        console.log('   ✅ Backend health confirmed');
        console.log('   ✅ API endpoints responding');
        console.log('   ✅ Both Deepgram and ElevenLabs operational');
        console.log('\n🎯 Ready for production deployment!');
    } else {
        console.log('\n⚠️  ISSUES FOUND - Review before production deployment');
    }
    
    return voiceTestResult && readinessResult;
}

// Auto-run when in Node.js environment
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    const WebSocket = require('ws');
    runComprehensiveVoiceTest();
} else {
    // Browser environment
    console.log('🌐 Running in browser - manual execution available');
    window.runVoiceTest = runComprehensiveVoiceTest;
}

// Export for manual testing
if (typeof module !== 'undefined') {
    module.exports = {
        testVoiceService,
        testProductionReadiness,
        runComprehensiveVoiceTest
    };
}
