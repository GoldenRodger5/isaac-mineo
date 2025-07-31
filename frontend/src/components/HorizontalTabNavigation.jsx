import React, { useRef, useEffect } from 'react';

const HorizontalTabNavigation = ({ tabs, activeTab, setActiveTab, className = "" }) => {
  const scrollContainerRef = useRef(null);

  // Scroll active tab into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  return (
    <nav className={`glass-heavy border-y border-white/20 shadow-lg md:block hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={scrollContainerRef}
          className="flex justify-center overflow-x-auto scrollbar-hide py-2 space-x-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-500 whitespace-nowrap flex-shrink-0 animate-magnetic ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-xl transform scale-105'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50 border border-gray-300 hover:border-primary-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-semibold">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default HorizontalTabNavigation;
