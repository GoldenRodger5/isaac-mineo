// Test setup file for Vitest
import '@testing-library/jest-dom';

// Mock environment variables
global.process = {
  ...global.process,
  env: {
    NODE_ENV: 'test',
    VITE_API_BASE_URL: 'http://localhost:8000/api'
  }
};

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    protocol: 'http:',
    port: '5173'
  },
  writable: true
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock intersection observer for components that might use it
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
