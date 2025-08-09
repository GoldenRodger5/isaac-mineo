// Enhanced Voice Service - Real Audio Input with Live Transcription
// Now includes microphone capture and real-time transcription display

import { apiClient } from './apiClient.js';

class EnhancedVoiceService {
  constructor() {
    this.websocket = null;
    this.isEnabled = false;
    this.status = 'checking';
    this.currentAudio = null;
    this.isListening = false;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.processor = null;
    
    // Real-time transcription
    this.liveTranscript = '';
    this.finalTranscript = '';
    
    // Event callbacks
    this.onStatusChange = null;
    this.onResponse = null;
    this.onError = null;
    this.onListeningStateChange = null;
    this.onTranscript = null;
    this.onLiveTranscript = null;
    
    this.checkVoiceSupport();
  }
  
  async checkVoiceSupport() {
    try {
      const baseUrl = apiClient.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/voice/status`);
      const data = await response.json();
      
      this.isEnabled = data.voice_enabled;
      this.status = data.voice_enabled ? 'ready' : 'backend_not_configured';
      
      console.log('🎤 Enhanced Voice Service Status:', this.status);
      
      if (this.onStatusChange) {
        this.onStatusChange(this.status, this.isEnabled);
      }
      
    } catch (error) {
      console.error('Voice service check failed:', error);
      this.status = 'error';
      this.isEnabled = false;
    }
  }
  
  async requestMicrophonePermission() {
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
      
      // Stop the stream immediately - we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('🎤 Microphone permission granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      if (this.onError) {
        this.onError('Microphone permission denied. Please allow microphone access to use voice chat.');
      }
      return false;
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
      console.log('🎙️ Starting enhanced voice chat...');
      
      // Request microphone permission first
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) return false;
      
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
        this.stopContinuousListening();
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
        // Start real audio listening when ready
        if (data.voice_enabled && !this.isListening) {
          this.startContinuousListening();
        }
        break;
        
      case 'transcript':
        console.log('📝 Live Transcript:', data.text);
        
        // Check if this is interim or final transcript
        if (data.is_final) {
          this.finalTranscript = data.text;
          this.liveTranscript = ''; // Clear live transcript
          
          if (this.onTranscript) {
            this.onTranscript(data.text, true); // true = final
          }
          
          // Auto-process final transcript after a short delay
          setTimeout(() => {
            if (this.finalTranscript.trim()) {
              this.processTranscript(this.finalTranscript);
              this.finalTranscript = '';
            }
          }, 1500); // 1.5 second delay for natural conversation flow
          
        } else {
          this.liveTranscript = data.text;
          
          if (this.onLiveTranscript) {
            this.onLiveTranscript(data.text);
          }
        }
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
  
  processTranscript(transcript) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.log('📤 Processing transcript:', transcript);
      this.websocket.send(JSON.stringify({
        type: 'process_transcript',
        text: transcript,
        session_id: `voice_${Date.now()}`
      }));
    }
  }
  
  async startContinuousListening() {
    if (this.isListening || !this.websocket) return false;
    
    try {
      console.log('🎙️ Starting real audio listening...');
      
      // Clean up any existing audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        try {
          await this.audioContext.close();
        } catch (e) {
          console.warn('Failed to close existing audio context:', e);
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Create AudioContext for processing raw audio data  
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      // Resume AudioContext if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('📱 AudioContext resumed');
      }
      
      const source = this.audioContext.createMediaStreamSource(stream);
      
      // Use modern AudioWorkletNode instead of deprecated ScriptProcessorNode
      try {
        // Try different paths for the worklet module
        const workletPath = window.location.origin.includes('localhost') 
          ? '/voice-audio-processor.js'
          : '/voice-audio-processor.js';
          
        await this.audioContext.audioWorklet.addModule(workletPath);
        this.processor = new AudioWorkletNode(this.audioContext, 'voice-audio-processor');
        
          // Listen for audio data from the worklet
          this.processor.port.onmessage = (event) => {
            if (event.data.type === 'audioData') {
              // Send raw PCM data that Deepgram expects
              if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(event.data.data);
              }
            } else if (event.data.type === 'speechStart') {
              console.log('🎤 Speech detected by VAD');
            } else if (event.data.type === 'speechEnd') {
              console.log('🤫 Speech ended, duration:', event.data.duration?.toFixed(2), 's');
            } else if (event.data.type === 'processorReady') {
              console.log('✅ Audio processor ready');
            } else if (event.data.type === 'processorError') {
              console.error('🚨 Audio processor error:', event.data.error);
            }
          };        // Connect source to processor (no need to connect to destination)
        source.connect(this.processor);
        console.log('✅ AudioWorkletNode connected successfully');
        
      } catch (error) {
        console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode:', error);
        
        // Clean up failed worklet attempt
        if (this.processor) {
          try {
            this.processor.disconnect();
          } catch (e) {}
          this.processor = null;
        }
        
        // Fallback to ScriptProcessorNode for older browsers
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        
        this.processor.onaudioprocess = (event) => {
          if (!this.isListening) return;
          
          // Get raw audio data as Float32Array
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          
          // Convert Float32Array to Int16Array (PCM format expected by Deepgram)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // Convert from [-1, 1] to [-32768, 32767] and clamp
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          }
          
          // Send raw PCM data that Deepgram expects
          if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(pcmData.buffer);
          }
        };
        
        // Connect the audio processing chain for fallback
        source.connect(this.processor);
        // Note: For ScriptProcessorNode, we need to connect to destination to keep it alive
        this.processor.connect(this.audioContext.destination);
        console.log('⚠️ Using ScriptProcessorNode fallback');
      }
      
      this.isListening = true;
      this.audioStream = stream;
      
      // Start audio processing in the worklet
      if (this.processor && this.processor.port) {
        this.processor.port.postMessage({ command: 'start' });
      }
      
      // Notify UI of listening state change
      if (this.onListeningStateChange) {
        this.onListeningStateChange(true);
      }
      
      console.log('✅ Real audio listening started - speak now!');
      return true;
      
    } catch (error) {
      console.error('Failed to start audio listening:', error);
      if (this.onError) {
        this.onError('Failed to start audio listening: ' + error.message);
      }
      return false;
    }
  }
  
  stopContinuousListening() {
    console.log('🛑 Stopping continuous listening...');
    
    if (!this.isListening) return;
    
    try {
      // Stop audio processing in the worklet
      if (this.processor && this.processor.port) {
        this.processor.port.postMessage({ command: 'stop' });
      }
      
      // Stop audio processing
      if (this.processor) {
        try {
          this.processor.disconnect();
        } catch (e) {
          console.warn('Error disconnecting processor:', e);
        }
        this.processor = null;
      }
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        this.audioContext = null;
      }
      
      // Stop all audio tracks
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
      
      this.isListening = false;
      this.liveTranscript = '';
      this.finalTranscript = '';
      
      // Notify UI of listening state change
      if (this.onListeningStateChange) {
        this.onListeningStateChange(false);
      }
      
      console.log('🎙️ Continuous listening stopped');
      
    } catch (error) {
      console.error('Error stopping continuous listening:', error);
    }
  }
  
  // Method to send custom text (for testing - keeping this for backward compatibility)
  sendText(text) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      console.log('📤 Sending text:', text);
      this.processTranscript(text);
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
    this.stopContinuousListening();
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    if (this.websocket) {
      this.websocket.send(JSON.stringify({ type: 'end_session' }));
      this.websocket.close();
      this.websocket = null;
    }
    
    console.log('🔊 Enhanced voice chat stopped');
  }
  
  // Event handler setters for compatibility
  setOnResponse(callback) { this.onResponse = callback; }
  setOnError(callback) { this.onError = callback; }
  setOnStatusChange(callback) { this.onStatusChange = callback; }
  setOnTranscript(callback) { this.onTranscript = callback; }
  setOnLiveTranscript(callback) { this.onLiveTranscript = callback; }
  setOnListeningStateChange(callback) { this.onListeningStateChange = callback; }
  
  // Additional compatibility methods
  setOnAIStateChange(callback) { /* Not used in this version */ }
  
  // Legacy methods for compatibility
  async startRecording() { return this.startContinuousListening(); }
  stopRecording() { this.stopContinuousListening(); }
}

// Export singleton instance
const voiceService = new EnhancedVoiceService();

// Add global method for manual testing (keeping for backward compatibility)
window.sendVoiceText = (text) => {
  voiceService.sendText(text || 'Hello, can you hear me?');
};

console.log('🎤 Enhanced Voice Service loaded with real audio input and live transcription!');
console.log('🎙️ Use sendVoiceText("text") for manual testing or just speak into your microphone!');

export { voiceService };
export default voiceService;
