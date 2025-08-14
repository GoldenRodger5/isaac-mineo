import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Simple fallback components
const SimpleNavigation = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex justify-center space-x-4 p-4 bg-white shadow">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-4 py-2 rounded-lg ${
          activeTab === tab.id 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
);

const SimpleContent = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Isaac Mineo</h1>
            <p className="text-xl text-gray-600">Full-Stack Developer & AI Engineer</p>
          </div>
        );
      case 'projects':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Projects</h2>
            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">Nutrivize</h3>
                <p className="text-gray-600">AI-powered nutrition tracking app</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">SignalFlow</h3>
                <p className="text-gray-600">Trading signal analysis platform</p>
              </div>
            </div>
          </div>
        );
      case 'chat':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">AI Chat</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">Ask me about Isaac's tech stack, projects, or experience!</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask me anything..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Send
                </button>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Contact</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 mb-4">Get in touch with Isaac</p>
              <p className="text-blue-600">isaacmineo@gmail.com</p>
            </div>
          </div>
        );
      default:
        return <div className="p-8">Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  );
};

function SimpleApp() {
  const [activeTab, setActiveTab] = useState('about');
  
  const tabs = [
    { id: 'about', label: 'About', icon: '👋' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <SimpleContent activeTab={activeTab} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default SimpleApp;
