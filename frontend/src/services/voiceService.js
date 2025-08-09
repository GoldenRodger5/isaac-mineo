// Ultra-Simple Voice Service - Text-Based Implementation
// This will work reliably by using text input instead of complex audio processing

import { apiClient } from './apiClient.js';

class SimpleVoiceService {
  constructor() {
    this.websocket = null;
    this.isEnabled = false;
    this.status = 'checking';
    this.currentAudio = null;
    
    // Simple event callbacks
    this.onStatusChange = null;
    this.onResponse = null;
    this.onError = null;
    this.onListeningStateChange = null;
    
    this.checkVoiceSupport();
  }
  
  async checkVoiceSupport() {
    try {
      const baseUrl = apiClient.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/voice/status`);
      const data = await response.json();
      
      this.isEnabled = data.voice_enabled;
      this.status = data.voice_enabled ? 'ready' : 'backend_not_configured';
      
      console.log('🎤 Simple Voice Service Status:', this.status);
      
      if (this.onStatusChange) {
        this.onStatusChange(this.status, this.isEnabled);
      }
      
    } catch (error) {
      console.error('Voice service check failed:', error);
      this.status = 'error';
      this.isEnabled = false;
    }
  }
  
  async startVoiceChat(sessionId) {
    if (!this.isEnabled) {
      if (this.onError) {
        this.onError('Voice chat is not available.');
      }
      return false;
    }
    
    try {
      console.log('🎙️ Starting simple voice chat...');
      
      // Connect WebSocket
      const baseUrl = apiClient.getApiBaseUrl();
      const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/voice/chat';
      
      console.log('🔌 Connecting to:', wsUrl);
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.websocket.send(JSON.stringify({
          type: 'start_session',
          session_id: sessionId
        }));
        
        // Simulate "listening" state for UI
        if (this.onListeningStateChange) {
          this.onListeningStateChange(true);
        }
      };
      
      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onError) {
          this.onError('Voice connection failed');
        }
      };
      
      this.websocket.onclose = () => {
        console.log('🔌 WebSocket closed');
        if (this.onListeningStateChange) {
          this.onListeningStateChange(false);
        }
      };
      
      return true;
      
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      if (this.onError) {
        this.onError('Failed to start voice chat: ' + error.message);
      }
      return false;
    }
  }
  
  handleMessage(data) {
    console.log('📨 Received:', data.type, data.message || data.text || '');
    
    switch (data.type) {
      case 'status':
        console.log('Voice status:', data.message);
        // Auto-send a test message when ready
        if (data.voice_enabled) {
          setTimeout(() => {
            this.sendTestMessage();
          }, 1000);
        }
        break;
        
      case 'transcript':
        console.log('📝 Transcript:', data.text);
        break;
        
      case 'ai_response':
        console.log('🤖 AI Response:', data.text);
        if (this.onResponse) {
          this.onResponse(data.text, null);
        }
        break;
        
      case 'audio_response':
        console.log('🔊 Audio response received');
        this.playAudio(data.audio_url);
        if (this.onResponse) {
          this.onResponse(data.text, data.audio_url);
        }
        break;
        
      case 'error':
        console.error('Voice error:', data.message);
        if (this.onError) {
          this.onError(data.message);
        }
        break;
    }
  }
  
  // Send a test message to trigger AI response
  sendTestMessage() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.log('📤 Sending test message...');
      this.websocket.send(JSON.stringify({
        type: 'process_transcript',
        text: 'Hello, this is a test of the voice system',
        session_id: `test_${Date.now()}`
      }));
    }
  }
  
  // Method to send custom text (for testing)
  sendText(text) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.log('📤 Sending text:', text);
      this.websocket.send(JSON.stringify({
        type: 'process_transcript',
        text: text,
        session_id: `manual_${Date.now()}`
      }));
    }
  }
  
  playAudio(audioUrl) {
    if (audioUrl) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.play().catch(error => {
        console.error('Audio playback error:', error);
      });
      
      this.currentAudio.onended = () => {
        this.currentAudio = null;
      };
    }
  }
  
  stopVoiceChat() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    if (this.websocket) {
      this.websocket.send(JSON.stringify({ type: 'end_session' }));
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.onListeningStateChange) {
      this.onListeningStateChange(false);
    }
    
    console.log('🔊 Simple voice chat stopped');
  }
  
  // Compatibility methods
  async requestMicrophonePermission() { 
    console.log('🎤 Microphone permission granted (simulated)');
    return true; 
  }
  
  setOnResponse(callback) { this.onResponse = callback; }
  setOnError(callback) { this.onError = callback; }
  setOnStatusChange(callback) { this.onStatusChange = callback; }
  setOnTranscript(callback) { /* Not used in simple version */ }
  setOnLiveTranscript(callback) { /* Not used in simple version */ }
  setOnAIStateChange(callback) { /* Not used in simple version */ }
  setOnListeningStateChange(callback) { this.onListeningStateChange = callback; }
  
  // Legacy methods
  async startContinuousListening() { 
    console.log('🎙️ Starting continuous listening (simulated)');
    if (this.onListeningStateChange) {
      this.onListeningStateChange(true);
    }
    return true; 
  }
  
  stopContinuousListening() { 
    console.log('🛑 Stopping continuous listening (simulated)');
    if (this.onListeningStateChange) {
      this.onListeningStateChange(false);
    }
  }
}

// Export singleton instance
const voiceService = new SimpleVoiceService();

// Add global method for manual testing
window.sendVoiceText = (text) => {
  voiceService.sendText(text || 'Hello, can you hear me?');
};

console.log('🎤 Simple Voice Service loaded. Test with: sendVoiceText("hello")');

export { voiceService };
export default voiceService;
