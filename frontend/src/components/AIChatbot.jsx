import React, { useState, useRef, useEffect } from 'react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Isaac's AI assistant. I can answer questions about his experience, projects, tech stack, and career goals. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationCount, setConversationCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session on first load
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, []);

  // Generate session ID
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Call the enhanced AI API
  const getAIResponse = async (question) => {
    try {
      const response = await fetch('/api/chatbot-ultimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({ 
          question,
          sessionId
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before asking another question.');
        }
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      // Update session info
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
      }
      
      if (data.conversationLength) {
        setConversationCount(data.conversationLength);
      }

      return {
        response: data.response,
        metadata: {
          cached: data.cached,
          searchMethod: data.searchMethod,
          error: data.error
        }
      };
    } catch (error) {
      console.error('Error calling AI API:', error);
      
      // Enhanced fallback responses
      const lowerQuestion = question.toLowerCase();
      
      if (error.message.includes('Rate limit')) {
        return {
          response: "I'm getting a lot of questions right now! Please wait a moment and try again. In the meantime, you can always contact Isaac directly at isaac@isaacmineo.com.",
          metadata: { error: true, type: 'rate_limit' }
        };
      }
      
      if (lowerQuestion.includes('tech') || lowerQuestion.includes('stack') || lowerQuestion.includes('technologies')) {
        return {
          response: "Isaac's main tech stack includes React, FastAPI, Python, MongoDB, and Redis. He's particularly strong with AI integrations using OpenAI APIs and specializes in building scalable backend systems. He also works with Tailwind CSS, Firebase Auth, and deploys on Vercel/Render.",
          metadata: { error: true, type: 'fallback' }
        };
      }
      
      if (lowerQuestion.includes('nutrivize') || lowerQuestion.includes('project')) {
        return {
          response: "Nutrivize is Isaac's flagship project - an AI-powered nutrition tracker that uses computer vision to recognize food from photos. It's built with React/FastAPI, uses MongoDB for data storage, and integrates OpenAI's GPT-4 Vision for food recognition. The app is deployed and actively used by beta testers.",
          metadata: { error: true, type: 'fallback' }
        };
      }
      
      if (lowerQuestion.includes('experience') || lowerQuestion.includes('background')) {
        return {
          response: "Isaac is a Full-Stack Developer and AI Engineer who specializes in building intelligent, scalable web applications. He has extensive experience with React, Python, and AI integrations. His approach focuses on clean code, performance optimization, and creating tools with real-world impact.",
          metadata: { error: true, type: 'fallback' }
        };
      }
      
      if (lowerQuestion.includes('looking for') || lowerQuestion.includes('job') || lowerQuestion.includes('role')) {
        return {
          response: "Isaac is looking for backend, AI engineering, or full-stack roles where he can build meaningful tools with smart, creative teams. He's especially interested in healthtech, AI, productivity, or developer tooling companies. He's open to remote work and values collaborative environments.",
          metadata: { error: true, type: 'fallback' }
        };
      }
      
      if (lowerQuestion.includes('ai') || lowerQuestion.includes('artificial intelligence')) {
        return {
          response: "Isaac has advanced experience with AI integration, particularly with OpenAI APIs for GPT models and computer vision. He's skilled in prompt engineering and building AI-powered features like the food recognition system in Nutrivize. He's also learning about vector databases and embeddings.",
          metadata: { error: true, type: 'fallback' }
        };
      }
      
      if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('reach')) {
        return {
          response: "You can reach Isaac at isaac@isaacmineo.com, check out his GitHub at github.com/GoldenRodger5, or connect with him on LinkedIn at linkedin.com/in/isaacmineo. He's always open to discussing interesting opportunities and projects!",
          metadata: { error: true, type: 'fallback' }
        };
      }
      
      // Default response
      return {
        response: "I'm having trouble connecting to my AI service right now, but I can tell you that Isaac is a Full-Stack Developer specializing in AI-powered applications. You can contact him directly at isaac@isaacmineo.com for any specific questions!",
        metadata: { error: true, type: 'fallback' }
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseData = await getAIResponse(inputValue);
      const botMessage = {
        id: Date.now() + 1,
        text: responseData.response,
        isBot: true,
        timestamp: new Date(),
        metadata: responseData.metadata
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again or contact Isaac directly at isaac@isaacmineo.com",
        isBot: true,
        timestamp: new Date(),
        metadata: { error: true, type: 'connection_error' }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What's Isaac's strongest technology?",
    "Tell me about Nutrivize",
    "What kind of roles is he looking for?",
    "Has he worked with AI before?",
    "What's his experience with React?"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Open AI Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold">Ask about Isaac</h3>
                <p className="text-sm text-white/80">
                  AI Assistant {conversationCount > 0 && `• ${conversationCount} exchanges`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
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
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.isBot && message.metadata && (
                    <div className="flex items-center mt-2 space-x-2">
                      {message.metadata.cached && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Cached
                        </span>
                      )}
                      {message.metadata.searchMethod === 'vector_search' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                          AI Search
                        </span>
                      )}
                      {message.metadata.type === 'rate_limit' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Rate Limited
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about Isaac's skills, projects, or experience..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
