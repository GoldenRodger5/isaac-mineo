import React from 'react';
import useSwipeGestures from '../hooks/useSwipeGestures';

const SwipeableTabContainer = ({ children, tabs, activeTab, setActiveTab, className = "" }) => {
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

  const handleSwipeLeft = () => {
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex].id);
  };

  const handleSwipeRight = () => {
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[prevIndex].id);
  };

  const swipeHandlers = useSwipeGestures(handleSwipeLeft, handleSwipeRight);

  return (
    <div 
      className={`relative ${className}`}
      {...swipeHandlers}
    >
      {/* Swipe Indicator */}
      <div className="md:hidden absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-1">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-blue-500 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {children}
      
      {/* Swipe Instructions */}
      <div className="md:hidden text-center py-2">
        <p className="text-xs text-gray-500">
          Swipe left or right to navigate between sections
        </p>
      </div>
    </div>
  );
};

export default SwipeableTabContainer;
