import React, { useState } from 'react';
import { apiClient } from '../services/apiClient';
import { MobileFormField, MobileFormButton, MobileFormContainer } from './MobileFormComponents';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    interest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const interests = [
    'Full-Stack Development',
    'AI Engineering', 
    'Backend Development',
    'HealthTech Projects',
    'Developer Tooling',
    'Collaboration',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await apiClient.sendContactEmail(formData);
      
      if (result.success) {
        // Create success message based on method used
        let successMessage = 'Thank you for your message! Isaac will get back to you soon.';
        
        if (result.fallback) {
          successMessage += ' (via backup system)';
        }
        
        // Add performance info in development
        if (import.meta.env.DEV && result.duration) {
          successMessage += ` [${result.duration}ms via ${result.method}]`;
        }
        
        setSubmitStatus({
          type: 'success',
          message: successMessage
        });
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          interest: ''
        });
      } else {
        let errorMessage = 'There was an issue sending your message. Please try again or email Isaac directly at isaacmineo@gmail.com.';
        
        // Add debug info in development
        if (import.meta.env.DEV && result.details) {
          errorMessage += ` [Debug: ${result.details.environment} environment, both ${result.details.primary} and ${result.details.fallback} failed]`;
        }
        
        setSubmitStatus({
          type: 'error',
          message: errorMessage
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'There was an issue sending your message. Please try again or email Isaac directly at isaacmineo@gmail.com.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-4 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-accent-400 to-primary-400 rounded-full filter blur-3xl animate-float-professional"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-neural-400 to-accent-400 rounded-full filter blur-3xl animate-float-professional" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 animate-fadeInUp">
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-2 gradient-text">Get In Touch</h2>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Ready to discuss opportunities, collaborate on projects, or just say hello? 
            I'd love to hear from you!
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Let's Connect</h3>
              <p className="text-gray-600 mb-2 leading-relaxed">
                I'm always open to discussing new opportunities, interesting projects, 
                or just chatting about technology and innovation. Whether you're looking 
                for a developer who can design, build, and ship full-stack features with 
                speed and purpose, or you want to collaborate on something exciting, 
                I'd love to hear from you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a href="mailto:isaacmineo@gmail.com" className="text-primary-600 hover:text-primary-700">
                    isaacmineo@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">GitHub</p>
                  <a href="https://github.com/GoldenRodger5" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    @GoldenRodger5
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">LinkedIn</p>
                                    <a href="https://www.linkedin.com/in/isaacmineo2001/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                    linkedin.com/in/isaacmineo2001
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-6">
              <h4 className="font-semibold text-primary-900 mb-2">Quick Response Promise</h4>
              <p className="text-primary-800 text-sm">
                I typically respond to messages within 24 hours. For urgent inquiries, 
                feel free to reach out directly via email or LinkedIn.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <MobileFormContainer onSubmit={handleSubmit}>
              <MobileFormField
                label="Name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                autoComplete="name"
                name="name"
              />

              <MobileFormField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                name="email"
              />

              <MobileFormField
                label="Type of Inquiry"
                type="select"
                value={formData.interest}
                onChange={handleChange}
                options={interests}
                placeholder="Select an option"
                name="interest"
              />

              <MobileFormField
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                required
                name="subject"
              />

              <MobileFormField
                label="Message"
                multiline
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me about your project, opportunity, or what you'd like to discuss..."
                required
                name="message"
              />

              {/* Status Message */}
              {submitStatus && (
                <div className={`p-4 rounded-xl ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <MobileFormButton
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                variant="primary"
                size="large"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </MobileFormButton>
            </MobileFormContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
