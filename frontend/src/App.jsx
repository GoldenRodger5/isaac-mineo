import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import About from './components/About';
import Projects from './components/Projects';
import Resume from './components/Resume';
import Contact from './components/Contact';
import AIChat from './components/AIChat';
import AIChatbot from './components/AIChatbot';

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

  const tabs = [
    { id: 'about', label: 'About', icon: '👨‍💻' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'resume', label: 'Resume', icon: '📄' },
    { id: 'ai-chat', label: 'AI Assistant', icon: '🤖' },
    { id: 'contact', label: 'Contact', icon: '📬' }
  ];

  // Check if user has valid session
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isaac-portfolio-auth');
    if (isAuthenticated === 'true') {
      setUnlocked(true);
    }
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* AI-themed background pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium z-50">
          ⚠️ Offline Mode - Some features may be limited
        </div>
      )}

      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">IM</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Isaac Mineo
                </h1>
                <p className="text-xs text-gray-500 font-medium">Gen AI Backend Developer</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                >
                  Install App
                </button>
              )}
              
              <button
                onClick={() => {
                  localStorage.removeItem('isaac-portfolio-auth');
                  setUnlocked(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                >
                  Install
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/20 rounded-b-2xl shadow-xl mx-4 mb-4">
              <div className="px-4 py-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
                <hr className="my-4 border-gray-200" />
                <button
                  onClick={() => {
                    localStorage.removeItem('isaac-portfolio-auth');
                    setUnlocked(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Building the Future
              </span>
              <br />
              <span className="text-gray-800">with AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Full-Stack Developer specializing in <strong>AI-powered applications</strong>, 
              scalable backend architecture, and intelligent user experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
                🧠 AI Integration Expert
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200">
                ⚡ FastAPI Specialist
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 rounded-full text-sm font-semibold border border-indigo-200">
                🚀 React Developer
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setActiveTab('projects')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              🚀 Explore Projects
            </button>
            <button
              onClick={() => setActiveTab('ai-chat')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              🤖 Chat with AI
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200"
            >
              📄 View Resume
            </button>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="relative z-30 bg-white/80 backdrop-blur-xl border-y border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex space-x-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 md:p-12">
              {activeTab === 'about' && <About />}
              {activeTab === 'projects' && <Projects />}
              {activeTab === 'resume' && <Resume />}
              {activeTab === 'ai-chat' && <AIChat />}
              {activeTab === 'contact' && <Contact />}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 mt-20 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center space-x-8 mb-8">
              <a 
                href="https://github.com/GoldenRodger5" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 group"
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
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a 
                href="mailto:isaac@isaacmineo.com"
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </a>
            </div>
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-300 mb-2">
                © 2025 Isaac Mineo. Built with React, FastAPI, and AI.
              </p>
              <p className="text-sm text-gray-400">
                🎧 When not coding: gaming, lifting, exploring music, and spontaneous adventures with friends.
              </p>
              {!isOnline && (
                <p className="text-amber-400 text-sm mt-2">
                  ⚠️ Offline mode active - Content cached for your convenience
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <AIChatbot />
      
      {/* Vercel Analytics & Speed Insights */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
