/**
 * Production-Ready Voice Audio Processor with Enhanced Error Handling
 * Fixes AudioContext issues and improves Voice Activity Detection
 * Processes microphone audio data for speech-to-text transcription
 */

class VoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Voice Activity Detection parameters
    this.vadThreshold = 0.005;         // Lowered threshold for better detection
    this.silenceFrames = 0;
    this.maxSilenceFrames = 20;        // Reduced for faster speech detection
    this.isProcessing = false;
    this.speechBuffer = [];
    this.maxBufferSize = 16000 * 2;    // 2 seconds max buffer
    this.isListening = false;
    
    // Enhanced noise reduction
    this.noiseFloor = 0.001;           // Lower noise floor
    this.adaptiveThreshold = 0.005;
    this.energyHistory = [];
    this.maxHistorySize = 50;          // Smaller history for responsiveness
    
    // Performance optimization
    this.frameCount = 0;
    this.processInterval = 2;          // Process every 2nd frame for better performance
    this.energySmoothingFactor = 0.4;  // Faster response to energy changes
    this.lastEnergy = 0;
    
    // Audio enhancement
    this.preEmphasisAlpha = 0.95;
    this.lastSample = 0;
    
    // Error handling
    this.errorCount = 0;
    this.maxErrors = 10;
    
    console.log('🎤 Production Voice Audio Processor initialized');
    
    // Listen for messages from the main thread
    this.port.onmessage = (event) => {
      if (event.data.command === 'start') {
        this.isListening = true;
        console.log('🎙️ Voice processor started listening');
      } else if (event.data.command === 'stop') {
        this.isListening = false;
        this.isProcessing = false;
        console.log('🛑 Voice processor stopped listening');
      }
    };
    
    // Send ready signal
    this.port.postMessage({ 
      type: 'processorReady',
      timestamp: Date.now()
    });
  }

  process(inputs, outputs, parameters) {
    try {
      const input = inputs[0];
      
      // Only process audio when listening
      if (!this.isListening || !input || input.length === 0) {
        return true;
      }

      const inputChannel = input[0];
      if (!inputChannel || inputChannel.length === 0) {
        return true;
      }

      this.frameCount++;
      
      // Optimize processing frequency
      if (this.frameCount % this.processInterval !== 0) {
        return true;
      }

      // Process audio with enhanced VAD
      this.processAudioSafely(inputChannel);
      
    } catch (error) {
      this.handleProcessingError(error);
    }

    return true;
  }

  processAudioSafely(samples) {
    try {
      // Apply pre-emphasis filter
      const enhancedSamples = this.applyPreEmphasis(samples);
      
      // Calculate energy for VAD
      const energy = this.calculateSmoothEnergy(enhancedSamples);
      
      // Update adaptive threshold
      this.updateAdaptiveThreshold(energy);
      
      // Voice Activity Detection
      const speechDetected = this.detectVoiceActivity(energy);
      
      if (speechDetected) {
        this.handleSpeechDetected(enhancedSamples, energy);
      } else {
        this.handleSilenceDetected();
      }
      
    } catch (error) {
      throw new Error(`Audio processing failed: ${error.message}`);
    }
  }

  applyPreEmphasis(samples) {
    const enhanced = new Float32Array(samples.length);
    
    try {
      enhanced[0] = samples[0] - this.preEmphasisAlpha * this.lastSample;
      
      for (let i = 1; i < samples.length; i++) {
        enhanced[i] = samples[i] - this.preEmphasisAlpha * samples[i - 1];
      }
      
      this.lastSample = samples[samples.length - 1];
      return enhanced;
    } catch (error) {
      // Fallback to original samples if pre-emphasis fails
      console.warn('Pre-emphasis failed, using original samples');
      return samples;
    }
  }

  calculateSmoothEnergy(samples) {
    let energy = 0;
    
    try {
      // RMS energy calculation
      for (let i = 0; i < samples.length; i++) {
        energy += samples[i] * samples[i];
      }
      
      energy = Math.sqrt(energy / samples.length);
      
      // Apply smoothing
      this.lastEnergy = this.lastEnergy * (1 - this.energySmoothingFactor) + 
                        energy * this.energySmoothingFactor;
      
      // Noise floor subtraction with safety check
      const adjustedEnergy = Math.max(0, this.lastEnergy - this.noiseFloor);
      
      return adjustedEnergy;
    } catch (error) {
      console.warn('Energy calculation failed, using last known energy');
      return this.lastEnergy || 0;
    }
  }

  updateAdaptiveThreshold(energy) {
    try {
      this.energyHistory.push(energy);
      
      if (this.energyHistory.length > this.maxHistorySize) {
        this.energyHistory.shift();
      }
      
      if (this.energyHistory.length >= 10) {
        const mean = this.energyHistory.reduce((a, b) => a + b) / this.energyHistory.length;
        const variance = this.energyHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.energyHistory.length;
        const stdDev = Math.sqrt(variance);
        
        // Conservative adaptive threshold
        this.adaptiveThreshold = Math.max(
          this.vadThreshold,
          mean + 1.5 * stdDev
        );
      }
    } catch (error) {
      console.warn('Adaptive threshold update failed, using default');
    }
  }

  detectVoiceActivity(energy) {
    try {
      // Primary energy-based detection
      const energyDetection = energy > this.adaptiveThreshold;
      
      // Consistency check for ongoing speech
      const consistencyDetection = this.isProcessing && energy > this.vadThreshold * 0.3;
      
      return energyDetection || consistencyDetection;
    } catch (error) {
      console.warn('VAD failed, falling back to energy threshold');
      return energy > this.vadThreshold;
    }
  }

  handleSpeechDetected(samples, energy) {
    try {
      this.silenceFrames = 0;
      
      if (!this.isProcessing) {
        this.isProcessing = true;
        this.speechBuffer = [];
        this.port.postMessage({ 
          type: 'speechStart',
          timestamp: Date.now(),
          energy: energy
        });
      }
      
      // Add to speech buffer with overflow protection
      this.addToSpeechBuffer(samples);
      
      // Convert to PCM and send (keeping original format for compatibility)
      const pcmData = this.convertToPCM(samples);
      
      this.port.postMessage({
        type: 'audioData',
        data: pcmData.buffer,
        energy: energy,
        timestamp: Date.now(),
        bufferLevel: this.speechBuffer.length / this.maxBufferSize
      }, [pcmData.buffer]);
    } catch (error) {
      console.error('Speech handling error:', error);
    }
  }

  handleSilenceDetected() {
    try {
      if (this.isProcessing) {
        this.silenceFrames++;
        
        if (this.silenceFrames > this.maxSilenceFrames) {
          this.isProcessing = false;
          
          const duration = this.speechBuffer.length / 16000; // Assume 16kHz
          
          this.port.postMessage({ 
            type: 'speechEnd',
            duration: duration,
            totalSamples: this.speechBuffer.length,
            timestamp: Date.now()
          });
          
          // Clear speech buffer
          this.speechBuffer = [];
        }
      }
    } catch (error) {
      console.error('Silence handling error:', error);
    }
  }

  addToSpeechBuffer(samples) {
    try {
      for (let i = 0; i < samples.length; i++) {
        if (this.speechBuffer.length < this.maxBufferSize) {
          this.speechBuffer.push(samples[i]);
        } else {
          // Circular buffer behavior
          this.speechBuffer.shift();
          this.speechBuffer.push(samples[i]);
        }
      }
    } catch (error) {
      console.error('Buffer management error:', error);
    }
  }

  convertToPCM(samples) {
    try {
      const pcmData = new Int16Array(samples.length);
      
      for (let i = 0; i < samples.length; i++) {
        // Convert from [-1, 1] to [-32768, 32767] and clamp
        const sample = Math.max(-1, Math.min(1, samples[i]));
        pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
      
      return pcmData;
    } catch (error) {
      console.error('PCM conversion error:', error);
      // Return empty buffer on error
      return new Int16Array(samples.length);
    }
  }

  handleProcessingError(error) {
    this.errorCount++;
    
    console.error(`Audio processor error ${this.errorCount}:`, error);
    
    if (this.errorCount > this.maxErrors) {
      this.port.postMessage({
        type: 'processorError',
        error: 'Too many processing errors, processor may be unstable',
        errorCount: this.errorCount
      });
    } else {
      this.port.postMessage({
        type: 'processingWarning',
        error: error.message,
        errorCount: this.errorCount
      });
    }
  }
}

// Register the processor with error handling
try {
  registerProcessor('voice-audio-processor', VoiceAudioProcessor);
  console.log('✅ Voice Audio Processor registered successfully');
} catch (error) {
  console.error('❌ Failed to register Voice Audio Processor:', error);
}

// Also register with alternative name for compatibility
try {
  registerProcessor('voice-audio-processor-vad', VoiceAudioProcessor);
  console.log('✅ Voice Audio Processor (VAD) registered successfully');
} catch (error) {
  console.warn('Alternative processor registration failed:', error);
}
