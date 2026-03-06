import React from 'react';
import { Battery, Play, Pause } from 'lucide-react';

interface StatusBarProps {
  title: string;
  isPlaying: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ title, isPlaying }) => {
  return (
    <div className="h-6 bg-gradient-to-b from-gray-100 to-gray-300 border-b border-gray-400 flex items-center justify-between px-2 shadow-sm z-10 relative">
      <div className="w-4">
        {isPlaying ? <Play size={10} fill="black" /> : <Pause size={10} fill="black" />}
      </div>
      <span className="text-xs font-semibold truncate max-w-[160px] text-black drop-shadow-sm">
        {title}
      </span>
      <div className="w-6 flex justify-end">
        <Battery size={14} className="text-black fill-green-600" />
      </div>
    </div>
  );
};