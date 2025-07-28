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
    <div className={`flex flex-col h-full ${isKeyboardVisible ? 'keyboard-open' : ''}`}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.isBot
                ? 'bg-gray-100 text-gray-900 rounded-bl-sm'
                : 'bg-blue-600 text-white rounded-br-sm'
            }`}>
              {message.isBot && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🤖</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">AI Assistant</span>
                </div>
              )}
              <div className="text-sm leading-relaxed">
                {typeof message.text === 'string' ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: message.text.replace(/\n/g, '<br/>') 
                  }} />
                ) : (
                  message.text
                )}
              </div>
              {message.timestamp && (
                <div className={`text-xs mt-2 ${
                  message.isBot ? 'text-gray-500' : 'text-blue-100'
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
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSend(question)}
                className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            {/* Character count for long messages */}
            {inputValue.length > 200 && (
              <div className="absolute -top-6 right-2 text-xs text-gray-500">
                {inputValue.length}/500
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileChatInterface;
