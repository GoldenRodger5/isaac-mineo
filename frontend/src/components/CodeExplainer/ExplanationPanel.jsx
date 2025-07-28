import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';

const ExplanationPanel = ({ 
  explanation, 
  selectedCode, 
  fileContext, 
  loading, 
  error, 
  explanationMode, 
  onExplainCode 
}) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  const formatExplanation = (text) => {
    if (!text) return '';
    
    // Convert markdown-style formatting for better display
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/`(.+?)`/g, '<code class="bg-blue-500/20 text-blue-300 px-1 rounded">$1</code>')
      .replace(/^\s*[\*\-]\s+(.+)/gm, '<div class="flex items-start space-x-2 mb-1"><span class="text-blue-400 mt-1">•</span><span>$1</span></div>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
  };

  const getModeIcon = (mode) => {
    const icons = {
      explain: '🔍',
      summarize: '📋',
      teach: '🎓'
    };
    return icons[mode] || '🔍';
  };

  const getModeColor = (mode) => {
    const colors = {
      explain: 'blue',
      summarize: 'green',
      teach: 'purple'
    };
    return colors[mode] || 'blue';
  };

  const handleAskFollowUp = async () => {
    if (!followUpQuestion.trim()) return;

    try {
      // Add question to history
      const newQuestion = {
        type: 'question',
        content: followUpQuestion,
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, newQuestion]);
      const currentQuestion = followUpQuestion;
      setFollowUpQuestion('');

      // Create context for follow-up question
      const context = selectedCode || fileContext?.content;
      const followUpPrompt = `Previous context: ${explanationMode} mode explanation was provided for this code.

Follow-up question: ${currentQuestion}

Code being discussed:
\`\`\`${fileContext?.language || 'text'}
${context?.slice(0, 1000)}${context?.length > 1000 ? '...' : ''}
\`\`\`

Please provide a focused answer to the follow-up question in the context of this code.`;

      // Use the code explanation API for follow-up
      const response = await apiClient.explainCode(
        followUpPrompt,
        'explain', // Use explain mode for follow-ups
        fileContext,
        selectedCode
      );
      
      if (response.success) {
        const newAnswer = {
          type: 'answer',
          content: response.data.explanation,
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, newAnswer]);
      } else {
        // Handle error case
        const errorAnswer = {
          type: 'answer',
          content: response.fallback ? response.data.explanation : "I'm having trouble answering that question right now. Please try again.",
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, errorAnswer]);
      }
    } catch (error) {
      console.error('Error asking follow-up question:', error);
      const errorAnswer = {
        type: 'answer',
        content: "Sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, errorAnswer]);
    }
  };

  const clearConversation = () => {
    setConversationHistory([]);
  };

  const copyExplanation = () => {
    const textToCopy = explanation.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textToCopy);
    // TODO: Add toast notification
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">AI Explanation</h2>
          <div className="animate-pulse text-blue-400">🤖</div>
        </div>
        
        <div className="space-y-3 flex-1">
          <div className="animate-pulse">
            <div className="bg-white/10 rounded h-3 mb-2"></div>
            <div className="bg-white/10 rounded h-3 mb-2 w-4/5"></div>
            <div className="bg-white/10 rounded h-3 mb-2 w-3/4"></div>
            <div className="bg-white/10 rounded h-3 mb-2 w-5/6"></div>
            <div className="bg-white/10 rounded h-3 mb-2 w-2/3"></div>
          </div>
        </div>
        
        <div className="text-center text-blue-400 mt-4">
          ⏳ Claude AI is analyzing your code...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">AI Explanation</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="text-red-400 text-xl mb-2">⚠️</div>
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => onExplainCode()}
            className="mt-3 text-sm bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded text-red-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getModeIcon(explanationMode)}</span>
          <h2 className="text-base font-semibold text-white">AI Explanation</h2>
          <span className={`px-2 py-1 rounded text-xs bg-${getModeColor(explanationMode)}-500/20 text-${getModeColor(explanationMode)}-300`}>
            {explanationMode}
          </span>
        </div>
        
        {explanation && (
          <div className="flex items-center space-x-2">
            <button
              onClick={copyExplanation}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
              title="Copy explanation"
            >
              📋
            </button>
            <button
              onClick={clearConversation}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
              title="Clear conversation"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {!explanation && !loading && !error && (
          <div className="text-center py-12 flex-1 flex flex-col justify-center">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-gray-400 text-base mb-2">Claude AI Ready to Help</p>
            <p className="text-gray-500 text-xs">
              Select code or click explain to get Claude-powered insights
            </p>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-blue-300 font-medium mb-2 text-sm">How it works:</h3>
              <ul className="text-xs text-gray-400 space-y-1 text-left">
                <li>🔍 <strong>Explain:</strong> Technical breakdown for developers</li>
                <li>📋 <strong>Summarize:</strong> High-level overview</li>
                <li>🎓 <strong>Teach:</strong> Beginner-friendly explanations</li>
              </ul>
            </div>
          </div>
        )}

        {explanation && (
          <div className="space-y-4">
            {/* Main Explanation */}
            <div className="bg-white/5 rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-${getModeColor(explanationMode)}-400`}>
                  {getModeIcon(explanationMode)}
                </span>
                <span className="text-xs font-medium text-gray-300">
                  {explanationMode.charAt(0).toUpperCase() + explanationMode.slice(1)} Mode
                </span>
                {selectedCode && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">
                    Selection
                  </span>
                )}
              </div>
              <div 
                className="text-gray-300 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-2">${formatExplanation(explanation)}</p>` 
                }}
              />
            </div>

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-400 border-b border-white/10 pb-1">
                  Follow-up Q&A
                </h3>
                {conversationHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${
                      item.type === 'question' 
                        ? 'bg-blue-500/10 border-l-4 border-blue-500 ml-0' 
                        : 'bg-green-500/10 border-l-4 border-green-500 ml-3'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs">
                        {item.type === 'question' ? '❓' : '🤖'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div 
                      className="text-xs text-gray-300"
                      dangerouslySetInnerHTML={{ 
                        __html: formatExplanation(item.content) 
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follow-up Question Input */}
      {explanation && (
        <div className="p-3 border-t border-white/10 bg-white/5 flex-shrink-0">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask a follow-up question..."
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskFollowUp()}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 text-xs"
            />
            <button
              onClick={handleAskFollowUp}
              disabled={!followUpQuestion.trim()}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-xs font-medium transition-colors"
            >
              Ask
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Ask questions like "Why is this approach used?" or "What could be improved?"
          </p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
