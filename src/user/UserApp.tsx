
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ngheBaiHatRealtime } from "../services/Baihat";
import { Song, ChatMessage, PlayerState, ActiveMenu } from '../types';
import { chatWithAI } from '../services/gemini';
import SongDetail from './page/SongDetail';
import Explore from './page/Explore';
import Library from './page/Library';

// Icons

const HomeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ExploreIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const LibraryIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>;
const CategoryIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>;
const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>;
const ProfileIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const HeartIcon = ({ filled }: { filled?: boolean }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={filled ? "text-red-500" : ""}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const PauseIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const PrevIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>;
const NextIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
const ShuffleIcon = ({ active }: { active?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366f1" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
const RepeatIcon = ({ active }: { active?: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#6366f1" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const VolumeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;

const UserApp: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string>('Tất cả');
  const [recentSongs, setRecentSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('musi_recent_songs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { return []; }
    }
    return [];
  });
  const [player, setPlayer] = useState<PlayerState>(() => {
    const saved = localStorage.getItem('musi_player_state');
    const defaultState: PlayerState = {
      currentSong: null, isPlaying: false, progress: 0, volume: 0.7, queue: [], history: [], activeMenu: 'home', likedSongIds: []
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          ...parsed,
          activeMenu: 'home', // Luôn khởi đầu tại Trang chủ
          isPlaying: false,
          likedSongIds: Array.isArray(parsed.likedSongIds) ? parsed.likedSongIds : [] // Tránh tự động phát nhạc khi tải lại trang
        };
      } catch (e) { return defaultState; }
    }
    return defaultState;
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ 
    role: 'model', 
    text: 'Chào mừng bạn đến với MusiGemini! Tôi đã sẵn sàng kết nối với dữ liệu Firebase của bạn. 🎵', 
    timestamp: Date.now() 
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAIThinking]);
useEffect(() => {
  const unsubscribe = ngheBaiHatRealtime((data) => {
    if (!data || data.length === 0) {
      setIsLoading(false);
      return;
    }

    setSongs(data);
    setRecentSongs(prev => {
        const valid = prev.filter(rs => data.some(s => s.id === rs.id));
        return valid;
      });
    // Lấy bài hát đã lưu
    let savedSongId: string | null = null;
    try {
      const saved = localStorage.getItem('musi_player_state');
      savedSongId = saved ? JSON.parse(saved)?.currentSongId : null;
    } catch (e) {
      console.warn('LocalStorage parse error');
    }

    setPlayer(prev => {
  let currentSong = prev.currentSong;

  if (!currentSong && savedSongId) {
    currentSong = data.find(s => s.id === savedSongId) || null;
  }

  if (!currentSong) {
    currentSong = data[0];
  }

  return {
    ...prev,
    currentSong,
    queue: data
  };
});


    setIsLoading(false);
  });

  return () => unsubscribe();
}, []); 
 useEffect(() => {
    localStorage.setItem('musi_recent_songs', JSON.stringify(recentSongs));
  }, [recentSongs]);
useEffect(() => {
  if (!player.currentSong) return;

  const stateToSave = {
    currentSongId: player.currentSong.id,
    isPlaying: player.isPlaying,
    volume: player.volume,   
    activeMenu: 'playing', // 🔥 ép đúng menu khi có bài
    updatedAt: Date.now(),
    likedSongIds: player.likedSongIds // optional (debug sau này)
  };

  localStorage.setItem(
    'musi_player_state',
    JSON.stringify(stateToSave)
  );
}, [
  player.currentSong?.id,
  player.isPlaying,
  player.volume,
  player.likedSongIds
]);

 const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  const toggleLike = (songId: string) => {
    setPlayer(prev => {
      const likedIds = prev.likedSongIds || [];
      const isLiked = likedIds.includes(songId);
      const newLiked = isLiked 
        ? likedIds.filter(id => id !== songId) 
        : [...likedIds, songId];
      return { ...prev, likedSongIds: newLiked };
    });
  };
  const playSong = (song: Song) => {
    setPlayer(prev => ({ 
      ...prev, 
      currentSong: song, 
      isPlaying: true, 
      activeMenu: 'playing' 
    }));
    setRecentSongs(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 15); // Lưu tối đa 15 bài
      return updated;
    });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (player.isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setPlayer(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };
  const nextSong = () => {
    if (songs.length === 0) return;
    let nextIdx = songs.findIndex(s => s.id === player.currentSong?.id) + 1;
    if (isShuffle) nextIdx = Math.floor(Math.random() * songs.length);
    if (nextIdx >= songs.length) nextIdx = 0;
    playSong(songs[nextIdx]);
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    let prevIdx = songs.findIndex(s => s.id === player.currentSong?.id) - 1;
    if (prevIdx < 0) prevIdx = songs.length - 1;
    playSong(songs[prevIdx]);
  };
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!chatInput.trim() || isAIThinking) return;

    const userMsg = chatInput;
    setChatInput('');
    setIsAIThinking(true);
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);

    const responseText = await chatWithAI(userMsg, chatHistory, songs);
    setIsAIThinking(false);

    const playMatch = responseText.match(/\[PLAY:(.+?)\]/);
    if (playMatch && playMatch[1]) {
      const songId = playMatch[1];
      const targetSong = songs.find(s => s.id === songId);
      if (targetSong) playSong(targetSong);
    }

    const cleanText = responseText.replace(/\[PLAY:.+?\]/g, '').trim();
    setChatHistory(prev => [...prev, { role: 'model', text: cleanText, timestamp: Date.now() }]);
  };
  const menuItems = [
    { id: 'home', icon: <HomeIcon />, label: 'Trang chủ' },
    { id: 'explore', icon: <ExploreIcon />, label: 'Khám phá' },
    { id: 'library', icon: <LibraryIcon />, label: 'Thư viện' },
    { id: 'category', icon: <CategoryIcon />, label: 'Thể loại' },
    { id: 'search', icon: <SearchIcon />, label: 'Tìm kiếm' },
  ];

  const genres = useMemo(() => {
    const g = Array.from(new Set(songs.map(s => s.genre)));
    return ['Tất cả', ...g];
  }, [songs]);

  const filteredByGenre = useMemo(() => {
    if (activeGenre === 'Tất cả') return songs;
    return songs.filter(s => s.genre === activeGenre);
  }, [songs, activeGenre]);

  const heroSong = useMemo(() => {
    return songs[0] || null;
  }, [songs]);

  const likedSongs = useMemo(() => {
    return songs.filter(s => player.likedSongIds.includes(s.id));
  }, [songs, player.likedSongIds]);
  return (
    <div className="flex h-screen bg-[#020202] text-white font-['Inter'] overflow-hidden">
      <audio 
        ref={audioRef}
  src={player.currentSong?.audioUrl}
  autoPlay={player.isPlaying}
  onTimeUpdate={() => {
    if (!audioRef.current) return;

    const { currentTime, duration } = audioRef.current;
    if (!duration || isNaN(duration)) return;

    setPlayer(p => ({
      ...p,
      progress: (currentTime / duration) * 100
    }));
  }}
      />

      {/* --- SIDEBAR --- */}
      <aside className="w-16 flex flex-col items-center py-6 gap-8 border-r border-white/5 z-50">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform">
          <PlayIcon />
        </div>
        
        <div className="flex flex-col gap-6 mt-4">
          <button className="text-zinc-500 hover:text-white transition-colors p-2"><ProfileIcon /></button>
          <button className="text-zinc-500 hover:text-white transition-colors p-2"><HeartIcon /></button>
        </div>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`mt-auto w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isChatOpen ? 'bg-indigo-600 text-white' : 'bg-[#121214] text-indigo-400 border border-white/5'}`}
        >
          AI
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative">
        
        {/* --- TOP PILL NAVIGATION --- */}
        <header className="h-20 flex items-center justify-center relative px-8 z-40">
          <div className="bg-[#121214] rounded-2xl p-1 flex gap-1 border border-white/5 shadow-2xl">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPlayer(p => ({ ...p, activeMenu: item.id as ActiveMenu }))}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                  player.activeMenu === item.id 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-500/20">AI</div>
          </div>
        </header>

        {/* --- SCROLLABLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-12 pb-44">
          {isLoading ? (
            <div className="h-full flex items-center justify-center opacity-30">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
          ) : (
            <>
              {player.activeMenu === 'home' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pt-6">
                  {heroSong && (
                    <div className="relative h-[380px] rounded-[3.5rem] overflow-hidden group border border-white/5 shadow-2xl">
                       <img src={heroSong.coverUrl} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent"></div>
                       <div className="absolute bottom-12 left-12 right-12 flex flex-col items-start gap-4">
                         <span className="bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Bài hát nổi bật</span>
                         <h2 className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl">{heroSong.title}</h2>
                         <p className="text-2xl font-bold text-zinc-300 mb-4">{heroSong.artist}</p>
                         <button 
                            onClick={() => playSong(heroSong)}
                            className="bg-white text-black px-10 py-5 rounded-2xl font-black flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                         >
                           <PlayIcon size={24} /> PHÁT NGAY
                         </button>
                       </div>
                    </div>
                  )}

                  {recentSongs.length > 0 && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black tracking-tight">Vừa nghe gần đây</h3>
                       </div>
                       <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                         {recentSongs.map(song => (
                           <div key={song.id} onClick={() => playSong(song)} className="flex-shrink-0 w-44 group cursor-pointer">
                             <div className="aspect-square rounded-3xl overflow-hidden mb-3 relative border border-white/5 shadow-xl">
                               <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><PlayIcon size={24} /></div>
                             </div>
                             <p className="font-bold text-sm truncate">{song.title}</p>
                             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{song.artist}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black tracking-tight">Dành cho bạn</h3>
                       <div className="flex gap-2 p-1 bg-[#121214] rounded-2xl border border-white/5">
                          {genres.map(g => (
                            <button 
                              key={g} 
                              onClick={() => setActiveGenre(g)}
                              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeGenre === g ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >{g.toUpperCase()}</button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                      {filteredByGenre.map(song => (
                        <div key={song.id} onClick={() => playSong(song)} className="group cursor-pointer">
                          <div className="aspect-square bg-[#121214] rounded-[2.5rem] overflow-hidden mb-4 relative shadow-2xl border border-white/5">
                            <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><PlayIcon size={32} /></div>
                          </div>
                          <p className="font-bold text-base truncate group-hover:text-indigo-400 transition-colors">{song.title}</p>
                          <p className="text-sm text-zinc-500 mt-1 truncate font-medium">{song.artist}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {player.activeMenu === 'explore' && (
                <Explore songs={songs} onPlaySong={playSong} />
              )}
              {player.activeMenu === 'library' && (
                <Library 
                  likedSongs={likedSongs} 
                  onPlaySong={playSong} 
                  onToggleLike={toggleLike}
                  onNavigateHome={() => setPlayer(p => ({...p, activeMenu: 'home'}))}
                />
              )}

              {player.activeMenu === 'profile' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-6 max-w-4xl mx-auto">
                   <div className="bg-[#121214] border border-white/5 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                      <div className="relative flex flex-col items-center text-center gap-6">
                         <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-purple-600 p-1">
                            <div className="w-full h-full bg-black rounded-[2.3rem] flex items-center justify-center font-black text-4xl">U</div>
                         </div>
                         <div>
                            <h2 className="text-4xl font-black tracking-tight">Musi User</h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Premium Member</p>
                         </div>

                         <div className="grid grid-cols-3 gap-10 mt-10 w-full">
                            <div className="space-y-1">
                               <p className="text-3xl font-black">{likedSongs.length}</p>
                               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Bài hát thích</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-3xl font-black">{recentSongs.length}</p>
                               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Đã nghe</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-3xl font-black">AI</p>
                               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Trợ lý Gemini</p>
                            </div>
                         </div>

                         <div className="w-full mt-12 pt-12 border-t border-white/5">
                            <h4 className="text-left text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 px-4">Cài đặt tài khoản</h4>
                            <div className="space-y-2">
                               <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center justify-between transition-all group">
                                  <span className="font-bold text-zinc-300 group-hover:text-white">Chất lượng âm thanh</span>
                                  <span className="text-xs text-indigo-500 font-black uppercase">High (Lossless)</span>
                               </button>
                               <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center justify-between transition-all group">
                                  <span className="font-bold text-zinc-300 group-hover:text-white">Lịch sử tìm kiếm</span>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                               </button>
                               <button className="w-full text-left p-4 rounded-2xl hover:bg-rose-500/10 flex items-center justify-between transition-all group">
                                  <span className="font-bold text-rose-500">Đăng xuất</span>
                                  <svg className="text-rose-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
              {player.activeMenu === 'search' && (
                <div className="max-w-2xl mx-auto pt-10 animate-in fade-in duration-500">
                  <div className="relative mb-12">
                    <input 
                      type="text" placeholder="Tìm kiếm bài hát, nghệ sĩ..." 
                      className="w-full bg-[#121214] border border-white/10 rounded-2xl py-6 px-10 focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-bold transition-all"
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-600"><SearchIcon /></div>
                  </div>
                  <div className="space-y-4">
                    {songs.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase())).map(song => (
                      <div key={song.id} onClick={() => playSong(song)} className="flex items-center gap-5 p-5 bg-[#121214] rounded-3xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5">
                        <img src={song.coverUrl} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{song.title}</p>
                          <p className="text-xs text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">{song.artist}</p>
                        </div>
                        <PlayIcon />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {player.activeMenu === 'playing' && player.currentSong && (
                <div className="animate-in fade-in duration-700">
                  <SongDetail 
                    song={player.currentSong}
                    isPlaying={player.isPlaying}
                    progress={player.progress}
                    currentTime={audioRef.current?.currentTime || 0}
                    onTogglePlay={togglePlay}
                    isLiked={(player.likedSongIds || []).includes(player.currentSong.id)}
                    onToggleLike={() => toggleLike(player.currentSong!.id)}
                    onSeek={(p) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = audioRef.current.duration * p;
                      }
                    }}
                    onBack={() => setPlayer(p => ({...p, activeMenu: 'home'}))}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* --- FLOATING PILL PLAYER --- */}
        {player.currentSong && (
          <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#0a0a0b]/95 backdrop-blur-2xl border-t border-white/5 px-8 flex items-center justify-between z-[100] shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
            {/* Left: Info */}
            <div className="flex items-center gap-4 w-[30%] min-w-0">
              <div 
                className={`w-14 h-14 rounded-full overflow-hidden shadow-2xl border-2 border-white/5 flex-shrink-0 cursor-pointer ${player.isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
                onClick={() => setPlayer(p => ({...p, activeMenu: 'playing'}))}
              >
                <img src={player.currentSong.coverUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate text-white hover:text-indigo-400 cursor-pointer" onClick={() => setPlayer(p => ({...p, activeMenu: 'playing'}))}>{player.currentSong.title}</p>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest truncate">{player.currentSong.artist}</p>
              </div>
              <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors ml-2"><HeartIcon /></button>
            </div>

            {/* Center: Controls & Progress */}
            <div className="flex-1 flex flex-col items-center max-w-2xl px-10">
              <div className="flex items-center gap-6 mb-2">
                <button onClick={() => setIsShuffle(!isShuffle)} className="text-zinc-500 hover:text-white transition-all"><ShuffleIcon active={isShuffle} /></button>
                <button onClick={prevSong} className="text-zinc-500 hover:text-white transition-all"><PrevIcon /></button>
                <button onClick={togglePlay} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                  {player.isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
                </button>
                <button onClick={nextSong} className="text-zinc-500 hover:text-white transition-all"><NextIcon /></button>
                <button onClick={() => setIsRepeat(!isRepeat)} className="text-zinc-500 hover:text-white transition-all"><RepeatIcon active={isRepeat} /></button>
              </div>
              
              <div className="w-full flex items-center gap-3 group">
                <span className="text-[9px] font-black text-zinc-500 min-w-[35px] text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
                <div 
                  className="flex-1 h-1 bg-white/5 rounded-full relative cursor-pointer overflow-hidden group-hover:h-1.5 transition-all"
                  onClick={(e) => {
                    if(!audioRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const p = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = audioRef.current.duration * p;
                  }}
                >
                  <div className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" style={{width: `${player.progress}%`}} />
                </div>
                <span className="text-[9px] font-black text-zinc-500 min-w-[35px]">{formatTime(audioRef.current?.duration || 0)}</span>
              </div>
            </div>

            {/* Right: Volume & Extra */}
            <div className="flex items-center justify-end gap-6 w-[30%]">
              <div className="flex items-center gap-2 group w-32">
                <VolumeIcon />
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={player.volume} 
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if(audioRef.current) audioRef.current.volume = v;
                    setPlayer(p => ({...p, volume: v}));
                  }}
                  className="flex-1 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-white" 
                />
              </div>
              <div className="w-[1px] h-6 bg-white/5"></div>
              <button className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all" title="Danh sách chờ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* --- RIGHT AI CHAT SIDEBAR --- */}
      {isChatOpen && (
        <aside className={`w-[350px] border-l border-white/5 flex flex-col bg-[#080809] animate-in slide-in-from-right duration-500 z-[110] ${player.currentSong ? 'pb-24' : ''}`}>
          <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/20">G</div>
              <div>
                <p className="font-black text-sm tracking-tight text-white uppercase">Gemini DJ</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sẵn sàng quẩy</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-zinc-600 hover:text-white transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-xl ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none' 
                  : 'bg-[#121214] text-zinc-300 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAIThinking && (
              <div className="flex justify-start">
                <div className="bg-[#121214] p-4 rounded-2xl flex gap-1.5 border border-white/5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-5 border-t border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md">
            <form onSubmit={handleChatSubmit} className="relative flex items-center bg-[#121214] rounded-2xl p-1.5 border border-white/5 shadow-inner focus-within:border-indigo-500/50 transition-all">
              <input 
                type="text" 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                placeholder="Yêu cầu nhạc, hỏi về nghệ sĩ..." 
                className="flex-1 bg-transparent border-none py-3 px-4 outline-none text-sm text-white placeholder:text-zinc-700"
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || isAIThinking}
                className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
            <p className="text-[9px] text-zinc-600 mt-3 text-center uppercase font-bold tracking-[0.2em]">Powered by Gemini 3 Flash</p>
          </div>
        </aside>
      )}
    </div>
  );
};

export default UserApp;

