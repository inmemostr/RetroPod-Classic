
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClickWheel } from './ClickWheel';
import { Screen } from './Screen';
import { MENUS, MOCK_SONGS } from '../constants';
import { MenuID, WheelAction, Song } from '../types';

export const IPod: React.FC = () => {
  // Navigation State
  const [menuStack, setMenuStack] = useState<MenuID[]>(['main']);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(MOCK_SONGS[0]);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);

  // Refs for timers
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMenuId = menuStack[menuStack.length - 1];
  const currentMenu = MENUS[currentMenuId] || MENUS['main'];
  const isCoverFlow = currentMenuId === 'coverFlow';

  // Reset selection when menu changes
  useEffect(() => {
    if (isCoverFlow) {
        // If entering cover flow, try to center on current song or start at 0
        const idx = MOCK_SONGS.findIndex(s => s.id === currentSong?.id);
        setSelectedIndex(idx !== -1 ? idx : 0);
    } else {
        setSelectedIndex(0);
    }
  }, [currentMenuId]); // Removed isCoverFlow/currentSong dependency to prevent loop reset on song change

  // Playback Logic (Simulation)
  useEffect(() => {
    if (isPlaying && currentSong) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentSong.duration) {
            // Song ended, go to next
            handleNextSong();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, currentSong]);

  const handleNextSong = () => {
     const currIdx = MOCK_SONGS.findIndex(s => s.id === currentSong?.id);
     if (currIdx !== -1) {
        const nextSong = MOCK_SONGS[(currIdx + 1) % MOCK_SONGS.length];
        setCurrentSong(nextSong);
        setProgress(0);
     }
  };

  const handlePrevSong = () => {
    const currIdx = MOCK_SONGS.findIndex(s => s.id === currentSong?.id);
    if (currIdx !== -1) {
       const prevSong = MOCK_SONGS[(currIdx - 1 + MOCK_SONGS.length) % MOCK_SONGS.length];
       setCurrentSong(prevSong);
       setProgress(0);
    }
  };

  const handleAction = useCallback((action: WheelAction) => {
    const listLength = isCoverFlow ? MOCK_SONGS.length : currentMenu.items.length;

    switch (action) {
      case WheelAction.SCROLL_CW:
        if (currentMenuId === 'nowPlaying') {
             setVolume(v => Math.min(100, v + 5));
        } else {
             setSelectedIndex((prev) => (prev + 1) % listLength);
        }
        break;
      case WheelAction.SCROLL_CCW:
        if (currentMenuId === 'nowPlaying') {
            setVolume(v => Math.max(0, v - 5));
        } else {
            setSelectedIndex((prev) => (prev - 1 + listLength) % listLength);
        }
        break;
      case WheelAction.CLICK_MENU:
        if (menuStack.length > 1) {
          setMenuStack((prev) => prev.slice(0, -1));
        }
        break;
      case WheelAction.CLICK_SELECT:
        if (currentMenuId === 'nowPlaying') {
             setIsPlaying(!isPlaying);
             return;
        }
        
        if (isCoverFlow) {
            // Select the song in cover flow
            const selectedSong = MOCK_SONGS[selectedIndex];
            setCurrentSong(selectedSong);
            setIsPlaying(true);
            setMenuStack((prev) => [...prev, 'nowPlaying']);
            return;
        }

        const item = currentMenu.items[selectedIndex];
        if (item) {
          if (item.type === 'navigation' && item.target) {
            setMenuStack((prev) => [...prev, item.target!]);
          } else if (item.type === 'action') {
             // Check if it's a song ID
             const song = MOCK_SONGS.find(s => s.id === item.id);
             if (song) {
                 setCurrentSong(song);
                 setIsPlaying(true);
                 setProgress(0);
                 setMenuStack((prev) => [...prev, 'nowPlaying']);
             } else if (item.id === 'reset') {
                 setMenuStack(['main']);
                 setSelectedIndex(0);
             } else {
                // Generic toggle logic simulation
             }
          }
        }
        break;
      case WheelAction.CLICK_PLAY_PAUSE:
        setIsPlaying((prev) => !prev);
        break;
      case WheelAction.CLICK_NEXT:
        handleNextSong();
        break;
      case WheelAction.CLICK_PREV:
        if (progress > 3) {
            // If playing for more than 3s, restart song
            setProgress(0);
        } else {
            handlePrevSong();
        }
        break;
    }
  }, [currentMenu, currentMenuId, menuStack, selectedIndex, isPlaying, currentSong, isCoverFlow, progress]);

  return (
    <div className="relative w-[370px] h-[620px] bg-[#e6e6e6] rounded-[36px] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_20px_40px_-10px_rgba(0,0,0,0.4),inset_0_2px_5px_rgba(255,255,255,0.5),inset_0_-2px_5px_rgba(0,0,0,0.1)] flex flex-col items-center p-8 select-none transition-all">
      
      {/* Metallic Texture Overlay */}
      <div className="absolute inset-0 rounded-[36px] pointer-events-none opacity-20" 
           style={{background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 100%)`}}></div>

      {/* Screen Container */}
      <div className="w-[322px] h-[242px] bg-black rounded-lg mb-10 relative z-10 shadow-[0_0_0_2px_#333,0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="w-full h-full bg-white relative">
            <Screen 
                menuId={currentMenuId} 
                selectedIndex={selectedIndex}
                isPlaying={isPlaying}
                currentSong={currentSong}
                progress={progress}
                volume={volume}
            />
        </div>
        {/* Glossy Screen Glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Click Wheel Container */}
      <div className="mt-2 relative z-10">
        <ClickWheel onAction={handleAction} />
      </div>

      {/* Bottom text/copyright */}
      <div className="absolute bottom-6 text-[9px] text-gray-400 font-medium tracking-wide opacity-60">
         Designed by Apple in California
      </div>
    </div>
  );
};
