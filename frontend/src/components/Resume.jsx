import { useState } from 'react';

export default function Resume() {
  const [activeDocument, setActiveDocument] = useState('resume');

  const documents = {
    resume: {
      title: 'Professional Resume',
      filename: 'Mineo, Isaac, Resume.pdf',
      description: 'Complete overview of my professional experience, skills, and achievements'
    },
    transcript: {
      title: 'Academic Transcript',
      filename: 'Mineo, Isaac, Transcript.pdf',
      description: 'Official academic record showcasing my educational background'
    }
  };

  const currentDoc = documents[activeDocument];

  return (
    <section id="resume" className="py-20">
      <div className="animate-fadeInUp">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-text">Resume & Credentials</h2>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Document Selector */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                {Object.entries(documents).map(([key, doc]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDocument(key)}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      activeDocument === key
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
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
                  className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
            
            <p className="text-gray-600 mt-3">{currentDoc.description}</p>
          </div>

          {/* PDF Viewer */}
          <div className="relative">
            <div className="aspect-[8.5/11] bg-gray-100 flex items-center justify-center">
              <iframe
                src={`/${currentDoc.filename}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title={currentDoc.title}
                loading="lazy"
              />
            </div>
            
            {/* Fallback for browsers that don't support PDF viewing */}
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-center p-8 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">Click to view document in full screen</p>
              <a
                href={`/${currentDoc.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Open PDF
              </a>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Highlights</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full-stack developer specializing in AI integration
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Proven track record in building scalable applications
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Expertise in modern web technologies and AI APIs
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Focus on performance, clean code, and user experience
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What I'm Looking For</h3>
            <p className="text-gray-600 mb-4">
              I'm open to backend, AI engineering, or full-stack roles where I can build meaningful tools 
              alongside smart, creative teams.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Backend Development', 'AI Engineering', 'Full-Stack', 'HealthTech', 'Developer Tools'].map((interest) => (
                <span 
                  key={interest}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
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