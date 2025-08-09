// AudioWorkletProcessor for real-time audio processing
// This replaces the deprecated ScriptProcessorNode

class VoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isListening = true;
    
    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'stop') {
        this.isListening = false;
      } else if (event.data.type === 'start') {
        this.isListening = true;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0 && this.isListening) {
      const inputChannel = input[0];
      
      if (inputChannel && inputChannel.length > 0) {
        // Convert Float32Array to Int16Array (PCM format for Deepgram)
        const pcmData = new Int16Array(inputChannel.length);
        
        for (let i = 0; i < inputChannel.length; i++) {
          // Convert from [-1, 1] to [-32768, 32767] and clamp
          const sample = Math.max(-1, Math.min(1, inputChannel[i]));
          pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
        
        // Send PCM data to main thread
        this.port.postMessage({
          type: 'audioData',
          data: pcmData.buffer,
          samples: pcmData.length
        });
      }
    }
    
    // Keep the processor alive
    return this.isListening;
  }
}

registerProcessor('voice-audio-processor', VoiceAudioProcessor);
