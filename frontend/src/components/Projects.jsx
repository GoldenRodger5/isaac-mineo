import React from 'react';

export default function Projects() {
  const projects = [
    {
      title: "Nutrivize",
      subtitle: "🚀 AI Nutrition Platform",
      description: "A production-grade, AI-powered nutrition tracking platform that combines automation, intelligent feedback, and user customization to help people make smarter food decisions and track progress effortlessly.",
      longDescription: "Nutrivize leverages both Claude and GPT models to deliver real-time, context-aware nutrition guidance. The system supports macro tracking, custom goal management, and generates actionable insights and grocery lists based on user data. Built as a mobile-first PWA with robust backend architecture and secure authentication.",
      technologies: ["React (PWA)", "Python (FastAPI)", "MongoDB Atlas", "Redis Cloud", "Firebase Auth", "OpenAI API", "Claude Sonnet 3.5", "Vercel", "Render"],
      features: [
        "Comprehensive food logging and macro tracking",
        "Customizable goals with auto-adjustment",
        "AI-generated weekly progress and insights",
        "Conversational AI nutrition assistant",
        "Multi-user support and streak tracking",
        "Cheat day planning and smart recommendations",
        "Automated grocery list generation"
      ],
      architecture: [
        "Mobile-first PWA with offline support",
        "Redis for persistent memory and caching",
        "Firebase for secure authentication",
        "MongoDB for structured user data and logs",
        "Dual AI integration (Claude + GPT)"
      ],
      githubUrl: "https://github.com/GoldenRodger5/nutrivize/tree/master",
      liveUrl: "https://nutrivize.vercel.app",
      status: "Live",
      featured: true,
      gradient: "from-emerald-500 to-teal-600",
      impact: "A robust, user-centric nutrition platform that demonstrates scalable AI integration and thoughtful product design."
    },
    {
      title: "Quizium",
      subtitle: "🧠 AI Flashcard Generator & Study Assistant",
      description: "A web application that transforms PDFs and web content into interactive flashcards using Claude AI, with a focus on adaptive learning and analytics.",
      longDescription: "Quizium automates the creation of high-quality flashcards from documents and web sources. The platform uses AI for answer evaluation, adaptive hints, and persistent study sessions, providing a seamless and engaging study experience across devices.",
      technologies: ["Python 3.11+", "FastAPI", "Claude AI (Anthropic)", "Uvicorn", "PyPDF2", "BeautifulSoup4", "Jinja2", "Vanilla JavaScript", "HTML5/CSS3"],
      features: [
        "Automated flashcard generation from PDFs and web content",
        "AI-powered answer evaluation and adaptive hints",
        "Persistent study sessions and real-time progress tracking",
        "Multiple study modes and category organization",
        "Batch processing and accessibility support"
      ],
      architecture: [
        "FastAPI backend with modern Python architecture",
        "Claude AI integration for content generation and evaluation",
        "In-memory session storage with auto-recovery",
        "Vanilla JavaScript frontend for performance",
        "RESTful API endpoints for all frontend interactions"
      ],
      githubUrl: "https://github.com/GoldenRodger5/Quizium",
      status: "Production Ready",
      gradient: "from-violet-500 to-purple-600",
      impact: "A practical demonstration of AI-driven learning tools, built for reliability and user engagement."
    },
    {
      title: "EchoPodCast Generator",
      subtitle: "🎙️ AI-Powered Podcast Creation",
      description: "A tool that converts web content into engaging, multi-voice podcasts using advanced AI and realistic voice synthesis.",
      longDescription: "EchoPodCast automates the process of turning articles and blogs into professional-quality podcasts. The system uses OpenAI and ElevenLabs for content analysis and natural-sounding speech, supporting real-time updates, multiple conversation styles, and exportable audio.",
      technologies: ["FastAPI", "React", "OpenAI API", "ElevenLabs", "WebSockets", "Pydub", "YAML", "CSS3", "Python"],
      features: [
        "Automated podcast generation from any web article",
        "Multi-voice AI personalities and customizable styles",
        "Real-time WebSocket updates and background processing",
        "Exportable audio and advanced customization controls"
      ],
      architecture: [
        "FastAPI backend with WebSocket communication",
        "React frontend with modular UI",
        "OpenAI and ElevenLabs for AI content and TTS",
        "Pydub for audio processing",
        "YAML for configuration management"
      ],
      githubUrl: "https://github.com/GoldenRodger5/EchoPodCastGenerator",
      liveUrl: "https://echopodcastgenerator-frontend.onrender.com",
      status: "Live",
      gradient: "from-orange-500 to-red-600",
      impact: "A practical example of AI and automation in media production, making podcast creation accessible and efficient."
    },
    {
      title: "SignalFlow",
      subtitle: "🤖 Advanced AI Trading System",
      description: "Comprehensive AI-powered trading ecosystem with sophisticated algorithms, multi-agent architecture, and professional-grade dashboards using supervised learning with adaptive feedback.",
      longDescription: "SignalFlow combines advanced machine learning, sophisticated algorithms, multi-agent architecture, and professional-grade dashboards. The system uses supervised learning with adaptive feedback to continuously improve trading performance through pattern recognition and outcome analysis.",
      technologies: ["Python 3.8+", "FastAPI", "Streamlit", "MongoDB Atlas", "OpenAI GPT-4o", "Anthropic Claude", "Polygon.io", "Alpaca API", "Railway", "Telegram Bot"],
      features: [
        "Multi-agent architecture with 6 specialized agents (Market Watcher, Trade Recommender, Sentiment Analysis, Execution Monitor, Reasoning, Summary)",
        "Supervised learning with 70/30 train/validation split and adaptive feedback",
        "Kelly Criterion mathematical position sizing optimization",
        "Advanced technical indicators: Williams %R, MACD, momentum multipliers, volatility scaling, regime detection",
        "Real-time market scanning and pattern detection",
        "AI-powered sentiment analysis from news and social media feeds",
        "Interactive Telegram bot with one-click trade execution and controls",
        "Enhanced Trading UI and Railway Cloud Dashboard with mobile-responsive design",
        "Railway cloud deployment with auto-scaling infrastructure and MongoDB Atlas"
      ],
      architecture: [
        "Multi-agent AI system with Market Watcher, Trade Recommender, Sentiment Analysis, Execution Monitor, Reasoning, and Summary agents",
        "Dual LLM integration: OpenAI GPT-4o for complex analysis and Anthropic Claude for sentiment",
        "Railway cloud deployment at web-production-3e19d.up.railway.app",
        "Streamlit dashboards: Enhanced Trading UI (comprehensive) and Railway Cloud Dashboard (monitoring)",
        "Telegram API integration for interactive notifications and trade controls",
        "Polygon.io for real-time market data and Alpaca API for paper/live trading execution"
      ],
      githubUrl: "https://github.com/GoldenRodger5/singal-flow",
      liveUrl: "https://web-production-3e19d.up.railway.app",
      status: "Live",
      featured: true,
      gradient: "from-blue-600 to-indigo-700",
      impact: "A sophisticated demonstration of AI-driven algorithmic trading with comprehensive risk management, achieving 60-65% expected win rate through supervised learning and adaptive feedback systems."
    },
    {
      title: "AI Development Portfolio",
      subtitle: "This Website",
      description: "A modern portfolio and knowledge base with secure authentication, AI-powered chatbot, and a focus on performance and user experience.",
      longDescription: "This site demonstrates my approach to full-stack development: clean architecture, robust authentication, and seamless AI integration. Features include a glassmorphism UI, interactive resume viewer, and a custom chatbot trained on my technical background.",
      technologies: ["React", "Vite", "Tailwind CSS", "FastAPI", "Pinecone", "OpenAI API", "Vercel", "PWA"],
      features: [
        "AI-powered chatbot with knowledge base integration",
        "Glassmorphism UI and smooth animations",
        "Interactive document viewer for resume/transcript",
        "Responsive, mobile-optimized design",
        "Performance-focused with lazy loading",
        "SEO optimized with structured data",
        "Contact form with email integration"
      ],
      architecture: [
        "Vite for fast development and builds",
        "Tailwind for utility-first styling",
        "FastAPI backend with AI integration",
        "Pinecone vector database for knowledge retrieval",
        "Custom animations and micro-interactions"
      ],
      githubUrl: "https://github.com/GoldenRodger5/isaac-mineo",
      liveUrl: "https://isaacmineo.com",
      status: "Live",
      gradient: "from-cyan-500 to-blue-600",
      impact: "A practical example of modern web development, security, and AI working together."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Beta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Development': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Production Ready': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Ongoing': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Separate featured and regular projects
  const featuredProjects = projects.filter(p => p.featured);
  const regularProjects = projects.filter(p => !p.featured);

  return (
    <section id="projects" className="py-4 relative overflow-hidden">
      {/* Enhanced background with neural network pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full filter blur-3xl animate-float-professional"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-neural-400 to-primary-400 rounded-full filter blur-3xl animate-float-professional" style={{animationDelay: '2s'}}></div>
        
        {/* Neural network dots */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neural-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="currentColor" className="text-primary-300" opacity="0.4">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      <div className="relative z-10 animate-fadeInUp">
        <div className="text-center mb-2">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-2 gradient-text">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 mb-2 max-w-4xl mx-auto leading-relaxed">
            Innovative solutions that showcase my expertise in AI integration, full-stack development, 
            and scalable system architecture. Each project demonstrates end-to-end technical execution.
          </p>
          
          {/* Professional metrics bar */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">5+</div>
              <div className="text-sm text-gray-600 font-medium">Production Apps</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">4+</div>
              <div className="text-sm text-gray-600 font-medium">AI Models Integrated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">99%</div>
              <div className="text-sm text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>

        {/* Featured Projects - Bento Grid Layout */}
        {featuredProjects.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-display font-semibold text-gray-900 mb-8 text-center">🌟 Flagship Projects</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProjects.map((project, index) => (
                <div 
                  key={project.title}
                  className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-magnetic overflow-hidden"
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                  
                  {/* Floating status indicator */}
                  <div className="absolute -top-2 -right-2 flex items-center">
                    <div className="w-6 h-6 bg-emerald-400 rounded-full animate-ping"></div>
                    <div className="absolute w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-display font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                          {project.title}
                        </h3>
                        <p className="text-primary-600 font-semibold mb-3">{project.subtitle}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {project.description}
                    </p>
                    
                    {/* Key highlights */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">Technologies</div>
                        <div className="text-xs text-gray-600">{project.technologies.slice(0, 3).join(', ')}</div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">Features</div>
                        <div className="text-xs text-gray-600">{project.features.length} key features</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium text-sm group-hover:shadow-lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        Code
                      </a>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r ${project.gradient} text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Projects */}
        {/* Regular Projects */}
        <div className="space-y-8">
          {regularProjects.map((project, index) => (
            <div 
              key={project.title}
              className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/30 animate-magnetic"
              style={{animationDelay: `${(featuredProjects.length + index) * 0.2}s`}}
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-display font-bold text-gray-900">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    {project.subtitle && (
                      <p className="text-primary-600 font-semibold mb-3">{project.subtitle}</p>
                    )}
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {project.description}
                    </p>
                    {project.longDescription && (
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {project.longDescription}
                      </p>
                    )}
                    <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-l-4 border-primary-500 p-4 rounded-r-xl">
                      <p className="text-primary-800 font-medium text-sm">
                        💡 {project.impact}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Key Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {project.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-gray-600">
                          <svg className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Architecture & Technologies */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                      Architecture & Technologies
                    </h4>
                    {project.architecture && (
                      <ul className="space-y-2 mb-4">
                        {project.architecture.map((item, archIndex) => (
                          <li key={archIndex} className="flex items-start text-gray-600 text-sm">
                            <svg className="w-3 h-3 text-accent-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span 
                          key={tech}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium group-hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                    View Code
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200 font-medium ${project.gradient ? `hover:bg-gradient-to-r hover:${project.gradient} hover:text-white hover:border-transparent` : ''}`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Call to Action */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cta-grid)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Interested in collaborating on innovative projects or want to explore more of my development work?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://github.com/GoldenRodger5" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Explore All Projects
                </a>
                
                <a 
                  href="#contact" 
                  className="inline-flex items-center px-8 py-4 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Let's Connect
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
