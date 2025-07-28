import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';

// Import sub-components (we'll create these next)
import RepositoryBrowser from './CodeExplainer/RepositoryBrowser';
import FileBrowser from './CodeExplainer/FileBrowser';
import CodeViewer from './CodeExplainer/CodeViewer';
import ExplanationPanel from './CodeExplainer/ExplanationPanel';
import LoadingSpinner from './CodeExplainer/LoadingSpinner';

const CodeExplainer = () => {
  // Main state management
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoFiles, setRepoFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explanationMode, setExplanationMode] = useState('explain'); // explain, summarize, teach
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  
  // Loading states for better UX
  const [loadingStates, setLoadingStates] = useState({
    repositories: false,
    files: false,
    fileContent: false,
    explanation: false
  });

  // Error states
  const [errors, setErrors] = useState({});

  // GitHub service health
  const [githubHealthy, setGithubHealthy] = useState(null);
  
  // Navigation state for tab-based interface
  const [activeNavigationTab, setActiveNavigationTab] = useState('repos'); // 'repos' or 'files'
  const [showNavigation, setShowNavigation] = useState(false);
  
  // Panel sizing state for main content (simplified for 2-panel layout)
  const [mainPanelSplit, setMainPanelSplit] = useState(55); // Percentage for code viewer (55% code, 45% explanation)
  
  // Ref for drag handling
  const isDragging = useRef(false);

  // Check GitHub service health on mount
  useEffect(() => {
    checkGitHubHealth();
  }, []);

  const checkGitHubHealth = async () => {
    try {
      const response = await apiClient.fetchWithRetry(`${apiClient.baseURL}/github/health`);
      setGithubHealthy(response.success);
      
      if (response.success) {
        loadRepositories();
      } else {
        console.error('GitHub service unhealthy:', response.message);
        setErrors(prev => ({ ...prev, github: response.message || 'GitHub service is not available' }));
      }
    } catch (error) {
      console.error('GitHub health check failed:', error);
      setGithubHealthy(false);
      setErrors(prev => ({ ...prev, github: 'Failed to connect to GitHub service' }));
    }
  };

  const loadRepositories = async () => {
    setLoadingStates(prev => ({ ...prev, repositories: true }));
    setErrors(prev => ({ ...prev, repositories: null }));

    try {
      const response = await apiClient.fetchWithRetry(`${apiClient.baseURL}/github/repos?username=GoldenRodger5`);
      
      if (response.success) {
        setRepositories(response.data);
      } else {
        setErrors(prev => ({ ...prev, repositories: 'Failed to load repositories' }));
      }
    } catch (error) {
      console.error('Error loading repositories:', error);
      setErrors(prev => ({ ...prev, repositories: error.message }));
    } finally {
      setLoadingStates(prev => ({ ...prev, repositories: false }));
    }
  };

  const handleRepoSelect = async (repo) => {
    setSelectedRepo(repo);
    setSelectedFile(null);
    setFileContent(null);
    setExplanation('');
    setSelectedCode('');
    
    setLoadingStates(prev => ({ ...prev, files: true }));
    setErrors(prev => ({ ...prev, files: null }));

    try {
      const response = await apiClient.fetchWithRetry(`${apiClient.baseURL}/github/repo/${repo.full_name}/tree`);
      
      if (response.success) {
        setRepoFiles(response.data.files);
      } else {
        setErrors(prev => ({ ...prev, files: 'Failed to load repository files' }));
      }
    } catch (error) {
      console.error('Error loading repository files:', error);
      setErrors(prev => ({ ...prev, files: error.message }));
    } finally {
      setLoadingStates(prev => ({ ...prev, files: false }));
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setFileContent(null);
    setExplanation('');
    setSelectedCode('');
    
    setLoadingStates(prev => ({ ...prev, fileContent: true }));
    setErrors(prev => ({ ...prev, fileContent: null }));

    try {
      const response = await apiClient.fetchWithRetry(
        `${apiClient.baseURL}/github/repo/${selectedRepo.full_name}/file?file_path=${encodeURIComponent(file.path)}`
      );
      
      if (response.success) {
        setFileContent(response.data);
      } else {
        setErrors(prev => ({ ...prev, fileContent: 'Failed to load file content' }));
      }
    } catch (error) {
      console.error('Error loading file content:', error);
      setErrors(prev => ({ ...prev, fileContent: error.message }));
    } finally {
      setLoadingStates(prev => ({ ...prev, fileContent: false }));
    }
  };

  const handleExplainCode = async (codeToExplain = null) => {
    const code = codeToExplain || selectedCode || fileContent?.content;
    if (!code) return;

    setLoadingStates(prev => ({ ...prev, explanation: true }));
    setErrors(prev => ({ ...prev, explanation: null }));

    try {
      // Use the new dedicated code explanation API
      const response = await apiClient.explainCode(
        code,
        explanationMode,
        fileContent,
        selectedCode !== code ? selectedCode : null
      );
      
      if (response.success) {
        setExplanation(response.data.explanation);
        setFollowUpQuestions(response.data.follow_up_questions || []);
      } else {
        // Handle fallback response
        if (response.fallback) {
          setExplanation(response.data.explanation);
          setFollowUpQuestions(response.data.follow_up_questions || []);
        } else {
          setErrors(prev => ({ ...prev, explanation: response.error || 'Failed to generate explanation' }));
        }
      }
    } catch (error) {
      console.error('Error generating explanation:', error);
      setErrors(prev => ({ ...prev, explanation: error.message }));
    } finally {
      setLoadingStates(prev => ({ ...prev, explanation: false }));
    }
  };

  // GitHub health check function

  const generateExplanationPrompt = (code, mode, fileContext) => {
    const modeInstructions = {
      explain: "Explain this code as if to a mid-level developer reviewing a pull request. Highlight purpose, key logic, and interactions.",
      summarize: "Give a high-level overview of what this code does and where it fits in the application.",
      teach: "You're a senior developer teaching a beginner. Explain this code in simple terms, including what it does and why it's written that way."
    };

    const context = fileContext ? `
File: ${fileContext.path}
Language: ${fileContext.language}
Lines: ${fileContext.lines}
Repository: ${fileContext.repo}
` : '';

    return `${modeInstructions[mode]}

${context}

Code to explain:
\`\`\`${fileContext?.language || 'text'}
${code}
\`\`\`

Please provide a clear, detailed explanation.`;
  };

  const handleCodeSelection = (selection) => {
    setSelectedCode(selection);
  };

  const handleClearExplanation = () => {
    setExplanation('');
    setFollowUpQuestions([]);
  };

  // Main panel resizing handlers (for code viewer vs explanation panel)
  const handleMainPanelMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMainPanelMouseMove);
    document.addEventListener('mouseup', handleMainPanelMouseUp);
  };

  const handleMainPanelMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const container = document.querySelector('.main-content-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const relativeX = e.clientX - containerRect.left;
    const percentage = (relativeX / containerRect.width) * 100;
    
    // Constrain between 30% and 70%
    const newSplit = Math.max(30, Math.min(70, percentage));
    setMainPanelSplit(newSplit);
  };

  const handleMainPanelMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMainPanelMouseMove);
    document.removeEventListener('mouseup', handleMainPanelMouseUp);
  };

  // Toggle navigation panel
  const toggleNavigation = () => {
    setShowNavigation(!showNavigation);
  };

  // Handle navigation tab switching
  const handleNavigationTabSwitch = (tab) => {
    setActiveNavigationTab(tab);
    if (!showNavigation) {
      setShowNavigation(true);
    }
  };

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMainPanelMouseMove);
      document.removeEventListener('mouseup', handleMainPanelMouseUp);
    };
  }, []);

  // If GitHub service is not healthy, show error state
  if (githubHealthy === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-12 text-center">
            <div className="text-red-400 text-5xl mb-6">⚠️</div>
            <h2 className="text-3xl font-bold text-red-400 mb-6">GitHub Service Unavailable</h2>
            <p className="text-gray-300 mb-3 text-lg">
              {errors.github || 'The GitHub integration service is currently unavailable.'}
            </p>
            <p className="text-gray-400 mb-8">
              Please check your configuration and try again.
            </p>
            <button
              onClick={checkGitHubHealth}
              className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-lg font-medium transition-colors text-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col overflow-hidden">
      {/* Header - Fixed Height */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-full mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🔍</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Claude AI Code Explainer</h1>
                <p className="text-gray-300">
                  Explore and understand code with Claude Sonnet-powered explanations
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              {!repositories.length && (
                <button
                  onClick={loadRepositories}
                  disabled={loadingStates.repositories}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <span>📁</span>
                  <span>{loadingStates.repositories ? 'Loading...' : 'Load Repositories'}</span>
                </button>
              )}
              
              {selectedRepo && !showNavigation && (
                <button
                  onClick={toggleNavigation}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <span>🗂️</span>
                  <span>Browse</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Main Content */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Navigation Tabs Bar */}
        <div className="px-8 py-3 border-b border-white/10 bg-black/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleNavigationTabSwitch('repos')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeNavigationTab === 'repos' && showNavigation
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>📁</span>
                <span>Repositories</span>
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{repositories.length}</span>
              </button>
              
              <button
                onClick={() => handleNavigationTabSwitch('files')}
                disabled={!selectedRepo}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeNavigationTab === 'files' && showNavigation
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : selectedRepo 
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <span>📄</span>
                <span>Files</span>
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{repoFiles.length}</span>
              </button>
              
              {/* Breadcrumb */}
              {selectedRepo && (
                <div className="flex items-center space-x-2 ml-4 text-sm text-gray-400">
                  <span>/</span>
                  <span className="text-gray-300">{selectedRepo.name}</span>
                  {selectedFile && (
                    <>
                      <span>/</span>
                      <span className="text-blue-300">{selectedFile.path}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Right: Mode Controls */}
            <div className="flex bg-white/10 rounded-xl p-1">
              {['explain', 'summarize', 'teach'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    // Clear explanation when switching modes
                    if (explanationMode !== mode) {
                      setExplanation('');
                    }
                    setExplanationMode(mode);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    explanationMode === mode
                      ? mode === 'explain' ? 'bg-blue-500 text-white' :
                        mode === 'summarize' ? 'bg-green-500 text-white' :
                        'bg-purple-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode === 'explain' ? '🔍' : mode === 'summarize' ? '📋' : '🎓'} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative min-h-0">
          {/* Navigation Sidebar (Overlay) */}
          {showNavigation && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowNavigation(false)}
              />
              
              {/* Navigation Panel */}
              <div className="fixed left-8 top-32 bottom-8 w-96 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-xl z-50 shadow-2xl">
                <div className="h-full flex flex-col">
                  {/* Navigation Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">
                      {activeNavigationTab === 'repos' ? '📁 Repositories' : '📄 Files'}
                    </h3>
                    <button
                      onClick={() => setShowNavigation(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Navigation Content */}
                  <div className="flex-1 overflow-hidden">
                    {activeNavigationTab === 'repos' ? (
                      <RepositoryBrowser
                        repositories={repositories}
                        selectedRepo={selectedRepo}
                        onRepoSelect={(repo) => {
                          handleRepoSelect(repo);
                          setShowNavigation(false);
                        }}
                        loading={loadingStates.repositories}
                        error={errors.repositories}
                      />
                    ) : (
                      <FileBrowser
                        files={repoFiles}
                        selectedFile={selectedFile}
                        onFileSelect={(file) => {
                          handleFileSelect(file);
                          setShowNavigation(false);
                        }}
                        loading={loadingStates.files}
                        error={errors.files}
                        selectedRepo={selectedRepo}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Content Panels */}
          <div className="main-content-container flex w-full flex-1 px-8 py-6 gap-4 min-h-0">
            {/* Code Viewer */}
            <div 
              className="transition-all duration-200 flex flex-col min-h-0"
              style={{ width: `${mainPanelSplit}%` }}
            >
              <CodeViewer
                fileContent={fileContent}
                selectedCode={selectedCode}
                onCodeSelection={handleCodeSelection}
                onExplainCode={handleExplainCode}
                loading={loadingStates.fileContent}
                error={errors.fileContent}
                explanationMode={explanationMode}
              />
            </div>

            {/* Main Panel Resize Handle */}
            <div
              className="w-2 bg-white/5 hover:bg-white/20 rounded-full cursor-col-resize transition-colors flex-shrink-0 group self-stretch"
              onMouseDown={handleMainPanelMouseDown}
            >
              <div className="w-full h-full rounded-full group-hover:bg-blue-400/50"></div>
            </div>

            {/* Explanation Panel */}
            <div 
              className="transition-all duration-200 flex flex-col min-h-0"
              style={{ width: `${100 - mainPanelSplit - 1}%` }} // Subtract 1% for the handle
            >
              <ExplanationPanel
                explanation={explanation}
                selectedCode={selectedCode}
                fileContext={fileContent}
                loading={loadingStates.explanation}
                error={errors.explanation}
                explanationMode={explanationMode}
                onExplainCode={handleExplainCode}
                onClearExplanation={handleClearExplanation}
                followUpQuestions={followUpQuestions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {Object.values(loadingStates).some(Boolean) && (
        <LoadingSpinner message="Processing..." />
      )}
    </div>
  );
};

export default CodeExplainer;
