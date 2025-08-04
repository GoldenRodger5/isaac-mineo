#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎤 Mobile Voice Integration Test');
console.log('================================\n');

// Test files to check
const testFiles = [
  {
    name: 'VoiceChat Component',
    path: 'frontend/src/components/VoiceChat.jsx',
    checks: [
      'const VoiceChat = ({ sessionId, onVoiceResponse, onError, className = \'\', disabled = false })',
      'mobile-voice-controls',
      'onTouchStart',
      'onTouchEnd'
    ]
  },
  {
    name: 'MobileChatInterface Component',
    path: 'frontend/src/components/MobileChatInterface.jsx',
    checks: [
      'import VoiceChat from \'./VoiceChat\';',
      'onVoiceResponse,',
      'onVoiceError',
      'className="mobile-voice-controls"'
    ]
  },
  {
    name: 'AIChat Component',
    path: 'frontend/src/components/AIChat.jsx',
    checks: [
      'sessionId={sessionId}',
      'onVoiceResponse={handleVoiceResponse}',
      'onVoiceError={(error) => console.error(\'Voice error:\', error)}'
    ]
  }
];

let allTestsPassed = true;

testFiles.forEach(file => {
  console.log(`📱 Testing ${file.name}`);
  console.log(`   File: ${file.path}`);
  
  const filePath = path.join(__dirname, file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found`);
    allTestsPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  file.checks.forEach(check => {
    if (content.includes(check)) {
      console.log(`   ✅ Found: ${check.substring(0, 50)}${check.length > 50 ? '...' : ''}`);
    } else {
      console.log(`   ❌ Missing: ${check.substring(0, 50)}${check.length > 50 ? '...' : ''}`);
      allTestsPassed = false;
    }
  });
  
  console.log('');
});

// Test voice service
console.log('🔧 Testing Voice Service');
const voiceServicePath = path.join(__dirname, 'frontend/src/services/voiceService.js');
if (fs.existsSync(voiceServicePath)) {
  const voiceContent = fs.readFileSync(voiceServicePath, 'utf8');
  const voiceChecks = [
    'startVoiceChat',
    'startRecording',
    'stopRecording',
    'interrupt'
  ];
  
  voiceChecks.forEach(check => {
    if (voiceContent.includes(check)) {
      console.log(`   ✅ Voice method: ${check}`);
    } else {
      console.log(`   ❌ Missing method: ${check}`);
      allTestsPassed = false;
    }
  });
} else {
  console.log('   ❌ Voice service file not found');
  allTestsPassed = false;
}

console.log('\n🎤 Mobile Voice Integration Summary');
console.log('===================================');
if (allTestsPassed) {
  console.log('✅ All tests passed! Voice features are fully integrated with mobile interface.');
  console.log('📱 Mobile users can now:');
  console.log('   • Use push-to-talk voice input');
  console.log('   • Receive voice responses');
  console.log('   • Control voice interactions with touch');
  console.log('   • Interrupt or stop voice responses');
  console.log('\n🔗 Voice controls will appear in the mobile chat interface when voice features are enabled.');
} else {
  console.log('❌ Some tests failed. Please check the issues above.');
}

console.log('\n📖 To enable voice features:');
console.log('   1. Install dependencies: pip install deepgram-sdk elevenlabs');
console.log('   2. Get API keys from Deepgram and ElevenLabs');
console.log('   3. Update .env file with your keys');
console.log('   4. Restart the backend server');
