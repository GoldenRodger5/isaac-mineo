import React, { useState, useEffect } from 'react';
import { voiceService } from '../services/voiceService';

const VoiceChat = ({ sessionId, onVoiceResponse, onError, className = '', disabled = false }) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('checking');
  const [lastTranscript, setLastTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Set up voice service callbacks
    voiceService.setOnStatusChange((status, enabled) => {
      setVoiceStatus(status);
      setIsVoiceEnabled(enabled);
    });

    voiceService.setOnTranscript((transcript) => {
      setLastTranscript(transcript);
      setIsProcessing(true);
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

    voiceService.setOnError((error) => {
      setIsProcessing(false);
      setIsRecording(false);
      setIsListening(false);
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
  }, [onVoiceResponse, onError]);

  const startVoiceChat = async () => {
    const success = await voiceService.startVoiceChat(sessionId);
    if (success) {
      setIsListening(true);
    }
  };

  const stopVoiceChat = () => {
    voiceService.stopVoiceChat();
    setIsListening(false);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      voiceService.stopRecording();
      setIsRecording(false);
    } else {
      voiceService.startRecording();
      setIsRecording(true);
    }
  };

  const interruptAudio = () => {
    voiceService.interrupt();
  };

  const getStatusMessage = () => {
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
              {/* Push to Talk Button */}
              <button
                onMouseDown={toggleRecording}
                onMouseUp={toggleRecording}
                onTouchStart={toggleRecording}
                onTouchEnd={toggleRecording}
                disabled={disabled}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-110 shadow-lg' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isRecording ? "Release to stop recording" : "Hold to speak"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

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
