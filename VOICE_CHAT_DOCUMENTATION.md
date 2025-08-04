# 🎤 Voice Chat Feature Documentation

## Overview

The voice chat feature adds real-time voice interaction capabilities to Isaac's AI assistant, enabling users to:
- **Speak questions** using speech-to-text
- **Hear responses** with natural text-to-speech
- **Interrupt responses** (barge-in functionality)
- **Seamless integration** with existing text chat

## 🏗️ Architecture

### Backend Components

#### 1. Voice Service (`/backend/app/services/voice_service.py`)
- **Deepgram Integration**: Real-time speech-to-text via WebSocket
- **ElevenLabs Integration**: High-quality text-to-speech
- **Interruption Support**: Barge-in functionality for natural conversation
- **Error Handling**: Graceful fallbacks when services unavailable

#### 2. Voice Router (`/backend/app/routers/voice.py`)
- **WebSocket Endpoint**: `/api/voice/chat` for real-time communication
- **Synthesis Endpoint**: `/api/voice/synthesize` for text-to-speech
- **Status Endpoint**: `/api/voice/status` for feature availability
- **Session Management**: Integrates with existing chat sessions

### Frontend Components

#### 1. Voice Service (`/frontend/src/services/voiceService.js`)
- **Browser WebRTC**: Microphone access and audio recording
- **WebSocket Client**: Real-time communication with backend
- **Audio Playback**: Interruible audio response system
- **Permission Management**: Microphone access handling

#### 2. Voice Chat Component (`/frontend/src/components/VoiceChat.jsx`)
- **Push-to-Talk Interface**: Hold to record, release to send
- **Status Indicators**: Recording, processing, and connection status
- **Interrupt Controls**: Stop current audio playback
- **Error Handling**: User-friendly error messages

## 🚀 Features

### Core Functionality
- ✅ **Real-time Speech-to-Text** via Deepgram Nova-2 model
- ✅ **Natural Text-to-Speech** via ElevenLabs Turbo v2
- ✅ **Barge-in Support** - interrupt bot mid-speech
- ✅ **Session Continuity** - voice and text share same session
- ✅ **Mobile Friendly** - touch controls for mobile devices
- ✅ **Graceful Degradation** - works without voice APIs configured

### Smart Integration
- ✅ **Existing Chat Logic** - uses same AI processing pipeline
- ✅ **Context Awareness** - maintains conversation context
- ✅ **Entity Tracking** - preserves entity state across voice/text
- ✅ **Analytics Integration** - tracks voice interactions

## 📋 Setup Instructions

### 1. Backend Dependencies

```bash
# Install voice processing libraries
pip install deepgram-sdk elevenlabs websockets

# Or using the updated requirements.txt
pip install -r backend/requirements.txt
```

### 2. API Keys Configuration

Add to your `.env` file:

```env
# Deepgram API Key (get from https://console.deepgram.com/)
DEEPGRAM_API_KEY=your_deepgram_api_key

# ElevenLabs API Key (get from https://elevenlabs.io/)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# ElevenLabs Voice ID (optional, default: 21m00Tcm4TlvDq8ikWAM)
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### 3. Getting API Keys

#### Deepgram (Speech-to-Text)
1. Sign up at [console.deepgram.com](https://console.deepgram.com/)
2. Create a new project
3. Generate an API key
4. Copy the key to `DEEPGRAM_API_KEY`

#### ElevenLabs (Text-to-Speech)
1. Sign up at [elevenlabs.io](https://elevenlabs.io/)
2. Go to your profile settings
3. Copy your API key to `ELEVENLABS_API_KEY`
4. Optionally, choose a voice ID from the voice library

### 4. Frontend Setup

No additional dependencies required - uses browser's native WebRTC APIs.

## 🎯 Usage

### For Users

#### Desktop
1. **Enable Voice**: Click "Voice Chat" button to start
2. **Push-to-Talk**: Hold the red microphone button while speaking
3. **Listen**: Release to send - AI responds with voice
4. **Interrupt**: Click orange button to stop current response
5. **Stop**: Click X to end voice session

#### Mobile
- Touch and hold the microphone button
- Same interrupt and stop functionality
- Optimized for touch interfaces

### For Developers

#### Backend API

```python
# Check voice service status
GET /api/voice/status

# Generate voice response for text
POST /api/voice/synthesize
{
    "text": "Hello world",
    "session_id": "session_123",
    "return_audio": true
}

# Real-time voice chat
WebSocket /api/voice/chat
```

#### Frontend Integration

```javascript
import { voiceService } from '../services/voiceService';

// Check if voice is available
if (voiceService.isEnabled) {
    // Start voice chat
    await voiceService.startVoiceChat(sessionId);
}

// Send text and get voice response
const result = await voiceService.sendTextWithVoice("Hello");
```

## 🔧 Configuration Options

### Voice Quality Settings

#### Deepgram (Speech-to-Text)
- **Model**: Nova-2 (latest, most accurate)
- **Language**: English (US)
- **Features**: Smart formatting, punctuation, filler word removal
- **Endpointing**: 300ms silence detection

#### ElevenLabs (Text-to-Speech)
- **Model**: Turbo v2 (fastest, good quality)
- **Voice**: Configurable via `ELEVENLABS_VOICE_ID`
- **Streaming**: Real-time audio generation
- **Quality**: Professional-grade synthesis

### Performance Tuning

```python
# Adjust audio chunk size for latency vs quality
mediaRecorder.start(250)  # 250ms chunks (lower = faster)

# Configure Deepgram endpointing
endpointing=300  # 300ms silence (lower = more responsive)
```

## 🛟 Troubleshooting

### Common Issues

#### 1. "Voice services not available"
- **Cause**: Missing API keys or network issues
- **Solution**: Check `.env` file and API key validity
- **Test**: Visit `/api/voice/status` endpoint

#### 2. "Microphone permission denied"
- **Cause**: Browser blocked microphone access
- **Solution**: Click the microphone icon in address bar
- **Note**: HTTPS required for production

#### 3. "WebSocket connection failed"
- **Cause**: Network issues or backend not running
- **Solution**: Check backend logs and network connectivity
- **Fallback**: Text chat continues to work

#### 4. Audio not playing
- **Cause**: Browser autoplay policy or audio format issues
- **Solution**: User must interact with page first
- **Workaround**: Component handles this automatically

### Debugging

```bash
# Test voice endpoints
curl http://localhost:8000/api/voice/status

# Check backend logs
tail -f backend/app.log

# Test WebSocket connection
wscat -c ws://localhost:8000/api/voice/chat
```

## 📊 Analytics Integration

Voice interactions are automatically tracked:
- Voice session start/end events
- Speech-to-text transcription metrics
- Audio response generation stats
- Error rates and fallback usage

## 🔒 Security Considerations

### Privacy
- **No Audio Storage**: Audio is processed in real-time, not stored
- **Session Security**: Voice uses existing session management
- **API Key Security**: Keys stored server-side only

### Performance
- **Rate Limiting**: Same limits as text chat (60 requests/hour)
- **Resource Management**: Automatic cleanup of audio streams
- **Error Handling**: Graceful fallbacks prevent system crashes

## 🚀 Future Enhancements

### Planned Features
- [ ] **Voice Activity Detection** - Automatic start/stop recording
- [ ] **Multiple Voice Options** - User-selectable voice personalities  
- [ ] **Conversation Modes** - Continuous conversation without push-to-talk
- [ ] **Language Support** - Multi-language voice interaction
- [ ] **Voice Commands** - Direct actions via voice (e.g., "clear chat")

### Technical Improvements
- [ ] **Audio Preprocessing** - Noise reduction and audio enhancement
- [ ] **Streaming Optimization** - Reduced latency for real-time feel
- [ ] **Offline Fallback** - Browser-based speech recognition backup
- [ ] **Audio Compression** - Optimized bandwidth usage

## 📈 Performance Metrics

### Latency Targets
- **Speech-to-Text**: < 1 second (Deepgram Nova-2)
- **AI Processing**: < 2 seconds (existing chat pipeline)  
- **Text-to-Speech**: < 1 second (ElevenLabs Turbo v2)
- **Total Response Time**: < 4 seconds end-to-end

### Quality Metrics
- **Transcription Accuracy**: >95% (Deepgram Nova-2)
- **Voice Naturalness**: Professional quality (ElevenLabs)
- **Interruption Response**: <200ms (barge-in detection)

## 🎉 Benefits

### For Users
- **Natural Interaction**: Speak naturally instead of typing
- **Multitasking**: Continue working while chatting
- **Accessibility**: Easier for users with typing difficulties
- **Mobile Experience**: Better experience on mobile devices

### For Isaac's Portfolio
- **Cutting-Edge Technology**: Demonstrates latest AI integration
- **Real-World Application**: Practical use of voice AI
- **Technical Depth**: Shows WebSocket, API integration skills
- **User Experience**: Enhanced interaction capabilities

This voice feature represents a significant advancement in the AI assistant's capabilities, showcasing modern voice AI integration while maintaining the robust architecture and user experience of the existing system.
