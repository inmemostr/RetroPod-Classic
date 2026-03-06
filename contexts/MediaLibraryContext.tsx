import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Song, Photo } from '../types';
import {
  initDB, storeBlob, getBlob, deleteBlob,
  saveSongMetadata, loadSongMetadata,
  savePhotoMetadata, loadPhotoMetadata,
  AUDIO_STORE, IMAGE_STORE, coverBlobId,
} from '../services/storage';
import { DEFAULT_SONGS } from '../constants';
import { parseAudioMetadata } from '../services/audioMetadata';

interface MediaLibraryContextValue {
  songs: Song[];
  photos: Photo[];
  addSongFromFile: (file: File) => Promise<void>;
  addSongFromUrl: (url: string, title?: string, artist?: string, album?: string) => Promise<void>;
  removeSong: (id: string) => void;
  addPhotoFromFile: (file: File) => Promise<void>;
  addPhotoFromUrl: (url: string, title?: string) => Promise<void>;
  removePhoto: (id: string) => void;
  isLoading: boolean;
}

const MediaLibraryContext = createContext<MediaLibraryContextValue | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getAudioDuration(src: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(isFinite(audio.duration) ? audio.duration : 0);
    });
    audio.addEventListener('error', () => resolve(0));
    audio.src = src;
  });
}

function fileNameWithoutExt(name: string): string {
  return name.replace(/\.[^/.]+$/, '');
}

export function MediaLibraryProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const blobUrlsRef = useRef<Map<string, string>>(new Map());

  // Initialize: load from storage, restore blob URLs for local items
  useEffect(() => {
    let cancelled = false;

    async function init() {
      await initDB();

      const savedSongs = loadSongMetadata();
      const savedPhotos = loadPhotoMetadata();

      // If no saved data, use defaults
      if (savedSongs.length === 0 && savedPhotos.length === 0) {
        if (!cancelled) {
          setSongs(DEFAULT_SONGS);
          saveSongMetadata(DEFAULT_SONGS);
          setIsLoading(false);
        }
        return;
      }

      // Restore blob URLs for local songs (audio + cover art)
      const restoredSongs: Song[] = [];
      for (const song of savedSongs) {
        if (song.sourceType === 'local') {
          const blob = await getBlob(AUDIO_STORE, song.id);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            blobUrlsRef.current.set(song.id, blobUrl);

            // Restore cover art blob URL if exists
            let coverUrl = song.coverUrl;
            if (!coverUrl) {
              const coverBlob = await getBlob(IMAGE_STORE, coverBlobId(song.id));
              if (coverBlob) {
                const coverBlobUrl = URL.createObjectURL(coverBlob);
                blobUrlsRef.current.set(coverBlobId(song.id), coverBlobUrl);
                coverUrl = coverBlobUrl;
              }
            }

            restoredSongs.push({ ...song, url: blobUrl, coverUrl });
          }
          // Skip songs whose blobs are missing
        } else {
          restoredSongs.push(song);
        }
      }

      // Restore blob URLs for local photos
      const restoredPhotos: Photo[] = [];
      for (const photo of savedPhotos) {
        if (photo.sourceType === 'local') {
          const blob = await getBlob(IMAGE_STORE, photo.id);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            blobUrlsRef.current.set(photo.id, blobUrl);
            restoredPhotos.push({ ...photo, url: blobUrl });
          }
        } else {
          restoredPhotos.push(photo);
        }
      }

      if (!cancelled) {
        setSongs(restoredSongs);
        setPhotos(restoredPhotos);
        setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist metadata whenever songs/photos change (skip during initial load)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (isLoading) return;
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }
    saveSongMetadata(songs);
  }, [songs, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (!initialLoadDone.current) return;
    savePhotoMetadata(photos);
  }, [photos, isLoading]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  const addSongFromFile = useCallback(async (file: File) => {
    const id = generateId();
    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current.set(id, blobUrl);

    // Parse ID3 / metadata tags (title, artist, album, cover art)
    const metadata = await parseAudioMetadata(file);

    // Get duration from audio
    const duration = await getAudioDuration(blobUrl);

    // Store audio blob in IndexedDB
    await storeBlob(AUDIO_STORE, id, file);

    // If cover art was found, store its blob and create a URL
    let coverUrl = '';
    if (metadata.coverBlob) {
      await storeBlob(IMAGE_STORE, coverBlobId(id), metadata.coverBlob);
      const coverBlobUrl = URL.createObjectURL(metadata.coverBlob);
      blobUrlsRef.current.set(coverBlobId(id), coverBlobUrl);
      coverUrl = coverBlobUrl;
    }

    const song: Song = {
      id,
      title: metadata.title || fileNameWithoutExt(file.name),
      artist: metadata.artist || 'Unknown Artist',
      album: metadata.album || 'Unknown Album',
      duration,
      coverUrl,
      url: blobUrl,
      sourceType: 'local',
    };

    setSongs(prev => [...prev, song]);
  }, []);

  const addSongFromUrl = useCallback(async (url: string, title?: string, artist?: string, album?: string) => {
    const id = generateId();

    // Try to get duration
    const duration = await getAudioDuration(url);

    const song: Song = {
      id,
      title: title || 'Untitled',
      artist: artist || 'Unknown Artist',
      album: album || 'Unknown Album',
      duration,
      coverUrl: '',
      url,
      sourceType: 'remote',
    };

    setSongs(prev => [...prev, song]);
  }, []);

  const removeSong = useCallback((id: string) => {
    setSongs(prev => {
      const song = prev.find(s => s.id === id);
      if (song?.sourceType === 'local') {
        // Revoke audio blob URL
        const blobUrl = blobUrlsRef.current.get(id);
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          blobUrlsRef.current.delete(id);
        }
        deleteBlob(AUDIO_STORE, id).catch(() => {});

        // Revoke cover art blob URL and delete from IndexedDB
        const coverId = coverBlobId(id);
        const coverBlobUrl = blobUrlsRef.current.get(coverId);
        if (coverBlobUrl) {
          URL.revokeObjectURL(coverBlobUrl);
          blobUrlsRef.current.delete(coverId);
        }
        deleteBlob(IMAGE_STORE, coverId).catch(() => {});
      }
      return prev.filter(s => s.id !== id);
    });
  }, []);

  const addPhotoFromFile = useCallback(async (file: File) => {
    const id = generateId();
    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current.set(id, blobUrl);

    await storeBlob(IMAGE_STORE, id, file);

    const photo: Photo = {
      id,
      title: fileNameWithoutExt(file.name),
      url: blobUrl,
      sourceType: 'local',
    };

    setPhotos(prev => [...prev, photo]);
  }, []);

  const addPhotoFromUrl = useCallback(async (url: string, title?: string) => {
    const id = generateId();

    const photo: Photo = {
      id,
      title: title || 'Untitled',
      url,
      sourceType: 'remote',
    };

    setPhotos(prev => [...prev, photo]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.sourceType === 'local') {
        const blobUrl = blobUrlsRef.current.get(id);
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          blobUrlsRef.current.delete(id);
        }
        deleteBlob(IMAGE_STORE, id).catch(() => {});
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

  return (
    <MediaLibraryContext.Provider value={{
      songs,
      photos,
      addSongFromFile,
      addSongFromUrl,
      removeSong,
      addPhotoFromFile,
      addPhotoFromUrl,
      removePhoto,
      isLoading,
    }}>
      {children}
    </MediaLibraryContext.Provider>
  );
}

export function useMediaLibrary(): MediaLibraryContextValue {
  const ctx = useContext(MediaLibraryContext);
  if (!ctx) throw new Error('useMediaLibrary must be used within MediaLibraryProvider');
  return ctx;
}
