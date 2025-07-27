export default function Projects() {
  const projects = [
    {
      title: "Nutrivize",
      subtitle: "🚀 Featured Project",
      description: "A fully AI-powered, mobile-first nutrition tracking app I built from the ground up. Combines automation, intelligent feedback, and user customization to help people make smarter food decisions and track progress effortlessly.",
      longDescription: "Nutrivize integrates both Claude and GPT models to deliver dynamic, context-aware suggestions. It can recommend meals based on your current macros, generate a grocery list from your meal plan, or even justify indulgent foods with playful, human-like reasoning.",
      technologies: ["React (PWA)", "Python (FastAPI)", "MongoDB Atlas", "Redis Cloud", "Firebase Auth", "OpenAI API", "Claude Sonnet 3.5", "Vercel", "Render"],
      features: [
        "Full-featured food logging system",
        "Real-time macro and calorie tracking",
        "Custom goal management & auto-adjustment",
        "AI-generated weekly progress insights",
        "Conversational AI nutrition companion",
        "Multi-user functionality with streak tracking",
        "Cheat day planning and smart recommendations",
        "Grocery list generation from meal plans"
      ],
      architecture: [
        "Mobile-first PWA with offline capabilities",
        "Redis for persistent memory and caching",
        "Firebase for secure authentication",
        "MongoDB for structured user data and logs",
        "Dual AI integration (Claude + GPT)"
      ],
      githubUrl: "https://github.com/GoldenRodger5/nutrivize",
      liveUrl: "https://nutrivize.vercel.app",
      status: "Live",
      impact: "An intelligent nutrition companion designed to feel personal, lightweight, and helpful - not just a tracker"
    },
    {
      title: "AI Development Portfolio",
      subtitle: "This Website",
      description: "A modern, secure portfolio website with password protection, smooth animations, and optimized performance. Built to showcase professional work with innovative features.",
      longDescription: "Features glassmorphism design, secure authentication, responsive layouts, and performance optimizations. Demonstrates modern web development practices and attention to detail.",
      technologies: ["React", "Vite", "Tailwind CSS", "Vercel", "PWA", "PDF.js"],
      features: [
        "Password-protected access with session management",
        "Glassmorphism UI with smooth animations",
        "Interactive document viewer for resume/transcript",
        "Responsive design optimized for all devices",
        "Performance-focused with lazy loading",
        "SEO optimized with structured data"
      ],
      architecture: [
        "Vite for lightning-fast development",
        "Tailwind for utility-first styling",
        "Custom animations and micro-interactions",
        "Environment-based configuration"
      ],
      githubUrl: "https://github.com/GoldenRodger5/isaac-mineo",
      liveUrl: "https://isaacmineo.com",
      status: "Live",
      impact: "Professional showcase demonstrating modern web development skills and design sensibility"
    },
    {
      title: "Full-Stack Development Expertise",
      subtitle: "Technical Capabilities",
      description: "Comprehensive experience building scalable web applications with modern technologies, AI integration, and performance optimization.",
      longDescription: "Specialized in creating end-to-end solutions that combine intelligent backend architecture with polished frontend experiences.",
      technologies: ["Python", "JavaScript/TypeScript", "React Ecosystem", "AI APIs", "Cloud Platforms", "Database Design"],
      features: [
        "API design and architecture",
        "Database modeling and optimization", 
        "Authentication and security implementation",
        "AI and automation integration",
        "Performance monitoring and optimization",
        "DevOps and deployment workflows"
      ],
      architecture: [
        "Microservices and serverless architectures",
        "RESTful API design patterns",
        "Database normalization and indexing",
        "Caching strategies with Redis",
        "CI/CD pipeline implementation"
      ],
      githubUrl: "https://github.com/GoldenRodger5",
      status: "Ongoing",
      impact: "Building meaningful tools that solve real-world problems with clean, scalable code"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Live': return 'bg-green-100 text-green-800';
      case 'Beta': return 'bg-blue-100 text-blue-800';
      case 'In Development': return 'bg-yellow-100 text-yellow-800';
      case 'Ongoing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="projects" className="py-20">
      <div className="animate-fadeInUp">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-text">Featured Projects</h2>
        <p className="text-xl text-center text-gray-600 mb-16 max-w-4xl mx-auto">
          Here are some projects that showcase my ability to build innovative, scalable applications 
          using cutting-edge technologies. From AI-powered nutrition tracking to secure portfolio systems, 
          each project demonstrates end-to-end development skills.
        </p>
        
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <div 
              key={project.title}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    {project.subtitle && (
                      <p className="text-primary-600 font-medium mb-3">{project.subtitle}</p>
                    )}
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {project.description}
                    </p>
                    {project.longDescription && (
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {project.longDescription}
                      </p>
                    )}
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
                      <p className="text-primary-800 font-medium text-sm">
                        💡 {project.impact}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Key Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {project.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-gray-600">
                          <svg className="w-4 h-4 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Architecture & Technologies */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Architecture & Technologies</h4>
                    {project.architecture && (
                      <ul className="space-y-2 mb-4">
                        {project.architecture.map((item, archIndex) => (
                          <li key={archIndex} className="flex items-start text-gray-600 text-sm">
                            <svg className="w-3 h-3 text-secondary-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
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
                    className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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
                      className="flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
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
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Interested in collaborating or want to see more of my work?
          </p>
          <a 
            href="https://github.com/GoldenRodger5" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            View All Projects on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
