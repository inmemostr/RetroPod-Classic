
import { MenuConfig, MenuID, Song } from './types';

export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'Cyber Punkers',
    album: 'Future City',
    duration: 214,
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'The Synthetics',
    album: 'Retrowave Essentials',
    duration: 186,
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Ocean Breeze',
    artist: 'Chill Wave',
    album: 'Summer Vibes',
    duration: 245,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  },
  {
    id: '4',
    title: 'Mountain Echo',
    artist: 'Folk Spirits',
    album: 'High Altitudes',
    duration: 198,
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop',
  },
  {
    id: '5',
    title: 'Urban Jungle',
    artist: 'Concrete Beats',
    album: 'City Life',
    duration: 220,
    coverUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=300&h=300&fit=crop',
  },
  {
    id: '6',
    title: 'Cosmic Voyage',
    artist: 'Star Gazers',
    album: 'Galaxy Sounds',
    duration: 260,
    coverUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?w=300&h=300&fit=crop',
  }
];

export const MENUS: Record<MenuID, MenuConfig> = {
  main: {
    title: 'iPod',
    items: [
      { id: 'music', label: 'Music', type: 'navigation', target: 'music', hasChevron: true },
      { id: 'videos', label: 'Videos', type: 'navigation', target: 'videos', hasChevron: true },
      { id: 'photos', label: 'Photos', type: 'navigation', target: 'photos', hasChevron: true },
      { id: 'extras', label: 'Extras', type: 'navigation', target: 'extras', hasChevron: true },
      { id: 'settings', label: 'Settings', type: 'navigation', target: 'settings', hasChevron: true },
      { id: 'nowPlaying', label: 'Now Playing', type: 'navigation', target: 'nowPlaying', hasChevron: true },
    ],
  },
  music: {
    title: 'Music',
    parent: 'main',
    items: [
      { id: 'coverFlow', label: 'Cover Flow', type: 'navigation', target: 'coverFlow', hasChevron: true },
      { id: 'playlists', label: 'Playlists', type: 'navigation', target: 'songs', hasChevron: true },
      { id: 'artists', label: 'Artists', type: 'navigation', target: 'artists', hasChevron: true },
      { id: 'albums', label: 'Albums', type: 'navigation', target: 'albums', hasChevron: true },
      { id: 'songs', label: 'Songs', type: 'navigation', target: 'songs', hasChevron: true },
    ],
  },
  videos: {
    title: 'Videos',
    parent: 'main',
    items: [
       { id: 'movies', label: 'Movies', type: 'navigation', target: 'songs', hasChevron: true }, // Reuse songs list for demo
       { id: 'musicVideos', label: 'Music Videos', type: 'navigation', target: 'songs', hasChevron: true },
    ]
  },
  photos: {
    title: 'Photos',
    parent: 'main',
    items: [
        { id: 'all', label: 'All Photos', type: 'action' }
    ]
  },
  artists: {
    title: 'Artists',
    parent: 'music',
    items: MOCK_SONGS.map(s => ({ id: `art_${s.id}`, label: s.artist, type: 'navigation', target: 'songs', hasChevron: true })),
  },
  albums: {
    title: 'Albums',
    parent: 'music',
    items: MOCK_SONGS.map(s => ({ id: `alb_${s.id}`, label: s.album, type: 'navigation', target: 'songs', hasChevron: true })),
  },
  songs: {
    title: 'Songs',
    parent: 'music',
    items: MOCK_SONGS.map(s => ({ id: s.id, label: s.title, type: 'action' })),
  },
  extras: {
    title: 'Extras',
    parent: 'main',
    items: [
      { id: 'games', label: 'Games', type: 'navigation', target: 'games', hasChevron: true },
      { id: 'clock', label: 'Clock', type: 'action' },
      { id: 'calendar', label: 'Calendar', type: 'action' },
      { id: 'notes', label: 'Notes', type: 'action' },
    ],
  },
  games: {
    title: 'Games',
    parent: 'extras',
    items: [
        { id: 'brick', label: 'Brick', type: 'action' },
        { id: 'parachute', label: 'Parachute', type: 'action' },
        { id: 'solitaire', label: 'Solitaire', type: 'action' },
    ]
  },
  settings: {
    title: 'Settings',
    parent: 'main',
    items: [
      { id: 'about', label: 'About', type: 'navigation', hasChevron: true },
      { id: 'eq', label: 'EQ', type: 'navigation', hasChevron: true },
      { id: 'soundcheck', label: 'Sound Check', type: 'toggle' },
      { id: 'contrast', label: 'Contrast', type: 'navigation' },
      { id: 'reset', label: 'Reset All', type: 'action' },
    ],
  },
  nowPlaying: {
    title: 'Now Playing',
    parent: 'main',
    items: [],
  },
  coverFlow: {
    title: 'Cover Flow',
    parent: 'music',
    items: [],
  }
};
