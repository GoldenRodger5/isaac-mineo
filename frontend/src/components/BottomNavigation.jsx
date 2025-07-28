import React from 'react';

const BottomNavigation = ({ tabs, activeTab, setActiveTab, className = "" }) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 safe-area-bottom z-50 md:hidden ${className}`}>
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className={`text-xs font-medium truncate max-w-full ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
