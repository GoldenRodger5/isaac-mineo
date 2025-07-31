import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const MobileCodeExplainerFlow = ({ 
  repositories = [], 
  selectedRepo, 
  repoFiles = [], 
  selectedFile, 
  fileContent, 
  explanation: propExplanation = '',
  explanationMode: propExplanationMode = 'explain',
  onRepoSelect, 
  onFileSelect, 
  onCodeSelection, 
  onExplainCode,
  onLoadRepositories, 
  loadingStates = {}, 
  errors = {} 
}) => {
  const [selectedCode, setSelectedCode] = useState('');
  const [explanationMode, setExplanationMode] = useState(propExplanationMode);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);

  // Use prop explanation or local state
  const explanation = propExplanation;

  // Handle text selection for code
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedCode(text);
      if (onCodeSelection) onCodeSelection(text);
    }
  };

  // Handle code explanation
  const handleCodeExplain = async (code, mode = explanationMode) => {
    if (!code) return;
    
    setIsExplaining(true);
    
    try {
      if (onExplainCode) {
        await onExplainCode(code);
        // The parent component should update the explanation state
        // For now, we'll scroll to the explanation section
        setTimeout(() => {
          const explanationElement = document.getElementById('mobile-explanation');
          if (explanationElement) {
            explanationElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error explaining code:', error);
    } finally {
      setIsExplaining(false);
    }
  };

  // Repository selection
  const handleRepoSelect = (repo) => {
    if (onRepoSelect) {
      onRepoSelect(repo);
    }
    setShowRepoDropdown(false);
    setSelectedCode('');
    // Clear explanation when switching repos
  };

  // File selection
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
    setShowFileDropdown(false);
    setSelectedCode('');
    // Clear explanation when switching files
  };

  return (
    <div className="w-full space-y-4">
      {/* Compact Selection Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3 sticky top-0 z-40 shadow-sm">
        {/* Repository Selection */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Repository</label>
          <button
            onClick={() => {
              if (!repositories?.length && onLoadRepositories) {
                onLoadRepositories();
              }
              setShowRepoDropdown(!showRepoDropdown);
            }}
            className="w-full flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
          >
            <span className="truncate">
              {selectedRepo ? selectedRepo.name : 'Select repository...'}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showRepoDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
              {loadingStates.repositories ? (
                <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
              ) : repositories?.length ? (
                repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo)}
                    className="w-full text-left p-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium truncate text-gray-900">{repo.name}</div>
                    {repo.description && (
                      <div className="text-xs text-gray-500 truncate">{repo.description}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">No repositories found</div>
              )}
            </div>
          )}
        </div>

        {/* File Selection */}
        {selectedRepo && (
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">File</label>
            <button
              onClick={() => setShowFileDropdown(!showFileDropdown)}
              className="w-full flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
            >
              <span className="truncate">
                {selectedFile ? selectedFile.name : 'Select file...'}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showFileDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                {loadingStates.files ? (
                  <div className="p-3 text-center text-sm text-gray-500">Loading...</div>
                ) : repoFiles?.length ? (
                  repoFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleFileSelect(file)}
                      className="w-full text-left p-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center space-x-2"
                    >
                      <span>{file.type === 'file' ? '📄' : '📁'}</span>
                      <span className="truncate text-gray-900 font-medium">{file.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">No files found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mode Selection */}
        {selectedFile && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Explanation Mode</label>
            <div className="flex space-x-1">
              {[
                { key: 'explain', label: 'Explain', icon: '🔍' },
                { key: 'summarize', label: 'Summarize', icon: '📋' },
                { key: 'teach', label: 'Teach', icon: '👨‍🏫' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setExplanationMode(mode.key)}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    explanationMode === mode.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Viewer */}
      {selectedFile && fileContent && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Action Bar */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => handleCodeExplain(fileContent?.content || fileContent)}
                disabled={isExplaining}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {isExplaining ? '⏳' : '🔍'} {explanationMode === 'explain' ? 'Explain' : explanationMode === 'summarize' ? 'Summarize' : 'Teach'} File
              </button>
              {selectedCode && (
                <button
                  onClick={() => handleCodeExplain(selectedCode)}
                  disabled={isExplaining}
                  className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                >
                  {isExplaining ? '⏳' : '📝'} {explanationMode === 'explain' ? 'Explain' : explanationMode === 'summarize' ? 'Summarize' : 'Teach'} Selection
                </button>
              )}
            </div>
            {selectedCode && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                ✨ {selectedCode.length} characters selected
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{selectedFile.name}</span>
                {selectedFile.language && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {selectedFile.language}
                  </span>
                )}
              </div>
              <span className="text-gray-500 text-xs">
                {fileContent?.lines || 0} lines
              </span>
            </div>
          </div>

          {/* Code Content */}
          <div className="relative">
            {loadingStates.fileContent ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading file content...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <pre
                  className="text-xs bg-gray-900 text-gray-100 p-4 overflow-x-auto select-text leading-relaxed"
                  onMouseUp={handleTextSelection}
                  onTouchEnd={handleTextSelection}
                  style={{ 
                    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    minHeight: '200px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <code>{fileContent?.content || fileContent || 'No content available'}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Explanation Section */}
      {(explanation || isExplaining) && (
        <div id="mobile-explanation" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Explanation Header */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🤖</span>
              <h3 className="font-medium text-gray-900">
                Claude AI {explanationMode === 'explain' ? 'Explanation' : explanationMode === 'summarize' ? 'Summary' : 'Teaching'}
              </h3>
              {isExplaining && (
                <div className="ml-auto">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Explanation Content */}
          <div className="p-4">
            <div className="prose prose-sm max-w-none">
              {explanation ? (
                <ReactMarkdown 
                  className="prose prose-sm max-w-none prose-p:my-2 prose-strong:font-bold prose-em:italic prose-ul:my-2 prose-li:my-0 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
                >
                  {explanation}
                </ReactMarkdown>
              ) : (
                <div 
                  className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed text-gray-600 italic"
                  style={{ minHeight: '200px' }}
                >
                  Claude AI is analyzing your code and preparing a detailed explanation...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      {!selectedRepo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">🚀 Get Started</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select a repository from the dropdown above</li>
            <li>Choose a file to examine</li>
            <li>Select text or explain the entire file</li>
            <li>Get AI-powered insights from Claude</li>
          </ol>
        </div>
      )}

      {/* Status Info */}
      {repositories?.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {repositories.length} repositories available
          </p>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showRepoDropdown || showFileDropdown) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowRepoDropdown(false);
            setShowFileDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default MobileCodeExplainerFlow;
