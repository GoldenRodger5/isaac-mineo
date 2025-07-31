import React from 'react';

const BottomNavigation = ({ tabs, activeTab, setActiveTab, className = "" }) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 glass-heavy border-t border-gray-200/30 safe-area-bottom z-50 md:hidden ${className}`}>
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-0 flex-1 animate-magnetic ${
              activeTab === tab.id
                ? 'text-primary-700 bg-primary-100 scale-105 shadow-md border border-primary-300'
                : 'text-gray-600 hover:text-primary-700 hover:bg-gray-100'
            }`}
          >
            <span className={`text-xl mb-1 ${activeTab === tab.id ? 'animate-neural-pulse' : ''}`}>{tab.icon}</span>
            {/* Show label for active tab */}
            {activeTab === tab.id && (
              <span className="text-xs font-semibold truncate max-w-full text-primary-800">
                {tab.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
