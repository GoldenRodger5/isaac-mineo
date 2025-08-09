import React, { useState, useEffect, useRef } from 'react';

/**
 * Enhanced Mobile Touch Button Component
 * Features: Haptic feedback, ripple animation, accessibility optimized
 */
const MobileTouchButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  hapticFeedback = true,
  ariaLabel,
  className = '',
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  const rippleId = useRef(0);

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = (type = 'light') => {
    if (!hapticFeedback || !navigator.vibrate) return;
    
    // iOS Haptic Feedback
    if (window.navigator.userAgent.includes('iPhone') && window.DeviceMotionEvent) {
      navigator.vibrate(type === 'light' ? 10 : type === 'medium' ? 20 : 50);
    }
    // Android Haptic Feedback
    else if (navigator.vibrate) {
      navigator.vibrate(type === 'light' ? 25 : type === 'medium' ? 50 : 100);
    }
  };

  // Ripple effect animation
  const createRipple = (event) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: rippleId.current++,
      x,
      y,
      size
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  // Enhanced touch handlers
  const handleTouchStart = (event) => {
    setIsPressed(true);
    createRipple(event.touches[0]);
    triggerHapticFeedback('light');
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleClick = (event) => {
    if (!disabled) {
      triggerHapticFeedback('medium');
      onClick?.(event);
    }
  };

  // Size variants optimized for touch
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px] min-w-[40px]', // Minimum touch target
    md: 'px-6 py-3 text-base min-h-[44px] min-w-[44px]', // Apple HIG standard
    lg: 'px-8 py-4 text-lg min-h-[48px] min-w-[48px]', // Material Design
    xl: 'px-10 py-5 text-xl min-h-[56px] min-w-[56px]' // Large touch target
  };

  // Enhanced variant styles with better contrast for mobile
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-2 border-gray-300 hover:border-gray-400',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent',
    ghost: 'text-purple-600 hover:bg-purple-100 hover:text-purple-700 bg-transparent',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg'
  };

  const baseClasses = `
    relative overflow-hidden
    font-medium rounded-xl
    transition-all duration-200 ease-out
    transform active:scale-95
    focus:outline-none focus:ring-4 focus:ring-purple-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    select-none touch-manipulation
    flex items-center justify-center
    ${isPressed ? 'scale-95 shadow-inner' : 'shadow-md hover:shadow-lg'}
  `;

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Ripple effect container */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              animationDuration: '600ms',
              animationIterationCount: 1,
              animationFillMode: 'forwards'
            }}
          />
        ))}
      </div>
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

/**
 * Mobile-Optimized Input Component
 * Features: Better touch handling, mobile keyboard optimization
 */
const MobileInput = ({ 
  label, 
  error, 
  type = 'text', 
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Mobile keyboard optimization
  const inputModeMap = {
    email: 'email',
    tel: 'tel',
    number: 'numeric',
    search: 'search',
    url: 'url'
  };

  // Auto-zoom prevention for iOS
  const preventZoom = type === 'email' || type === 'tel' || type === 'number';

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-700 mb-2 px-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          inputMode={inputModeMap[type]}
          autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}
          className={`
            w-full px-4 py-4 text-lg
            border-2 rounded-xl
            transition-all duration-200
            touch-manipulation
            ${isFocused 
              ? 'border-purple-500 ring-4 ring-purple-500/20 shadow-lg' 
              : error 
                ? 'border-red-400 ring-4 ring-red-400/20' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${error ? 'bg-red-50' : 'bg-white'}
            focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            placeholder-gray-400
            ${preventZoom ? 'text-base md:text-lg' : 'text-lg'}
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Focus indicator */}
        <div className={`
          absolute inset-0 rounded-xl pointer-events-none
          transition-opacity duration-200
          ${isFocused ? 'opacity-100' : 'opacity-0'}
          bg-gradient-to-r from-purple-500/10 to-blue-500/10
        `} />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 px-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Mobile-Optimized Card Component
 * Features: Touch-friendly interactions, better mobile spacing
 */
const MobileCard = ({ 
  children, 
  className = '', 
  interactive = false,
  onClick,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (interactive) setIsPressed(true);
  };

  const handleTouchEnd = () => {
    if (interactive) setIsPressed(false);
  };

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-md
        transition-all duration-200 ease-out
        ${interactive ? 'cursor-pointer hover:shadow-lg active:shadow-inner' : ''}
        ${isPressed ? 'scale-98 shadow-inner' : ''}
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={interactive ? () => setIsPressed(true) : undefined}
      onMouseUp={interactive ? () => setIsPressed(false) : undefined}
      onMouseLeave={interactive ? () => setIsPressed(false) : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Pull-to-Refresh Component
 * Features: Native-feeling pull to refresh functionality
 */
const PullToRefresh = ({ onRefresh, children, className = '' }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);
  
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, (currentY - startY) * 0.5);
      setPullDistance(Math.min(distance, MAX_PULL));
      
      // Prevent default scroll when pulling
      if (distance > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={`
          fixed top-0 left-0 right-0 z-50
          flex items-center justify-center
          bg-gradient-to-b from-purple-500 to-transparent
          transition-all duration-300 ease-out
          ${pullDistance > 0 ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ 
          height: Math.min(pullDistance, 60),
          transform: `translateY(-${Math.max(0, 60 - pullDistance)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-white">
          {isRefreshing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Refreshing...</span>
            </>
          ) : pullDistance >= PULL_THRESHOLD ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Release to refresh</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Pull to refresh</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export { MobileTouchButton, MobileInput, MobileCard, PullToRefresh };
