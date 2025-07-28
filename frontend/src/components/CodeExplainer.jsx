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
  
  // Panel sizing state for resizable panels
  const [panelSizes, setPanelSizes] = useState({
    repositories: 280,  // Repository browser width
    files: 250,         // File browser width  
    code: 450,          // Code viewer width
    explanation: 350    // Explanation panel width
  });
  
  // Refs for drag handling
  const isDragging = useRef(false);
  const dragType = useRef(null);

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
      } else {
        // Handle fallback response
        if (response.fallback) {
          setExplanation(response.data.explanation);
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

  // Panel resizing handlers
  const handleMouseDown = (e, panelType) => {
    e.preventDefault();
    isDragging.current = true;
    dragType.current = panelType;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !dragType.current) return;
    
    const containerRect = document.querySelector('.code-explainer-container').getBoundingClientRect();
    const relativeX = e.clientX - containerRect.left;
    
    setPanelSizes(prev => {
      const newSizes = { ...prev };
      
      switch (dragType.current) {
        case 'repositories':
          newSizes.repositories = Math.max(200, Math.min(400, relativeX - 24));
          break;
        case 'files':
          newSizes.files = Math.max(180, Math.min(350, relativeX - prev.repositories - 48));
          break;
        case 'code':
          const usedWidth = prev.repositories + prev.files;
          const availableForCode = containerRect.width - usedWidth - prev.explanation - 96; // margins
          newSizes.code = Math.max(300, Math.min(800, relativeX - usedWidth - 72));
          break;
      }
      
      return newSizes;
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    dragType.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
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
            
            {/* Explanation Mode Selector */}
            <div className="flex bg-white/10 rounded-xl p-1.5">
              {['explain', 'summarize', 'teach'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setExplanationMode(mode)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    explanationMode === mode
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Resizable Panels */}
      <div className="code-explainer-container flex h-[calc(100vh-120px)] px-8 py-6 gap-6">
        {/* Repository Browser */}
        <div 
          className="flex-shrink-0 transition-all duration-200"
          style={{ width: `${panelSizes.repositories}px` }}
        >
          <RepositoryBrowser
            repositories={repositories}
            selectedRepo={selectedRepo}
            onRepoSelect={handleRepoSelect}
            loading={loadingStates.repositories}
            error={errors.repositories}
          />
        </div>

        {/* Resize Handle 1 */}
        <div
          className="w-2 bg-white/5 hover:bg-white/20 rounded-full cursor-col-resize transition-colors flex-shrink-0 group"
          onMouseDown={(e) => handleMouseDown(e, 'repositories')}
        >
          <div className="w-full h-full rounded-full group-hover:bg-blue-400/50"></div>
        </div>

        {/* File Browser */}
        <div 
          className="flex-shrink-0 transition-all duration-200"
          style={{ width: `${panelSizes.files}px` }}
        >
          <FileBrowser
            files={repoFiles}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            loading={loadingStates.files}
            error={errors.files}
            selectedRepo={selectedRepo}
          />
        </div>

        {/* Resize Handle 2 */}
        <div
          className="w-2 bg-white/5 hover:bg-white/20 rounded-full cursor-col-resize transition-colors flex-shrink-0 group"
          onMouseDown={(e) => handleMouseDown(e, 'files')}
        >
          <div className="w-full h-full rounded-full group-hover:bg-blue-400/50"></div>
        </div>

        {/* Code Viewer */}
        <div 
          className="flex-shrink-0 transition-all duration-200"
          style={{ width: `${panelSizes.code}px` }}
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

        {/* Resize Handle 3 */}
        <div
          className="w-2 bg-white/5 hover:bg-white/20 rounded-full cursor-col-resize transition-colors flex-shrink-0 group"
          onMouseDown={(e) => handleMouseDown(e, 'code')}
        >
          <div className="w-full h-full rounded-full group-hover:bg-blue-400/50"></div>
        </div>

        {/* Explanation Panel - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <ExplanationPanel
            explanation={explanation}
            selectedCode={selectedCode}
            fileContext={fileContent}
            loading={loadingStates.explanation}
            error={errors.explanation}
            explanationMode={explanationMode}
            onExplainCode={handleExplainCode}
          />
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
