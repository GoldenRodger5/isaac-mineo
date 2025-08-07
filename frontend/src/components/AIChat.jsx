import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiClient } from '../services/apiClient';
import MobileChatInterface from './MobileChatInterface';
import VoiceChat from './VoiceChat';

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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [avgResponseTime, setAvgResponseTime] = useState(null);
  const [responseTimes, setResponseTimes] = useState([]);
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
    // Only scroll if user has interacted with the chat
    if (hasUserInteracted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, hasUserInteracted]);

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
    const startTime = Date.now();
    try {
      const result = await apiClient.sendMessage(question, sessionId);
      const endTime = Date.now();
      const currentResponseTime = endTime - startTime;
      
      // Update response time tracking
      setResponseTime(currentResponseTime);
      setResponseTimes(prev => {
        const newTimes = [...prev, currentResponseTime];
        // Keep only last 10 responses for average calculation
        const recentTimes = newTimes.slice(-10);
        const average = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
        setAvgResponseTime(Math.round(average));
        return recentTimes;
      });
      
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

    // Mark that user has interacted with the chat
    setHasUserInteracted(true);

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
          error: aiResponse.error,
          responseTime: responseTime
        }
      };

      setMessages(prev => [...prev, botMessage]);

      // Try to generate voice response if voice API is available
      if (window.voiceChatAPI && window.voiceChatAPI.sendTextWithVoice) {
        try {
          await window.voiceChatAPI.sendTextWithVoice(aiResponse.text);
        } catch (voiceError) {
          console.log('Voice response not available:', voiceError);
        }
      }

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

  const handleVoiceResponse = (voiceData) => {
    // Add voice message to chat
    const voiceMessage = {
      id: messages.length + 1,
      text: voiceData.text,
      isBot: true,
      timestamp: voiceData.timestamp,
      metadata: {
        isVoice: true,
        audioUrl: voiceData.audioUrl
      }
    };

    setMessages(prev => [...prev, voiceMessage]);
    setConversationCount(prev => prev + 1);
  };

  const handleVoiceError = (error) => {
    console.error('Voice error:', error);
    // Optionally show error message in chat
  };

  return (
    <section className="py-4 relative overflow-hidden">
      {/* Static background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-neural-400 to-primary-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 gradient-text">
            AI Assistant
          </h2>
          <p className="text-lg text-gray-600 mb-2 max-w-4xl mx-auto leading-relaxed">
            Chat with Isaac's AI assistant powered by his comprehensive knowledge base. 
            Ask about his technical skills, projects, experience, or career goals.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Mobile Chat Interface */}
          <div className="md:hidden glass-heavy rounded-2xl border border-white/20 shadow-2xl h-[85vh]">
            <MobileChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              suggestedQuestions={suggestedQuestions}
              placeholder="Ask me anything about Isaac's background, skills, projects, or career goals..."
              sessionId={sessionId}
              onVoiceResponse={handleVoiceResponse}
              onVoiceError={(error) => console.error('Voice error:', error)}
            />
          </div>

          {/* Desktop Chat Interface */}
          <div className="hidden md:block">
            {/* Status Bar - Enhanced Bold Design */}
            <div className="glass-heavy rounded-t-2xl border-x border-t border-white/30 px-8 py-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full shadow-lg ${
                      backendStatus === 'connected' ? 'bg-emerald-400' : 
                      backendStatus === 'disconnected' ? 'bg-red-400' : 'bg-amber-400'
                    }`}></div>
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Isaac's AI Assistant</h3>
                    <p className="text-sm font-medium text-gray-800">
                      {backendStatus === 'connected' ? (
                        `🟢 Connected • ${conversationCount} messages exchanged${avgResponseTime ? ` • ~${avgResponseTime}ms avg` : ''}`
                      ) : backendStatus === 'disconnected' ? (
                        '🔴 Backend offline • Using fallback responses'
                      ) : (
                        '🟡 Checking connection...'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 rounded-xl transition-all duration-300 text-sm font-bold text-white border border-gray-600 hover:border-gray-500 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Clear Chat</span>
                </button>
              </div>
            </div>

          {/* Chat Messages - Much Larger and More Professional */}
          <div className="bg-white/5 backdrop-blur-xl h-[32rem] lg:h-[36rem] xl:h-[40rem] overflow-y-auto p-8 border-x border-white/20 shadow-inner">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-sm lg:max-w-lg xl:max-w-2xl ${
                    message.isBot
                      ? 'bg-white border-2 border-gray-300 text-gray-900 shadow-xl'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-xl'
                  } rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-start space-x-3">
                      {message.isBot && (
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {message.isBot ? (
                          <div className="text-sm prose prose-sm max-w-none leading-normal">
                            <ReactMarkdown 
                              components={{
                                p: ({children}) => <p className="mb-1 last:mb-0 text-gray-900 font-medium leading-normal">{children}</p>,
                                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                                em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({children}) => <li className="text-sm text-gray-900 font-medium">{children}</li>,
                                code: ({children}) => <code className="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-xs font-mono text-primary-800 font-bold">{children}</code>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-primary-500 pl-4 italic my-2 text-gray-800 font-medium bg-gray-50 py-2 rounded-r">{children}</blockquote>,
                                h1: ({children}) => <h1 className="text-lg font-bold mb-1 mt-2 text-gray-900">{children}</h1>,
                                h2: ({children}) => <h2 className="text-base font-bold mb-1 mt-2 text-gray-900">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-bold mb-1 mt-1 text-gray-900">{children}</h3>,
                                hr: () => <hr className="my-2 border-gray-400" />,
                                a: ({href, children}) => <a href={href} className="text-primary-700 hover:text-primary-800 underline font-semibold" target="_blank" rel="noopener noreferrer">{children}</a>
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">{message.text}</p>
                        )}
                        <div className="flex items-center mt-3 space-x-3">
                          <p className={`text-xs font-medium ${message.isBot ? 'text-gray-600' : 'text-white/80'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.metadata?.cached && (
                            <span className="text-xs bg-accent-500/20 text-accent-600 px-2 py-1 rounded-full border border-accent-500/30 font-bold">
                              Cached
                            </span>
                          )}
                          {message.metadata?.error && (
                            <span className="text-xs bg-red-500/20 text-red-600 px-2 py-1 rounded-full border border-red-500/30 font-bold">
                              Fallback
                            </span>
                          )}
                          {message.metadata?.responseTime && message.isBot && (
                            <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full border border-blue-500/20 font-medium">
                              {message.metadata.responseTime}ms
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
                  <div className="bg-white border-2 border-gray-300 rounded-2xl px-6 py-4 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-3 h-3 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-3 h-3 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">AI is thinking...</span>
                        {avgResponseTime && (
                          <span className="text-xs text-gray-500">Avg: {avgResponseTime}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Questions - Enhanced */}
          {showSuggestions && (
            <div className="glass-heavy border-x border-white/20 px-8 py-6 shadow-inner">
              <p className="text-base font-bold text-gray-900 mb-4">💡 Suggested questions:</p>
              <div className="flex flex-wrap gap-3">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading}
                    className="text-sm bg-white hover:bg-gray-50 disabled:hover:bg-white text-gray-900 px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 border-2 border-gray-300 hover:border-primary-500 font-medium shadow-lg"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Chat Controls */}
          <div className="glass-heavy rounded-lg border border-white/30 p-4 shadow-xl mb-4">
            <VoiceChat 
              sessionId={sessionId}
              onVoiceResponse={handleVoiceResponse}
              onError={handleVoiceError}
            />
          </div>

          {/* Input Area - Enhanced Professional Design */}
          <div className="glass-heavy rounded-b-2xl border border-white/30 p-8 shadow-2xl">
            <div className="flex space-x-6">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Isaac's background, skills, projects, or career goals..."
                className="flex-1 glass-light border-2 border-white/30 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 resize-none text-gray-900 placeholder-gray-600 backdrop-blur-sm font-medium text-base shadow-inner bg-white/90"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center shadow-xl text-base hover:shadow-2xl"
              >
                {isLoading ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m9-9h-4M5 12H1m15.364-7.364L19.778 2.222M4.222 19.778l2.414-2.414M19.778 19.778l-2.414-2.414M4.222 4.222l2.414 2.414" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-800">
              <p className="font-medium">💡 Press Enter to send, Shift+Enter for new line</p>
              <p className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent font-bold">
                ⚡ Powered by GPT-4o • Isaac's Knowledge Base
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
