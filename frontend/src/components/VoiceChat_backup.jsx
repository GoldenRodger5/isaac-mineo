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
    voiceService.setTranscriptCallback((data) => {
      if (data.type === 'live') {
        setLiveTranscript(data.text);
      }
    });

    voiceService.setFinalTranscriptCallback((data) => {
      if (data.type === 'final') {
        setFinalTranscript(data.text);
        setLiveTranscript(''); // Clear live transcript when we get final
      }
    });

    voiceService.setStatusCallback((status) => {
      setVoiceStatus(status);
      setIsVoiceEnabled(status === 'ready');
    });

    voiceService.setAIResponseCallback((data) => {
      setIsAIResponding(data.isResponding);
      if (data.response && onVoiceResponse) {
        onVoiceResponse({
          response: data.response,
          timestamp: new Date()
        });
      }
    });

    voiceService.setProcessingCallback((isProcessingNow) => {
      setIsProcessing(isProcessingNow);
    });

    voiceService.setListeningCallback((listening) => {
      setIsListening(listening);
    });

    voiceService.setErrorCallback((error) => {
      if (onError) {
        onError({
          message: error.message || 'Voice service error',
          type: 'voice'
        });
      }
    });

    return () => {
      voiceService.cleanup();
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

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
    } else {
      voiceService.startContinuousListening();
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
    
    setIsProcessing(true);
    const result = await voiceService.sendTextWithVoice(text);
    setIsProcessing(false);
    
    return result;
  };

  // Expose the sendTextWithVoice function to parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.voiceChatAPI = { sendTextWithVoice };
    }
  }, []);

  if (!isVoiceEnabled && voiceStatus === 'checking') {
    return (
      <div className={`flex items-center justify-center p-4 text-sm text-gray-500 ${className}`}>
        <span className="animate-spin mr-2">🔄</span>
        <span>{getStatusMessage()}</span>
      </div>
    );
  }

  return (
    <div className={`voice-chat-container ${className}`}>
      {/* Voice Status Display */}
      {voiceStatus !== 'ready' && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-gray-600">{getStatusMessage()}</span>
        </div>
      )}

      {/* Voice Controls */}
      {isVoiceEnabled && (
        <div className="flex flex-col items-center space-y-4">
          {/* Main Voice Button */}
          {!isListening ? (
            <button
              onClick={startVoiceChat}
              disabled={disabled || isProcessing}
              className={`p-4 rounded-full transition-all duration-200 ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
              } text-white shadow-lg hover:shadow-xl`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleListening}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } text-white shadow-lg hover:shadow-xl`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <button
                onClick={stopVoiceChat}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                title="Stop voice chat"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Live Transcription Display */}
          {isListening && (liveTranscript || finalTranscript) && (
            <div className="max-w-xs bg-gray-100 border rounded-lg p-2 text-sm">
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
            <div className="flex items-center space-x-2 text-blue-600">
              <span className="animate-spin">🤖</span>
              <span className="text-sm font-medium">AI is responding...</span>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center space-x-2 text-orange-600">
              <span className="animate-spin">⚙️</span>
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium">
              {getStatusMessage()}
            </p>
          </div>
        </div>
      )}

      {/* Voice Not Available */}
      {voiceStatus === 'not_supported' && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🚫</div>
          <p className="text-gray-600 text-sm">
            Voice chat is not supported in your browser.
            <br />
            Try Chrome, Firefox, or Safari for the best experience.
          </p>
        </div>
      )}

      {/* Voice Needs Setup */}
      {voiceStatus === 'needs_setup' && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">⚠️</div>
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
