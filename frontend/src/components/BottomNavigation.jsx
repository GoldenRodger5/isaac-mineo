import React from 'react';

const BottomNavigation = ({ tabs, activeTab, setActiveTab, className = "" }) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 md:hidden ${className}`}>
      <div className="flex justify-around items-center py-3 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors duration-200 min-w-0 flex-1 ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
