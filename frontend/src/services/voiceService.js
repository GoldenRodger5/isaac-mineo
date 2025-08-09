import { apiClient } from './apiClient.js';

class VoiceService {
  constructor() {
    this.isRecording = false;
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.websocket = null;
    this.currentAudio = null;
    this.sessionId = null;
    
    // Voice service status
    this.isEnabled = false;
    this.status = 'checking';
    
    // Real-time transcription
    this.liveTranscript = '';
    this.finalTranscript = '';
    this.silenceTimer = null;
    this.silenceThreshold = 2000; // 2 seconds of silence to trigger AI response
    this.isAIResponding = false;
    
    // Event callbacks
    this.onTranscript = null;
    this.onLiveTranscript = null;
    this.onResponse = null;
    this.onError = null;
    this.onStatusChange = null;
    this.onAIStateChange = null;
    this.onListeningStateChange = null;
    
    this.checkVoiceSupport();
  }
  
  async checkVoiceSupport() {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.status = 'not_supported';
        this.isEnabled = false;
        return;
      }
      
      // Check backend voice status
      const baseUrl = apiClient.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/voice/status`);
      const data = await response.json();
      
      this.isEnabled = data.voice_enabled;
      this.status = data.voice_enabled ? 'ready' : 'backend_not_configured';
      
      console.log('🎤 Voice Service Status:', this.status);
      
      if (this.onStatusChange) {
        this.onStatusChange(this.status, this.isEnabled);
      }
      
    } catch (error) {
      console.error('Voice service check failed:', error);
      this.status = 'error';
      this.isEnabled = false;
      
      if (this.onStatusChange) {
        this.onStatusChange(this.status, this.isEnabled);
      }
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
        this.onError('Voice chat is not available. Please check your configuration.');
      }
      return false;
    }
    
    try {
      this.sessionId = sessionId;
      
      // Request microphone permission
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) return false;
      
      // Connect to voice WebSocket
      const baseUrl = apiClient.getApiBaseUrl();
      // Convert HTTP/HTTPS to WS/WSS properly
      let wsUrl;
      if (baseUrl.startsWith('https://')) {
        wsUrl = baseUrl.replace('https://', 'wss://') + '/voice/chat';
      } else if (baseUrl.startsWith('http://')) {
        wsUrl = baseUrl.replace('http://', 'ws://') + '/voice/chat';
      } else {
        // Fallback - assume http for localhost
        wsUrl = `ws://${baseUrl}/voice/chat`;
      }
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('🔊 Voice chat WebSocket connected');
        this.websocket.send(JSON.stringify({
          type: 'start_session',
          session_id: this.sessionId
        }));
      };
      
      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };
      
      this.websocket.onerror = (error) => {
        console.error('Voice WebSocket error:', error);
        if (this.onError) {
          this.onError('Voice connection failed. Please try again.');
        }
      };
      
      this.websocket.onclose = () => {
        console.log('🔊 Voice chat WebSocket disconnected - stopping recording');
        this.stopRecording();
      };
      
      return true;
      
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      if (this.onError) {
        this.onError('Failed to start voice chat. Please try again.');
      }
      return false;
    }
  }
  
  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'status':
        console.log('Voice status:', data.message);
        break;
        
      case 'transcript':
        console.log('📝 Live Transcript:', data.text);
        
        // Check if this is interim or final transcript
        if (data.is_final) {
          this.finalTranscript = data.text;
          this.liveTranscript = ''; // Clear live transcript
          
          // Reset silence timer and start waiting for pause
          this.resetSilenceTimer();
          this.startSilenceTimer();
          
          if (this.onTranscript) {
            this.onTranscript(data.text, true); // true = final
          }
        } else {
          this.liveTranscript = data.text;
          
          // Clear silence timer while user is still talking
          this.clearSilenceTimer();
          
          if (this.onLiveTranscript) {
            this.onLiveTranscript(data.text);
          }
        }
        break;
        
      case 'ai_response':
        console.log('🤖 AI Response:', data.text);
        this.isAIResponding = true;
        if (this.onAIStateChange) {
          this.onAIStateChange(true);
        }
        if (this.onResponse) {
          this.onResponse(data.text, null);
        }
        break;
        
      case 'audio_response':
        console.log('🔊 Audio response received');
        this.isAIResponding = true;
        if (this.onAIStateChange) {
          this.onAIStateChange(true);
        }
        this.playAudioResponse(data.audio_url);
        if (this.onResponse) {
          this.onResponse(data.text, data.audio_url);
        }
        break;
        
      case 'interrupted':
        console.log('🛑 Audio playback interrupted by user speech');
        this.stopCurrentAudio();
        this.isAIResponding = false;
        if (this.onAIStateChange) {
          this.onAIStateChange(false);
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
  
  async startContinuousListening() {
    if (this.isListening || !this.websocket) return false;
    
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
      
      // Create AudioContext for processing raw audio data  
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = this.audioContext.createMediaStreamSource(stream);
      
      // Use AudioWorkletProcessor for modern audio processing
      // But fallback to ScriptProcessorNode for compatibility with Deepgram's expected raw PCM format
      try {
        // Try modern approach first - but convert to PCM for Deepgram
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
            console.log('🎤 Sending PCM audio data:', pcmData.length, 'samples');
            this.websocket.send(pcmData.buffer);
          }
        };
        
        // Connect the audio processing chain
        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        
        console.log('🎙️ Using ScriptProcessorNode for PCM audio processing');
        
      } catch (audioProcessorError) {
        console.warn('Failed to set up audio processor:', audioProcessorError);
        throw new Error('Audio processing setup failed');
      }
      
      this.isListening = true;
      this.audioStream = stream;
      
      // Notify UI of listening state change
      if (this.onListeningStateChange) {
        this.onListeningStateChange(true);
      }
      
      // Send keep-alive messages to prevent Deepgram timeout
      this.keepAliveInterval = setInterval(() => {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify({ type: 'keep_alive' }));
        }
      }, 8000); // Every 8 seconds (before 10s timeout)
      
      console.log('🎙️ Continuous listening started with raw PCM audio');
      return true;
      
    } catch (error) {
      console.error('Failed to start continuous listening:', error);
      if (this.onError) {
        this.onError('Failed to start listening. Please check your microphone.');
      }
      return false;
    }
  }

  stopContinuousListening() {
    console.log('🛑 stopContinuousListening() called - Stack trace:');
    console.trace();
    
    if (!this.isListening) return;
    
    try {
      // Clear timers
      this.clearSilenceTimer();
      
      // Stop audio processing
      if (this.processor) {
        this.processor.disconnect();
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
      
      // Clear keep-alive interval
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
      
      this.isListening = false;
      this.liveTranscript = '';
      this.finalTranscript = '';
      
      // Notify UI of listening state change
      if (this.onListeningStateChange) {
        this.onListeningStateChange(false);
      }
      
      // Notify UI of listening state change
      if (this.onListeningStateChange) {
        this.onListeningStateChange(false);
      }
      
      console.log('🎙️ Continuous listening stopped');
      
    } catch (error) {
      console.error('Error stopping continuous listening:', error);
    }
  }

  startSilenceTimer() {
    this.clearSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      if (this.finalTranscript.trim() && !this.isAIResponding) {
        console.log('🤖 Silence detected, sending to AI:', this.finalTranscript);
        
        // Send the final transcript to AI
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify({
            type: 'process_transcript',
            text: this.finalTranscript,
            session_id: this.sessionId
          }));
        }
        
        // Clear the transcript
        this.finalTranscript = '';
      }
    }, this.silenceThreshold);
  }

  clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  resetSilenceTimer() {
    this.clearSilenceTimer();
  }

  // Legacy method for backwards compatibility
  async startRecording() {
    return this.startContinuousListening();
  }

  // Legacy method for backwards compatibility
  stopRecording() {
    this.stopContinuousListening();
  }  async playAudioResponse(audioUrl) {
    try {
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      if (audioUrl) {
        this.currentAudio = new Audio(audioUrl);
        
        // Monitor for user speech while AI is talking
        this.currentAudio.onplay = () => {
          this.isAIResponding = true;
          if (this.onAIStateChange) {
            this.onAIStateChange(true);
          }
        };
        
        this.currentAudio.onended = () => {
          this.currentAudio = null;
          this.isAIResponding = false;
          if (this.onAIStateChange) {
            this.onAIStateChange(false);
          }
        };
        
        this.currentAudio.onerror = (error) => {
          console.error('Audio playback error:', error);
          this.currentAudio = null;
          this.isAIResponding = false;
          if (this.onAIStateChange) {
            this.onAIStateChange(false);
          }
        };
        
        this.currentAudio.play();
      }
      
    } catch (error) {
      console.error('Failed to play audio response:', error);
      this.isAIResponding = false;
      if (this.onAIStateChange) {
        this.onAIStateChange(false);
      }
    }
  }

  stopCurrentAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isAIResponding = false;
      if (this.onAIStateChange) {
        this.onAIStateChange(false);
      }
    }
  }

  // Smart interruption - called when user starts speaking while AI is responding
  handleUserInterruption() {
    console.log('🎤 User interruption detected');
    
    // Stop AI audio immediately
    this.stopCurrentAudio();
    
    // Send interrupt signal to server
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'interrupt'
      }));
    }
    
    this.isAIResponding = false;
    if (this.onAIStateChange) {
      this.onAIStateChange(false);
    }
  }
  
  interrupt() {
    // Stop current audio playback
    this.stopCurrentAudio();
    
    // Send interrupt signal to server
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'interrupt'
      }));
    }
  }
  
  async sendTextWithVoice(text) {
    if (!this.isEnabled) {
      if (this.onError) {
        this.onError('Voice services not available');
      }
      return null;
    }
    
    try {
      const baseUrl = apiClient.getApiBaseUrl();
      
      // Ensure we have a session ID
      const currentSessionId = this.sessionId || `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`${baseUrl}/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          session_id: currentSessionId,
          return_audio: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Voice API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update session ID
      if (data.session_id) {
        this.sessionId = data.session_id;
      }
      
      // Play audio if available
      if (data.audio_url) {
        this.playAudioResponse(data.audio_url);
      }
      
      return data;
      
    } catch (error) {
      console.error('Text-to-voice error:', error);
      if (this.onError) {
        this.onError('Failed to generate voice response');
      }
      return null;
    }
  }
  
  stopVoiceChat() {
    this.stopContinuousListening();
    this.stopCurrentAudio();
    
    // Clear all timers
    this.clearSilenceTimer();
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    
    if (this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'end_session'
      }));
      this.websocket.close();
      this.websocket = null;
    }
    
    this.sessionId = null;
    this.isAIResponding = false;
    console.log('🔊 Voice chat stopped');
  }
  
  // Event handler setters
  setOnTranscript(callback) {
    this.onTranscript = callback;
  }
  
  setOnLiveTranscript(callback) {
    this.onLiveTranscript = callback;
  }
  
  setOnResponse(callback) {
    this.onResponse = callback;
  }
  
  setOnError(callback) {
    this.onError = callback;
  }
  
  setOnStatusChange(callback) {
    this.onStatusChange = callback;
  }
  
  setOnAIStateChange(callback) {
    this.onAIStateChange = callback;
  }
}

// Export singleton instance
const voiceService = new VoiceService();
export { voiceService };
export default voiceService;
