import React, { useRef } from 'react';
import { useClickWheel } from '../hooks/useClickWheel';
import { WheelAction } from '../types';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';

interface ClickWheelProps {
  onAction: (action: WheelAction) => void;
}

export const ClickWheel: React.FC<ClickWheelProps> = ({ onAction }) => {
  const wheelRef = useRef<HTMLDivElement>(null);

  useClickWheel({
    containerRef: wheelRef,
    onScroll: (direction) => {
      onAction(direction === 1 ? WheelAction.SCROLL_CW : WheelAction.SCROLL_CCW);
    },
  });

  const handleButtonPress = (action: WheelAction, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent triggering drag on buttons
    onAction(action);
  };

  return (
    <div 
      ref={wheelRef}
      className="w-64 h-64 rounded-full bg-[#f2f2f2] relative shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_4px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-pointer touch-none active:brightness-95 transition-all"
    >
       {/* Menu Button (Top) */}
      <button 
        className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-400 tracking-wide uppercase hover:text-gray-600 active:scale-95 transition-transform"
        onClick={(e) => handleButtonPress(WheelAction.CLICK_MENU, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_MENU, e)}
      >
        Menu
      </button>

      {/* Prev Button (Left) */}
      <button 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"
        onClick={(e) => handleButtonPress(WheelAction.CLICK_PREV, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_PREV, e)}
      >
        <Rewind size={20} fill="currentColor" className="text-current" />
      </button>

      {/* Next Button (Right) */}
      <button 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"
        onClick={(e) => handleButtonPress(WheelAction.CLICK_NEXT, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_NEXT, e)}
      >
        <FastForward size={20} fill="currentColor" className="text-current" />
      </button>

      {/* Play/Pause Button (Bottom) */}
      <button 
        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-end gap-0.5 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"
        onClick={(e) => handleButtonPress(WheelAction.CLICK_PLAY_PAUSE, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_PLAY_PAUSE, e)}
      >
        <Play size={16} fill="currentColor" className="text-current" />
        <Pause size={16} fill="currentColor" className="text-current" />
      </button>

      {/* Center Button */}
      <div 
        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] shadow-[inset_0_1px_3px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.3)] z-10 active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] active:bg-[#d5d5d5]"
        onClick={(e) => handleButtonPress(WheelAction.CLICK_SELECT, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_SELECT, e)}
      ></div>
    </div>
  );
};