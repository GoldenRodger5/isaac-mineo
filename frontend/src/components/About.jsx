import React from 'react';

export default function About() {
  const skills = [
    { 
      category: "Frontend", 
      items: ["React (Vite, Next.js)", "Tailwind CSS", "JavaScript/TypeScript", "PWA", "Mobile-first Design"] 
    },
    { 
      category: "Backend", 
      items: ["Python (FastAPI, Flask)", "Node.js (Express)", "MongoDB (Atlas)", "Redis", "RESTful APIs"] 
    },
    { 
      category: "AI + Tooling", 
      items: ["OpenAI API (GPT-4)", "Claude Sonnet 3.5", "Pinecone", "Prompt Engineering", "LangChain"] 
    },
    { 
      category: "Auth & Security", 
      items: ["Firebase Auth", "JWT", "Session Handling", "API Security", "CORS"] 
    },
    { 
      category: "DevOps", 
      items: ["Vercel", "Render", "GitHub CI/CD", "Cloudflare", "Environment Management"] 
    }
  ];

  return (
    <section id="about" className="py-20">
      <div className="animate-fadeInUp">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-text">About Me</h2>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Personal Story */}
          <div className="space-y-6">
            <div className="prose prose-lg text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                Hey, I'm Isaac Mineo. I'm a full-stack developer who thrives on building useful, intelligent, 
                and scalable web applications. I care deeply about clean code, performance, and crafting 
                digital tools that make real-world impact.
              </p>
              
              <p className="leading-relaxed mb-6">
                My focus is on backend architecture and AI integration, but I also love delivering polished 
                frontend experiences that feel responsive and intentional across every device. I've led and 
                built projects end-to-end, managing everything from data modeling to UI design.
              </p>
              
              <p className="leading-relaxed mb-6">
                I move fast, solve hard problems, and love building things from scratch. Whether I'm designing 
                an API, setting up a full authentication system, or deploying a PWA to production, I approach 
                every part of the stack with the same energy and attention to detail.
              </p>
              
              <p className="leading-relaxed">
                I enjoy working on ambitious ideas with people who care about what they're making. I'm always 
                looking for ways to combine smart backend logic with AI, automation, or data to create something 
                that feels genuinely helpful to users.
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
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">🛠️ Tech Stack</h3>
            
            <div className="grid gap-6">
              {skills.map((skillGroup, index) => (
                <div 
                  key={skillGroup.category} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <h4 className="font-semibold text-primary-600 mb-3 text-sm uppercase tracking-wider">
                    {skillGroup.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <span 
                        key={skill}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Philosophy & Approach */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Move Fast</h4>
              <p className="text-gray-600">
                I ship quickly without sacrificing quality, iterating based on real user feedback and data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Solve Hard Problems</h4>
              <p className="text-gray-600">
                I thrive on complex challenges that require creative solutions and innovative thinking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
