
import React, { useState } from 'react';
import { Song } from '../../types';
import Visualizer from '../components/Visualizer';

interface SongDetailProps {
  song: Song;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  isLiked: boolean;
  onTogglePlay: () => void;
  onToggleLike: () => void;
  onSeek: (percent: number) => void;
  onBack: () => void;
}

const SongDetail: React.FC<SongDetailProps> = ({ 
  song, isPlaying, progress, currentTime, isLiked, onTogglePlay, onToggleLike, onSeek, onBack 
}) => {
  const [viewMode, setViewMode] = useState<'visualizer' | 'lyrics'>('visualizer');
  const [isDownloading, setIsDownloading] = useState(false);
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(song.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title} - ${song.artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Lỗi khi tải nhạc:", error);
      // Fallback nếu fetch bị chặn CORS
      window.open(song.audioUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 animate-in zoom-in-95 duration-700 py-10 relative">
      {/* Nút quay lại trang chủ */}
      <button 
        onClick={onBack} 
        className="absolute top-0 -left-6 lg:-left-12 flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all z-30 group border border-white/5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-1 transition-transform">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span className="text-sm font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white">Trang chủ</span>
      </button>

      {/* Album Art with Animation */}
      <div className="w-full max-w-[400px] lg:max-w-[480px] flex-shrink-0 relative mt-16 lg:mt-0">
        <div className="relative aspect-square z-20">
          <div className={`absolute -inset-10 bg-indigo-600/20 blur-[100px] -z-10 rounded-full transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
          
          <img 
            src={song.coverUrl} 
            className={`w-full h-full rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] object-cover border-8 border-white/5 relative z-20 transition-all duration-1000 ${isPlaying ? 'scale-105 rotate-2' : 'scale-100 rotate-0'}`} 
            alt={song.title} 
          />
          
          {/* Vinyl Record Shadow Effect */}
          <div className={`absolute top-0 right-0 w-full h-full bg-zinc-900 rounded-full -z-10 shadow-2xl transition-all duration-1000 border-4 border-zinc-800 ${isPlaying ? 'translate-x-[25%] opacity-100 animate-[spin_10s_linear_infinite]' : 'translate-x-0 opacity-0'}`}
               style={{ backgroundImage: 'repeating-radial-gradient(circle, #222 0, #222 1px, #000 3px, #000 4px)' }}>
          </div>
        </div>
      </div>

      {/* Song Info & Controls */}
      <div className="flex-1 space-y-10 w-full lg:text-left text-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3 lg:justify-start justify-center">
            <span className="bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-indigo-600/30">#{song.genre}</span>
            <span className="text-zinc-500 font-black uppercase text-[10px] tracking-widest border border-white/10 px-3 py-1.5 rounded-full">High Quality</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black tracking-tighter leading-tight text-white">{song.title}</h2>
          <p className="text-3xl lg:text-4xl text-zinc-400 font-bold tracking-tight">{song.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div 
            className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden group cursor-pointer shadow-inner"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              onSeek(percent);
            }}
          >
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(song.duration)}</span>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative min-h-[300px] flex flex-col">
           <div className="flex justify-center gap-4 mb-6">
              <button 
                onClick={() => setViewMode('visualizer')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'visualizer' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
              >Nhịp điệu</button>
              <button 
                onClick={() => setViewMode('lyrics')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'lyrics' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
              >Lời bài hát</button>
           </div>

           {viewMode === 'visualizer' ? (
             <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-500">
               <Visualizer isPlaying={isPlaying} />
               <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3 mb-4 lg:justify-start justify-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_indigo]"></div>
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">AI Insights</p>
                  </div>
                  <p className="text-zinc-300 text-lg italic font-medium leading-relaxed">
                    "Bản nhạc {song.title} mang âm hưởng {song.genre} đặc trưng. Bạn có biết bài này ra mắt trong album {song.album} không?"
                  </p>
               </div>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-4 animate-in slide-in-from-bottom-4 duration-500">
                {song.lyrics ? (
                  <pre className="whitespace-pre-wrap font-['Inter'] text-xl md:text-2xl font-bold text-zinc-300 leading-relaxed text-left">
                    {song.lyrics}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 21V3"/><path d="M8 21V3"/><path d="M16 21V3"/><path d="M4 21V3"/><path d="M20 21V3"/></svg>
                     <p className="font-black uppercase tracking-widest text-xs italic">Dữ liệu lời bài hát đang được cập nhật...</p>
                  </div>
                )}
             </div>
           )}
         <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#121214] to-transparent pointer-events-none"></div>
        </div>
        

        {/* Controls */}
        <div className="flex items-center gap-10 lg:justify-start justify-center pt-4">
          <button 
            onClick={onTogglePlay} 
            className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_20px_80px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          
          <button 
            onClick={onToggleLike} 
            className={`w-16 h-16 rounded-[1.8rem] bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 group ${isLiked ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-zinc-400'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-16 h-16 rounded-[1.8rem] bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 text-zinc-400 active:scale-90 ${isDownloading ? 'opacity-50 animate-pulse' : ''}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;

