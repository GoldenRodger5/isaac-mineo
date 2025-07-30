import React, { useState, useEffect } from 'react';

export default function Resume() {
  const [activeDocument, setActiveDocument] = useState('resume');
  const [iframeError, setIframeError] = useState(false);

  const documents = {
    resume: {
      id: 'resume',
      title: 'Resume',
      filename: 'Isaac_Mineo_Resume.pdf',
      description: 'Comprehensive overview of experience, skills, and achievements'
    },
    transcript: {
      id: 'transcript',
      title: 'Academic Transcript',
      filename: 'Isaac_Mineo_Transcript.pdf',
      description: 'Official academic record from Middlebury College'
    }
  };

  const currentDoc = documents[activeDocument];

  // Reset iframe error when document changes
  useEffect(() => {
    setIframeError(false);
  }, [activeDocument]);

  return (
    <section id="resume" className="py-20">
      <div className="animate-fadeInUp">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary-600 via-accent-600 to-neural-600 bg-clip-text text-transparent">
          Resume & Credentials
        </h2>
        
        <div className="glass-heavy rounded-3xl overflow-hidden border border-white/20">
          {/* Document Selector */}
          <div className="glass-light border-b border-white/10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex space-x-1 bg-white/20 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                {Object.entries(documents).map(([key, doc]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDocument(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 animate-magnetic ${
                      activeDocument === key
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-white/30'
                    }`}
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={`/${currentDoc.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-300 font-medium shadow-lg animate-magnetic"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Full Screen
                </a>
                <a
                  href={`/${currentDoc.filename}`}
                  download
                  className="flex items-center px-4 py-2 border border-primary-500/50 text-primary-600 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-primary-50/50 transition-all duration-300 font-medium animate-magnetic"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
            
            <p className="text-gray-300 mt-3 font-medium">{currentDoc.description}</p>
          </div>

          {/* PDF Viewer */}
          <div className="relative">
            <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-900/20 to-gray-800/30 flex items-center justify-center">
              {!iframeError ? (
                <iframe
                  src={`/${currentDoc.filename}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-0 rounded-lg"
                  title={currentDoc.title}
                  loading="lazy"
                  onError={() => setIframeError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl mb-4">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{currentDoc.title}</h3>
                  <p className="text-gray-300 mb-6">PDF preview not available. Click below to view or download.</p>
                  
                  <div className="flex space-x-3">
                    <a
                      href={`/${currentDoc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-300 font-medium shadow-lg animate-magnetic"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View PDF
                    </a>
                    <a
                      href={`/${currentDoc.filename}`}
                      download
                      className="flex items-center px-6 py-3 border border-primary-500/50 text-primary-300 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-primary-50/20 transition-all duration-300 font-medium animate-magnetic"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overlay with direct links - always visible */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <a
                href={`/${currentDoc.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-light shadow-xl rounded-xl p-2 hover:bg-white/30 transition-all duration-300 animate-magnetic"
                title="Open in new tab"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href={`/${currentDoc.filename}`}
                download
                className="glass-light shadow-xl rounded-xl p-2 hover:bg-white/30 transition-all duration-300 animate-magnetic"
                title="Download PDF"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="glass-heavy rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Professional Highlights</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start animate-float-professional">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Full-stack developer specializing in AI integration
              </li>
              <li className="flex items-start animate-float-professional" style={{ animationDelay: '0.1s' }}>
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Proven track record in building scalable applications
              </li>
              <li className="flex items-start animate-float-professional" style={{ animationDelay: '0.2s' }}>
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Expertise in modern web technologies and AI APIs
              </li>
              <li className="flex items-start animate-float-professional" style={{ animationDelay: '0.3s' }}>
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Focus on performance, clean code, and user experience
              </li>
            </ul>
          </div>
          
          <div className="glass-heavy rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 bg-gradient-to-r from-accent-400 to-neural-400 bg-clip-text text-transparent">What I'm Looking For</h3>
            <p className="text-gray-300 mb-4">
              I'm open to backend, AI engineering, or full-stack roles where I can build meaningful tools 
              alongside smart, creative teams.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Backend Development', 'AI Engineering', 'Full-Stack', 'HealthTech', 'Developer Tools'].map((interest, index) => (
                <span 
                  key={interest}
                  className="px-3 py-1 bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-300 border border-primary-500/30 rounded-full text-sm font-medium backdrop-blur-sm animate-float-professional"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}