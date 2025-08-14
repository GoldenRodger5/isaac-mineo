// Simple Voice Service - Minimal Working Implementation
// This replaces the complex voiceService.js with a simple, working version

import { apiClient } from './apiClient.js';

class SimpleVoiceService {
  constructor() {
    this.isRecording = false;
    this.websocket = null;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.isEnabled = false;
    this.status = 'disabled'; // Changed from 'checking' to 'disabled'
    
    // Simple event callbacks
    this.onStatusChange = null;
    this.onResponse = null;
    this.onError = null;
    
    // VOICE SUPPORT CHECK DISABLED FOR DEBUGGING
    // this.checkVoiceSupport();
    console.log('🚫 Simple Voice Service: Disabled for debugging');
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
      
      // Get microphone permission
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      console.log('🎤 Microphone access granted');
      
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
        this.stopRecording();
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
        if (data.voice_enabled && !this.isRecording) {
          this.startRecording();
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
  
  startRecording() {
    if (this.isRecording || !this.audioStream || !this.websocket) return;
    
    try {
      console.log('🎙️ Starting audio recording...');
      
      // Use MediaRecorder for simple audio capture
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          console.log('🎤 Sending audio data:', event.data.size, 'bytes');
          
          // Convert to ArrayBuffer and send
          event.data.arrayBuffer().then(buffer => {
            this.websocket.send(buffer);
          });
        }
      };
      
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };
      
      // Start recording with 1 second chunks
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      
      console.log('✅ Audio recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (this.onError) {
        this.onError('Failed to start audio recording');
      }
    }
  }
  
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      console.log('🛑 Stopping audio recording...');
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }
  
  playAudio(audioUrl) {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
      });
    }
  }
  
  stopVoiceChat() {
    this.stopRecording();
    
    if (this.websocket) {
      this.websocket.send(JSON.stringify({ type: 'end_session' }));
      this.websocket.close();
      this.websocket = null;
    }
    
    console.log('🔊 Simple voice chat stopped');
  }
  
  // Event handler setters for compatibility
  setOnResponse(callback) { this.onResponse = callback; }
  setOnError(callback) { this.onError = callback; }
  setOnStatusChange(callback) { this.onStatusChange = callback; }
  
  // Legacy methods for compatibility
  async requestMicrophonePermission() { return true; }
  setOnTranscript() {}
  setOnLiveTranscript() {}
  setOnAIStateChange() {}
}

// Export singleton instance
const simpleVoiceService = new SimpleVoiceService();
export { simpleVoiceService as voiceService };
export default simpleVoiceService;
