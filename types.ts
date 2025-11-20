
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  url?: string; // Optional real audio url
}

export interface MenuItem {
  id: string;
  label: string;
  type: 'navigation' | 'action' | 'toggle';
  target?: MenuID;
  action?: () => void;
  hasChevron?: boolean;
}

export type MenuID = 'main' | 'music' | 'videos' | 'photos' | 'extras' | 'settings' | 'nowPlaying' | 'artists' | 'albums' | 'songs' | 'coverFlow' | 'games';

export interface MenuConfig {
  title: string;
  items: MenuItem[];
  parent?: MenuID;
}

export enum WheelAction {
  SCROLL_CW, // Clockwise
  SCROLL_CCW, // Counter-Clockwise
  CLICK_MENU,
  CLICK_SELECT,
  CLICK_NEXT,
  CLICK_PREV,
  CLICK_PLAY_PAUSE
}
