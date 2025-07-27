import { useState, useEffect } from 'react';
import About from './components/About';
import Projects from './components/Projects';
import Resume from './components/Resume';
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

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
        
        <div className="relative glass rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl sm:text-2xl font-bold">IM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Isaac Mineo</h1>
            <p className="text-white/80 text-sm">Professional Portfolio</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Access Code
              </label>
              <input
                id="password"
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                placeholder="Enter access code"
                required
              />
              {error && (
                <p className="mt-2 text-red-300 text-sm">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Enter Portfolio'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              This portfolio contains confidential project information
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Status Bar for safe area */}
      <div className="safe-area-top bg-gradient-to-r from-blue-500 to-purple-600 h-1"></div>
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
          Offline Mode - Some features may be limited
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 safe-area-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm sm:text-lg font-bold">IM</span>
              </div>
              <span className="text-lg sm:text-xl font-bold gradient-text hidden xs:block">Isaac Mineo</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors text-sm lg:text-base">About</a>
              <a href="#projects" className="text-gray-600 hover:text-primary-600 transition-colors text-sm lg:text-base">Projects</a>
              <a href="#resume" className="text-gray-600 hover:text-primary-600 transition-colors text-sm lg:text-base">Resume</a>
              
              {installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200"
                >
                  Install App
                </button>
              )}
              
              <button
                onClick={() => {
                  localStorage.removeItem('isaac-portfolio-auth');
                  setUnlocked(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors duration-200"
                >
                  Install
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-primary-600 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 py-4 space-y-2">
              <a 
                href="#about" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                About
              </a>
              <a 
                href="#projects" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Projects
              </a>
              <a 
                href="#resume" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Resume
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem('isaac-portfolio-auth');
                  setUnlocked(false);
                }}
                className="block w-full text-left px-4 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 safe-area-all">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fadeInUp">
              Hi, I'm <span className="gradient-text">Isaac</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-3 sm:mb-4 max-w-4xl mx-auto animate-fadeInUp px-4" style={{animationDelay: '0.2s'}}>
              Full-Stack Developer who thrives on building useful, intelligent, and scalable web applications.
            </p>
            <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8 max-w-3xl mx-auto animate-fadeInUp px-4" style={{animationDelay: '0.3s'}}>
              I care deeply about clean code, performance, and crafting digital tools that make real-world impact. 
              Specializing in backend architecture and AI integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fadeInUp px-4" style={{animationDelay: '0.4s'}}>
              <a 
                href="#projects" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                🚀 View Nutrivize & Projects
              </a>
              <a 
                href="#resume" 
                className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
              >
                📄 Download Resume
              </a>
            </div>
            
            {/* Quick intro badges */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 animate-fadeInUp px-4" style={{animationDelay: '0.5s'}}>
              <span className="px-3 sm:px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm font-medium border border-primary-200">
                🤖 AI Integration Expert
              </span>
              <span className="px-3 sm:px-4 py-2 bg-secondary-50 text-secondary-700 rounded-full text-xs sm:text-sm font-medium border border-secondary-200">
                ⚡ FastAPI & React
              </span>
              <span className="px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-medium border border-green-200">
                🎯 Problem Solver
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div id="about" className="scroll-mt-20">
          <About />
        </div>
        <div id="projects" className="scroll-mt-20">
          <Projects />
        </div>
        <div id="resume" className="scroll-mt-20">
          <Resume />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 safe-area-bottom">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">💬 Let's Build Something Amazing Together</h3>
            <p className="text-gray-400 mb-2 max-w-2xl mx-auto text-sm sm:text-base">
              I'm open to backend, AI engineering, or full-stack roles where I can build meaningful tools 
              alongside smart, creative teams.
            </p>
            <p className="text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm">
              Especially interested in healthtech, AI, productivity, or developer tooling companies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
              <a 
                href="mailto:isaac@isaacmineo.com" 
                className="text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
              <a 
                href="https://github.com/GoldenRodger5" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/isaacmineo" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                LinkedIn
              </a>
            </div>
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-xs sm:text-sm text-gray-500">
              <p className="mb-2">
                © 2025 Isaac Mineo. Built with React, Vite, and Tailwind CSS.
              </p>
              <p className="text-xs">
                🎧 When not coding: gaming, lifting, exploring music, and spontaneous adventures with friends.
              </p>
              {!isOnline && (
                <p className="text-amber-400 text-xs mt-2">
                  Offline mode active - Content cached for your convenience
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

export default App;
