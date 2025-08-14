import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function TestApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Isaac Mineo - Portfolio Test
        </h1>
        <p className="text-gray-600 mb-6">
          This is a test version to isolate any JavaScript issues.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Frontend</h3>
            <p className="text-blue-700">React + Vite + Tailwind</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Backend</h3>
            <p className="text-green-700">FastAPI + Python</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900">AI/ML</h3>
            <p className="text-purple-700">OpenAI + Pinecone</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900">Database</h3>
            <p className="text-orange-700">MongoDB + Redis</p>
          </div>
        </div>
        <button 
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => alert('Test button working!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
