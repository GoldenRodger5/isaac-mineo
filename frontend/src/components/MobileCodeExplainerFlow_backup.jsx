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
    onRepoSelect(repo);
    setCurrentModal('files');
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    onFileSelect(file);
    setCurrentModal('code');
  };

  // Handle code explanation
  const handleCodeExplain = async (code) => {
    if (!code) return;
    
    setCurrentModal('explanation');
    setExplanation('Generating explanation...');
    
    try {
      const result = await onExplainCode(code);
      setExplanation(result || 'Explanation generated successfully!');
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

  const handleRepoSelect = (repo) => {
    onRepoSelect(repo);
    setCurrentModal('files');
  };

  const handleFileSelect = (file) => {
    onFileSelect(file);
    setCurrentModal('code');
  };

  const handleCodeExplain = async (code) => {
    setSelectedCode(code);
    setCurrentModal('explanation');
    try {
      const result = await onExplainCode(code);
      setExplanation(result);
    } catch (error) {
      setExplanation('Error generating explanation. Please try again.');
    }
  };

  const renderRepositoryList = () => (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-3">
        {repositories.map((repo) => (
          <button
            key={repo.full_name}
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

  const renderFileList = () => (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-2">
        {repoFiles.map((file) => (
          <button
            key={file.path}
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

  const renderCodeViewer = () => (
    <div className="h-full flex flex-col">
      {/* Action Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <button
            onClick={() => handleCodeExplain(fileContent?.content)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Explain File
          </button>
          <button
            onClick={() => handleCodeExplain(selectedCode)}
            disabled={!selectedCode}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Explain Selection
          </button>
        </div>
      </div>
      
      {/* Code Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-900 text-green-400 font-mono text-sm">
        <pre className="whitespace-pre-wrap">
          {fileContent?.content || 'Loading...'}
        </pre>
      </div>
    </div>
  );

  const renderExplanation = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h3 className="font-medium text-blue-900">AI Explanation</h3>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="prose prose-sm max-w-none">
          {explanation || 'Generating explanation...'}
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
