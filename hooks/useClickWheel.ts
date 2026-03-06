import { useRef, useEffect } from 'react';

interface UseClickWheelProps {
  onScroll: (direction: 1 | -1) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onScrollProgress?: (totalSteps: number) => void; // cumulative steps since drag start
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const useClickWheel = ({
  onScroll,
  containerRef,
  onScrollProgress,
  onDragStart,
  onDragEnd,
}: UseClickWheelProps) => {
  // Use refs so event handlers always get latest callbacks without re-subscribing
  const onScrollRef = useRef(onScroll);
  onScrollRef.current = onScroll;
  const onScrollProgressRef = useRef(onScrollProgress);
  onScrollProgressRef.current = onScrollProgress;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const state = useRef({
    isDragging: false,
    lastAngle: 0,
    accumulatedDelta: 0,   // for discrete step detection
    totalAccumulated: 0,   // cumulative since drag start (for progress)
  });

  // Sensitivity threshold (degrees). Higher = less sensitive.
  const STEP_THRESHOLD = 15;

  const calculateAngle = (x: number, y: number, center: { x: number; y: number }) => {
    const rad = Math.atan2(y - center.y, x - center.x);
    return rad * (180 / Math.PI);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!state.current.isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const currentAngle = calculateAngle(clientX, clientY, center);
      let delta = currentAngle - state.current.lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      state.current.lastAngle = currentAngle;
      state.current.accumulatedDelta += delta;
      state.current.totalAccumulated += delta;

      // Emit continuous progress (totalSteps since drag start)
      onScrollProgressRef.current?.(state.current.totalAccumulated / STEP_THRESHOLD);

      // Discrete step events
      if (Math.abs(state.current.accumulatedDelta) >= STEP_THRESHOLD) {
        const direction = state.current.accumulatedDelta > 0 ? 1 : -1;
        onScrollRef.current(direction);
        state.current.accumulatedDelta = 0;
      }
    };

    const startDrag = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      state.current.isDragging = true;
      state.current.totalAccumulated = 0;
      state.current.accumulatedDelta = 0;
      const rect = containerRef.current.getBoundingClientRect();
      state.current.lastAngle = calculateAngle(
        clientX,
        clientY,
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      );
      onDragStartRef.current?.();
    };

    const endDrag = () => {
      if (state.current.isDragging) {
        state.current.isDragging = false;
        onDragEndRef.current?.();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        startDrag(e.clientX, e.clientY);
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (state.current.isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => endDrag();

    const handleTouchStart = (e: TouchEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (state.current.isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };
    const handleTouchEnd = () => endDrag();

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    const wheelEl = containerRef.current;
    if (wheelEl) {
      wheelEl.addEventListener('touchstart', handleTouchStart, { passive: false });
      wheelEl.addEventListener('touchmove', handleTouchMove, { passive: false });
      wheelEl.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (wheelEl) {
        wheelEl.removeEventListener('touchstart', handleTouchStart);
        wheelEl.removeEventListener('touchmove', handleTouchMove);
        wheelEl.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [containerRef]); // Only re-run when containerRef changes; callbacks use refs
};
