import React, { useState, useEffect } from 'react';
import voiceService from '../services/voiceService';

const VoiceChat = ({ sessionId, onVoiceResponse, onError, className = '', disabled = false }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('checking');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    voiceService.setOnLiveTranscript((text) => {
      setLiveTranscript(text);
    });

    voiceService.setOnTranscript((text) => {
      setFinalTranscript(text);
      setLiveTranscript(''); // Clear live transcript when we get final
    });

    voiceService.setOnStatusChange((status) => {
      setVoiceStatus(status);
      setIsVoiceEnabled(status === 'ready');
    });

    voiceService.setOnResponse((response) => {
      if (response && onVoiceResponse) {
        onVoiceResponse({
          response: response,
          timestamp: new Date()
        });
      }
    });

    voiceService.setOnAIStateChange((state) => {
      setIsAIResponding(state.isResponding || false);
      setIsProcessing(state.isProcessing || false);
      setIsListening(state.isListening || false);
    });

    // Add dedicated listener for voice service listening state changes
    voiceService.setOnListeningStateChange = (callback) => {
      voiceService.onListeningStateChange = callback;
    };
    
    voiceService.setOnListeningStateChange((isListeningNow) => {
      console.log('🎙️ Listening state changed:', isListeningNow);
      setIsListening(isListeningNow);
    });

    voiceService.setOnError((error) => {
      if (onError) {
        onError({
          message: error.message || 'Voice service error',
          type: 'voice'
        });
      }
    });

    // Force re-check of voice support after component mounts
    setTimeout(() => {
      voiceService.checkVoiceSupport();
    }, 1000);

    return () => {
      // No cleanup needed as voiceService is a singleton
    };
  }, [onVoiceResponse, onError]);

  const startVoiceChat = async () => {
    const success = await voiceService.startVoiceChat(sessionId);
    if (!success && onError) {
      onError({
        message: 'Failed to start voice chat',
        type: 'voice'
      });
    }
  };

  const stopVoiceChat = () => {
    voiceService.stopVoiceChat();
    setIsListening(false);
    setLiveTranscript('');
    setFinalTranscript('');
    setIsAIResponding(false);
    setIsProcessing(false);
  };

  const toggleListening = async () => {
    if (isListening) {
      voiceService.stopContinuousListening();
    } else {
      // First ensure voice chat WebSocket is connected
      if (!voiceService.websocket || voiceService.websocket.readyState !== WebSocket.OPEN) {
        console.log('🔌 Starting voice chat session first...');
        const success = await voiceService.startVoiceChat(sessionId);
        if (!success) {
          console.error('Failed to start voice chat session');
          return;
        }
        // Wait a moment for connection to establish
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Now start continuous listening
      console.log('🎙️ Starting continuous listening...');
      const success = await voiceService.startContinuousListening();
      if (!success) {
        console.error('Failed to start continuous listening');
      }
    }
  };

  const getStatusMessage = () => {
    if (isProcessing) {
      return '🔄 Processing...';
    } else if (isAIResponding) {
      return '🤖 AI is responding...';
    } else if (isListening) {
      return '👂 Listening...';
    } else if (isVoiceEnabled) {
      return '🎙️ Ready to listen';
    }
    
    switch (voiceStatus) {
      case 'ready':
        return '🎙️ Voice chat ready';
      case 'checking':
        return '🔄 Checking voice services...';
      case 'not_supported':
        return '❌ Voice not supported in this browser';
      case 'needs_setup':
        return '⚠️ Voice services need configuration';
      default:
        return '❓ Voice status unknown';
    }
  };

  const sendTextWithVoice = async (text) => {
    if (!text?.trim()) return null;
    
    console.log('🔊 Sending text with voice:', text);
    
    // Ensure session ID is set before making the call
    if (!voiceService.sessionId && sessionId) {
      voiceService.sessionId = sessionId;
    }
    
    const result = await voiceService.sendTextWithVoice(text);
    console.log('🔊 Voice result:', result);
    return result;
  };

  // Expose the sendTextWithVoice function to parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.voiceChatAPI = { sendTextWithVoice };
    }
  }, [sessionId]);

  if (!isVoiceEnabled && voiceStatus === 'checking') {
    return (
      <div className={`flex items-center justify-center p-2 text-sm text-gray-500 ${className}`}>
        <span className="animate-spin mr-2">🔄</span>
        <span>{getStatusMessage()}</span>
      </div>
    );
  }

  // Show voice controls regardless of voice status for better UX
  const showVoiceControls = isVoiceEnabled || voiceStatus === 'checking';

  return (
    <div className={`voice-chat-container ${className}`}>
      {/* Voice Status Display */}
      {voiceStatus !== 'ready' && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <span className="text-gray-600 text-xs">{getStatusMessage()}</span>
        </div>
      )}

      {/* Voice Controls */}
      {showVoiceControls && (
        <div className="flex items-center justify-center space-x-2">
          {/* Main Microphone Button - Primary Action */}
          <button
            onClick={toggleListening}
            disabled={disabled || isProcessing || voiceStatus !== 'ready'}
            className={`p-3 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 animate-pulse text-white shadow-lg'
                : voiceStatus === 'ready'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed text-white'
            }`}
            title={
              voiceStatus !== 'ready' 
                ? 'Voice services initializing...' 
                : isListening 
                  ? 'Click to stop listening' 
                  : 'Click to start voice chat'
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          {/* Stop Voice Chat Button (only show when listening) */}
          {isListening && (
            <button
              onClick={stopVoiceChat}
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
              title="Stop voice chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Live Transcription Display */}
          {isListening && (liveTranscript || finalTranscript) && (
            <div className="max-w-xs bg-gray-100 border rounded-lg p-2 text-sm mt-2">
              {liveTranscript && (
                <div className="text-gray-600 italic">
                  <span className="text-blue-600">🎤</span> {liveTranscript}
                </div>
              )}
              {finalTranscript && (
                <div className="text-gray-800 font-medium">
                  <span className="text-green-600">✓</span> {finalTranscript}
                </div>
              )}
            </div>
          )}

          {/* AI Response Status */}
          {isAIResponding && (
            <div className="flex items-center space-x-2 text-blue-600 mt-2">
              <span className="animate-spin">🤖</span>
              <span className="text-sm font-medium">AI is responding...</span>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center space-x-2 text-orange-600 mt-2">
              <span className="animate-spin">⚙️</span>
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
        </div>
      )}

      {/* Voice Not Available */}
      {voiceStatus === 'not_supported' && (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🚫</div>
          <p className="text-gray-600 text-sm">
            Voice chat is not supported in your browser.
            <br />
            Try Chrome, Firefox, or Safari for the best experience.
          </p>
        </div>
      )}

      {/* Voice Needs Setup */}
      {voiceStatus === 'needs_setup' && (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-gray-600 text-sm">
            Voice services need to be configured.
            <br />
            Please check the backend configuration.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
