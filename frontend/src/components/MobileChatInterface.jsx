import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
// import VoiceChat from './VoiceChat'; // Commented out - voice functionality disabled

const MobileChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  suggestedQuestions = [],
  placeholder = "Type your message...",
  sessionId,
  onVoiceResponse,
  onVoiceError
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialViewportHeight = useRef(window.innerHeight);

  // Handle virtual keyboard
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      
      // If height decreased by more than 150px, assume keyboard is open
      if (heightDifference > 150) {
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    if (textToSend && !isLoading) {
      onSendMessage(textToSend);
      setInputValue('');
      inputRef.current?.blur(); // Hide keyboard after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={`flex flex-col h-full bg-white ${isKeyboardVisible ? 'keyboard-open' : ''}`}
      style={{
        '--vh': `${window.innerHeight * 0.01}px`
      }}
    >
      {/* Messages Container - Optimized */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              message.isBot
                ? 'bg-gray-50 text-gray-900 rounded-bl-sm border border-gray-200'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm shadow-md'
            }`}>
              {message.isBot && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🤖</span>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">AI Assistant</span>
                </div>
              )}
              <div className="text-sm leading-relaxed">
                {typeof message.text === 'string' ? (
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-strong:font-bold prose-em:italic prose-ul:my-2 prose-li:my-0">
                    <ReactMarkdown>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.text
                )}
              </div>
              {message.timestamp && (
                <div className={`text-xs mt-2 ${
                  message.isBot ? 'text-gray-500' : 'text-white/70'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator - Optimized */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🤖</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - Mobile Optimized */}
      {suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 6).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSend(question)}
                className="bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors duration-200 border border-gray-200 min-h-[44px] flex items-center justify-center"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Optimized for Mobile */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900 placeholder-gray-500 leading-relaxed"
              rows={3}
              style={{ 
                minHeight: '120px', 
                maxHeight: '180px',
                fontSize: '16px' // Prevents zoom on iOS
              }}
              disabled={isLoading}
            />
            {/* Character count for long messages */}
            {inputValue.length > 200 && (
              <div className="absolute -top-6 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {inputValue.length}/500
              </div>
            )}
          </div>
          
          {/* Voice Controls - Disabled
          {onVoiceResponse && (
            <VoiceChat
              onVoiceResponse={onVoiceResponse}
              onVoiceError={onVoiceError}
              sessionId={sessionId}
              disabled={isLoading}
              className="mobile-voice-controls"
            />
          )}
          */}
          
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 shadow-sm min-w-[56px] min-h-[56px] flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Helper text - Voice functionality disabled */}
        <div className="mt-3 flex items-center justify-center">
          <p className="text-xs text-gray-500">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
};

export default MobileChatInterface;
