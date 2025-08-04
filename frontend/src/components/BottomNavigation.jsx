import React from 'react';

const BottomNavigation = ({ tabs, activeTab, setActiveTab, className = "" }) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 safe-area-bottom z-50 md:hidden shadow-lg ${className}`}>
      <div className="flex justify-around items-center py-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 min-w-0 flex-1 relative group active:scale-95 ${
              activeTab === tab.id
                ? 'text-primary-600 bg-gradient-to-t from-primary-50 to-primary-100 shadow-md scale-105'
                : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            {/* Active indicator dot */}
            {activeTab === tab.id && (
              <div className="absolute -top-1 w-2 h-2 bg-primary-600 rounded-full shadow-sm animate-pulse"></div>
            )}
            
            <span className={`text-2xl transition-transform duration-300 ${
              activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
            }`}>
              {tab.icon}
            </span>
            
            {/* Tab label for better UX */}
            <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
              activeTab === tab.id 
                ? 'opacity-100 text-primary-700' 
                : 'opacity-60 group-hover:opacity-80'
            }`}>
              {tab.label || tab.id}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
