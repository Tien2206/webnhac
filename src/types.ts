
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  genre: string;
  isLiked?: boolean;
  lyrics?: string;
}

export type ActiveMenu = 
  | 'home' 
  | 'search' 
  | 'explore' 
  | 'library' 
  | 'liked' 
  | 'playing' 
  | 'artists' 
  | 'artist-detail'
  | 'albums' 
  | 'recent' 
  | 'playlists'
  | 'admin';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  suggestedSongs?: Song[];
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Song[];
  history: Song[];
  activeMenu: ActiveMenu;
  likedSongIds: string[];
}
export type AdminMenu = 'dashboard' | 'songs';