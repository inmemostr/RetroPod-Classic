
import { MenuConfig, MenuID, Song, Photo } from './types';

export const DEFAULT_SONGS: Song[] = [
  {
    id: 'default_1',
    title: 'Neon Nights',
    artist: 'Cyber Punkers',
    album: 'Future City',
    duration: 214,
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_33f2d81a20.mp3',
    sourceType: 'remote',
  },
  {
    id: 'default_2',
    title: 'Midnight Drive',
    artist: 'The Synthetics',
    album: 'Retrowave Essentials',
    duration: 186,
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    sourceType: 'remote',
  },
  {
    id: 'default_3',
    title: 'Ocean Breeze',
    artist: 'Chill Wave',
    album: 'Summer Vibes',
    duration: 245,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3',
    sourceType: 'remote',
  },
  {
    id: 'default_4',
    title: 'Mountain Echo',
    artist: 'Folk Spirits',
    album: 'High Altitudes',
    duration: 198,
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop',
    url: 'https://cdn.pixabay.com/audio/2023/05/17/audio_4b0e21468c.mp3',
    sourceType: 'remote',
  },
  {
    id: 'default_5',
    title: 'Urban Jungle',
    artist: 'Concrete Beats',
    album: 'City Life',
    duration: 220,
    coverUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=300&h=300&fit=crop',
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
    sourceType: 'remote',
  },
  {
    id: 'default_6',
    title: 'Cosmic Voyage',
    artist: 'Star Gazers',
    album: 'Galaxy Sounds',
    duration: 260,
    coverUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?w=300&h=300&fit=crop',
    url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    sourceType: 'remote',
  }
];

// Deduplicate helper for artist/album lists
function unique<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getMenus(songs: Song[], photos: Photo[]): Record<MenuID, MenuConfig> {
  const uniqueArtists = unique(songs, s => s.artist);
  const uniqueAlbums = unique(songs, s => s.album);

  return {
    main: {
      title: 'iPod',
      items: [
        { id: 'music', label: 'Music', type: 'navigation', target: 'music', hasChevron: true },
        { id: 'videos', label: 'Videos', type: 'navigation', target: 'videoGallery', hasChevron: true },
        { id: 'photos', label: 'Photos', type: 'navigation', target: 'photoGallery', hasChevron: true },
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
        { id: 'artists', label: 'Artists', type: 'navigation', target: 'artists', hasChevron: true },
        { id: 'albums', label: 'Albums', type: 'navigation', target: 'albums', hasChevron: true },
        { id: 'songs', label: 'Songs', type: 'navigation', target: 'songs', hasChevron: true },
      ],
    },
    videos: {
      title: 'Videos',
      parent: 'main',
      items: [
        { id: 'movies', label: 'Movies', type: 'navigation', target: 'songs', hasChevron: true },
        { id: 'musicVideos', label: 'Music Videos', type: 'navigation', target: 'songs', hasChevron: true },
      ]
    },
    videoGallery: {
      title: 'Gallery',
      parent: 'main',
      items: [],
    },
    photoGallery: {
      title: 'Photos',
      parent: 'main',
      items: [],
    },
    photos: {
      title: 'Photos',
      parent: 'main',
      items: photos.length > 0
        ? [{ id: 'allPhotos', label: `All Photos (${photos.length})`, type: 'navigation', target: 'photoViewer', hasChevron: true }]
        : [{ id: 'noPhotos', label: 'No Photos', type: 'action' }],
    },
    artists: {
      title: 'Artists',
      parent: 'music',
      items: uniqueArtists.map(s => ({
        id: `art_${s.id}`, label: s.artist, type: 'navigation' as const, target: 'songs' as MenuID, hasChevron: true
      })),
    },
    albums: {
      title: 'Albums',
      parent: 'music',
      items: uniqueAlbums.map(s => ({
        id: `alb_${s.id}`, label: s.album, type: 'navigation' as const, target: 'songs' as MenuID, hasChevron: true
      })),
    },
    songs: {
      title: 'Songs',
      parent: 'music',
      items: songs.map(s => ({ id: s.id, label: s.title, type: 'action' as const })),
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
        { id: 'mediaLibrary', label: 'Media Library', type: 'navigation', target: 'mediaLibrary', hasChevron: true },
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
    },
    photoViewer: {
      title: 'Photos',
      parent: 'photos',
      items: [],
    },
    // Media Library sub-menus
    mediaLibrary: {
      title: 'Media Library',
      parent: 'settings',
      items: [
        { id: 'addMusic', label: 'Add Music', type: 'navigation', target: 'addMusic', hasChevron: true },
        { id: 'addPhotos', label: 'Add Photos', type: 'navigation', target: 'addPhotos', hasChevron: true },
        { id: 'manageSongs', label: `Manage Music (${songs.length})`, type: 'navigation', target: 'manageSongs', hasChevron: true },
        { id: 'managePhotos', label: `Manage Photos (${photos.length})`, type: 'navigation', target: 'managePhotos', hasChevron: true },
      ],
    },
    addMusic: {
      title: 'Add Music',
      parent: 'mediaLibrary',
      items: [
        { id: 'addMusicFile', label: 'From File...', type: 'action' },
        { id: 'addMusicUrl', label: 'From URL...', type: 'navigation', target: 'urlInput', hasChevron: true },
      ],
    },
    addPhotos: {
      title: 'Add Photos',
      parent: 'mediaLibrary',
      items: [
        { id: 'addPhotoFile', label: 'From File...', type: 'action' },
        { id: 'addPhotoUrl', label: 'From URL...', type: 'navigation', target: 'urlInput', hasChevron: true },
      ],
    },
    manageSongs: {
      title: 'Manage Music',
      parent: 'mediaLibrary',
      items: songs.length > 0
        ? songs.map(s => ({ id: `del_${s.id}`, label: s.title, type: 'action' as const }))
        : [{ id: 'noSongs', label: 'No Songs', type: 'action' as const }],
    },
    managePhotos: {
      title: 'Manage Photos',
      parent: 'mediaLibrary',
      items: photos.length > 0
        ? photos.map(p => ({ id: `del_${p.id}`, label: p.title, type: 'action' as const }))
        : [{ id: 'noPhotos', label: 'No Photos', type: 'action' as const }],
    },
    urlInput: {
      title: 'Add URL',
      parent: 'mediaLibrary',
      items: [],
    },
  };
}
