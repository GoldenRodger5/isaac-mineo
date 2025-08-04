import React, { useState } from 'react';

const MobileCodeExplainerModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showBackButton = false, 
  onBack 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative h-full bg-white flex flex-col safe-area-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

const MobileCodeExplainerFlow = ({ 
  repositories = [], 
  selectedRepo, 
  repoFiles = [], 
  selectedFile, 
  fileContent, 
  onRepoSelect, 
  onFileSelect, 
  onCodeSelection, 
  onExplainCode, 
  loadingStates = {}, 
  errors = {} 
}) => {
  const [currentModal, setCurrentModal] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [explanation, setExplanation] = useState('');

  // Handle repository selection
  const handleRepoSelect = (repo) => {
    if (onRepoSelect) {
      onRepoSelect(repo);
    }
    setCurrentModal('files');
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
    setCurrentModal('code');
  };

  // Handle code explanation
  const handleCodeExplain = async (code) => {
    if (!code) return;
    
    setCurrentModal('explanation');
    setExplanation('🤖 Claude AI is analyzing your code...');
    
    try {
      if (onExplainCode) {
        const result = await onExplainCode(code);
        setExplanation(result || 'Explanation generated successfully!');
      }
    } catch (error) {
      setExplanation('Sorry, there was an error generating the explanation. Please try again.');
    }
  };

  // Handle text selection for code
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedCode(text);
      if (onCodeSelection) onCodeSelection(text);
    }
  };

  // Render loading state
  const renderLoading = (message = 'Loading...') => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );

  // Render repository list
  const renderRepositoryList = () => {
    if (loadingStates.repositories) {
      return renderLoading('Loading repositories...');
    }

    if (!repositories?.length) {
      return (
        <div className="p-4 text-center">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-gray-600">No repositories found</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-3">
          {repositories.map((repo, index) => (
            <button
              key={repo.id || repo.name || index}
              onClick={() => handleRepoSelect(repo)}
              className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate">{repo.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {repo.language || 'Unknown'}
                </span>
              </div>
              {repo.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{repo.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render file list
  const renderFileList = () => {
    if (loadingStates.files) {
      return renderLoading('Loading files...');
    }

    if (!repoFiles?.length) {
      return (
        <div className="p-4 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600">No files found</p>
        </div>
      );
    }

    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-2">
          {repoFiles.map((file, index) => (
            <button
              key={file.path || file.name || index}
              onClick={() => handleFileSelect(file)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{file.type === 'file' ? '📄' : '📁'}</span>
                <span className="font-medium text-gray-900 truncate">{file.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render code viewer
  const renderCodeViewer = () => {
    if (loadingStates.fileContent) {
      return renderLoading('Loading file content...');
    }

    if (!fileContent) {
      return (
        <div className="p-4 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600">No content available</p>
        </div>
      );
    }

    // Debug content
    const contentToShow = fileContent?.content || fileContent || 'No content available';
    console.log('Mobile Code Viewer - Content length:', contentToShow.length);
    console.log('Mobile Code Viewer - Content preview:', contentToShow.substring(0, 100));

    return (
      <div className="h-full flex flex-col">
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={() => handleCodeExplain(fileContent?.content || fileContent)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🔍 Explain File
            </button>
            <button
              onClick={() => handleCodeExplain(selectedCode)}
              disabled={!selectedCode}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              📝 Explain Selection
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <pre
            className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto select-text code-content border border-gray-700"
            onMouseUp={handleTextSelection}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
              minHeight: '200px',
              lineHeight: '1.5',
              fontSize: '14px',
              color: '#f8f9fa',
              backgroundColor: '#212529'
            }}
          >
            <code 
              className="text-gray-100 whitespace-pre-wrap break-words"
              style={{ 
                color: '#f8f9fa',
                display: 'block',
                width: '100%'
              }}
            >
              {contentToShow || 'No content available'}
            </code>
          </pre>
          
          {/* Debug Information */}
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
            <strong>Debug:</strong> Content length: {contentToShow?.length || 0} characters
            {contentToShow && (
              <div className="mt-1">
                Preview: "{contentToShow.substring(0, 50)}..."
              </div>
            )}
          </div>
          
          {selectedCode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✨ Selected {selectedCode.length} characters. Tap "Explain Selection" to analyze.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render explanation
  const renderExplanation = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="prose prose-sm max-w-none">
          <div className="bg-gray-50 rounded-lg p-4">
            {explanation || 'Generating explanation...'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Repository Selection Modal */}
      <MobileCodeExplainerModal
        isOpen={currentModal === 'repos'}
        onClose={() => setCurrentModal('')}
        title="Select Repository"
      >
        {renderRepositoryList()}
      </MobileCodeExplainerModal>

      {/* File Selection Modal */}
      <MobileCodeExplainerModal
        isOpen={currentModal === 'files'}
        onClose={() => setCurrentModal('')}
        title={selectedRepo?.name || 'Files'}
        showBackButton
        onBack={() => setCurrentModal('repos')}
      >
        {renderFileList()}
      </MobileCodeExplainerModal>

      {/* Code Viewer Modal */}
      <MobileCodeExplainerModal
        isOpen={currentModal === 'code'}
        onClose={() => setCurrentModal('')}
        title={selectedFile?.name || 'Code'}
        showBackButton
        onBack={() => setCurrentModal('files')}
      >
        {renderCodeViewer()}
      </MobileCodeExplainerModal>

      {/* Explanation Modal */}
      <MobileCodeExplainerModal
        isOpen={currentModal === 'explanation'}
        onClose={() => setCurrentModal('')}
        title="Code Explanation"
        showBackButton
        onBack={() => setCurrentModal('code')}
      >
        {renderExplanation()}
      </MobileCodeExplainerModal>

      {/* Entry Point Button for Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setCurrentModal('repos')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl font-medium text-center"
        >
          🔍 Browse Code Repositories
        </button>
      </div>
    </>
  );
};

export default MobileCodeExplainerFlow;
