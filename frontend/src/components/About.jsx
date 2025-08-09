import React from 'react';
import { 
  MobileSectionContainer, 
  MobileTypography, 
  MobileSkillsGrid 
} from './mobile/EnhancedMobileLayout';
import { SmartAnimation } from './mobile/MobilePerformance';

export default function About() {
  const skills = [
    { 
      category: "Frontend Development", 
      icon: "⚛️",
      items: ["React (Vite.js)", "Tailwind CSS", "JavaScript/TypeScript", "PWA", "Mobile-first Design"],
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      category: "Backend & Infrastructure", 
      icon: "🔧",
      items: ["Python (FastAPI, Flask)", "Node.js (Express)", "MongoDB (Atlas)", "Redis", "RESTful APIs"],
      gradient: "from-emerald-500 to-teal-500"
    },
    { 
      category: "AI & Machine Learning", 
      icon: "🧠",
      items: ["OpenAI API (GPT-4)", "Claude Sonnet 3.5", "Pinecone", "Prompt Engineering", "LangChain"],
      gradient: "from-violet-500 to-purple-500"
    },
    { 
      category: "Security & Authentication", 
      icon: "🔐",
      items: ["Firebase Auth", "JWT", "Session Handling", "API Security", "CORS"],
      gradient: "from-amber-500 to-orange-500"
    },
    { 
      category: "DevOps & Deployment", 
      icon: "🚀",
      items: ["Vercel", "Render", "GitHub CI/CD", "Cloudflare", "Environment Management"],
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <MobileSectionContainer 
      background="gradient" 
      padding="lg"
      className="relative overflow-hidden"
    >
      {/* Enhanced background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary-300 to-accent-300 rounded-full filter blur-3xl animate-float-professional"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-neural-300 to-primary-300 rounded-full filter blur-3xl animate-float-professional" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10">
        <SmartAnimation animation="fadeIn" delay={200}>
          <div className="text-center mb-8 md:mb-12">
            <MobileTypography 
              variant="h1" 
              className="mb-4 gradient-text font-display"
            >
              <span className="hidden md:inline">About Me</span>
              <span className="md:hidden">Building the Future with AI</span>
            </MobileTypography>
            <MobileTypography 
              variant="body" 
              className="text-gray-600 max-w-4xl mx-auto px-4 md:px-0"
            >
              <span className="md:hidden">Full-Stack Developer specializing in AI-powered applications, scalable backend architecture, and intelligent user experiences.</span>
              <span className="hidden md:inline">Building intelligent applications that bridge cutting-edge technology with human needs. Specialized in AI integration, system architecture, and scalable web solutions.</span>
            </MobileTypography>
          </div>
        </SmartAnimation>
        
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Personal Story */}
          <SmartAnimation animation="slideUp" delay={300}>
            <div className="space-y-6">
              <div className="prose prose-lg text-gray-600">
                <div className="mb-6">
                  <MobileTypography 
                    variant="h3" 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 font-bold"
                  >
                    <span className="hidden md:inline">Building with Intention: My Journey as a Developer, Thinker, and Creator in the AI Era</span>
                    <span className="md:hidden">My Journey as a Developer</span>
                  </MobileTypography>
                  <MobileTypography 
                    variant="body" 
                    className="font-semibold text-gray-700 mb-4"
                  >
                    I'm Isaac Mineo — a full-stack application developer with a backend foundation, a neuroscience background, and a deep curiosity for how intelligent systems can improve daily life. I build tools that think, but more importantly, tools that help people think better.
                  </MobileTypography>
                </div>

                <div className="space-y-4 text-gray-600">
                  <MobileTypography variant="body" className="leading-relaxed">
                    My journey into tech didn't begin with a CS degree. It began with a fascination for how humans learn, adapt, and interact — a curiosity I explored through neuroscience before teaching myself to code. That mindset still drives me: I don't just build for functionality; I build to understand systems, teach others through what I build, and create experiences that are intuitive, helpful, and human-centered.
                  </MobileTypography>

                  <MobileTypography variant="body" className="leading-relaxed">
                    Over time, I've taught myself to architect applications from scratch using technologies like Python, React, Flask, FastAPI, Firebase Auth, MongoDB, and Redis. I've integrated large language models like Claude and GPT-4 into production-ready apps, building intelligent assistants that track goals, process context, and adapt to user needs.
                  </MobileTypography>

                  <MobileTypography variant="body" className="leading-relaxed">
                    <span className="hidden md:inline">But what sets my work apart isn't just the stack — it's the intention behind every decision. I'm methodical in how I structure my codebase, thoughtful about scalability, and always focused on user experience. Whether syncing HealthKit data securely with JWT and Firebase, implementing AI-powered features that feel conversational, or designing vector-based search to personalize results, I bring a balance of engineering discipline and human insight to everything I build.</span>
                    <span className="md:hidden">I'm methodical in structuring codebases, thoughtful about scalability, and focused on user experience. I bring engineering discipline and human insight to everything I build.</span>
                  </MobileTypography>

                  <MobileTypography variant="body" className="leading-relaxed">
                    <span className="hidden md:inline">Right now, I'm deepening my knowledge of AI systems — from prompt engineering to vector databases — and working toward my AWS Solutions Architect certification. I'm especially drawn to problems that sit at the intersection of intelligence, usability, and education — the kinds of challenges where thoughtful system design can unlock real human value.</span>
                    <span className="md:hidden">Currently deepening my AI systems knowledge and working toward AWS Solutions Architect certification. I'm drawn to challenges where thoughtful system design unlocks real human value.</span>
                  </MobileTypography>

                  <MobileTypography variant="body" className="leading-relaxed">
                    Ultimately, I'm looking to join a team that values curiosity, creativity, and clarity — a place where I can contribute not just as a developer, but as a systems thinker and builder with purpose. If the work is meaningful and the bar is high, I'm all in.
                  </MobileTypography>
                </div>
              </div>

              {/* Personal Interests */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 md:p-6 border border-primary-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-3">🎧</span>
                  Outside of Code
                </h4>
                <MobileTypography variant="body" className="text-gray-700 leading-relaxed">
                  Outside of dev work, I'm into gaming, lifting, exploring music, and spontaneous adventures 
                  with friends. I've got a big appreciation for well-designed digital and physical spaces, 
                  clever storytelling, and any project that blends creativity with impact.
                </MobileTypography>
              </div>
            </div>
          </SmartAnimation>
          
          {/* Enhanced Skills Section */}
          <SmartAnimation animation="slideUp" delay={400}>
            <div className="space-y-6">
              <MobileTypography variant="h3" className="text-gray-900 mb-6 flex items-center">
                <span className="w-3 h-3 bg-primary-500 rounded-full mr-3 animate-pulse"></span>
                Tech Stack & Expertise
              </MobileTypography>
              
              <MobileSkillsGrid skills={skills} />
            </div>
          </SmartAnimation>
        </div>
        
        {/* Philosophy & Approach */}
        <SmartAnimation animation="fadeIn" delay={600}>
          <div className="mt-12 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-200">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-professional">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <MobileTypography variant="h5" className="text-gray-900 mb-2">
                  Move Fast
                </MobileTypography>
                <MobileTypography variant="body" className="text-gray-600">
                  I ship quickly without sacrificing quality, iterating based on real user feedback and data.
                </MobileTypography>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-neural-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-professional" style={{animationDelay: '0.2s'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <MobileTypography variant="h5" className="text-gray-900 mb-2">
                  Solve Hard Problems
                </MobileTypography>
                <MobileTypography variant="body" className="text-gray-600">
                  I thrive on complex challenges that require creative solutions and innovative thinking.
                </MobileTypography>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neural-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-professional" style={{animationDelay: '0.4s'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <MobileTypography variant="h5" className="text-gray-900 mb-2">
                  Build with Purpose
                </MobileTypography>
                <MobileTypography variant="body" className="text-gray-600">
                  Every feature I create is designed to genuinely help users and make a meaningful impact.
                </MobileTypography>
              </div>
            </div>
          </div>
        </SmartAnimation>
      </div>
    </MobileSectionContainer>
  );
}
