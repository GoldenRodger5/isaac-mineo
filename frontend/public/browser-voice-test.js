// Browser Test for Ultra-Simple Voice Service
// Paste this in browser console at https://isaac-mineo.vercel.app

console.log('🧪 BROWSER TEST: Ultra-Simple Voice Service');
console.log('===========================================');

async function testVoiceServiceInBrowser() {
    console.log('\n1. 🔍 Checking Voice Service Status...');
    
    // Wait for page to load
    await new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
    
    // Check if voice service is available
    if (typeof sendVoiceText === 'function') {
        console.log('✅ sendVoiceText function is available globally');
        
        console.log('\n2. 🎤 Testing Voice Service Connection...');
        
        // Try to send a test message
        console.log('📤 Sending test message: "Hello from browser test"');
        sendVoiceText('Hello from browser test');
        
        console.log('\n3. 🔍 Expected Results:');
        console.log('   - Look for: "🎤 Simple Voice Service Status: ready"');
        console.log('   - Look for: "✅ WebSocket connected"');
        console.log('   - Look for: "📤 Sending text: Hello from browser test"');
        console.log('   - Look for: "🤖 AI Response: [response text]"');
        console.log('   - Look for: "🔊 Audio response received" (if audio working)');
        
    } else {
        console.log('❌ sendVoiceText function not found');
        console.log('💡 This means the ultra-simple voice service may not be loaded yet');
        
        // Try to find voice service in window
        if (window.voiceService) {
            console.log('✅ Found window.voiceService');
            window.voiceService.sendText('Hello from browser test via window.voiceService');
        } else {
            console.log('❌ Voice service not found in window object');
        }
    }
    
    console.log('\n4. 🎯 Manual Testing Options:');
    console.log('   - Click the voice chat button in the AI Chat section');
    console.log('   - Use: sendVoiceText("your message here")');
    console.log('   - Check browser console for voice service messages');
    
    console.log('\n5. 🔍 Debugging Information:');
    console.log('   Current URL:', window.location.href);
    console.log('   Voice service in window?', !!window.voiceService);
    console.log('   sendVoiceText function?', typeof sendVoiceText);
}

// Auto-run the test
testVoiceServiceInBrowser();

// Make the test function available for re-running
window.testVoiceServiceInBrowser = testVoiceServiceInBrowser;

console.log('\n🔄 To re-run this test, use: testVoiceServiceInBrowser()');
console.log('🎯 To test voice: sendVoiceText("Hello, can you hear me?")');
