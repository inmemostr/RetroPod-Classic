
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ClickWheel } from './ClickWheel';
import { Screen } from './Screen';
import { getMenus } from '../constants';
import { MenuID, WheelAction, Song } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMediaLibrary } from '../contexts/MediaLibraryContext';

export const IPod: React.FC = () => {
  const { songs, photos, addSongFromFile, addSongFromUrl, addPhotoFromFile, addPhotoFromUrl, removeSong, removePhoto } = useMediaLibrary();

  // Navigation State
  const [menuStack, setMenuStack] = useState<MenuID[]>(['main']);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Current song being played
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // URL input state
  const [urlInputMode, setUrlInputMode] = useState<'song' | 'photo' | null>(null);

  // File input refs
  const audioFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  // ── Photo Gallery ─────────────────────────────────────────────────────────
  // Dynamic grid density: cols 3–8 (fewer = bigger cells)
  const [photoGridCols, setPhotoGridCols] = useState(6);

  // ── Photo Viewer slide transition ─────────────────────────────────────────
  // slideOffset: gesture offset in "photo units" relative to selectedIndex
  //   positive = swiping toward next photo (strip moves left)
  //   negative = swiping toward previous photo (strip moves right)
  const [photoSlideOffset, setPhotoSlideOffset] = useState(0);
  const [photoTransitioning, setPhotoTransitioning] = useState(false);
  // Ref to always-current values needed inside non-reactive callbacks
  const photoSlideOffsetRef = useRef(0);
  const photoBaseDragIndexRef = useRef(0);    // selectedIndex at drag start
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;
  const isPhotoViewerRef = useRef(false);

  // ── Audio player ──────────────────────────────────────────────────────────
  const songsRef = useRef(songs);
  const currentSongRef = useRef(currentSong);
  songsRef.current = songs;
  currentSongRef.current = currentSong;

  const audioControlsRef = useRef<ReturnType<typeof useAudioPlayer>[1] | null>(null);

  const handleSongEnded = useCallback(() => {
    const s = songsRef.current;
    const cs = currentSongRef.current;
    const currIdx = s.findIndex(song => song.id === cs?.id);
    if (currIdx !== -1 && s.length > 0) {
      const nextSong = s[(currIdx + 1) % s.length];
      setCurrentSong(nextSong);
      audioControlsRef.current?.loadSong(nextSong);
    }
  }, []);

  const [audioState, audioControls] = useAudioPlayer({ onSongEnded: handleSongEnded });
  audioControlsRef.current = audioControls;

  // Dynamic menus
  const menus = useMemo(() => getMenus(songs, photos), [songs, photos]);

  const currentMenuId = menuStack[menuStack.length - 1];
  const currentMenu = menus[currentMenuId] || menus['main'];
  const isCoverFlow = currentMenuId === 'coverFlow';
  const isPhotoViewer = currentMenuId === 'photoViewer';
  const isVideoGallery = currentMenuId === 'videoGallery';
  const isPhotoGallery = currentMenuId === 'photoGallery';
  isPhotoViewerRef.current = isPhotoViewer;

  // Reset selection when menu changes
  useEffect(() => {
    if (isCoverFlow) {
      const idx = songs.findIndex(s => s.id === currentSong?.id);
      setSelectedIndex(idx !== -1 ? idx : 0);
    } else if (currentMenuId === 'photoViewer' || isVideoGallery || isPhotoGallery) {
      // Preserve selectedIndex when transitioning between gallery and photoViewer
    } else {
      setSelectedIndex(0);
    }
    // Reset slide offset when leaving photoViewer
    if (currentMenuId !== 'photoViewer') {
      setPhotoSlideOffset(0);
      photoSlideOffsetRef.current = 0;
      setPhotoTransitioning(false);
    }
  }, [currentMenuId]);

  // Set initial song when songs load
  useEffect(() => {
    if (!currentSong && songs.length > 0) {
      setCurrentSong(songs[0]);
    }
  }, [songs, currentSong]);

  const handleNextSong = useCallback(() => {
    const currIdx = songs.findIndex(s => s.id === currentSong?.id);
    if (currIdx !== -1 && songs.length > 0) {
      const nextSong = songs[(currIdx + 1) % songs.length];
      setCurrentSong(nextSong);
      audioControls.loadSong(nextSong);
    }
  }, [songs, currentSong, audioControls]);

  const handlePrevSong = useCallback(() => {
    const currIdx = songs.findIndex(s => s.id === currentSong?.id);
    if (currIdx !== -1 && songs.length > 0) {
      const prevSong = songs[(currIdx - 1 + songs.length) % songs.length];
      setCurrentSong(prevSong);
      audioControls.loadSong(prevSong);
    }
  }, [songs, currentSong, audioControls]);

  // File input handlers
  const handleAudioFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      await addSongFromFile(file);
    }
    e.target.value = '';
  }, [addSongFromFile]);

  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      await addPhotoFromFile(file);
    }
    e.target.value = '';
  }, [addPhotoFromFile]);

  // URL submit handler
  const handleUrlSubmit = useCallback(async (url: string, metadata?: { title?: string; artist?: string; album?: string }) => {
    if (urlInputMode === 'song') {
      await addSongFromUrl(url, metadata?.title, metadata?.artist, metadata?.album);
    } else if (urlInputMode === 'photo') {
      await addPhotoFromUrl(url, metadata?.title);
    }
    setMenuStack(prev => prev.slice(0, -1));
    setUrlInputMode(null);
  }, [urlInputMode, addSongFromUrl, addPhotoFromUrl]);

  const handleUrlCancel = useCallback(() => {
    setMenuStack(prev => prev.slice(0, -1));
    setUrlInputMode(null);
  }, []);

  // ── Click Wheel gesture callbacks ─────────────────────────────────────────

  /** Called when a drag starts on the wheel. */
  const handleWheelDragStart = useCallback(() => {
    if (isPhotoViewerRef.current) {
      // Capture the base index at drag start
      photoBaseDragIndexRef.current = selectedIndexRef.current;
      setPhotoTransitioning(false);
    }
  }, []);

  /** Called on every wheel movement with total steps since drag start. */
  const handleWheelScrollProgress = useCallback((totalSteps: number) => {
    if (!isPhotoViewerRef.current) return;
    // Clamp so we can't swipe past the photo list edges
    const photosLen = songsRef.current ? photos.length : 0; // closure refresh via ref
    const baseIdx = photoBaseDragIndexRef.current;
    const maxForward = photos.length - 1 - baseIdx;
    const maxBackward = baseIdx;
    const clamped = Math.max(-maxBackward, Math.min(maxForward, totalSteps));
    photoSlideOffsetRef.current = clamped;
    setPhotoSlideOffset(clamped);
  }, [photos.length]);

  /** Called when the drag ends — snap to nearest photo with animation. */
  const handleWheelDragEnd = useCallback(() => {
    if (!isPhotoViewerRef.current) return;
    const total = photoSlideOffsetRef.current;
    const baseIdx = photoBaseDragIndexRef.current;
    const newIndex = Math.max(0, Math.min(photos.length - 1, Math.round(baseIdx + total)));
    // Corrected offset keeps visual position identical before & after index commit
    const correctedOffset = total - (newIndex - baseIdx);

    // Commit index + corrected offset (no visible jump)
    setSelectedIndex(newIndex);
    selectedIndexRef.current = newIndex;
    setPhotoSlideOffset(correctedOffset);
    photoSlideOffsetRef.current = correctedOffset;

    // After React renders the above, animate offset → 0 (snap to center)
    setTimeout(() => {
      setPhotoTransitioning(true);
      setPhotoSlideOffset(0);
      photoSlideOffsetRef.current = 0;
      // Reset transitioning flag after animation completes
      setTimeout(() => setPhotoTransitioning(false), 300);
    }, 0);
  }, [photos.length]);

  // ── Discrete wheel actions ────────────────────────────────────────────────

  const handleAction = useCallback((action: WheelAction) => {
    if (currentMenuId === 'urlInput') {
      if (action === WheelAction.CLICK_MENU) handleUrlCancel();
      return;
    }

    const listLength =
      isCoverFlow     ? songs.length  :
      isPhotoViewer   ? photos.length :
      isVideoGallery  ? photos.length :
      isPhotoGallery  ? photos.length :
      currentMenu.items.length;

    if (listLength === 0 &&
        (action === WheelAction.SCROLL_CW || action === WheelAction.SCROLL_CCW)) {
      return;
    }

    switch (action) {
      case WheelAction.SCROLL_CW:
        if (currentMenuId === 'nowPlaying') {
          audioControls.setVolume(audioState.volume + 5);
        } else if (isPhotoViewer) {
          // Handled continuously via onScrollProgress; skip discrete index update
        } else if (listLength > 0) {
          setSelectedIndex((prev) => (prev + 1) % listLength);
        }
        break;

      case WheelAction.SCROLL_CCW:
        if (currentMenuId === 'nowPlaying') {
          audioControls.setVolume(audioState.volume - 5);
        } else if (isPhotoViewer) {
          // Handled continuously via onScrollProgress
        } else if (listLength > 0) {
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
          audioControls.togglePlayPause();
          return;
        }
        if (isVideoGallery) {
          if (photos.length > 0) setMenuStack((prev) => [...prev, 'photoViewer']);
          return;
        }
        if (isPhotoGallery) {
          if (photos.length > 0) setMenuStack((prev) => [...prev, 'photoViewer']);
          return;
        }
        if (isPhotoViewer) return;
        if (isCoverFlow) {
          if (songs.length > 0) {
            const selectedSong = songs[selectedIndex];
            setCurrentSong(selectedSong);
            audioControls.loadSong(selectedSong);
            setMenuStack((prev) => [...prev, 'nowPlaying']);
          }
          return;
        }

        const item = currentMenu.items[selectedIndex];
        if (!item) return;

        if (item.type === 'navigation' && item.target) {
          if (item.target === 'urlInput') {
            if (currentMenuId === 'addMusic') setUrlInputMode('song');
            else if (currentMenuId === 'addPhotos') setUrlInputMode('photo');
          }
          setMenuStack((prev) => [...prev, item.target!]);
        } else if (item.type === 'action') {
          if (item.id === 'addMusicFile') { audioFileRef.current?.click(); return; }
          if (item.id === 'addPhotoFile') { imageFileRef.current?.click(); return; }
          if (currentMenuId === 'manageSongs' && item.id.startsWith('del_')) {
            const songId = item.id.replace('del_', '');
            removeSong(songId);
            if (currentSong?.id === songId) { setCurrentSong(null); audioControls.pause(); }
            setSelectedIndex(prev => Math.max(0, Math.min(prev, songs.length - 2)));
            return;
          }
          if (currentMenuId === 'managePhotos' && item.id.startsWith('del_')) {
            const photoId = item.id.replace('del_', '');
            removePhoto(photoId);
            setSelectedIndex(prev => Math.max(0, Math.min(prev, photos.length - 2)));
            return;
          }
          const song = songs.find(s => s.id === item.id);
          if (song) {
            setCurrentSong(song);
            audioControls.loadSong(song);
            setMenuStack((prev) => [...prev, 'nowPlaying']);
          } else if (item.id === 'reset') {
            setMenuStack(['main']);
            setSelectedIndex(0);
          }
        }
        break;

      case WheelAction.CLICK_PLAY_PAUSE:
        audioControls.togglePlayPause();
        break;

      case WheelAction.CLICK_NEXT:
        if (isPhotoGallery) {
          // Fewer columns = bigger cells (min 3)
          setPhotoGridCols(prev => Math.max(3, prev - 1));
          break;
        }
        handleNextSong();
        break;

      case WheelAction.CLICK_PREV:
        if (isPhotoGallery) {
          // More columns = smaller cells (max 8)
          setPhotoGridCols(prev => Math.min(8, prev + 1));
          break;
        }
        if (audioState.currentTime > 3) {
          audioControls.seek(0);
        } else {
          handlePrevSong();
        }
        break;
    }
  }, [currentMenu, currentMenuId, menuStack, selectedIndex, audioState, audioControls,
      isCoverFlow, isPhotoViewer, isVideoGallery, isPhotoGallery, songs, photos, currentSong,
      handleNextSong, handlePrevSong, handleUrlCancel, removeSong, removePhoto]);

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
                isPlaying={audioState.isPlaying}
                currentSong={currentSong}
                progress={audioState.currentTime}
                volume={audioState.volume}
                duration={audioState.duration}
                songs={songs}
                photos={photos}
                isAudioLoading={audioState.isLoading}
                urlInputMode={urlInputMode}
                onUrlSubmit={handleUrlSubmit}
                onUrlCancel={handleUrlCancel}
                photoSlideOffset={photoSlideOffset}
                photoTransitioning={photoTransitioning}
                photoGridCols={photoGridCols}
            />
        </div>
        {/* Glossy Screen Glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Click Wheel */}
      <div className="mt-2 relative z-10">
        <ClickWheel
          onAction={handleAction}
          onScrollProgress={handleWheelScrollProgress}
          onDragStart={handleWheelDragStart}
          onDragEnd={handleWheelDragEnd}
        />
      </div>

      {/* Hidden file inputs */}
      <input
        ref={audioFileRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/flac,.mp3,.wav,.ogg,.aac,.flac"
        multiple
        className="hidden"
        onChange={handleAudioFileChange}
      />
      <input
        ref={imageFileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />

      <div className="absolute bottom-6 text-[9px] text-gray-400 font-medium tracking-wide opacity-60">
         Designed by Apple in California
      </div>
    </div>
  );
};
