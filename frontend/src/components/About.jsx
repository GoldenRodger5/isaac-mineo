import React from 'react';

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
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary-300 to-accent-300 rounded-full filter blur-3xl animate-float-professional"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-neural-300 to-primary-300 rounded-full filter blur-3xl animate-float-professional" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 animate-fadeInUp">
        <h2 className="text-5xl md:text-6xl font-display font-bold text-center mb-16 gradient-text">About Me</h2>
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Personal Story */}
          <div className="space-y-6">
            <div className="prose prose-lg text-gray-600">
              <div className="mb-8">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Building with Intention: My Journey as a Developer, Thinker, and Creator in the AI Era
                </h3>
                <p className="text-xl font-semibold text-gray-700 mb-6">
                  I’m Isaac Mineo — a full-stack application developer with a backend foundation, a neuroscience background, and a deep curiosity for how intelligent systems can improve daily life. I build tools that think, but more importantly, tools that help people think better.
                </p>
              </div>

              <p className="text-xl leading-relaxed mb-6">
                My journey into tech didn’t begin with a CS degree. It began with a fascination for how humans learn, adapt, and interact — a curiosity I explored through neuroscience before teaching myself to code. That mindset still drives me: I don’t just build for functionality; I build to understand systems, teach others through what I build, and create experiences that are intuitive, helpful, and human-centered.
              </p>

              <p className="leading-relaxed mb-6">
                Over time, I’ve taught myself to architect applications from scratch using technologies like Python, React, Flask, FastAPI, Firebase Auth, MongoDB, and Redis. I’ve integrated large language models like Claude and GPT-4 into production-ready apps, building intelligent assistants that track goals, process context, and adapt to user needs. One of my proudest projects, Nutrivize, began as a personal nutrition tracker and grew into a full-stack health companion — offering AI-driven food logging, macro analysis, and personalized insights through real-time data and conversation memory.
              </p>

              <p className="leading-relaxed mb-6">
                But what sets my work apart isn’t just the stack — it’s the intention behind every decision. I’m methodical in how I structure my codebase, thoughtful about scalability, and always focused on user experience. Whether syncing HealthKit data securely with JWT and Firebase, implementing AI-powered features that feel conversational, or designing vector-based search to personalize results, I bring a balance of engineering discipline and human insight to everything I build.
              </p>

              <p className="leading-relaxed mb-6">
                I’ve developed entire systems independently, from backend APIs to mobile-first UI to AI-powered assistants — but I also know when to slow down, document decisions, and ask “why” before “how.” I learn fast by doing, and I enjoy breaking complex concepts into pieces others can learn from too.
              </p>

              <p className="leading-relaxed mb-6">
                Right now, I’m deepening my knowledge of AI systems — from prompt engineering to vector databases — and working toward my AWS Solutions Architect certification. I’m especially drawn to problems that sit at the intersection of intelligence, usability, and education — the kinds of challenges where thoughtful system design can unlock real human value.
              </p>

              <p className="leading-relaxed">
                Ultimately, I’m looking to join a team that values curiosity, creativity, and clarity — a place where I can contribute not just as a developer, but as a systems thinker and builder with purpose. If the work is meaningful and the bar is high, I’m all in.
              </p>
            </div>

            {/* Personal Interests */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100">
              <h4 className="font-semibold text-gray-900 mb-3">🎧 Outside of Code</h4>
              <p className="text-gray-700 leading-relaxed">
                Outside of dev work, I'm into gaming, lifting, exploring music, and spontaneous adventures 
                with friends. I've got a big appreciation for well-designed digital and physical spaces, 
                clever storytelling, and any project that blends creativity with impact.
              </p>
            </div>
          </div>
          
          {/* Skills Grid */}
          <div className="space-y-8">
            <h3 className="text-3xl font-display font-semibold text-gray-900 mb-8 flex items-center">
              <span className="w-3 h-3 bg-primary-500 rounded-full mr-3 animate-pulse"></span>
              Tech Stack & Expertise
            </h3>
            
            <div className="grid gap-6">
              {skills.map((skillGroup, index) => (
                <div 
                  key={skillGroup.category} 
                  className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 animate-magnetic overflow-hidden relative"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${skillGroup.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">{skillGroup.icon}</span>
                      <h4 className="font-display font-semibold text-gray-900 text-lg">
                        {skillGroup.category}
                      </h4>
                      <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill) => (
                        <span 
                          key={skill}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-700 transition-all duration-300 cursor-default group-hover:shadow-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Philosophy & Approach */}
        <div className="mt-16 glass-heavy rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-professional">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Move Fast</h4>
              <p className="text-gray-300">
                I ship quickly without sacrificing quality, iterating based on real user feedback and data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-neural-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-professional" style={{animationDelay: '0.2s'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Solve Hard Problems</h4>
              <p className="text-gray-300">
                I thrive on complex challenges that require creative solutions and innovative thinking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neural-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float-professional" style={{animationDelay: '0.4s'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Build with Purpose</h4>
              <p className="text-gray-600">
                Every feature I create is designed to genuinely help users and make a meaningful impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
