import { useState, useRef, useEffect } from 'react';

const useSwipeGestures = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = touchStartX.current - currentX;
    const diffY = touchStartY.current - currentY;

    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      setIsSwiping(true);
      e.preventDefault(); // Prevent scrolling during swipe
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Check if it's a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsSwiping(false);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isSwiping
  };
};

export default useSwipeGestures;
