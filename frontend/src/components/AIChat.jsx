import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../services/apiClient';
import MobileChatInterface from './MobileChatInterface';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 **Welcome!** I'm Isaac's AI assistant with comprehensive knowledge about his background, technical skills, projects, and career journey.\n\n**I can help you discover:**\n\n• **Technical Expertise** - His proficiency in React, Python, FastAPI, AI APIs, and full-stack development\n• **Featured Projects** - Detailed insights into Nutrivize, Quizium, EchoPodCast, and other innovative solutions\n• **Educational Background** - His Computer Science studies at Middlebury College and academic achievements\n• **Career Aspirations** - What he's looking for in his next role and his development philosophy\n• **Personal Approach** - His problem-solving methodology and collaborative work style\n\n*What aspect of Isaac's background interests you most?*",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What is Isaac's technical stack?",
    "Tell me about the Nutrivize project",
    "What kind of roles is Isaac looking for?",
    "What's Isaac's educational background?",
    "How can I contact Isaac?",
    "What makes Isaac's approach to development unique?"
  ];

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

  // Check backend connectivity every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    const isHealthy = await apiClient.healthCheck();
    setBackendStatus(isHealthy ? 'connected' : 'disconnected');
  };

  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const getAIResponse = async (question) => {
    try {
      const result = await apiClient.sendMessage(question, sessionId);
      
      if (result.success) {
        if (result.data.sessionId) {
          setSessionId(result.data.sessionId);
        }
        
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

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: textToSend,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const aiResponse = await getAIResponse(textToSend);
      
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "👋 **Welcome back!** I'm Isaac's AI assistant, ready to help you learn about his background, skills, projects, and career goals.\n\n**Ask me about:**\n• Technical expertise and development approach\n• Project details and implementations\n• Education and professional experience\n• Career objectives and interests\n\n*What would you like to explore about Isaac?*",
        isBot: true,
        timestamp: new Date()
      }
    ]);
    setConversationCount(0);
    setShowSuggestions(true);
    setSessionId(generateSessionId());
  };

  return (
    <section id="ai-chat" className="py-20">
      <div className="animate-fadeInUp">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-accent-600 to-neural-600 bg-clip-text text-transparent mb-4">
            AI Assistant
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Chat with Isaac's AI assistant powered by his comprehensive knowledge base. 
            Ask about his technical skills, projects, experience, or career goals.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Mobile Chat Interface */}
          <div className="md:hidden glass-heavy rounded-2xl border border-white/20 shadow-2xl h-[70vh]">
            <MobileChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              suggestedQuestions={suggestedQuestions}
              placeholder="Ask me anything about Isaac's background, skills, projects, or career goals..."
            />
          </div>

          {/* Desktop Chat Interface */}
          <div className="hidden md:block">
            {/* Status Bar */}
            <div className="glass-light rounded-t-2xl border-x border-t border-white/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    backendStatus === 'connected' ? 'bg-accent-400 animate-neural-pulse' : 
                    backendStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <h3 className="font-semibold text-white">Isaac's AI Assistant</h3>
                    <p className="text-sm text-gray-300">
                      {backendStatus === 'connected' ? (
                        `Connected • ${conversationCount} messages exchanged`
                      ) : backendStatus === 'disconnected' ? (
                        'Backend offline • Using fallback responses'
                      ) : (
                        'Checking connection...'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="flex items-center space-x-2 px-4 py-2 glass-light hover:bg-white/20 rounded-xl transition-all duration-300 text-sm font-medium text-gray-300 animate-magnetic"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Clear Chat</span>
                </button>
              </div>
            </div>

          {/* Chat Messages */}
          <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/40 backdrop-blur-xl h-96 overflow-y-auto p-6 border-x border-white/20">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-float-professional`}
                >
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.isBot
                      ? 'glass-light border border-white/20 text-gray-200'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                  } rounded-xl px-4 py-3 shadow-lg animate-magnetic`}>
                    <div className="flex items-start space-x-2">
                      {message.isBot && (
                        <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        {message.isBot ? (
                          <ReactMarkdown 
                            className="text-sm prose prose-sm max-w-none prose-invert"
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0 text-gray-200">{children}</p>,
                              strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                              em: ({children}) => <em className="italic text-gray-300">{children}</em>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-sm text-gray-200">{children}</li>,
                              code: ({children}) => <code className="bg-gray-800/50 px-1 py-0.5 rounded text-xs font-mono text-accent-300">{children}</code>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-primary-400 pl-4 italic my-2 text-gray-300">{children}</blockquote>,
                              h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-white">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-medium mb-1 text-white">{children}</h3>,
                              hr: () => <hr className="my-3 border-gray-600" />,
                              a: ({href, children}) => <a href={href} className="text-accent-400 hover:text-accent-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <p className={`text-xs ${message.isBot ? 'text-gray-400' : 'text-white/70'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.metadata?.cached && (
                            <span className="text-xs bg-accent-500/20 text-accent-300 px-2 py-0.5 rounded-full border border-accent-500/30">
                              Cached
                            </span>
                          )}
                          {message.metadata?.error && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
                              Fallback
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass-light border border-white/20 rounded-xl px-4 py-3 shadow-lg animate-magnetic">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Questions */}
          {showSuggestions && (
            <div className="glass-light border-x border-white/20 px-6 py-4">
              <p className="text-sm font-medium text-gray-300 mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading}
                    className="text-sm glass-light hover:bg-white/20 disabled:hover:bg-white/10 text-gray-300 px-3 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 animate-magnetic border border-white/10"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="glass-heavy rounded-b-2xl border border-white/20 p-6">
            <div className="flex space-x-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Isaac's background, skills, projects, or career goals..."
                className="flex-1 glass-light border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 resize-none text-gray-200 placeholder-gray-400 backdrop-blur-sm"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg animate-magnetic"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m9-9h-4M5 12H1m15.364-7.364L19.778 2.222M4.222 19.778l2.414-2.414M19.778 19.778l-2.414-2.414M4.222 4.222l2.414 2.414" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <p>Press Enter to send, Shift+Enter for new line</p>
              <p className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent font-medium">
                Powered by GPT-4o • Isaac's Knowledge Base
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChat;
