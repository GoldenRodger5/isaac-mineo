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

  const addLineNumbers = (code) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      const lineNumber = (index + 1).toString().padStart(3, ' ');
      return `<span class="line-number" style="color: #6B7280; margin-right: 16px; user-select: none; display: inline-block; width: 40px; text-align: right;">${lineNumber}</span>${line}`;
    }).join('\n');
  };

  const syntaxHighlight = (code, language) => {
    if (!code) return '';

    // Escape HTML first to prevent injection
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Simple syntax highlighting with regex for common languages
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch'],
      python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with', 'as', 'async', 'await', 'yield'],
      typescript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'interface', 'type', 'async', 'await']
    };

    const langKeywords = keywords[language?.toLowerCase()] || keywords.javascript;

    // Highlight keywords with word boundaries
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #a855f7; font-weight: 600;">$1</span>');
    });

    // Highlight strings (single, double quotes, and template literals)
    highlighted = highlighted.replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span style="color: #22c55e;">$1$2$1</span>');

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #3b82f6;">$1</span>');

    // Highlight comments
    if (language === 'javascript' || language === 'typescript') {
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span style="color: #6b7280; font-style: italic;">$1</span>');
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6b7280; font-style: italic;">$1</span>');
    } else if (language === 'python') {
      highlighted = highlighted.replace(/(#.*$)/gm, '<span style="color: #6b7280; font-style: italic;">$1</span>');
    }

    // Add line numbers
    return addLineNumbers(highlighted);
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
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">Code Viewer</h2>
        <div className="text-center py-12 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">👩‍💻</div>
          <p className="text-gray-400 text-base">Select a file to view its code</p>
          <p className="text-gray-500 text-xs mt-2">
            You can then highlight code sections for AI explanations
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Code Viewer</h2>
          <div className="animate-spin text-blue-400">⏳</div>
        </div>
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/10 rounded h-5" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">Code Viewer</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="text-red-400 text-xl mb-2">⚠️</div>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span className="text-lg">📄</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-white truncate">{fileContent.path}</h2>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span>{fileContent.language}</span>
              <span>{fileContent.lines} lines</span>
              <span>{Math.round(fileContent.size / 1024)} KB</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => copyToClipboard(fileContent.content)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
            title="Copy file content"
          >
            📋
          </button>
          <button
            onClick={handleExplainFile}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
              explanationMode === 'explain' ? 'bg-blue-500 hover:bg-blue-600' :
              explanationMode === 'summarize' ? 'bg-green-500 hover:bg-green-600' :
              'bg-purple-500 hover:bg-purple-600'
            } text-white shadow-lg hover:shadow-xl`}
          >
            {explanationMode === 'explain' ? '🔍 Explain' :
             explanationMode === 'summarize' ? '📋 Summarize' :
             '🎓 Teach'}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 min-h-0 bg-gray-900/50 overflow-hidden">
        <div 
          className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#4B5563 #1F2937'
          }}
        >
          <pre
            ref={codeRef}
            className="p-4 text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap select-text block min-h-full"
            style={{ tabSize: 2 }}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
          >
            <code
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(fileContent.content, fileContent.language)
              }}
            />
          </pre>
        </div>

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
                <span className="text-xs text-gray-300">
                  {selectedCode.length} characters selected
                </span>
                <button
                  onClick={handleExplainSelection}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
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
    </div>
  );
};

export default CodeViewer;
