import React, { useState, useEffect, useRef } from 'react';

const MobileChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  suggestedQuestions = [],
  placeholder = "Type your message..." 
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
    <div className={`flex flex-col h-full glass-heavy ${isKeyboardVisible ? 'keyboard-open' : ''}`}>
      {/* Messages Container - Enhanced */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-float-professional`}
          >
            <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-xl animate-magnetic backdrop-blur-sm ${
              message.isBot
                ? 'bg-white text-gray-900 rounded-bl-sm border-2 border-gray-300'
                : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-br-sm shadow-xl'
            }`}>
              {message.isBot && (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">🤖</span>
                  </div>
                  <span className="text-sm text-gray-700 font-bold">AI Assistant</span>
                </div>
              )}
              <div className="text-sm leading-relaxed font-medium">
                {typeof message.text === 'string' ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.text.replace(/\n/g, '<br/>') 
                  }} />
                ) : (
                  message.text
                )}
              </div>
              {message.timestamp && (
                <div className={`text-xs mt-3 font-medium ${
                  message.isBot ? 'text-gray-700' : 'text-white/70'
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
        
        {/* Enhanced Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-light rounded-2xl rounded-bl-sm px-6 py-4 max-w-[85%] border-2 border-white/20 shadow-xl animate-magnetic backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">🤖</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-accent-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-3 h-3 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-300 font-bold">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="px-6 py-4 border-t border-white/20">
          <div className="flex flex-wrap gap-3">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSend(question)}
                className="glass-light text-primary-300 px-4 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-all duration-300 border-2 border-primary-500/30 animate-magnetic shadow-lg"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="border-t border-white/30 p-6 glass-heavy">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-6 py-4 glass-light border-2 border-white/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 text-base font-medium text-gray-200 placeholder-gray-500 backdrop-blur-sm shadow-inner"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            {/* Character count for long messages */}
            {inputValue.length > 200 && (
              <div className="absolute -top-6 right-2 text-xs text-gray-600 font-bold">
                {inputValue.length}/500
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-4 rounded-2xl hover:from-primary-600 hover:to-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 shadow-xl animate-magnetic hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileChatInterface;
