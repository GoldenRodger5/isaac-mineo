import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = '', 
  className = '',
  overlay = false,
  progress = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500',
    white: 'border-white'
  };

  const textColorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    white: 'text-white'
  };

  const SpinnerElement = () => (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`w-full h-full border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );

  const DotsSpinner = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 bg-${color}-500 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );

  const PulseSpinner = () => (
    <div className={`${sizeClasses[size]} bg-${color}-500 rounded-full animate-pulse opacity-75`}></div>
  );

  const RippleSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 border-2 ${colorClasses[color]} rounded-full animate-ping opacity-75`}></div>
      <div className={`absolute inset-2 border-2 ${colorClasses[color]} rounded-full animate-ping opacity-50`} style={{ animationDelay: '0.2s' }}></div>
    </div>
  );

  const ProgressSpinner = () => (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Background circle */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-gray-700"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        {progress !== null && (
          <path
            className={textColorClasses[color]}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${progress}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        )}
      </svg>
      {progress !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-medium ${textColorClasses[color]}`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );

  const getSpinnerType = () => {
    if (progress !== null) return <ProgressSpinner />;
    if (size === 'sm') return <DotsSpinner />;
    if (text && size === 'lg') return <RippleSpinner />;
    return <SpinnerElement />;
  };

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      {getSpinnerType()}
      {text && (
        <div className={`text-center ${textColorClasses[color]}`}>
          <p className="text-sm font-medium">{text}</p>
          {progress !== null && (
            <p className="text-xs opacity-75 mt-1">
              {progress < 30 ? 'Getting started...' : 
               progress < 60 ? 'Processing...' : 
               progress < 90 ? 'Almost done...' : 
               'Finishing up...'}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 border border-white/20 rounded-xl p-8">
          <LoadingContent />
        </div>
      </div>
    );
  }

  return <LoadingContent />;
};

// Specialized loading components for common use cases
export const RepoLoadingSpinner = ({ count = 0 }) => (
  <LoadingSpinner 
    size="lg" 
    color="blue" 
    text={count > 0 ? `Loading ${count} repositories...` : "Loading repositories..."} 
  />
);

export const FileLoadingSpinner = ({ fileName = '' }) => (
  <LoadingSpinner 
    size="md" 
    color="green" 
    text={fileName ? `Loading ${fileName}...` : "Loading files..."} 
  />
);

export const AILoadingSpinner = ({ mode = 'explain' }) => {
  const modeTexts = {
    explain: 'Claude AI is analyzing your code...',
    summarize: 'Claude AI is summarizing the code...',
    teach: 'Claude AI is preparing a tutorial...'
  };
  
  return (
    <LoadingSpinner 
      size="lg" 
      color="purple" 
      text={modeTexts[mode] || 'Claude AI is processing...'} 
    />
  );
};

export const GitHubLoadingSpinner = ({ operation = 'fetching' }) => (
  <LoadingSpinner 
    size="md" 
    color="white" 
    text={`GitHub ${operation}...`} 
  />
);

export const SearchLoadingSpinner = () => (
  <div className="flex items-center space-x-2 text-gray-400">
    <LoadingSpinner size="sm" color="blue" />
    <span className="text-sm">Searching...</span>
  </div>
);

// Skeleton loading components
export const RepositorySkeleton = () => (
  <div className="bg-white/5 rounded-lg p-4 border border-white/10 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
        <div>
          <div className="w-32 h-4 bg-white/10 rounded mb-2"></div>
          <div className="w-20 h-3 bg-white/10 rounded"></div>
        </div>
      </div>
      <div className="w-16 h-6 bg-white/10 rounded"></div>
    </div>
    <div className="w-full h-3 bg-white/10 rounded mb-2"></div>
    <div className="w-3/4 h-3 bg-white/10 rounded mb-4"></div>
    <div className="flex space-x-4">
      <div className="w-16 h-4 bg-white/10 rounded"></div>
      <div className="w-20 h-4 bg-white/10 rounded"></div>
      <div className="w-12 h-4 bg-white/10 rounded"></div>
    </div>
  </div>
);

export const FileTreeSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-2" style={{ paddingLeft: `${(i % 3) * 16}px` }}>
        <div className="w-4 h-4 bg-white/10 rounded"></div>
        <div className={`h-3 bg-white/10 rounded`} style={{ width: `${120 + (i % 4) * 30}px` }}></div>
      </div>
    ))}
  </div>
);

export const CodeSkeleton = () => (
  <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm animate-pulse">
    {[...Array(15)].map((_, i) => (
      <div key={i} className="flex mb-1">
        <div className="w-8 h-4 bg-white/10 rounded mr-4"></div>
        <div 
          className="h-4 bg-white/10 rounded" 
          style={{ width: `${Math.random() * 300 + 100}px` }}
        ></div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner;
