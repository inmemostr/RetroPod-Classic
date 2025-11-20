
import React from 'react';
import { Song } from '../../types';

interface NowPlayingProps {
  song: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({ song, isPlaying, progress, duration }) => {
  if (!song) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-4">
        <p className="text-gray-500 text-sm">No Music Playing</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex bg-white overflow-hidden relative">
      {/* Left Side: Info */}
      <div className="w-1/2 p-3 flex flex-col justify-start z-10 pt-6">
        <div className="space-y-1 animate-fade-in">
            <h2 className="text-sm font-bold leading-tight line-clamp-2 text-black">{song.title}</h2>
            <p className="text-xs text-gray-600 truncate font-medium">{song.artist}</p>
            <p className="text-[10px] text-gray-500 truncate">{song.album}</p>
        </div>
      </div>

      {/* Right Side: Album Art */}
      <div className="w-1/2 relative bg-gray-50 flex items-center justify-center border-l border-gray-200 shadow-[inset_2px_0_5px_rgba(0,0,0,0.05)]">
        <div className="w-32 h-32 relative shadow-lg transform scale-90">
            <img 
                src={song.coverUrl} 
                alt="Cover" 
                className="w-full h-full object-cover bg-gray-200"
            />
            {/* Glassy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
        </div>
        
        {/* Reflection effect on the floor */}
        <div className="absolute -bottom-16 left-0 right-0 h-16 bg-gradient-to-b from-gray-200/50 to-transparent transform scale-x-90 opacity-50 blur-sm"></div>
      </div>

      {/* Bottom Info & Progress */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm border-t border-gray-100">
        <div className="flex justify-between text-[9px] font-semibold text-gray-500 mb-1">
            <span>{formatTime(progress)}</span>
            {/* Diamond Play/Pause Icon overlay could go here */}
            <span>-{formatTime(duration - progress)}</span>
         </div>
         
         {/* Progress Bar Background */}
         <div className="h-[10px] bg-gray-200 border border-gray-300 w-full relative shadow-inner rounded-sm overflow-hidden">
            {/* Progress Fill (Blue Glossy) */}
            <div 
                className="h-full bg-gradient-to-b from-[#84c1ff] via-[#3b99fc] to-[#2b8cf7] w-0 border-r border-[#1d6ecf]"
                style={{ width: `${(progress / duration) * 100}%` }}
            >
                <div className="w-full h-[50%] bg-white/30"></div>
            </div>
         </div>
      </div>
    </div>
  );
};
