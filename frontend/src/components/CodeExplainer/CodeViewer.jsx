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
  const [localSelectedCode, setLocalSelectedCode] = useState('');
  const [showSelectionTooltip, setShowSelectionTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const codeRef = useRef(null);

  const addLineNumbers = (code) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      const lineNumber = (index + 1).toString().padStart(3, ' ');
      return '<span class="line-number" style="color: #6B7280; margin-right: 16px; user-select: none; display: inline-block; width: 40px; text-align: right;">' + lineNumber + '</span>' + line;
    }).join('\n');
  };

  const syntaxHighlight = (code, language) => {
    if (!code) return '';

    // Simple highlighting without problematic regex
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Add line numbers only
    return addLineNumbers(highlighted);
  };

  const handleTextSelection = () => {
    if (!codeRef.current) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 0) {
      setLocalSelectedCode(text);
      if (onCodeSelection) {
        onCodeSelection(text);
      }
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setTooltipPosition({
        x: rect.left - 20, // Position to the LEFT of the selection
        y: rect.top - 10
      });
      
      setShowSelectionTooltip(true);
    } else {
      setShowSelectionTooltip(false);
      setLocalSelectedCode('');
      if (onCodeSelection) {
        onCodeSelection('');
      }
    }
  };

  const handleExplainSelection = () => {
    if (localSelectedCode) {
      onExplainCode(localSelectedCode);
      setShowSelectionTooltip(false);
    }
  };

  const handleExplainFile = () => {
    onExplainCode(fileContent?.content);
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
        <h2 className="text-base font-semibold text-white mb-4">Code Viewer</h2>
        <div className="flex-1 flex flex-col">
          <div className="animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-white/10 rounded mb-2 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 h-full flex flex-col">
        <h2 className="text-base font-semibold text-white mb-4">Code Viewer</h2>
        <div className="text-center py-12 flex-1 flex flex-col justify-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-400 text-base">Error loading file</p>
          <p className="text-gray-500 text-xs mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col h-full min-h-0">
      {showSelectionTooltip && localSelectedCode && (
        <div 
          className="fixed z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-600"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(0, -100%)' // Anchor from left edge, not center
          }}
        >
          <button
            onClick={handleExplainSelection}
            className="hover:text-blue-300 transition-colors"
          >
            Explain Selected Code
          </button>
        </div>
      )}

      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-white">Code Viewer</h2>
          <p className="text-xs text-gray-400 mt-1">
            Highlight code to explain specific sections
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExplainFile}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-xs bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
          >
            Explain Code
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-900 rounded-lg min-h-0">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">
            {fileContent?.name || 'No file selected'}
          </h3>
          {fileContent?.language && (
            <p className="text-sm text-gray-400 mt-1">
              Language: {fileContent.language}
            </p>
          )}
        </div>
        
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-auto">
            <pre 
              ref={codeRef}
              className="p-4 text-sm leading-relaxed text-gray-100 font-mono whitespace-pre block" 
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(fileContent?.content || '', fileContent?.language) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
