#!/usr/bin/env node

/**
 * Comprehensive Production Readiness Test
 * Tests all voice chat components end-to-end
 */

const https = require('https');
const WebSocket = require('ws');

const PRODUCTION_FRONTEND = 'https://isaac-mineo.vercel.app';
const PRODUCTION_BACKEND = 'https://isaac-mineo-api.onrender.com';

console.log('🔍 COMPREHENSIVE PRODUCTION READINESS TEST');
console.log('===========================================');
console.log(`Frontend: ${PRODUCTION_FRONTEND}`);
console.log(`Backend: ${PRODUCTION_BACKEND}`);
console.log('');

async function testAudioWorkletAccessibility() {
    console.log('1. 🎵 Testing AudioWorklet Processor Accessibility...');
    
    return new Promise((resolve) => {
        const url = `${PRODUCTION_FRONTEND}/voice-audio-processor.js`;
        console.log(`   Checking: ${url}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('   ✅ AudioWorklet processor accessible');
                    console.log(`   📦 Size: ${data.length} bytes`);
                    
                    // Check for key components
                    const hasProcessor = data.includes('VoiceAudioProcessor');
                    const hasRegister = data.includes('registerProcessor');
                    const hasAudioData = data.includes('audioData');
                    
                    console.log(`   🏗️ Has processor class: ${hasProcessor ? '✅' : '❌'}`);
                    console.log(`   📝 Has registration: ${hasRegister ? '✅' : '❌'}`);
                    console.log(`   🎤 Has audio processing: ${hasAudioData ? '✅' : '❌'}`);
                    
                    resolve({
                        accessible: true,
                        valid: hasProcessor && hasRegister && hasAudioData,
                        size: data.length
                    });
                } else {
                    console.log(`   ❌ AudioWorklet not accessible: ${res.statusCode}`);
                    resolve({ accessible: false, status: res.statusCode });
                }
            });
        }).on('error', (err) => {
            console.log(`   ❌ AudioWorklet fetch error: ${err.message}`);
            resolve({ accessible: false, error: err.message });
        });
    });
}

async function testVoiceServiceStatus() {
    console.log('\n2. 🎯 Testing Voice Service Status...');
    
    return new Promise((resolve) => {
        https.get(`${PRODUCTION_BACKEND}/api/voice/status`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const status = JSON.parse(data);
                    console.log('   📊 Voice Service Status:');
                    console.log(`   - Voice Enabled: ${status.voice_enabled ? '✅' : '❌'}`);
                    console.log(`   - Deepgram Available: ${status.deepgram_available ? '✅' : '❌'}`);
                    console.log(`   - ElevenLabs Available: ${status.elevenlabs_available ? '✅' : '❌'}`);
                    console.log(`   - Status: ${status.status}`);
                    
                    resolve({
                        working: status.voice_enabled && status.deepgram_available && status.elevenlabs_available,
                        details: status
                    });
                } catch (e) {
                    console.log(`   ❌ Invalid response: ${e.message}`);
                    resolve({ working: false, error: e.message });
                }
            });
        }).on('error', (err) => {
            console.log(`   ❌ Status check failed: ${err.message}`);
            resolve({ working: false, error: err.message });
        });
    });
}

async function testWebSocketVoiceChat() {
    console.log('\n3. 🔌 Testing WebSocket Voice Chat...');
    
    return new Promise((resolve) => {
        const wsUrl = 'wss://isaac-mineo-api.onrender.com/api/voice/chat';
        console.log(`   Connecting to: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        let receivedMessages = [];
        let timeout;
        
        ws.on('open', () => {
            console.log('   ✅ WebSocket connected');
            
            // Start session
            ws.send(JSON.stringify({
                type: 'start_session',
                session_id: `readiness_test_${Date.now()}`
            }));
            
            timeout = setTimeout(() => {
                console.log('   ⏱️ Test timeout');
                ws.close();
                resolve({
                    connected: true,
                    messages: receivedMessages,
                    voiceReady: receivedMessages.some(m => m.type === 'status' && m.voice_enabled)
                });
            }, 8000);
        });
        
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            receivedMessages.push(message);
            console.log(`   📨 Received: ${message.type} - ${message.message || 'no message'}`);
            
            if (message.type === 'status' && message.voice_enabled) {
                console.log('   ✅ Voice chat ready');
                
                // Test transcript processing
                ws.send(JSON.stringify({
                    type: 'process_transcript',
                    text: 'Production readiness test message',
                    session_id: `readiness_test_${Date.now()}`
                }));
            } else if (message.type === 'ai_response') {
                console.log('   ✅ AI response received');
                clearTimeout(timeout);
                ws.close();
                resolve({
                    connected: true,
                    messages: receivedMessages,
                    voiceReady: true,
                    aiWorking: true
                });
            }
        });
        
        ws.on('error', (error) => {
            console.log(`   ❌ WebSocket error: ${error.message}`);
            clearTimeout(timeout);
            resolve({ connected: false, error: error.message });
        });
        
        ws.on('close', () => {
            console.log('   🔌 WebSocket closed');
            clearTimeout(timeout);
        });
    });
}

async function testAudioSynthesis() {
    console.log('\n4. 🎵 Testing Audio Synthesis...');
    
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            text: 'Production readiness test for audio synthesis.',
            session_id: `audio_test_${Date.now()}`,
            return_audio: true
        });
        
        const options = {
            hostname: 'isaac-mineo-api.onrender.com',
            port: 443,
            path: '/api/voice/synthesize',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   ✅ Audio synthesis working');
                    console.log(`   📝 Response length: ${response.text ? response.text.length : 0} chars`);
                    console.log(`   🔊 Audio URL provided: ${!!response.audio_url}`);
                    resolve({ working: true, response });
                } catch (e) {
                    console.log(`   ❌ Invalid response: ${e.message}`);
                    resolve({ working: false, error: e.message });
                }
            });
        });
        
        req.on('error', (err) => {
            console.log(`   ❌ Request failed: ${err.message}`);
            resolve({ working: false, error: err.message });
        });
        
        req.write(postData);
        req.end();
    });
}

async function runComprehensiveTest() {
    console.log('🚀 Starting comprehensive production readiness test...\n');
    
    // Run all tests
    const audioWorkletResult = await testAudioWorkletAccessibility();
    const voiceStatusResult = await testVoiceServiceStatus();
    const webSocketResult = await testWebSocketVoiceChat();
    const audioSynthResult = await testAudioSynthesis();
    
    // Generate report
    console.log('\n📋 PRODUCTION READINESS REPORT');
    console.log('==============================');
    
    console.log(`\n🎵 AudioWorklet Processor:`);
    console.log(`   Accessible: ${audioWorkletResult.accessible ? '✅' : '❌'}`);
    console.log(`   Valid Content: ${audioWorkletResult.valid ? '✅' : '❌'}`);
    if (audioWorkletResult.size) console.log(`   File Size: ${audioWorkletResult.size} bytes`);
    
    console.log(`\n🎯 Backend Voice Services:`);
    console.log(`   Voice Enabled: ${voiceStatusResult.working ? '✅' : '❌'}`);
    if (voiceStatusResult.details) {
        console.log(`   Deepgram: ${voiceStatusResult.details.deepgram_available ? '✅' : '❌'}`);
        console.log(`   ElevenLabs: ${voiceStatusResult.details.elevenlabs_available ? '✅' : '❌'}`);
    }
    
    console.log(`\n🔌 WebSocket Voice Chat:`);
    console.log(`   Connection: ${webSocketResult.connected ? '✅' : '❌'}`);
    console.log(`   Voice Ready: ${webSocketResult.voiceReady ? '✅' : '❌'}`);
    console.log(`   AI Response: ${webSocketResult.aiWorking ? '✅' : '❌'}`);
    
    console.log(`\n🎵 Audio Synthesis:`);
    console.log(`   Working: ${audioSynthResult.working ? '✅' : '❌'}`);
    
    // Overall assessment
    const allSystemsReady = 
        audioWorkletResult.accessible && audioWorkletResult.valid &&
        voiceStatusResult.working &&
        webSocketResult.connected && webSocketResult.voiceReady && webSocketResult.aiWorking &&
        audioSynthResult.working;
    
    console.log(`\n🎯 OVERALL PRODUCTION READINESS:`);
    if (allSystemsReady) {
        console.log('✅ ALL SYSTEMS READY FOR PRODUCTION');
        console.log('🎤 Voice chat should work reliably with:');
        console.log('   - Real microphone input via AudioWorkletNode');
        console.log('   - Live transcription via Deepgram WebSocket');
        console.log('   - AI responses via OpenAI');
        console.log('   - Audio synthesis via ElevenLabs');
    } else {
        console.log('⚠️  SOME ISSUES DETECTED');
        if (!audioWorkletResult.accessible || !audioWorkletResult.valid) {
            console.log('❌ AudioWorklet processor issues - will use fallback');
        }
        if (!voiceStatusResult.working) {
            console.log('❌ Backend voice services not ready');
        }
        if (!webSocketResult.connected || !webSocketResult.voiceReady) {
            console.log('❌ WebSocket voice chat not ready');
        }
        if (!audioSynthResult.working) {
            console.log('❌ Audio synthesis not working');
        }
    }
    
    return {
        audioWorklet: audioWorkletResult,
        voiceStatus: voiceStatusResult,
        webSocket: webSocketResult,
        audioSynth: audioSynthResult,
        ready: allSystemsReady
    };
}

// Run the test
runComprehensiveTest().then(results => {
    console.log('\n🏁 Test completed!');
    if (results.ready) {
        console.log('🎉 Production voice chat is ready to go!');
    } else {
        console.log('🔧 Some components need attention before production use.');
    }
});
