import React, { useRef, useEffect, useCallback } from 'react';

interface UseClickWheelProps {
  onScroll: (direction: 1 | -1) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useClickWheel = ({ onScroll, containerRef }: UseClickWheelProps) => {
  const state = useRef({
    isDragging: false,
    lastAngle: 0,
    accumulatedDelta: 0,
  });

  // Sensitivity threshold (degrees). Higher = less sensitive.
  const STEP_THRESHOLD = 15;

  const calculateAngle = (x: number, y: number, center: { x: number; y: number }) => {
    // Calculate angle in radians
    const rad = Math.atan2(y - center.y, x - center.x);
    // Convert to degrees
    let deg = rad * (180 / Math.PI);
    return deg;
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const currentAngle = calculateAngle(clientX, clientY, center);
    
    // Handle the wrap-around at 180/-180
    let delta = currentAngle - state.current.lastAngle;
    
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    state.current.lastAngle = currentAngle;
    state.current.accumulatedDelta += delta;

    if (Math.abs(state.current.accumulatedDelta) >= STEP_THRESHOLD) {
      const direction = state.current.accumulatedDelta > 0 ? 1 : -1;
      onScroll(direction);
      // Reset accumulator but keep the remainder to ensure smooth scrolling
      state.current.accumulatedDelta = 0;
    }
  }, [onScroll, containerRef]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only start drag if clicked on the wheel part (not necessarily buttons, but we handle that in the component)
      // Checks are done in the component event handlers, this sets global mouse move listeners
      if (containerRef.current?.contains(e.target as Node)) {
        state.current.isDragging = true;
        const rect = containerRef.current.getBoundingClientRect();
        state.current.lastAngle = calculateAngle(
            e.clientX, 
            e.clientY, 
            { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
        );
        state.current.accumulatedDelta = 0;
      }
    };

    const handleMouseUp = () => {
      state.current.isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (state.current.isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        state.current.isDragging = true;
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        state.current.lastAngle = calculateAngle(
            touch.clientX, 
            touch.clientY, 
            { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
        );
        state.current.accumulatedDelta = 0;
      }
    };

    const handleTouchEnd = () => {
      state.current.isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (state.current.isDragging) {
        e.preventDefault(); // Prevent scrolling the page
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add passive: false to prevent default scrolling behavior
    const wheelEl = containerRef.current;
    if(wheelEl) {
        wheelEl.addEventListener('touchstart', handleTouchStart, { passive: false });
        wheelEl.addEventListener('touchmove', handleTouchMove, { passive: false });
        wheelEl.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if(wheelEl) {
        wheelEl.removeEventListener('touchstart', handleTouchStart);
        wheelEl.removeEventListener('touchmove', handleTouchMove);
        wheelEl.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleMove, containerRef]);
};