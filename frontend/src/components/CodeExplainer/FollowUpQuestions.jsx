import React, { useState } from 'react';

const FollowUpQuestions = ({ questions, onQuestionClick, isLoading }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    onQuestionClick(question);
  };

  return (
    <div className="follow-up-questions mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Follow-up Questions
      </h4>
      
      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(question)}
            disabled={isLoading}
            className={`w-full text-left p-3 rounded-md text-sm transition-all duration-200 ${
              isLoading && selectedQuestion === question
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600'
            } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400 font-medium">Q:</span>
              <span className="flex-1">{question}</span>
              {isLoading && selectedQuestion === question && (
                <div className="ml-2 flex-shrink-0">
                  <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Click any question to get a detailed explanation
      </div>
    </div>
  );
};

export default FollowUpQuestions;
