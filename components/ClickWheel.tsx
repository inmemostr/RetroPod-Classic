import React, { useRef } from 'react';
import { useClickWheel } from '../hooks/useClickWheel';
import { WheelAction } from '../types';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';

interface ClickWheelProps {
  onAction: (action: WheelAction) => void;
  onScrollProgress?: (totalSteps: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const ClickWheel: React.FC<ClickWheelProps> = ({
  onAction,
  onScrollProgress,
  onDragStart,
  onDragEnd,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);

  useClickWheel({
    containerRef: wheelRef,
    onScroll: (direction) => {
      onAction(direction === 1 ? WheelAction.SCROLL_CW : WheelAction.SCROLL_CCW);
    },
    onScrollProgress,
    onDragStart,
    onDragEnd,
  });

  const handleButtonPress = (action: WheelAction, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onAction(action);
  };

  return (
    <div
      ref={wheelRef}
      className="w-64 h-64 rounded-full bg-[#f2f2f2] relative shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_4px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-pointer touch-none active:brightness-95 transition-all"
    >
      {/*
        Quarter-zone click overlays — each covers one wedge of the wheel.
        clip-path triangles partition the square into 4 equal wedges meeting at center.
        z-[1] puts them above the wheel ring but below the center button (z-10).
      */}
      {/* Top wedge — Menu */}
      <div
        className="absolute inset-0 z-[1] cursor-pointer"
        style={{ clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)' }}
        onClick={(e) => handleButtonPress(WheelAction.CLICK_MENU, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_MENU, e)}
      />
      {/* Bottom wedge — Play/Pause */}
      <div
        className="absolute inset-0 z-[1] cursor-pointer"
        style={{ clipPath: 'polygon(50% 50%, 0% 100%, 100% 100%)' }}
        onClick={(e) => handleButtonPress(WheelAction.CLICK_PLAY_PAUSE, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_PLAY_PAUSE, e)}
      />
      {/* Left wedge — Prev */}
      <div
        className="absolute inset-0 z-[1] cursor-pointer"
        style={{ clipPath: 'polygon(50% 50%, 0% 0%, 0% 100%)' }}
        onClick={(e) => handleButtonPress(WheelAction.CLICK_PREV, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_PREV, e)}
      />
      {/* Right wedge — Next */}
      <div
        className="absolute inset-0 z-[1] cursor-pointer"
        style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%)' }}
        onClick={(e) => handleButtonPress(WheelAction.CLICK_NEXT, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_NEXT, e)}
      />

      {/* Visual icon labels — pointer-events-none so zones behind them still fire */}
      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 tracking-wide uppercase pointer-events-none z-[2]">
        Menu
      </span>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[2]">
        <Rewind size={20} fill="currentColor" />
      </span>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[2]">
        <FastForward size={20} fill="currentColor" />
      </span>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5 text-gray-400 pointer-events-none z-[2]">
        <Play size={16} fill="currentColor" />
        <Pause size={16} fill="currentColor" />
      </span>

      {/* Center Select button */}
      <div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#e0e0e0] to-[#d0d0d0] shadow-[inset_0_1px_3px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.3)] z-10 active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] active:bg-[#d5d5d5] cursor-pointer"
        onClick={(e) => handleButtonPress(WheelAction.CLICK_SELECT, e)}
        onTouchEnd={(e) => handleButtonPress(WheelAction.CLICK_SELECT, e)}
      />
    </div>
  );
};
