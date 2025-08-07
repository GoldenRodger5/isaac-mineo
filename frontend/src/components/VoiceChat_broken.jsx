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
    // Set up voice service callbacks
    voiceService.setOnStatusChange((status, enabled) => {
      setVoiceStatus(status);
      setIsVoiceEnabled(enabled);
    });

    voiceService.setOnLiveTranscript((transcript) => {
      setLiveTranscript(transcript);
      
      // If AI is responding and user starts talking, interrupt
      if (isAIResponding && transcript.trim()) {
        voiceService.handleUserInterruption();
      }
    });

    voiceService.setOnTranscript((transcript, isFinal) => {
      if (isFinal) {
        setFinalTranscript(transcript);
        setLiveTranscript(''); // Clear live transcript when final
        setIsProcessing(true);
      }
    });

    voiceService.setOnResponse((text, audioUrl) => {
      setIsProcessing(false);
      if (onVoiceResponse) {
        onVoiceResponse({
          text,
          audioUrl,
          isVoice: true,
          timestamp: new Date()
        });
      }
    });

    voiceService.setOnAIStateChange((isResponding) => {
      setIsAIResponding(isResponding);
      if (!isResponding) {
        setIsProcessing(false);
      }
    });

    voiceService.setOnError((error) => {
      setIsProcessing(false);
      setIsListening(false);
      setIsAIResponding(false);
      if (onError) {
        onError(error);
      }
    });

    // Initial check
    voiceService.checkVoiceSupport();

    return () => {
      // Cleanup on unmount
      voiceService.stopVoiceChat();
    };
  }, [onVoiceResponse, onError, isAIResponding]);

  const startVoiceChat = async () => {
    const success = await voiceService.startVoiceChat(sessionId);
    if (success) {
      setIsListening(true);
      // Start continuous listening immediately
      voiceService.startContinuousListening();
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
      stopVoiceChat();
    } else {
      startVoiceChat();
    }
  };

  const getStatusMessage = () => {
    if (isListening && isAIResponding) {
      return '🤖 AI is responding...';
    } else if (isListening && liveTranscript) {
      return '👂 Listening...';
    } else if (isListening) {
      return '🎙️ Ready to listen';
    }
    
    switch (voiceStatus) {
      case 'ready':
        return '🎙️ Voice chat ready';
      case 'checking':
        return '🔄 Checking voice services...';
      case 'not_supported':
        return '❌ Voice not supported in this browser';
      case 'backend_not_configured':
        return '⚠️ Voice services need configuration';
      case 'error':
        return '❌ Voice service error';
      default:
        return '🔄 Loading...';
    }
  };

  const sendTextWithVoice = async (text) => {
    if (!isVoiceEnabled) return null;
    
    setIsProcessing(true);
    const result = await voiceService.sendTextWithVoice(text);
    setIsProcessing(false);
    
    return result;
  };

  // Expose the sendTextWithVoice function to parent component
  useEffect(() => {
    if (window.voiceChatAPI) {
      window.voiceChatAPI.sendTextWithVoice = sendTextWithVoice;
    } else {
      window.voiceChatAPI = { sendTextWithVoice };
    }
  }, [isVoiceEnabled]);

  if (!isVoiceEnabled && voiceStatus !== 'checking') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>{getStatusMessage()}</span>
      </div>
    );
  }

  const isMobile = className.includes('mobile-voice-controls');

  return (
    <div className={`flex items-center space-x-2 ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${
      isMobile ? 'flex-col space-y-2 space-x-0' : ''
    }`}>
      {/* Voice Status Indicator - Hide on mobile to save space */}
      {!isMobile && (
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            voiceStatus === 'ready' ? 'bg-green-500' : 
            voiceStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span className="text-gray-600">{getStatusMessage()}</span>
        </div>
      )}

      {isVoiceEnabled && (
        <>
          {/* Voice Chat Toggle */}
          {!isListening ? (
            <button
              onClick={startVoiceChat}
              disabled={disabled}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Start continuous voice chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Voice Chat</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Listening Indicator and Microphone */}
              <button
                onClick={stopVoiceChat}
                disabled={disabled}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isListening 
                    ? 'bg-green-500 hover:bg-green-600 text-white scale-110 shadow-lg animate-pulse' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Click to stop voice chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Stop Voice Chat */}
              <button
                onClick={stopVoiceChat}
                className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Stop voice chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">AI Responding...</span>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && !isAIResponding && (
            <div className="flex items-center space-x-2 text-orange-600">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
            <button
              onClick={startVoiceChat}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Start voice chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Voice Chat</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Click to Toggle Recording Button */}
              <button
                onClick={toggleListening}
                disabled={disabled}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-110 shadow-lg animate-pulse' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isRecording ? "Click to stop recording" : "Click to start recording"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Recording Status Indicator */}
              {isRecording && (
                <div className="flex items-center space-x-1 text-red-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Recording...</span>
                </div>
              )}

              {/* Interrupt Button */}
              <button
                onClick={interruptAudio}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                title="Interrupt current response"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                </svg>
              </button>

              {/* Stop Voice Chat */}
              <button
                onClick={stopVoiceChat}
                className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Stop voice chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}

          {/* Last Transcript */}
          {lastTranscript && (
            <div className="max-w-xs text-sm text-gray-600 italic truncate" title={lastTranscript}>
              "{lastTranscript}"
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceChat;
