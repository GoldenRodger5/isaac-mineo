// Enhanced Mobile Layout Components
// Optimized for touch interactions, accessibility, and mobile performance

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMobilePerformance, SmartAnimation } from './MobilePerformance';
import { MobileTouchButton, MobileCard } from './MobileTouchComponents';

/**
 * Mobile-First Section Container
 * Optimized spacing and typography for mobile devices
 */
export const MobileSectionContainer = ({ 
  children, 
  className = '', 
  background = 'default',
  padding = 'default' 
}) => {
  const backgroundClasses = {
    default: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    dark: 'bg-gray-900 text-white'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-6',
    default: 'px-4 py-8 md:px-6 md:py-12',
    lg: 'px-4 py-12 md:px-8 md:py-16'
  };

  return (
    <section className={`
      ${backgroundClasses[background]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </section>
  );
};

/**
 * Mobile-Optimized Typography Component
 * Better reading experience on small screens
 */
export const MobileTypography = ({ 
  variant = 'body',
  children,
  className = '',
  responsive = true,
  ...props 
}) => {
  const variants = {
    h1: 'text-3xl md:text-4xl lg:text-6xl font-bold leading-tight',
    h2: 'text-2xl md:text-3xl lg:text-5xl font-bold leading-tight',
    h3: 'text-xl md:text-2xl lg:text-4xl font-semibold leading-tight',
    h4: 'text-lg md:text-xl lg:text-3xl font-semibold leading-tight',
    h5: 'text-base md:text-lg lg:text-2xl font-semibold leading-tight',
    h6: 'text-sm md:text-base lg:text-xl font-semibold leading-tight',
    body: 'text-base md:text-lg leading-relaxed',
    small: 'text-sm md:text-base leading-relaxed',
    caption: 'text-xs md:text-sm leading-relaxed'
  };

  const Component = variant.startsWith('h') ? variant : 'p';

  return (
    <Component 
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Mobile-Optimized Skills Grid
 * Enhanced touch interaction and visual hierarchy
 */
export const MobileSkillsGrid = ({ skills }) => {
  const [expandedSkill, setExpandedSkill] = useState(null);
  const { optimalSettings } = useMobilePerformance();

  const handleSkillToggle = (skillId) => {
    setExpandedSkill(expandedSkill === skillId ? null : skillId);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <SmartAnimation
          key={skill.category}
          animation="slideUp"
          delay={index * 100}
          className="w-full"
        >
          <MobileCard
            interactive
            onClick={() => handleSkillToggle(skill.category)}
            className="p-4 md:p-6 hover:shadow-lg transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{skill.icon}</span>
                <MobileTypography variant="h5" className="text-gray-900">
                  {skill.category}
                </MobileTypography>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Skill count badge */}
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {skill.items.length}
                </span>
                
                {/* Expand/collapse icon */}
                <div className={`
                  transform transition-transform duration-200
                  ${expandedSkill === skill.category ? 'rotate-180' : ''}
                `}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Skills list */}
            <div className={`
              transition-all duration-300 overflow-hidden
              ${expandedSkill === skill.category ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                {skill.items.map((item, itemIndex) => (
                  <SmartAnimation
                    key={item}
                    animation="fadeIn"
                    delay={itemIndex * 50}
                    className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
                  >
                    {item}
                  </SmartAnimation>
                ))}
              </div>
            </div>

            {/* Collapsed preview */}
            {expandedSkill !== skill.category && (
              <div className="flex flex-wrap gap-1 mt-3">
                {skill.items.slice(0, 3).map((item, itemIndex) => (
                  <span 
                    key={item}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
                {skill.items.length > 3 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                    +{skill.items.length - 3} more
                  </span>
                )}
              </div>
            )}
          </MobileCard>
        </SmartAnimation>
      ))}
    </div>
  );
};

/**
 * Mobile-Optimized Hero Section
 * Better visual hierarchy and touch-friendly CTAs
 */
export const MobileHero = ({ 
  title, 
  subtitle, 
  description, 
  primaryAction, 
  secondaryAction,
  backgroundImage 
}) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        </div>
      )}

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full animate-float blur-xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full animate-float blur-xl" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <SmartAnimation animation="fadeIn" delay={200}>
          <MobileTypography 
            variant="h1" 
            className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold"
          >
            {title}
          </MobileTypography>
        </SmartAnimation>

        <SmartAnimation animation="slideUp" delay={400}>
          <MobileTypography 
            variant="h4" 
            className="mb-6 text-gray-600 font-medium"
          >
            {subtitle}
          </MobileTypography>
        </SmartAnimation>

        <SmartAnimation animation="slideUp" delay={600}>
          <MobileTypography 
            variant="body" 
            className="mb-8 text-gray-600 max-w-2xl mx-auto"
          >
            {description}
          </MobileTypography>
        </SmartAnimation>

        {/* Action buttons */}
        <SmartAnimation animation="scale" delay={800}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {primaryAction && (
              <MobileTouchButton
                variant="primary"
                size="lg"
                onClick={primaryAction.onClick}
                className="w-full sm:w-auto"
                ariaLabel={primaryAction.label}
              >
                {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                {primaryAction.label}
              </MobileTouchButton>
            )}
            
            {secondaryAction && (
              <MobileTouchButton
                variant="outline"
                size="lg"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto"
                ariaLabel={secondaryAction.label}
              >
                {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
                {secondaryAction.label}
              </MobileTouchButton>
            )}
          </div>
        </SmartAnimation>
      </div>
    </div>
  );
};

/**
 * Mobile-Optimized Contact Form
 * Enhanced for mobile input and validation
 */
export const MobileContactForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'message':
        return value.length < 10 ? 'Message must be at least 10 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData);
    }
  };

  return (
    <MobileCard className="p-6 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`
              w-full px-4 py-4 text-lg border-2 rounded-xl
              transition-all duration-200 touch-manipulation
              ${errors.name 
                ? 'border-red-400 ring-4 ring-red-400/20 bg-red-50' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              }
              focus:outline-none
            `}
            placeholder="Your full name"
            autoComplete="name"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            inputMode="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`
              w-full px-4 py-4 text-lg border-2 rounded-xl
              transition-all duration-200 touch-manipulation
              ${errors.email 
                ? 'border-red-400 ring-4 ring-red-400/20 bg-red-50' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              }
              focus:outline-none
            `}
            placeholder="your.email@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Message Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            className={`
              w-full px-4 py-4 text-lg border-2 rounded-xl
              transition-all duration-200 touch-manipulation resize-none
              ${errors.message 
                ? 'border-red-400 ring-4 ring-red-400/20 bg-red-50' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              }
              focus:outline-none
            `}
            placeholder="Tell me about your project or just say hello!"
            autoComplete="off"
          />
          {errors.message && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <MobileTouchButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="w-full"
          ariaLabel="Send message"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Sending...
            </div>
          ) : (
            'Send Message'
          )}
        </MobileTouchButton>
      </form>
    </MobileCard>
  );
};

/**
 * Mobile-Optimized Image Gallery
 * Touch gestures, lazy loading, optimized performance
 */
export const MobileImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const galleryRef = useRef(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main image container */}
      <div 
        ref={galleryRef}
        className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]?.src}
          alt={images[currentIndex]?.alt}
          className={`
            w-full h-full object-cover transition-transform duration-300
            ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}
          `}
          onClick={() => setIsZoomed(!isZoomed)}
          loading="lazy"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-30 touch-manipulation"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentIndex(Math.min(images.length - 1, currentIndex + 1))}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-30 touch-manipulation"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${index === currentIndex ? 'border-blue-500' : 'border-gray-200'}
              `}
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default {
  MobileSectionContainer,
  MobileTypography,
  MobileSkillsGrid,
  MobileHero,
  MobileContactForm,
  MobileImageGallery
};
