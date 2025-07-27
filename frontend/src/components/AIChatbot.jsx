import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';

// Simple function to format AI responses
const formatAIResponse = (text) => {
  if (!text) return text;
  
  // Convert markdown-style formatting to HTML-like styling
  return text
    // Remove markdown headers and replace with bold
    .replace(/#{1,6}\s+(.+)/g, '<strong>$1</strong>')
    // Convert **bold** to <strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Convert bullet points from * to •
    .replace(/^\s*[\*\-]\s+(.+)/gm, '• $1')
    // Ensure proper paragraph breaks
    .replace(/\n\s*\n/g, '\n\n')
    // Clean up any remaining markdown symbols
    .replace(/\*+/g, '')
    .replace(/#+/g, '');
};

// Component to render formatted text
const FormattedText = ({ text }) => {
  const formattedText = formatAIResponse(text);
  
  return (
    <div className="text-sm">
      {formattedText.split('\n\n').map((paragraph, index) => {
        if (!paragraph.trim()) return null;
        
        // Handle bullet points
        if (paragraph.includes('•')) {
          const lines = paragraph.split('\n').filter(line => line.trim());
          return (
            <div key={index} className="mb-2">
              {lines.map((line, lineIndex) => (
                <div key={lineIndex} className="mb-1" 
                     dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </div>
          );
        }
        
        // Handle regular paragraphs
        return (
          <p key={index} className="mb-2" 
             dangerouslySetInnerHTML={{ __html: paragraph }} />
        );
      })}
    </div>
  );
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Isaac's AI assistant with comprehensive knowledge about his background, technical skills, projects, and career goals. I can answer questions about his programming experience, education at Middlebury College, specific projects like Nutrivize, or his career aspirations. What would you like to know about Isaac?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session and check backend status
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
    checkBackendHealth();
  }, []);

  // Check backend connectivity
  const checkBackendHealth = async () => {
    const isHealthy = await apiClient.healthCheck();
    setBackendStatus(isHealthy ? 'connected' : 'disconnected');
  };

  // Generate session ID
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Call the FastAPI backend
  const getAIResponse = async (question) => {
    try {
      const result = await apiClient.sendMessage(question, sessionId);
      
      if (result.success) {
        // Update session ID if provided
        if (result.data.sessionId) {
          setSessionId(result.data.sessionId);
        }
        
        // Update conversation count
        if (result.data.conversationLength) {
          setConversationCount(result.data.conversationLength);
        }
        
        return {
          text: result.data.response,
          searchMethod: result.data.searchMethod,
          cached: result.data.cached,
          timestamp: result.data.timestamp
        };
      } else {
        // Backend unavailable, return fallback
        return {
          text: result.data.response,
          searchMethod: 'fallback',
          cached: false,
          error: true
        };
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      return {
        text: "I'm experiencing technical difficulties. Please try again later or contact Isaac directly at isaac@isaacmineo.com.",
        searchMethod: 'fallback',
        error: true
      };
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(currentInput);
      
      const botMessage = {
        id: messages.length + 2,
        text: aiResponse.text,
        isBot: true,
        timestamp: new Date(),
        metadata: {
          searchMethod: aiResponse.searchMethod,
          cached: aiResponse.cached,
          error: aiResponse.error
        }
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble processing your request. Please try again or contact Isaac directly at isaac@isaacmineo.com.",
        isBot: true,
        timestamp: new Date(),
        metadata: { error: true }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group"
        aria-label="Toggle AI Chatbot"
      >
        <div className="relative">
          {backendStatus === 'connected' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
          {backendStatus === 'disconnected' && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"></div>
          )}
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.319-.345l-4.049 1.52a.5.5 0 01-.647-.647l1.52-4.049A8.013 8.013 0 016 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            )}
          </svg>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Isaac's AI Assistant</h3>
              <p className="text-sm text-blue-100">
                {backendStatus === 'connected' ? (
                  <>✅ Connected • {conversationCount} messages</>
                ) : backendStatus === 'disconnected' ? (
                  <>❌ Backend offline • Fallback mode</>
                ) : (
                  <>🔄 Checking connection...</>
                )}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.isBot ? (
                    <FormattedText text={message.text} />
                  ) : (
                    <FormattedText text={message.text} />
                  )}
                  {message.metadata && (
                    <div className="mt-2 text-xs opacity-70 flex items-center gap-2">
                      {message.metadata.cached && <span>📋 Cached</span>}
                      {message.metadata.searchMethod === 'vector_search' && <span>🔍 Vector</span>}
                      {message.metadata.searchMethod === 'fallback' && <span>💭 Fallback</span>}
                      {message.metadata.error && <span>⚠️ Error</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm">Isaac's AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Isaac..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
