import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import analyticsService from './services/analyticsService';
import ErrorBoundary from './components/ErrorBoundary';

// Enhanced Mobile Components (simplified)
import { AdvancedMobileNavigation, MobileHeader, MobileModal } from './components/mobile/MobileNavigation';
import { MobileTouchButton, PullToRefresh } from './components/mobile/MobileTouchComponents';

// Remove complex utilities that cause issues
// import './utils/advancedTouchGestures';
// import './utils/mobileDeviceManager';  
// import './utils/mobileAccessibilityManager';

// Lazy load components for better mobile performance
const About = lazy(() => import('./components/About'));
const Projects = lazy(() => import('./components/Projects'));
const Resume = lazy(() => import('./components/Resume'));
const Contact = lazy(() => import('./components/Contact'));
const AIChat = lazy(() => import('./components/AIChat'));
const AIChatbot = lazy(() => import('./components/AIChatbot'));
const CodeExplainer = lazy(() => import('./components/CodeExplainer'));
const PublicAnalytics = lazy(() => import('./components/PublicAnalytics'));
const AdminAnalytics = lazy(() => import('./components/AdminAnalytics'));

// Fallback components for legacy support
const BottomNavigation = lazy(() => import('./components/BottomNavigation'));
const HorizontalTabNavigation = lazy(() => import('./components/HorizontalTabNavigation'));
const SwipeableTabContainer = lazy(() => import('./components/SwipeableTabContainer'));

// Loading component for Suspense fallback
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Component loading fallback for tab content
const TabLoadingFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Content</h3>
      <p className="text-gray-600">Please wait while we load this section...</p>
    </div>
  </div>
);

const CORRECT_PASSWORD = import.meta.env.VITE_SITE_PASSWORD;

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isAppReady, setIsAppReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [useMobileNavigation, setUseMobileNavigation] = useState(false);

  // Simplified mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Simplified tab change handler - removed problematic debouncing
  const handleTabChange = (newTab) => {
    if (activeTab === newTab) return; // Prevent unnecessary changes
    setActiveTab(newTab);
  };

  const tabs = [
    { id: 'about', label: 'About', icon: '👨‍💻' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'resume', label: 'Resume', icon: '📄' },
    { id: 'ai-chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'code-explainer', label: 'Claude Code Explorer', icon: '🔍' },
    { id: 'contact', label: 'Contact', icon: '📬' }
  ];

  // Detect mobile device and enable enhanced mobile experience
  useEffect(() => {
    const detectMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setUseMobileNavigation(isMobile);
      setIsMobile(isMobile);
    };

    // Initial detection
    detectMobile();
    
    // Handle device orientation changes with debouncing
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        detectMobile();
      }, 150);
    };

    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []); // Empty dependency array to run only once

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    try {
      // Refresh current component data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Optional: reload specific data based on active tab
      if (activeTab === 'projects') {
        // Refresh projects data
      } else if (activeTab === 'analytics') {
        // Refresh analytics data
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  // Initialize app with error handling
  useEffect(() => {
    try {
      console.log('App initializing...');
      // Simulate app initialization
      setTimeout(() => {
        setIsAppReady(true);
        console.log('App ready');
      }, 100);
    } catch (error) {
      console.error('App initialization error:', error);
      setAppError(error.message);
    }
  }, []);

  // Check if user has valid session
  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem('isaac-portfolio-auth');
      if (isAuthenticated === 'true') {
        setUnlocked(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Don't fail completely, just log the error
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Don't prevent default to allow the banner to show
      // e.preventDefault(); // Commented out to allow install banner
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Analytics tracking for tab changes
  useEffect(() => {
    if (unlocked && isAppReady) {
      try {
        analyticsService.trackPageView('portfolio', activeTab);
      } catch (error) {
        console.warn('Analytics tracking error:', error);
        // Don't break the app if analytics fails
      }
    }
  }, [activeTab, unlocked, isAppReady]);

  // Track app unlock
  useEffect(() => {
    if (unlocked && isAppReady) {
      try {
        analyticsService.trackPageView('portfolio', 'unlocked');
        
        // Auto-enable admin access if user has JWT token
        const existingToken = localStorage.getItem('access_token');
        if (existingToken) {
          setAuthToken(existingToken);
          console.log('🔐 Admin access enabled via existing JWT token');
        }
      } catch (error) {
        console.warn('App unlock tracking error:', error);
        // Don't break the app if analytics or token handling fails
      }
    }
  }, [unlocked, isAppReady]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (input === CORRECT_PASSWORD) {
        setUnlocked(true);
        localStorage.setItem('isaac-portfolio-auth', 'true');
      } else {
        setError('Incorrect password. Please try again.');
      }
      setIsLoading(false);
    }, 800); // Simulate authentication delay
  };

  const handleInstallPWA = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        setInstallPrompt(null);
      });
    }
  };

  // Show loading screen while app initializes
  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
            <span className="text-white text-3xl font-bold">IM</span>
          </div>
          <div className="text-white text-2xl md:text-3xl font-bold mb-2 tracking-wide">Isaac Mineo</div>
          <div className="text-white/80 text-lg font-medium mb-6">AI & Full-Stack Developer Portfolio</div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen if app failed to initialize
  if (appError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl p-8 max-w-md mx-auto shadow-2xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">App Error</h1>
          <p className="text-gray-600 mb-6">
            Something went wrong while loading the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-center px-4 safe-area-all">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Floating background elements */}
        <div className="absolute top-10 sm:top-20 left-4 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-white opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 w-12 h-12 sm:w-24 sm:h-24 bg-white opacity-10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-2 sm:left-10 w-8 h-8 sm:w-16 sm:h-16 bg-white opacity-10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="absolute top-safe-top left-0 right-0 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium z-50">
            Offline Mode - Some features may be limited
          </div>
        )}

        {/* Login Form */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl sm:text-3xl font-bold">IM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600 text-sm sm:text-base">Access Isaac's Professional Portfolio</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Access Code
              </label>
              <input
                type="password"
                id="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base sm:text-lg"
                placeholder="Enter access code"
                required
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Access Portfolio'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              This portfolio contains confidential project information
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced AI-themed background pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full filter blur-3xl animate-morph"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-neural-400 to-primary-400 rounded-full filter blur-3xl animate-morph" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-accent-400 to-neural-400 rounded-full filter blur-3xl animate-morph" style={{animationDelay: '4s'}}></div>
        
        {/* Neural network grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neural-dots" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="currentColor" className="text-primary-300" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-dots)" />
        </svg>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium z-50">
          ⚠️ Offline Mode - Some features may be limited
        </div>
      )}

      {/* Header */}
      <header className="relative z-40 glass-heavy border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-accent-600 to-neural-600 rounded-xl flex items-center justify-center shadow-xl animate-pulse-glow">
                  <span className="text-white text-xl font-bold">IM</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-neural-pulse shadow-lg"></div>
              </div>
              <div className="block">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-bold gradient-text tracking-tight">
                  Isaac Mineo
                </h1>
                <p className="text-xs md:text-sm lg:text-base text-gray-600 font-semibold tracking-wide">
                  <span className="hidden sm:inline">AI & Full-Stack Developer</span>
                  <span className="sm:hidden">Portfolio</span>
                  <span className="hidden sm:inline text-xs text-gray-400 ml-2 font-normal">• Portfolio</span>
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg animate-magnetic"
                >
                  Install App
                </button>
              )}
              
              {/* Analytics Access for Desktop */}
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
                  showAnalytics 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Toggle Analytics"
              >
                📊 Analytics
              </button>
              
              {/* Admin Dashboard Access (if authenticated) */}
              {authToken && (
                <button
                  onClick={() => setShowAdminDashboard(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all duration-200 shadow-sm"
                  title="Admin Dashboard"
                >
                  ⚙️ Admin
                </button>
              )}
              
              <button
                onClick={() => {
                  localStorage.removeItem('isaac-portfolio-auth');
                  setUnlocked(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              {installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md active:scale-95"
                >
                  Install
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm active:scale-95 ${
                  isMenuOpen 
                    ? 'text-primary-600 bg-primary-50 shadow-md' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 rounded-b-3xl shadow-2xl mx-4 mb-4 overflow-hidden">
              <div className="px-6 py-6 space-y-3">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group active:scale-95 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className={`text-xl transition-transform duration-300 ${
                      activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {tab.icon}
                    </span>
                    <span className="font-semibold text-base">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
                
                <hr className="my-6 border-gray-200/60" />
                
                <button
                  onClick={() => {
                    localStorage.removeItem('isaac-portfolio-auth');
                    setUnlocked(false);
                  }}
                  className="w-full flex items-center space-x-4 px-5 py-4 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 group active:scale-95"
                >
                  <span className="text-xl group-hover:scale-105 transition-transform">🚪</span>
                  <span className="font-semibold text-base">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-6 pb-8 md:pt-8 md:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 md:mb-8">
            <h1 className="text-4xl md:text-7xl font-display font-bold mb-6 md:mb-12 leading-tight md:leading-relaxed">
              <span className="gradient-text block mb-2 md:mb-2">
                Building the Future
              </span>
              <span className="text-gray-800 block">with AI</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed md:leading-relaxed px-2">
              Full-Stack Developer specializing in <strong className="text-primary-700">AI-powered applications</strong>, 
              scalable backend architecture, and intelligent user experiences.
            </p>
            
            {/* Professional badges */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-8 px-2">
              <span className="px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 rounded-full text-sm md:text-sm font-semibold border border-primary-200 animate-magnetic shadow-sm">
                🧠 AI Integration Expert
              </span>
              <span className="px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-sm md:text-sm font-semibold border border-emerald-200 animate-magnetic shadow-sm">
                ⚡ FastAPI Specialist
              </span>
              <span className="px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-neural-100 to-primary-100 text-neural-800 rounded-full text-sm md:text-sm font-semibold border border-neural-200 animate-magnetic shadow-sm">
                🚀 React Developer
              </span>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-6 justify-center mb-6 md:mb-8 px-2">
            <button
              onClick={() => handleTabChange('projects')}
              className="group bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-8 py-4 md:px-10 md:py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-magnetic active:scale-95"
            >
              <span className="flex items-center justify-center text-base md:text-base">
                🚀 Explore Projects
                <svg className="w-5 h-5 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => handleTabChange('ai-chat')}
              className="group bg-gradient-to-r from-neural-600 to-purple-600 hover:from-neural-700 hover:to-purple-700 text-white px-8 py-4 md:px-10 md:py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-magnetic active:scale-95"
            >
              <span className="flex items-center justify-center text-base md:text-base">
                🤖 Chat with AI
                <svg className="w-5 h-5 md:w-5 md:h-5 ml-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => handleTabChange('resume')}
              className="group border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-4 md:px-10 md:py-4 rounded-2xl font-semibold transition-all duration-300 animate-magnetic shadow-sm hover:shadow-lg active:scale-95"
            >
              <span className="flex items-center justify-center text-base md:text-base">
                📄 View Resume
                <svg className="w-5 h-5 md:w-5 md:h-5 ml-2 group-hover:translate-y-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Tab Navigation - Desktop */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Loading navigation..." />}>
          <HorizontalTabNavigation 
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            className="hidden md:block"
          />
        </Suspense>
      </ErrorBoundary>

      {/* Main Content with Swipe Support */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Loading content container..." />}>
          <SwipeableTabContainer
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          >
        <main className="relative z-20 py-4 pb-24 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-4 md:p-6 lg:p-8">
                <ErrorBoundary>
                  <Suspense fallback={<TabLoadingFallback />}>
                    {(() => {
                      try {
                        switch (activeTab) {
                          case 'about':
                            return (
                              <>
                                <About />
                                {showAnalytics && <PublicAnalytics />}
                              </>
                            );
                          case 'projects':
                            return <Projects />;
                          case 'resume':
                            return <Resume />;
                          case 'ai-chat':
                            return <AIChat />;
                          case 'code-explainer':
                            return <CodeExplainer />;
                          case 'contact':
                            return <Contact />;
                          default:
                            return <About />;
                        }
                      } catch (error) {
                        console.error('Component render error:', error);
                        return (
                          <div className="text-center py-12">
                            <div className="text-red-500 text-4xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Component Error</h3>
                            <p className="text-gray-600 mb-4">
                              There was an error loading this section.
                            </p>
                            <button
                              onClick={() => handleTabChange('about')}
                              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Go to About
                            </button>
                          </div>
                        );
                      }
                    })()}
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </main>
          </SwipeableTabContainer>
        </Suspense>
      </ErrorBoundary>

      {/* Bottom Navigation - Mobile */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Loading mobile navigation..." />}>
          <BottomNavigation 
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Footer */}
      <footer className="relative z-20 mt-20 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center space-x-8 mb-8">
              <a 
                href="https://github.com/GoldenRodger5" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/isaacmineo2001" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-white transition-colors flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a 
                href="mailto:isaac@isaacmineo.com"
                className="text-gray-200 hover:text-white transition-colors flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </a>
            </div>
            <div className="border-t border-gray-600 pt-6">
              <p className="text-gray-200 mb-2">
                © 2025 Isaac Mineo. Built with React, FastAPI, and AI.
              </p>
              <p className="text-sm text-gray-200 mb-4">
                🎧 When not coding: gaming, lifting, exploring music, and spontaneous adventures with friends.
              </p>
              {!isOnline && (
                <p className="text-amber-300 text-sm mt-2">
                  ⚠️ Offline mode active - Content cached for your convenience
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <AIChatbot />
        </Suspense>
      </ErrorBoundary>

      {/* Analytics Components */}
      {showAdminDashboard && authToken && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback message="Loading admin dashboard..." />}>
            <AdminAnalytics 
              authToken={authToken}
              onClose={() => setShowAdminDashboard(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Floating Analytics Toggle */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-2">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title={showAnalytics ? "Hide Analytics" : "Show Analytics"}
        >
          <span className="text-lg">📊</span>
        </button>
        
        {/* Admin Dashboard Access (triple-click to reveal) */}
        <button
          onClick={(e) => {
            if (e.detail === 3) { // Triple click
              // Check if user is already authenticated with JWT
              const existingToken = localStorage.getItem('access_token');
              if (existingToken) {
                setAuthToken(existingToken);
                setShowAdminDashboard(true);
              } else {
                const token = prompt('Enter admin token (or use existing JWT from Code Explainer):');
                if (token) {
                  setAuthToken(token);
                  setShowAdminDashboard(true);
                }
              }
            }
          }}
          className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center opacity-30 hover:opacity-70"
          title="Admin Access (triple-click)"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>
      
      {/* Vercel Analytics & Speed Insights - Only in production */}
      {import.meta.env.PROD && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}

      {/* Accessibility Announcements for Screen Reader Support */}
      <div 
        id="accessibility-announcements" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      ></div>
      
      {/* Skip Links for Keyboard Navigation */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded z-50">
        Skip to main content
      </a>
      
      </div>
    </AuthProvider>
  );
}

export default App;
