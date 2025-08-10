import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Advanced Mobile Navigation with Gesture Support
 * Features: Swipe navigation, haptic feedback, smooth animations
 */
const AdvancedMobileNavigation = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback((intensity = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 25,
        strong: 50
      };
      navigator.vibrate(patterns[intensity] || patterns.light);
    }
  }, []);

  // Update indicator position
  useEffect(() => {
    if (indicatorRef.current && navRef.current) {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      const tabWidth = navRef.current.offsetWidth / tabs.length;
      const offset = activeIndex * tabWidth + dragOffset;
      
      indicatorRef.current.style.transform = `translateX(${offset}px)`;
    }
  }, [activeTab, tabs, dragOffset]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    const maxOffset = navRef.current.offsetWidth / tabs.length;
    
    // Constrain drag offset
    setDragOffset(Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.3)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(dragOffset) > threshold) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      let newIndex = currentIndex;
      
      if (dragOffset > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
        triggerHapticFeedback('medium');
      } else if (dragOffset < 0 && currentIndex < tabs.length - 1) {
        newIndex = currentIndex + 1;
        triggerHapticFeedback('medium');
      }
      
      if (newIndex !== currentIndex) {
        onTabChange(tabs[newIndex].id);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTabClick = (tabId) => {
    triggerHapticFeedback('light');
    onTabChange(tabId);
  };

  return (
    <nav 
      ref={navRef}
      className={`mobile-navigation relative bg-white border-t border-gray-200 shadow-lg ${className}`}
      data-mobile-nav="true"
      data-swipeable="true"
      role="navigation"
      aria-label="Mobile Navigation"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Active tab indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-transform duration-300 ease-out"
        style={{ 
          width: `${100 / tabs.length}%`,
          transform: isDragging ? 'none' : undefined
        }}
      />
      
      {/* Navigation tabs */}
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex flex-col items-center justify-center
                min-h-[60px] min-w-[60px] px-3 py-2
                rounded-xl transition-all duration-200
                touch-manipulation select-none
                ${isActive 
                  ? 'text-purple-600 bg-purple-50 scale-110' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
                }
              `}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon */}
              <div className={`text-2xl mb-1 transition-transform duration-200 ${
                isActive ? 'scale-110' : ''
              }`}>
                {tab.icon}
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'opacity-100 scale-105' : 'opacity-70'
              }`}>
                {tab.label}
              </span>
              
              {/* Badge/Notification dot */}
              {tab.badge && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {typeof tab.badge === 'number' ? tab.badge : ''}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * Mobile-Optimized Header Component
 * Features: Collapsible design, search integration, action buttons
 */
const MobileHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions = [],
  searchable = false,
  onSearch,
  className = ''
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef(null);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus search when activated
  useEffect(() => {
    if (isSearching && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearching]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchQuery('');
      onSearch?.('');
    }
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-40
        transition-all duration-300 ease-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
        }
        safe-area-pt-4
        ${className}
      `}
    >
      <div className="px-4 py-3">
        {isSearching ? (
          // Search Mode
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSearch}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 touch-manipulation"
              aria-label="Close search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-xl border-0 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        ) : (
          // Normal Mode
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 text-gray-700 hover:text-gray-900 touch-manipulation"
                  aria-label="Go back"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 truncate max-w-[200px]">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {searchable && (
                <button
                  onClick={toggleSearch}
                  className="p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl touch-manipulation"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl touch-manipulation"
                  aria-label={action.label}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Mobile-Optimized Modal Component
 * Features: Slide-up animation, backdrop blur, gesture dismiss
 */
const MobileModal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  slideFrom = 'bottom',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle drag to dismiss
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(0);
  };

  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) { // Only allow downward drag
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) { // Threshold for dismiss
      onClose();
    }
    setCurrentY(0);
  };

  if (!isOpen) return null;

  const slideClasses = {
    bottom: 'translate-y-full',
    top: '-translate-y-full',
    left: '-translate-x-full',
    right: 'translate-x-full'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full max-w-md mx-4 mb-4
          bg-white rounded-t-3xl shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : slideClasses[slideFrom]}
          ${className}
        `}
        style={{
          transform: `translateY(${Math.max(0, currentY * 0.3)}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag indicator */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pb-4">
            {title && (
              <h2 className="text-xl font-bold text-gray-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 touch-manipulation"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export { AdvancedMobileNavigation, MobileHeader, MobileModal };
