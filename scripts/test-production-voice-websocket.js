// Production WebSocket Voice Chat Test
// Test the actual WebSocket voice chat functionality in production

const PRODUCTION_URL = 'https://isaac-mineo-api.onrender.com';

console.log('🎤 PRODUCTION WEBSOCKET VOICE TEST');
console.log('===================================');

async function testProductionWebSocketVoice() {
    try {
        // Test WebSocket connection
        console.log('\n1. 🔌 Testing WebSocket Connection...');
        
        // Use Node.js WebSocket for testing
        const WebSocket = require('ws');
        const wsUrl = 'wss://isaac-mineo-api.onrender.com/api/voice/chat';
        
        console.log(`   Connecting to: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        
        return new Promise((resolve, reject) => {
            let receivedMessages = [];
            let timeout;
            
            ws.on('open', () => {
                console.log('   ✅ WebSocket Connected');
                
                // Start session
                ws.send(JSON.stringify({
                    type: 'start_session',
                    session_id: `prod_test_${Date.now()}`
                }));
                
                // Set timeout for test completion
                timeout = setTimeout(() => {
                    console.log('   ⏱️  Test timeout reached');
                    ws.close();
                    resolve({
                        connected: true,
                        messages: receivedMessages,
                        issue: 'No response to audio data (timeout)'
                    });
                }, 10000); // 10 second timeout
            });
            
            ws.on('message', (data) => {
                const message = JSON.parse(data.toString());
                receivedMessages.push(message);
                
                console.log(`   📨 Received: ${message.type} - ${message.message || message.text || 'no message'}`);
                
                if (message.type === 'status' && message.voice_enabled) {
                    console.log('   ✅ Voice enabled in WebSocket');
                    
                    // Simulate sending text for processing (instead of audio)
                    console.log('   📤 Testing text processing...');
                    ws.send(JSON.stringify({
                        type: 'process_transcript',
                        text: 'Hello, this is a production test',
                        session_id: `prod_test_${Date.now()}`
                    }));
                    
                } else if (message.type === 'ai_response') {
                    console.log('   ✅ AI Response received!');
                    clearTimeout(timeout);
                    ws.close();
                    resolve({
                        connected: true,
                        messages: receivedMessages,
                        aiWorking: true,
                        issue: null
                    });
                } else if (message.type === 'error') {
                    console.log(`   ❌ Error received: ${message.message}`);
                    clearTimeout(timeout);
                    ws.close();
                    resolve({
                        connected: true,
                        messages: receivedMessages,
                        error: message.message,
                        issue: 'WebSocket error'
                    });
                }
            });
            
            ws.on('error', (error) => {
                console.log(`   ❌ WebSocket Error: ${error.message}`);
                clearTimeout(timeout);
                reject({
                    connected: false,
                    error: error.message,
                    issue: 'Connection failed'
                });
            });
            
            ws.on('close', () => {
                console.log('   🔌 WebSocket Closed');
                clearTimeout(timeout);
            });
        });
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        return {
            connected: false,
            error: error.message,
            issue: 'Test setup failed'
        };
    }
}

async function testProductionAudioEndpoint() {
    console.log('\n2. 🎵 Testing Direct Audio Synthesis...');
    
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/voice/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: 'Testing production voice synthesis functionality.',
                session_id: `prod_audio_test_${Date.now()}`,
                return_audio: true
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Audio synthesis working');
            console.log(`   📝 Response text: ${data.text ? data.text.substring(0, 50) + '...' : 'No text'}`);
            console.log(`   🔊 Audio URL present: ${!!data.audio_url}`);
            return { working: true, data };
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Audio synthesis failed: ${response.status}`);
            console.log(`   Error: ${errorText}`);
            return { working: false, error: errorText };
        }
        
    } catch (error) {
        console.log(`   ❌ Audio test error: ${error.message}`);
        return { working: false, error: error.message };
    }
}

async function runProductionVoiceTest() {
    console.log('\n🎯 Testing Production Voice Chat Functionality...\n');
    
    // Test 1: WebSocket functionality
    const wsResult = await testProductionWebSocketVoice();
    
    // Test 2: Direct audio synthesis
    const audioResult = await testProductionAudioEndpoint();
    
    // Results summary
    console.log('\n📋 PRODUCTION VOICE TEST RESULTS');
    console.log('=================================');
    
    console.log(`WebSocket Connection: ${wsResult.connected ? '✅ CONNECTED' : '❌ FAILED'}`);
    console.log(`AI Response Processing: ${wsResult.aiWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`Audio Synthesis: ${audioResult.working ? '✅ WORKING' : '❌ FAILED'}`);
    
    if (wsResult.issue) {
        console.log(`\n🔍 Issue Identified: ${wsResult.issue}`);
    }
    
    if (wsResult.error || audioResult.error) {
        console.log('\n❌ Errors Found:');
        if (wsResult.error) console.log(`  WebSocket: ${wsResult.error}`);
        if (audioResult.error) console.log(`  Audio: ${audioResult.error}`);
    }
    
    // Diagnosis
    console.log('\n🩺 DIAGNOSIS:');
    if (wsResult.connected && audioResult.working) {
        if (wsResult.aiWorking) {
            console.log('✅ All systems operational - check client-side audio processing');
            console.log('💡 Likely issue: Audio data format or microphone permissions in browser');
        } else {
            console.log('⚠️  WebSocket connects but audio processing not working');
            console.log('💡 Likely issue: Audio data not being processed correctly on server');
        }
    } else {
        console.log('❌ Core functionality issues found');
        console.log('💡 Check server logs and environment variables');
    }
    
    return {
        websocket: wsResult,
        audio: audioResult
    };
}

// Auto-run when in Node.js environment
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    const WebSocket = require('ws');
    runProductionVoiceTest();
} else {
    // Browser environment
    console.log('🌐 Running in browser - manual execution available');
    window.runProductionVoiceTest = runProductionVoiceTest;
}
