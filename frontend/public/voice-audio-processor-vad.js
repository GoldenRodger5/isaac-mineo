// Enhanced Voice Audio Processor with Voice Activity Detection (VAD)
// Optimized for better performance, noise reduction, and smart audio processing

class VoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Voice Activity Detection parameters
    this.vadThreshold = 0.01;          // Energy threshold for speech detection
    this.silenceFrames = 0;            // Counter for silence frames
    this.maxSilenceFrames = 30;        // ~1 second at 16kHz (30 * 128 / 16000)
    this.isProcessing = false;         // Current processing state
    this.speechBuffer = [];            // Buffer for speech segments
    this.maxBufferSize = 16000 * 3;    // 3 seconds max buffer
    
    // Noise reduction
    this.noiseFloor = 0.005;           // Minimum noise level
    this.adaptiveThreshold = 0.01;     // Adaptive VAD threshold
    this.energyHistory = [];           // Energy level history for adaptation
    this.maxHistorySize = 100;         // Keep last 100 energy measurements
    
    // Performance optimization
    this.frameCount = 0;
    this.processInterval = 4;          // Process every 4th frame to reduce CPU usage
    this.energySmoothingFactor = 0.3;  // Smoothing for energy calculation
    this.lastEnergy = 0;
    
    // Audio quality enhancement
    this.preEmphasisAlpha = 0.97;      // Pre-emphasis filter coefficient
    this.lastSample = 0;               // For pre-emphasis filter
    
    // Debugging
    this.debugMode = false;
    this.statsCounter = 0;
    
    console.log('🎤 Enhanced Voice Audio Processor initialized with VAD');
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length === 0 || input[0].length === 0) {
      return true;
    }

    const samples = input[0];
    this.frameCount++;
    
    // Optimize processing - only process every Nth frame
    if (this.frameCount % this.processInterval !== 0) {
      return true;
    }

    try {
      // Apply pre-emphasis filter to enhance speech
      const enhancedSamples = this.applyPreEmphasis(samples);
      
      // Calculate energy for VAD
      const energy = this.calculateSmoothEnergy(enhancedSamples);
      
      // Update adaptive threshold
      this.updateAdaptiveThreshold(energy);
      
      // Voice Activity Detection
      const speechDetected = this.detectVoiceActivity(energy);
      
      if (speechDetected) {
        this.handleSpeechDetected(enhancedSamples);
      } else {
        this.handleSilenceDetected();
      }
      
      // Send debugging stats periodically
      if (this.debugMode && this.statsCounter++ % 50 === 0) {
        this.sendDebugStats(energy, speechDetected);
      }
      
    } catch (error) {
      console.error('VAD processing error:', error);
    }

    return true;
  }

  // Apply pre-emphasis filter to enhance speech frequencies
  applyPreEmphasis(samples) {
    const enhanced = new Float32Array(samples.length);
    
    enhanced[0] = samples[0] - this.preEmphasisAlpha * this.lastSample;
    
    for (let i = 1; i < samples.length; i++) {
      enhanced[i] = samples[i] - this.preEmphasisAlpha * samples[i - 1];
    }
    
    this.lastSample = samples[samples.length - 1];
    return enhanced;
  }

  // Calculate smoothed energy with noise reduction
  calculateSmoothEnergy(samples) {
    let energy = 0;
    
    for (let i = 0; i < samples.length; i++) {
      energy += samples[i] * samples[i];
    }
    
    energy = energy / samples.length;
    
    // Apply smoothing
    this.lastEnergy = this.lastEnergy * (1 - this.energySmoothingFactor) + 
                      energy * this.energySmoothingFactor;
    
    // Noise floor subtraction
    const adjustedEnergy = Math.max(0, this.lastEnergy - this.noiseFloor);
    
    return adjustedEnergy;
  }

  // Update adaptive VAD threshold based on recent energy history
  updateAdaptiveThreshold(energy) {
    this.energyHistory.push(energy);
    
    if (this.energyHistory.length > this.maxHistorySize) {
      this.energyHistory.shift();
    }
    
    if (this.energyHistory.length >= 20) {
      // Calculate moving average and standard deviation
      const mean = this.energyHistory.reduce((a, b) => a + b) / this.energyHistory.length;
      const variance = this.energyHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.energyHistory.length;
      const stdDev = Math.sqrt(variance);
      
      // Adaptive threshold: mean + 2 * standard deviation, with minimum floor
      this.adaptiveThreshold = Math.max(
        this.vadThreshold,
        mean + 2 * stdDev
      );
    }
  }

  // Enhanced voice activity detection
  detectVoiceActivity(energy) {
    // Multiple criteria for better accuracy
    const energyCriteria = energy > this.adaptiveThreshold;
    const consistencyCriteria = this.energyHistory.length >= 3 && 
      this.energyHistory.slice(-3).every(e => e > this.vadThreshold * 0.5);
    
    return energyCriteria || (this.isProcessing && consistencyCriteria);
  }

  // Handle detected speech
  handleSpeechDetected(samples) {
    this.silenceFrames = 0;
    
    if (!this.isProcessing) {
      this.isProcessing = true;
      this.speechBuffer = [];
      this.port.postMessage({ 
        type: 'speechStart',
        timestamp: currentFrame / sampleRate
      });
    }
    
    // Add to speech buffer
    this.addToSpeechBuffer(samples);
    
    // Convert to PCM and send
    const pcmData = this.convertToPCM(samples);
    this.port.postMessage({
      type: 'audioData',
      data: pcmData.buffer,
      energy: this.lastEnergy,
      timestamp: currentFrame / sampleRate
    });
  }

  // Handle detected silence
  handleSilenceDetected() {
    if (this.isProcessing) {
      this.silenceFrames++;
      
      if (this.silenceFrames > this.maxSilenceFrames) {
        this.isProcessing = false;
        this.port.postMessage({ 
          type: 'speechEnd',
          duration: this.speechBuffer.length / sampleRate,
          totalSamples: this.speechBuffer.length
        });
        
        // Clear speech buffer
        this.speechBuffer = [];
      }
    }
  }

  // Add samples to speech buffer with overflow protection
  addToSpeechBuffer(samples) {
    for (let i = 0; i < samples.length; i++) {
      if (this.speechBuffer.length < this.maxBufferSize) {
        this.speechBuffer.push(samples[i]);
      } else {
        // Remove oldest samples if buffer is full
        this.speechBuffer.shift();
        this.speechBuffer.push(samples[i]);
      }
    }
  }

  // Optimized PCM conversion with improved precision
  convertToPCM(samples) {
    const pcmData = new Int16Array(samples.length);
    
    for (let i = 0; i < samples.length; i++) {
      // Apply soft clipping to prevent harsh distortion
      let sample = Math.tanh(samples[i] * 1.2); // Soft saturation
      
      // Convert to 16-bit PCM
      sample = Math.max(-1, Math.min(1, sample));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    return pcmData;
  }

  // Send debugging statistics
  sendDebugStats(energy, speechDetected) {
    this.port.postMessage({
      type: 'debugStats',
      energy: energy.toFixed(6),
      threshold: this.adaptiveThreshold.toFixed(6),
      speechDetected,
      isProcessing: this.isProcessing,
      silenceFrames: this.silenceFrames,
      bufferSize: this.speechBuffer.length,
      historySize: this.energyHistory.length
    });
  }

  // Handle messages from main thread
  static get parameterDescriptors() {
    return [];
  }
}

// Register the processor
registerProcessor('voice-audio-processor-vad', VoiceAudioProcessor);

console.log('🎤 Enhanced Voice Audio Processor with VAD registered successfully!');
