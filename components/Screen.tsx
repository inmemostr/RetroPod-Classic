
import React, { useMemo } from 'react';
import { MenuID, MenuConfig, Song, Photo } from '../types';
import { StatusBar } from './ScreenComponents/StatusBar';
import { Menu } from './ScreenComponents/Menu';
import { NowPlaying } from './ScreenComponents/NowPlaying';
import { CoverFlow } from './ScreenComponents/CoverFlow';
import { PhotoViewer } from './ScreenComponents/PhotoViewer';
import { PhotoGrid } from './ScreenComponents/PhotoGrid';
import { MediaInput } from './ScreenComponents/MediaInput';
import { getMenus } from '../constants';

interface ScreenProps {
  menuId: MenuID;
  selectedIndex: number;
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number;
  volume: number;
  duration: number;
  songs: Song[];
  photos: Photo[];
  isAudioLoading: boolean;
  urlInputMode: 'song' | 'photo' | null;
  onUrlSubmit: (url: string, metadata?: { title?: string; artist?: string; album?: string }) => void;
  onUrlCancel: () => void;
  // PhotoViewer slide transition
  photoSlideOffset?: number;
  photoTransitioning?: boolean;
  // Dynamic photo grid columns (for photoGallery)
  photoGridCols?: number;
}

export const Screen: React.FC<ScreenProps> = ({
  menuId,
  selectedIndex,
  isPlaying,
  currentSong,
  progress,
  volume,
  duration,
  songs,
  photos,
  isAudioLoading,
  urlInputMode,
  onUrlSubmit,
  onUrlCancel,
  photoSlideOffset = 0,
  photoTransitioning = false,
  photoGridCols = 6,
}) => {
  const isNowPlaying = menuId === 'nowPlaying';
  const isCoverFlow = menuId === 'coverFlow';
  const isPhotoViewer = menuId === 'photoViewer';
  const isVideoGallery = menuId === 'videoGallery';
  const isPhotoGallery = menuId === 'photoGallery';
  const isUrlInput = menuId === 'urlInput';

  const menus = useMemo(() => getMenus(songs, photos), [songs, photos]);
  const currentMenuConfig: MenuConfig = menus[menuId] || menus['main'];

  const renderContent = () => {
    if (isNowPlaying) {
      return (
        <NowPlaying
            song={currentSong}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            isLoading={isAudioLoading}
        />
      );
    }

    if (isCoverFlow) {
      return (
        <CoverFlow
            songs={songs}
            selectedIndex={selectedIndex}
        />
      );
    }

    if (isPhotoViewer) {
      return (
        <PhotoViewer
            photos={photos}
            selectedIndex={selectedIndex}
            slideOffset={photoSlideOffset}
            transitioning={photoTransitioning}
        />
      );
    }

    if (isUrlInput && urlInputMode) {
      return (
        <MediaInput
            mode={urlInputMode}
            onSubmit={onUrlSubmit}
            onCancel={onUrlCancel}
        />
      );
    }

    if (isVideoGallery) {
      return (
        <PhotoGrid
            photos={photos}
            selectedIndex={selectedIndex}
        />
      );
    }

    if (isPhotoGallery) {
      return (
        <PhotoGrid
            photos={photos}
            selectedIndex={selectedIndex}
            cols={photoGridCols}
            squareCells
        />
      );
    }

    // Split screen for main menus (Left Menu, Right Preview)
    const showPreview = ['main', 'music', 'videos', 'extras'].includes(menuId);

    if (showPreview) {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
             <Menu items={currentMenuConfig.items} selectedIndex={selectedIndex} />
          </div>
          <div className="w-1/2 bg-white relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-gray-50 animate-slow-pan">
                 <div className="w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
             </div>
             {menuId === 'music' && (
                 <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg opacity-80">
                    <div className="text-white font-bold text-4xl">&#9835;</div>
                 </div>
             )}
              {menuId === 'videos' && (
                 <div className="relative w-24 h-20 bg-black rounded-md flex items-center justify-center shadow-lg border-2 border-gray-600">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                 </div>
             )}
             {menuId === 'main' && (
                 <img
                    src={currentSong?.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop"}
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    alt="Preview"
                />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>
        </div>
      );
    }

    // Full width menu for deeper levels
    return (
        <div className="flex flex-1 overflow-hidden bg-white">
            <div className="w-full">
                <Menu items={currentMenuConfig.items} selectedIndex={selectedIndex} />
            </div>
        </div>
    );
  };

  return (
    <div className="w-full h-full bg-white rounded-[4px] overflow-hidden flex flex-col relative font-sans antialiased">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-blue-50 opacity-20 pointer-events-none z-50 mix-blend-overlay"></div>
        <StatusBar title={currentMenuConfig.title} isPlaying={isPlaying} />
        {renderContent()}
    </div>
  );
};
