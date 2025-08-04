class VoiceService {
  constructor() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.websocket = null;
    this.currentAudio = null;
    this.sessionId = null;
    
    // Voice service status
    this.isEnabled = false;
    this.status = 'checking';
    
    // Event callbacks
    this.onTranscript = null;
    this.onResponse = null;
    this.onError = null;
    this.onStatusChange = null;
    
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/voice/status`);
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
      const wsUrl = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/api/voice/chat`;
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
        console.log('🔊 Voice chat WebSocket disconnected');
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
        console.log('📝 Transcript:', data.text);
        if (this.onTranscript) {
          this.onTranscript(data.text);
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
        this.playAudioResponse(data.audio_url);
        if (this.onResponse) {
          this.onResponse(data.text, data.audio_url);
        }
        break;
        
      case 'interrupted':
        console.log('🛑 Audio playback interrupted');
        this.stopCurrentAudio();
        break;
        
      case 'error':
        console.error('Voice error:', data.message);
        if (this.onError) {
          this.onError(data.message);
        }
        break;
    }
  }
  
  async startRecording() {
    if (this.isRecording || !this.websocket) return;
    
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
      
      // Create MediaRecorder for sending audio to server
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(event.data);
        }
      };
      
      this.mediaRecorder.start(250); // Send chunks every 250ms
      this.isRecording = true;
      
      console.log('🎙️ Recording started');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (this.onError) {
        this.onError('Failed to start recording. Please check your microphone.');
      }
    }
  }
  
  stopRecording() {
    if (!this.isRecording) return;
    
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        
        // Stop all tracks
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      }
      
      this.isRecording = false;
      console.log('🎙️ Recording stopped');
      
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }
  
  async playAudioResponse(audioUrl) {
    try {
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      if (audioUrl) {
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.play();
        
        this.currentAudio.onended = () => {
          this.currentAudio = null;
        };
        
        this.currentAudio.onerror = (error) => {
          console.error('Audio playback error:', error);
          this.currentAudio = null;
        };
      }
      
    } catch (error) {
      console.error('Failed to play audio response:', error);
    }
  }
  
  stopCurrentAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          session_id: this.sessionId,
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
    this.stopRecording();
    this.stopCurrentAudio();
    
    if (this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'end_session'
      }));
      this.websocket.close();
      this.websocket = null;
    }
    
    this.sessionId = null;
    console.log('🔊 Voice chat stopped');
  }
  
  // Event handler setters
  setOnTranscript(callback) {
    this.onTranscript = callback;
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
}

// Export singleton instance
export const voiceService = new VoiceService();
