
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song } from '../../types';
import { themBaiHat, capNhatBaiHat, xoaBaiHat } from '../../services/Baihat';
import { getLyricsFromAI } from '../../services/gemini';
const MusicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);
interface SongManagementProps {
  songs: Song[];
  onRefresh: () => void;
}

const SongManagement: React.FC<SongManagementProps> = ({ songs, onRefresh }) => {
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isAIFetching, setIsAIFetching] = useState(false);
  const [isFetchingDuration, setIsFetchingDuration] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formSong, setFormSong] = useState<Omit<Song, 'id'>>({
    title: '', artist: '', album: '', coverUrl: '', audioUrl: '', duration: 0, genre: ''
  });

  const durationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // Lọc bài hát theo từ khóa tìm kiếm
  const filteredSongs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  const fetchDuration = (url: string) => {
    if (!url || !url.startsWith('http')) return;
    setIsFetchingDuration(true);
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const d = Math.round(audio.duration);
      if (d) setFormSong(prev => ({ ...prev, duration: d }));
      setIsFetchingDuration(false);
    };
    audio.onerror = () => setIsFetchingDuration(false);
  };

  useEffect(() => {
    if (durationTimeoutRef.current) window.clearTimeout(durationTimeoutRef.current);
    if (formSong.audioUrl.startsWith('http')) {
        durationTimeoutRef.current = window.setTimeout(() => fetchDuration(formSong.audioUrl), 800);
    }
    return () => { if (durationTimeoutRef.current) window.clearTimeout(durationTimeoutRef.current); };
  }, [formSong.audioUrl]);
  const handleFetchLyrics = async () => {
    if (!formSong.title || !formSong.artist) {
      alert("Hãy nhập tên bài hát và nghệ sĩ trước nhé!");
      return;
    }
    setIsAIFetching(true);
    const lyrics = await getLyricsFromAI(formSong.title, formSong.artist);
    setFormSong(prev => ({ ...prev, lyrics }));
    setIsAIFetching(false);
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSongId) {
        await capNhatBaiHat(editingSongId, formSong);
        setStatusMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await themBaiHat(formSong);
        setStatusMsg({ type: 'success', text: 'Đã thêm thành công!' });
      }
      resetForm();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Lỗi không xác định.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingSongId(null);
    setFormSong({ title: '', artist: '', album: '', coverUrl: '', audioUrl: '', duration: 0, genre: '' });
    setShowForm(false);
  };

  const startEdit = (song: Song) => {
    setEditingSongId(song.id);
    setFormSong({ ...song });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-32">
      {/* Sticky Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl sticky top-28 z-40 shadow-2xl">
        <div className="relative w-full md:w-[450px]">
          <input 
            type="text" 
            placeholder="Tìm theo tên bài hát, nghệ sĩ hoặc thể loại..." 
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-12 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Library Status</p>
            <p className="text-sm font-black">{filteredSongs.length} / {songs.length} bài hát</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-widest"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Thêm mới
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`fixed bottom-10 right-10 z-[100] p-6 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-500 ${
          statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className="flex items-center gap-4 font-black text-sm uppercase tracking-widest">
            {statusMsg.type === 'success' ? '✓' : '✕'} {statusMsg.text}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-300 backdrop-blur-3xl">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-[350px] space-y-6">
              <div className="aspect-square w-full bg-black rounded-[3rem] border-4 border-white/5 overflow-hidden flex items-center justify-center relative shadow-inner">
                {formSong.coverUrl ? (
                  <img src={formSong.coverUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <MusicIcon />
                    <span className="text-[10px] font-black uppercase">Chưa có ảnh</span>
                  </div>
                )}
                {isFetchingDuration && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Thời lượng bài hát</p>
                 <p className="text-2xl font-black text-white">{Math.floor(formSong.duration / 60)}:{String(formSong.duration % 60).padStart(2, '0')}</p>
              </div>
            </div>

            <form onSubmit={handleSaveSong} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center justify-between mb-2">
                 <h3 className="text-2xl font-black text-white">{editingSongId ? 'Chỉnh sửa bài hát' : 'Nhập bài hát mới'}</h3>
                 <button type="button" onClick={resetForm} className="text-zinc-500 hover:text-white font-bold text-sm">Đóng ✕</button>
              </div>
              {[
                { id: 'title', label: 'Tên bài hát', placeholder: 'Vd: Midnight City' },
                { id: 'artist', label: 'Nghệ sĩ', placeholder: 'Vd: M83' },
                { id: 'genre', label: 'Thể loại', placeholder: 'Vd: Synthpop, EDM...' },
                { id: 'coverUrl', label: 'Link ảnh bìa', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.id} className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">{field.label}</label>
                  <input 
                    required 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-bold transition-all" 
                    value={(formSong as any)[field.id]} 
                    placeholder={field.placeholder}
                    onChange={e => setFormSong({...formSong, [field.id]: e.target.value})} 
                  />
                </div>
              ))}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">URL File âm thanh (.mp3)</label>
                <input 
                  required 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-bold transition-all" 
                  value={formSong.audioUrl} 
                  placeholder="https://example.com/song.mp3"
                  onChange={e => setFormSong({...formSong, audioUrl: e.target.value})} 
                />
              </div>
               <div className="space-y-2 h-full flex flex-col">
              <div className="flex items-center justify-between ml-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lời bài hát (AI-Ready)</label>
                <button 
                  type="button" 
                  onClick={handleFetchLyrics}
                  disabled={isAIFetching}
                  className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {isAIFetching ? 'Đang tìm...' : '🪄 Lấy lời bằng AI'}
                </button>
              </div>
              <textarea 
                className="flex-1 w-full bg-black/40 border border-white/5 rounded-xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium transition-all resize-none min-h-[250px] custom-scrollbar"
                placeholder="Dán lời hoặc dùng nút AI bên trên..."
                value={formSong.lyrics} onChange={e => setFormSong({...formSong, lyrics: e.target.value})}
              ></textarea>
            </div>
              <div className="md:col-span-2 pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting || isFetchingDuration} 
                  className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl disabled:opacity-20 uppercase text-[11px] tracking-[0.3em]"
                >
                  {isSubmitting ? 'Đang ghi dữ liệu...' : 'Hoàn tất & Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid List bài hát */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-5 min-w-0">
              <div className="relative w-16 h-16 flex-shrink-0">
                <img src={song.coverUrl} className="w-full h-full rounded-2xl object-cover shadow-2xl border border-white/5" alt="" />
                <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white truncate text-base leading-tight group-hover:text-indigo-400 transition-colors">{song.title}</p>
                <p className="text-zinc-500 text-[10px] font-black truncate mt-1 uppercase tracking-wider">{song.artist}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="px-2 py-0.5 bg-indigo-600/10 text-indigo-400 text-[8px] font-black rounded-md uppercase tracking-widest">{song.genre}</span>
                   <span className="text-[9px] text-zinc-700 font-bold">{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <button 
                onClick={() => startEdit(song)} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 text-zinc-400 rounded-xl hover:bg-white hover:text-black transition-all border border-white/5"
                title="Chỉnh sửa"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button 
                onClick={async () => { if(confirm("Bạn có chắc chắn muốn xóa bài hát này khỏi hệ thống?")) { await xoaBaiHat(song.id); onRefresh(); } }} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 text-zinc-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-white/5"
                title="Xóa bài"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredSongs.length === 0 && (
        <div className="text-center py-24 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
          <div className="mb-4 text-zinc-700 flex justify-center"><MusicIcon /></div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Không có bài hát nào khớp với "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default SongManagement;
