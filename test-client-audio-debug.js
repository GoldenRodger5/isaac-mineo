// Client-Side Audio Debug Test
// Test the exact audio processing pipeline that the frontend is using

console.log('🎤 CLIENT-SIDE AUDIO DEBUG TEST');
console.log('================================');

async function testClientAudioProcessing() {
    // Test 1: Microphone Access
    console.log('\n1. 🎙️ Testing Microphone Access...');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
        console.log('   ✅ Microphone access granted');
        console.log(`   📊 Audio tracks: ${stream.getAudioTracks().length}`);
        
        const audioTrack = stream.getAudioTracks()[0];
        const settings = audioTrack.getSettings();
        console.log(`   🔧 Sample Rate: ${settings.sampleRate}Hz`);
        console.log(`   🔧 Channel Count: ${settings.channelCount}`);
        
        // Stop stream after testing
        stream.getTracks().forEach(track => track.stop());
        
    } catch (error) {
        console.log(`   ❌ Microphone access failed: ${error.message}`);
        return { microphoneAccess: false, error: error.message };
    }
    
    // Test 2: AudioContext Creation
    console.log('\n2. 🔊 Testing AudioContext...');
    
    let audioContext;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000
        });
        
        console.log('   ✅ AudioContext created');
        console.log(`   📊 Sample Rate: ${audioContext.sampleRate}Hz`);
        console.log(`   📊 State: ${audioContext.state}`);
        
    } catch (error) {
        console.log(`   ❌ AudioContext creation failed: ${error.message}`);
        return { audioContext: false, error: error.message };
    }
    
    // Test 3: WebSocket Connection
    console.log('\n3. 🔌 Testing WebSocket Connection...');
    
    return new Promise((resolve) => {
        // Use production WebSocket URL
        const wsUrl = 'wss://isaac-mineo-api.onrender.com/api/voice/chat';
        console.log(`   Connecting to: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        let wsConnected = false;
        let sessionStarted = false;
        let testComplete = false;
        
        const timeout = setTimeout(() => {
            if (!testComplete) {
                console.log('   ⏱️  Test timeout - closing connection');
                testComplete = true;
                ws.close();
                if (audioContext) audioContext.close();
                resolve({
                    websocket: wsConnected,
                    sessionStarted: sessionStarted,
                    issue: 'Test timeout - no audio processing response'
                });
            }
        }, 15000); // 15 second timeout
        
        ws.onopen = () => {
            console.log('   ✅ WebSocket connected');
            wsConnected = true;
            
            // Start session
            ws.send(JSON.stringify({
                type: 'start_session',
                session_id: `audio_debug_${Date.now()}`
            }));
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`   📨 Message: ${data.type} - ${data.message || data.text || 'no content'}`);
            
            if (data.type === 'status' && data.voice_enabled) {
                console.log('   ✅ Voice enabled - starting audio test');
                sessionStarted = true;
                
                // Test 4: Audio Processing Pipeline
                testAudioPipeline(ws, audioContext, timeout, resolve);
            }
        };
        
        ws.onerror = (error) => {
            console.log(`   ❌ WebSocket error: ${error}`);
            testComplete = true;
            clearTimeout(timeout);
            if (audioContext) audioContext.close();
            resolve({
                websocket: false,
                error: 'WebSocket connection failed'
            });
        };
        
        ws.onclose = () => {
            console.log('   🔌 WebSocket closed');
            if (!testComplete) {
                testComplete = true;
                clearTimeout(timeout);
                if (audioContext) audioContext.close();
            }
        };
    });
}

async function testAudioPipeline(ws, audioContext, timeout, resolve) {
    console.log('\n4. 🎵 Testing Audio Processing Pipeline...');
    
    try {
        // Get microphone stream again for testing
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        let audioDataSent = 0;
        let receivedTranscription = false;
        
        processor.onaudioprocess = (event) => {
            // Get raw audio data
            const inputBuffer = event.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);
            
            // Convert to PCM format (same as frontend)
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                const sample = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            }
            
            // Send PCM data to WebSocket
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(pcmData.buffer);
                audioDataSent++;
                
                if (audioDataSent === 1) {
                    console.log('   📤 First PCM audio data sent');
                } else if (audioDataSent % 10 === 0) {
                    console.log(`   📤 Sent ${audioDataSent} audio chunks`);
                }
            }
        };
        
        // Set up WebSocket message handler for transcription
        const originalOnMessage = ws.onmessage;
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'transcript') {
                console.log(`   ✅ Received transcription: "${data.text}"`);
                receivedTranscription = true;
                
                // Clean up and resolve
                processor.disconnect();
                source.disconnect();
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
                ws.close();
                clearTimeout(timeout);
                
                resolve({
                    websocket: true,
                    sessionStarted: true,
                    audioProcessing: true,
                    transcription: true,
                    audioDataSent: audioDataSent,
                    issue: null
                });
                return;
            }
            
            // Call original handler
            originalOnMessage(event);
        };
        
        // Connect audio processing chain
        source.connect(processor);
        processor.connect(audioContext.destination);
        
        console.log('   ✅ Audio processing pipeline connected');
        console.log('   🎙️ Recording audio for 10 seconds...');
        console.log('   💬 Say "hello" or "test" now!');
        
        // Set up cleanup after 10 seconds if no transcription
        setTimeout(() => {
            if (!receivedTranscription) {
                console.log('   ⏱️  No transcription received after 10 seconds');
                
                processor.disconnect();
                source.disconnect();
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
                ws.close();
                clearTimeout(timeout);
                
                resolve({
                    websocket: true,
                    sessionStarted: true,
                    audioProcessing: true,
                    transcription: false,
                    audioDataSent: audioDataSent,
                    issue: 'Audio sent but no transcription received'
                });
            }
        }, 10000);
        
    } catch (error) {
        console.log(`   ❌ Audio pipeline error: ${error.message}`);
        clearTimeout(timeout);
        audioContext.close();
        ws.close();
        
        resolve({
            websocket: true,
            sessionStarted: true,
            audioProcessing: false,
            error: error.message,
            issue: 'Audio processing setup failed'
        });
    }
}

// Auto-run the test
console.log('🚀 Starting client-side audio debug test...');
console.log('📝 This test will check the complete audio processing pipeline');
console.log('🎙️ Please allow microphone access when prompted');
console.log('💬 Say "hello" or "test" when instructed\n');

testClientAudioProcessing().then(result => {
    console.log('\n📋 CLIENT AUDIO DEBUG RESULTS');
    console.log('==============================');
    
    console.log(`WebSocket Connection: ${result.websocket ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Session Started: ${result.sessionStarted ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Audio Processing: ${result.audioProcessing ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Transcription: ${result.transcription ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (result.audioDataSent) {
        console.log(`Audio Data Sent: ${result.audioDataSent} chunks`);
    }
    
    if (result.issue) {
        console.log(`\n🔍 Issue: ${result.issue}`);
    }
    
    if (result.error) {
        console.log(`\n❌ Error: ${result.error}`);
    }
    
    // Diagnosis
    console.log('\n🩺 DIAGNOSIS:');
    if (result.transcription) {
        console.log('✅ Complete audio pipeline working perfectly!');
    } else if (result.audioProcessing && result.audioDataSent > 0) {
        console.log('⚠️  Audio is being sent but not transcribed');
        console.log('💡 Likely issue: Audio format or Deepgram processing in production');
        console.log('🔧 Check backend logs for Deepgram errors');
    } else if (result.sessionStarted) {
        console.log('⚠️  WebSocket works but audio processing failed');
        console.log('💡 Likely issue: Microphone permissions or AudioContext setup');
    } else {
        console.log('❌ Fundamental connection issues');
        console.log('💡 Check WebSocket endpoint and authentication');
    }
    
}).catch(error => {
    console.error('❌ Test failed:', error);
});

// Make available to window for manual testing
window.testClientAudioProcessing = testClientAudioProcessing;
