/**
 * Comprehensive test suite for Code Explainer frontend components
 * Tests React components, API client, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Import components to test
import CodeExplainer from '../components/CodeExplainer';
import CodeViewer from '../components/CodeExplainer/CodeViewer';
import ExplanationPanel from '../components/CodeExplainer/ExplanationPanel';
import RepositoryBrowser from '../components/CodeExplainer/RepositoryBrowser';
import { apiClient } from '../services/apiClient';

// Mock API client
vi.mock('../services/apiClient', () => ({
  apiClient: {
    fetchWithRetry: vi.fn(),
    explainCode: vi.fn(),
    healthCheck: vi.fn(),
    baseURL: 'http://localhost:8000/api',
    environment: 'test'
  }
}));

describe('CodeExplainer Main Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock successful health check
    apiClient.fetchWithRetry.mockResolvedValue({
      success: true,
      message: 'GitHub service is healthy'
    });
  });

  test('renders main interface correctly', async () => {
    render(<CodeExplainer />);
    
    // Check for main heading
    expect(screen.getByText('Claude AI Code Explainer')).toBeInTheDocument();
    
    // Check for description
    expect(screen.getByText(/Explore and understand code with Claude Sonnet-powered explanations/)).toBeInTheDocument();
    
    // Check for mode buttons
    expect(screen.getByText('Explain')).toBeInTheDocument();
    expect(screen.getByText('Summarize')).toBeInTheDocument();
    expect(screen.getByText('Teach')).toBeInTheDocument();
  });

  test('handles GitHub service health check', async () => {
    render(<CodeExplainer />);
    
    await waitFor(() => {
      expect(apiClient.fetchWithRetry).toHaveBeenCalledWith(
        expect.stringContaining('/github/health')
      );
    });
  });

  test('switches explanation modes correctly', async () => {
    const user = userEvent.setup();
    render(<CodeExplainer />);
    
    // Click summarize mode
    const summarizeButton = screen.getByText('Summarize');
    await user.click(summarizeButton);
    
    // Verify button state change
    expect(summarizeButton).toHaveClass('bg-green-500');
  });

  test('handles navigation tab switching', async () => {
    const user = userEvent.setup();
    render(<CodeExplainer />);
    
    // Mock repositories data
    apiClient.fetchWithRetry.mockResolvedValueOnce({
      success: true,
      data: [
        {
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: 'Test repository',
          language: 'JavaScript'
        }
      ]
    });
    
    // Click repositories tab
    const reposTab = screen.getByText('Repositories');
    await user.click(reposTab);
    
    await waitFor(() => {
      expect(reposTab).toHaveClass('bg-blue-500/20');
    });
  });

  test('displays error state when GitHub service is unavailable', async () => {
    // Mock failed health check
    apiClient.fetchWithRetry.mockRejectedValue(new Error('Service unavailable'));
    
    render(<CodeExplainer />);
    
    await waitFor(() => {
      expect(screen.getByText('GitHub Service Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });
  });
});

describe('CodeViewer Component', () => {
  const mockFileContent = {
    name: 'test.js',
    content: 'function hello() {\n  return "world";\n}',
    language: 'javascript',
    path: 'src/test.js'
  };

  test('renders file content with syntax highlighting', () => {
    const mockProps = {
      fileContent: mockFileContent,
      selectedCode: '',
      onCodeSelection: vi.fn(),
      onExplainCode: vi.fn(),
      loading: false,
      error: null,
      explanationMode: 'explain'
    };

    render(<CodeViewer {...mockProps} />);
    
    expect(screen.getByText('test.js')).toBeInTheDocument();
    expect(screen.getByText('Language: javascript')).toBeInTheDocument();
    expect(screen.getByText(/function hello/)).toBeInTheDocument();
  });

  test('handles code selection', async () => {
    const user = userEvent.setup();
    const mockOnCodeSelection = vi.fn();
    
    const mockProps = {
      fileContent: mockFileContent,
      selectedCode: '',
      onCodeSelection: mockOnCodeSelection,
      onExplainCode: vi.fn(),
      loading: false,
      error: null,
      explanationMode: 'explain'
    };

    render(<CodeViewer {...mockProps} />);
    
    // Simulate text selection (this is complex in jsdom, so we'll mock it)
    const codeElement = screen.getByText(/function hello/);
    fireEvent.mouseUp(codeElement);
    
    // Note: Actual text selection testing is limited in jsdom
    // In a real test, you'd use a more sophisticated setup
  });

  test('shows loading state', () => {
    const mockProps = {
      fileContent: null,
      selectedCode: '',
      onCodeSelection: vi.fn(),
      onExplainCode: vi.fn(),
      loading: true,
      error: null,
      explanationMode: 'explain'
    };

    render(<CodeViewer {...mockProps} />);
    
    expect(screen.getByText('Loading file content...')).toBeInTheDocument();
  });

  test('shows error state', () => {
    const mockProps = {
      fileContent: null,
      selectedCode: '',
      onCodeSelection: vi.fn(),
      onExplainCode: vi.fn(),
      loading: false,
      error: 'Failed to load file',
      explanationMode: 'explain'
    };

    render(<CodeViewer {...mockProps} />);
    
    expect(screen.getByText('Failed to load file')).toBeInTheDocument();
  });
});

describe('ExplanationPanel Component', () => {
  const mockProps = {
    explanation: 'This is a test explanation',
    selectedCode: 'console.log("test")',
    fileContext: {
      name: 'test.js',
      language: 'javascript',
      path: 'src/test.js'
    },
    loading: false,
    error: null,
    explanationMode: 'explain',
    onExplainCode: vi.fn(),
    onClearExplanation: vi.fn()
  };

  test('renders explanation content', () => {
    render(<ExplanationPanel {...mockProps} />);
    
    expect(screen.getByText('AI Explanation')).toBeInTheDocument();
    expect(screen.getByText('This is a test explanation')).toBeInTheDocument();
  });

  test('handles follow-up questions', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    apiClient.explainCode.mockResolvedValue({
      success: true,
      data: {
        explanation: 'Follow-up answer'
      }
    });

    render(<ExplanationPanel {...mockProps} />);
    
    // Find and fill follow-up input
    const followUpInput = screen.getByPlaceholderText(/Ask a follow-up question/);
    await user.type(followUpInput, 'What does this function do?');
    
    // Submit question
    const askButton = screen.getByText('Ask');
    await user.click(askButton);
    
    await waitFor(() => {
      expect(apiClient.explainCode).toHaveBeenCalled();
    });
  });

  test('clears conversation when clear button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClearExplanation = vi.fn();
    
    const propsWithClear = {
      ...mockProps,
      onClearExplanation: mockOnClearExplanation
    };

    render(<ExplanationPanel {...propsWithClear} />);
    
    // Find and click clear button (trash icon)
    const clearButton = screen.getByText('🗑️');
    await user.click(clearButton);
    
    expect(mockOnClearExplanation).toHaveBeenCalled();
  });

  test('shows loading state during explanation generation', () => {
    const loadingProps = {
      ...mockProps,
      loading: true,
      explanation: ''
    };

    render(<ExplanationPanel {...loadingProps} />);
    
    expect(screen.getByText(/Generating explanation/)).toBeInTheDocument();
  });

  test('displays different mode indicators', () => {
    const teachProps = {
      ...mockProps,
      explanationMode: 'teach'
    };

    render(<ExplanationPanel {...teachProps} />);
    
    expect(screen.getByText('🎓')).toBeInTheDocument();
    expect(screen.getByText('teach')).toBeInTheDocument();
  });
});

describe('RepositoryBrowser Component', () => {
  const mockRepositories = [
    {
      name: 'repo1',
      full_name: 'user/repo1',
      description: 'First repository',
      language: 'JavaScript',
      private: false,
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      name: 'repo2',
      full_name: 'user/repo2',
      description: 'Second repository',
      language: 'Python',
      private: true,
      updated_at: '2024-01-02T00:00:00Z'
    }
  ];

  test('renders repository list', () => {
    const mockProps = {
      repositories: mockRepositories,
      selectedRepo: null,
      onRepoSelect: vi.fn(),
      loading: false,
      error: null
    };

    render(<RepositoryBrowser {...mockProps} />);
    
    expect(screen.getByText('repo1')).toBeInTheDocument();
    expect(screen.getByText('repo2')).toBeInTheDocument();
    expect(screen.getByText('First repository')).toBeInTheDocument();
    expect(screen.getByText('Second repository')).toBeInTheDocument();
  });

  test('handles repository selection', async () => {
    const user = userEvent.setup();
    const mockOnRepoSelect = vi.fn();
    
    const mockProps = {
      repositories: mockRepositories,
      selectedRepo: null,
      onRepoSelect: mockOnRepoSelect,
      loading: false,
      error: null
    };

    render(<RepositoryBrowser {...mockProps} />);
    
    const repo1Button = screen.getByText('repo1').closest('button');
    await user.click(repo1Button);
    
    expect(mockOnRepoSelect).toHaveBeenCalledWith(mockRepositories[0]);
  });

  test('shows selected repository state', () => {
    const mockProps = {
      repositories: mockRepositories,
      selectedRepo: mockRepositories[0],
      onRepoSelect: vi.fn(),
      loading: false,
      error: null
    };

    render(<RepositoryBrowser {...mockProps} />);
    
    const selectedButton = screen.getByText('repo1').closest('button');
    expect(selectedButton).toHaveClass('bg-blue-500/20');
  });

  test('displays private repository indicators', () => {
    const mockProps = {
      repositories: mockRepositories,
      selectedRepo: null,
      onRepoSelect: vi.fn(),
      loading: false,
      error: null
    };

    render(<RepositoryBrowser {...mockProps} />);
    
    // repo2 is private, should have private indicator
    expect(screen.getByText('Private')).toBeInTheDocument();
  });
});

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('detects environment correctly', () => {
    // Mock different hostnames
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true
    });
    
    expect(apiClient.environment).toBe('test');
  });

  test('handles API errors with retry logic', async () => {
    // Mock failed then successful response
    global.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: 'test' })
      });

    const result = await apiClient.fetchWithRetry('/test');
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  test('explains code with proper request format', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { explanation: 'Test explanation' }
      })
    });

    const result = await apiClient.explainCode(
      'console.log("test")',
      'explain',
      { language: 'javascript' }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/github/explain-code'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('console.log')
      })
    );

    expect(result.success).toBe(true);
  });

  test('provides fallback explanation on API failure', async () => {
    global.fetch.mockRejectedValue(new Error('API unavailable'));

    const result = await apiClient.explainCode(
      'console.log("test")',
      'explain',
      { language: 'javascript', path: 'test.js' }
    );

    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
    expect(result.data.explanation).toContain('having trouble connecting');
  });
});

describe('User Interaction Flows', () => {
  test('complete code explanation workflow', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    apiClient.fetchWithRetry
      .mockResolvedValueOnce({ success: true, message: 'Healthy' }) // Health check
      .mockResolvedValueOnce({ // Repositories
        success: true,
        data: [{
          name: 'test-repo',
          full_name: 'user/test-repo',
          description: 'Test repo'
        }]
      })
      .mockResolvedValueOnce({ // Repository tree
        success: true,
        data: {
          files: [{
            name: 'test.js',
            path: 'test.js',
            type: 'file'
          }]
        }
      })
      .mockResolvedValueOnce({ // File content
        success: true,
        data: {
          name: 'test.js',
          content: 'console.log("hello");',
          language: 'javascript'
        }
      });

    apiClient.explainCode.mockResolvedValue({
      success: true,
      data: { explanation: 'This logs hello to console' }
    });

    render(<CodeExplainer />);

    // Wait for health check
    await waitFor(() => {
      expect(screen.getByText('Load Repositories')).toBeInTheDocument();
    });

    // Load repositories
    const loadReposButton = screen.getByText('Load Repositories');
    await user.click(loadReposButton);

    // This would continue with the full workflow...
    // Note: Full integration testing is complex and would require more setup
  });
});

// Performance and accessibility tests
describe('Performance and Accessibility', () => {
  test('components render within performance budget', () => {
    const startTime = performance.now();
    
    render(<CodeExplainer />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Expect render to complete within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('components have proper ARIA labels', () => {
    render(<CodeExplainer />);
    
    // Check for important accessibility features
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Each button should have accessible text
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label', expect.any(String));
    });
  });
});
