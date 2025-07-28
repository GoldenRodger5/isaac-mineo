import React from 'react';

const MobileSkeletonLoader = ({ type = "card", count = 1, className = "" }) => {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        <div className="h-3 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  const renderMessageSkeleton = () => (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] animate-pulse">
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
  );

  const skeletonTypes = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    message: renderMessageSkeleton,
    text: renderTextSkeleton
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {skeletonTypes[type]()}
        </div>
      ))}
    </div>
  );
};

const MobileLoadingSpinner = ({ size = "medium", text = "Loading...", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`${sizeClasses[size]} border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

const MobileProgressBar = ({ progress = 0, className = "", showPercentage = true }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

const MobilePullToRefresh = ({ onRefresh, isRefreshing = false, threshold = 80, children }) => {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isPulling, setIsPulling] = React.useState(false);
  const touchStartY = React.useRef(null);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) { // Only activate at top of page
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current !== null && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;
      
      if (diff > 0) {
        setPullDistance(Math.min(diff, threshold * 1.5));
        setIsPulling(true);
        if (diff > 10) {
          e.preventDefault(); // Prevent default scroll
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > threshold && !isRefreshing) {
      onRefresh();
    }
    
    setPullDistance(0);
    setIsPulling(false);
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center bg-blue-50 border-b border-blue-200 transition-all duration-200 z-10"
          style={{ 
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`
          }}
        >
          <div className="flex items-center space-x-2 text-blue-600">
            <div className={`w-5 h-5 border-2 border-blue-600 rounded-full ${
              isRefreshing || pullDistance > threshold 
                ? 'border-t-transparent animate-spin' 
                : ''
            }`}></div>
            <span className="text-sm font-medium">
              {isRefreshing 
                ? 'Refreshing...' 
                : pullDistance > threshold 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}
      
      <div style={{ transform: `translateY(${isPulling ? pullDistance : 0}px)` }}>
        {children}
      </div>
    </div>
  );
};

export { MobileSkeletonLoader, MobileLoadingSpinner, MobileProgressBar, MobilePullToRefresh };
