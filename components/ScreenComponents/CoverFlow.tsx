
import React from 'react';
import { Song } from '../../types';

interface CoverFlowProps {
  songs: Song[];
  selectedIndex: number;
}

export const CoverFlow: React.FC<CoverFlowProps> = ({ songs, selectedIndex }) => {
  // We limit the visible range to keep DOM light and calculations simple
  const VISIBLE_RANGE = 4;

  return (
    <div className="w-full h-full bg-black relative overflow-hidden perspective-800">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-40 preserve-3d flex items-center justify-center">
            {songs.map((song, index) => {
                const offset = index - selectedIndex;
                
                // Optimization: Don't render items far off screen
                if (Math.abs(offset) > VISIBLE_RANGE) return null;

                // Calculate 3D transforms
                let transform = '';
                let zIndex = 0;
                let opacity = 1;

                if (offset === 0) {
                    // Center item
                    transform = 'translateX(0) translateZ(150px) rotateY(0deg)';
                    zIndex = 50;
                } else if (offset < 0) {
                    // Left items
                    transform = `translateX(${offset * 40 - 60}px) translateZ(-100px) rotateY(70deg)`;
                    zIndex = 50 + offset; // -1 is 49, -2 is 48...
                } else {
                    // Right items
                    transform = `translateX(${offset * 40 + 60}px) translateZ(-100px) rotateY(-70deg)`;
                    zIndex = 50 - offset;
                }

                return (
                    <div 
                        key={song.id}
                        className="absolute w-32 h-32 transition-all duration-300 ease-out origin-center"
                        style={{
                            transform,
                            zIndex
                        }}
                    >
                        {/* Album Art */}
                        <img 
                            src={song.coverUrl} 
                            alt={song.album} 
                            className="w-full h-full object-cover border border-gray-700 shadow-2xl"
                        />
                        
                        {/* Reflection */}
                        <div className="absolute top-full left-0 w-full h-full transform scale-y-[-1] opacity-30 pointer-events-none">
                             <img 
                                src={song.coverUrl} 
                                className="w-full h-full object-cover mask-image-gradient"
                                style={{ 
                                    WebkitMaskImage: 'linear-gradient(transparent 40%, black 100%)',
                                    maskImage: 'linear-gradient(transparent 40%, black 100%)'
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Active Title Label */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-50">
            <h3 className="text-white font-bold text-sm tracking-wide drop-shadow-md">{songs[selectedIndex].title}</h3>
            <p className="text-gray-400 text-xs">{songs[selectedIndex].artist}</p>
        </div>
        
        <div className="absolute top-2 right-2 text-[10px] text-gray-500 font-mono">
            {selectedIndex + 1} of {songs.length}
        </div>
    </div>
  );
};
