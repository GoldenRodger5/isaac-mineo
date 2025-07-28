import React, { useState, useRef, useEffect } from 'react';

const CodeViewer = ({ 
  fileContent, 
  selectedCode, 
  onCodeSelection, 
  onExplainCode, 
  loading, 
  error, 
  explanationMode 
}) => {
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [showSelectionTooltip, setShowSelectionTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const codeRef = useRef(null);

  const syntaxHighlight = (code, language) => {
    if (!code) return '';

    // Simple syntax highlighting with regex
    let highlighted = code;

    // Keywords highlighting
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await'],
      python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with', 'as', 'async', 'await'],
      typescript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'interface', 'type', 'async', 'await']
    };

    const langKeywords = keywords[language] || keywords.javascript;

    // Highlight keywords
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-purple-400 font-medium">${keyword}</span>`);
    });

    // Highlight strings
    highlighted = highlighted.replace(/(["'`])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-400">$1</span>');

    // Highlight comments
    if (language === 'javascript' || language === 'typescript') {
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');
    } else if (language === 'python') {
      highlighted = highlighted.replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
    }

    return highlighted;
  };

  const handleTextSelection = () => {
    if (!codeRef.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().trim() === '') {
      setShowSelectionTooltip(false);
      onCodeSelection('');
      return;
    }

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setTooltipPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top - 10
    });
    
    setShowSelectionTooltip(true);
    onCodeSelection(selectedText);
  };

  const handleExplainSelection = () => {
    if (selectedCode) {
      onExplainCode(selectedCode);
      setShowSelectionTooltip(false);
    }
  };

  const handleExplainFile = () => {
    onExplainCode(fileContent?.content);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  if (!fileContent && !loading && !error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full">
        <h2 className="text-lg font-semibold text-white mb-6">Code Viewer</h2>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👩‍💻</div>
          <p className="text-gray-400 text-lg">Select a file to view its code</p>
          <p className="text-gray-500 text-sm mt-2">
            You can then highlight code sections for AI explanations
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Code Viewer</h2>
          <div className="animate-spin text-blue-400">⏳</div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/10 rounded h-6" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full">
        <h2 className="text-lg font-semibold text-white mb-6">Code Viewer</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <div className="text-red-400 text-2xl mb-2">⚠️</div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <span className="text-xl">📄</span>
          <div>
            <h2 className="text-lg font-semibold text-white">{fileContent.path}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{fileContent.language}</span>
              <span>{fileContent.lines} lines</span>
              <span>{Math.round(fileContent.size / 1024)} KB</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => copyToClipboard(fileContent.content)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300 hover:text-white"
            title="Copy file content"
          >
            📋
          </button>
          <button
            onClick={handleExplainFile}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              explanationMode === 'explain' ? 'bg-blue-500 hover:bg-blue-600' :
              explanationMode === 'summarize' ? 'bg-green-500 hover:bg-green-600' :
              'bg-purple-500 hover:bg-purple-600'
            } text-white shadow-lg hover:shadow-xl`}
          >
            {explanationMode === 'explain' ? '🔍 Explain File' :
             explanationMode === 'summarize' ? '📋 Summarize File' :
             '🎓 Teach File'}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          <pre
            ref={codeRef}
            className="p-4 text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap select-text"
            style={{ tabSize: 2 }}
          >
            <code
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(fileContent.content, fileContent.language)
              }}
            />
          </pre>

          {/* Selection Tooltip */}
          {showSelectionTooltip && selectedCode && (
            <div
              className="fixed z-50 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-xl"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translateX(-50%) translateY(-100%)'
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">
                  {selectedCode.length} characters selected
                </span>
                <button
                  onClick={handleExplainSelection}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    explanationMode === 'explain' ? 'bg-blue-500 hover:bg-blue-600' :
                    explanationMode === 'summarize' ? 'bg-green-500 hover:bg-green-600' :
                    'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  {explanationMode === 'explain' ? '🔍 Explain' :
                   explanationMode === 'summarize' ? '📋 Summarize' :
                   '🎓 Teach'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>💡 Tip: Highlight code to get AI explanations</span>
          <span>Mode: {explanationMode.charAt(0).toUpperCase() + explanationMode.slice(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
