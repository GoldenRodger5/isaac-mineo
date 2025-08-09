// Test AudioWorklet loading
async function testAudioWorklet() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.audioWorklet.addModule('/voice-audio-processor.js');
        console.log('✅ AudioWorklet loaded successfully');
        await audioContext.close();
        return true;
    } catch (error) {
        console.error('❌ AudioWorklet failed to load:', error);
        return false;
    }
}

// Auto-run test
testAudioWorklet().then(success => {
    if (success) {
        console.log('🎵 AudioWorklet is supported and working!');
    } else {
        console.log('⚠️ AudioWorklet not supported, will use fallback');
    }
});
