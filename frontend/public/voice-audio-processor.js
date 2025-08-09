/**
 * Audio Worklet Processor for Voice Chat
 * Processes microphone audio data for speech-to-text transcription
 * Replaces deprecated ScriptProcessorNode with modern AudioWorkletNode
 */

class VoiceAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isListening = false;
    
    // Listen for messages from the main thread
    this.port.onmessage = (event) => {
      if (event.data.command === 'start') {
        this.isListening = true;
      } else if (event.data.command === 'stop') {
        this.isListening = false;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    // Only process audio when listening
    if (!this.isListening || !input || input.length === 0) {
      return true;
    }

    const inputChannel = input[0];
    if (!inputChannel || inputChannel.length === 0) {
      return true;
    }

    // Convert Float32Array to Int16Array (PCM format for Deepgram)
    const pcmData = new Int16Array(inputChannel.length);
    for (let i = 0; i < inputChannel.length; i++) {
      // Convert from [-1, 1] to [-32768, 32767] and clamp
      const sample = Math.max(-1, Math.min(1, inputChannel[i]));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    // Send PCM data to main thread for WebSocket transmission
    this.port.postMessage({
      type: 'audioData',
      data: pcmData.buffer
    }, [pcmData.buffer]);

    return true; // Keep processor alive
  }
}

registerProcessor('voice-audio-processor', VoiceAudioProcessor);
