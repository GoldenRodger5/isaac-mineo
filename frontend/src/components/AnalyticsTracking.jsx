import React from 'react';
import analyticsService from '../services/analyticsService';

/**
 * Enhanced link component with analytics tracking
 */
const AnalyticsLink = ({ 
  href, 
  children, 
  className, 
  eventName, 
  eventData = {}, 
  target, 
  rel,
  ...props 
}) => {
  const handleClick = async (e) => {
    // Track the click event
    try {
      await analyticsService.trackCustomEvent(eventName, {
        url: href,
        ...eventData
      });
      console.log(`📊 Link tracked: ${eventName}`, { href, ...eventData });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
    
    // Don't prevent default behavior - let link work normally
  };

  return (
    <a
      href={href}
      className={className}
      target={target || '_blank'}
      rel={rel || 'noopener noreferrer'}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};

/**
 * Enhanced button component with analytics tracking
 */
const AnalyticsButton = ({ 
  children, 
  className, 
  eventName, 
  eventData = {}, 
  onClick,
  ...props 
}) => {
  const handleClick = async (e) => {
    // Track the click event
    try {
      await analyticsService.trackCustomEvent(eventName, eventData);
      console.log(`📊 Button tracked: ${eventName}`, eventData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
    
    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export { AnalyticsLink, AnalyticsButton };
