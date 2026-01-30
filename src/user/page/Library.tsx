
import React from 'react';
import { Song } from '../../types';

interface LibraryProps {
  likedSongs: Song[];
  onPlaySong: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  onNavigateHome: () => void;
}

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const Library: React.FC<LibraryProps> = ({ likedSongs, onPlaySong, onToggleLike, onNavigateHome }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-6 space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Big Heart Card */}
        <div className="w-64 h-64 bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] rounded-[3.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(74,0,224,0.3)] relative group overflow-hidden">
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="text-white scale-[2.5]">
              <HeartIcon filled />
           </div>
        </div>

        <div className="text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-3">Thư viện của bạn</p>
          <h2 className="text-7xl font-black tracking-tighter text-white mb-2">Bài hát đã thích</h2>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">{likedSongs.length} BÀI HÁT</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-[#121214]/30 border border-white/5 rounded-[4rem] min-h-[450px] overflow-hidden backdrop-blur-sm">
        {likedSongs.length > 0 ? (
          <div className="p-8">
            <div className="grid grid-cols-1 gap-2">
              {likedSongs.map((song, i) => (
                <div 
                  key={song.id} 
                  onClick={() => onPlaySong(song)} 
                  className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5"
                >
                  <span className="w-8 text-center text-zinc-700 font-black text-sm">{i + 1}</span>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                    <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xl group-hover:text-indigo-400 transition-colors truncate">{song.title}</p>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{song.artist}</p>
                  </div>
                  <div className="hidden md:block text-zinc-500 font-bold text-sm px-4">{song.album}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(song.id); }} 
                    className="text-red-500 p-4 hover:scale-125 transition-transform"
                  >
                    <HeartIcon filled />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[450px] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <div className="opacity-10 scale-[2] text-zinc-400">
               <HeartIcon filled={false} />
            </div>
            <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-sm">Bạn chưa thích bài hát nào</p>
            <button 
              onClick={onNavigateHome}
              className="px-10 py-4 bg-transparent border-2 border-white/10 rounded-full text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all shadow-xl"
            >
              Khám phá ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
