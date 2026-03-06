import { useState, useRef, useCallback, useEffect } from 'react';
import { Song } from '../types';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0-100
  isLoading: boolean;
  error: string | null;
}

export interface AudioPlayerControls {
  loadSong: (song: Song) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

interface UseAudioPlayerOptions {
  onSongEnded?: () => void;
}

export function useAudioPlayer(options?: UseAudioPlayerOptions): [AudioPlayerState, AudioPlayerControls] {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const onSongEndedRef = useRef(options?.onSongEnded);

  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 50,
    isLoading: false,
    error: null,
  });

  // Keep callback ref fresh
  useEffect(() => {
    onSongEndedRef.current = options?.onSongEnded;
  }, [options?.onSongEnded]);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.5;
    audioRef.current = audio;

    const updateTime = () => {
      setState(prev => {
        const newTime = audio.currentTime;
        if (Math.abs(prev.currentTime - newTime) < 0.05) return prev;
        return { ...prev, currentTime: newTime };
      });
      rafRef.current = requestAnimationFrame(updateTime);
    };

    const onLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
        error: null,
      }));
    };

    const onPlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
      rafRef.current = requestAnimationFrame(updateTime);
    };

    const onPause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      cancelAnimationFrame(rafRef.current);
    };

    const onEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      cancelAnimationFrame(rafRef.current);
      onSongEndedRef.current?.();
    };

    const onError = () => {
      const errMsg = audio.error?.message || 'Failed to load audio';
      setState(prev => ({ ...prev, isLoading: false, error: errMsg, isPlaying: false }));
      cancelAnimationFrame(rafRef.current);
    };

    const onWaiting = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const onCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audioRef.current = null;
    };
  }, []);

  const loadSong = useCallback((song: Song) => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelAnimationFrame(rafRef.current);
    setState(prev => ({
      ...prev,
      currentTime: 0,
      duration: song.duration || 0,
      isLoading: true,
      error: null,
      isPlaying: false,
    }));

    audio.src = song.url;
    audio.load();
    audio.play().catch(() => {
      // Autoplay might be blocked, user interaction needed
    });
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const v = Math.max(0, Math.min(100, volume));
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
    setState(prev => ({ ...prev, volume: v }));
  }, []);

  return [state, { loadSong, play, pause, togglePlayPause, seek, setVolume }];
}
