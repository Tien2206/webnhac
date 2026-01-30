
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Song, AdminMenu } from '../../types';
import { ngheBaiHatRealtime } from '../../services/Baihat';
import SongManagement from '../page/SongManagement';

const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const MusicIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const ZapIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

const AdminApp: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Sử dụng realtime để Dashboard luôn cập nhật số liệu mới nhất
    const unsubscribe = ngheBaiHatRealtime((data) => {
      setSongs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Tính toán thống kê thể loại dựa trên dữ liệu thật
  const genreStats = useMemo(() => {
    const stats: Record<string, number> = {};
    songs.forEach(s => {
      const g = s.genre || 'Chưa phân loại';
      stats[g] = (stats[g] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [songs]);

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-zinc-100 font-['Inter']">
      {/* Sidebar Admin */}
      <aside className="w-72 border-r border-white/5 bg-zinc-950 flex flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-16 px-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter">MusiControl</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveMenu('dashboard')} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              activeMenu === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <DashboardIcon /> Tổng quan
          </button>
          <button 
            onClick={() => setActiveMenu('songs')} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
              activeMenu === 'songs' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <MusicIcon /> Kho bài hát
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-4">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gemini AI</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
            </div>
            <p className="text-[11px] font-bold text-zinc-300">Connected & Stable</p>
          </div>
          
         <Link to="/" className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-400/10 transition-all">
            <LogoutIcon /> Thoát Backend
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/10 via-zinc-950 to-zinc-950">
        <header className="h-24 flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-3xl sticky top-0 z-40 bg-zinc-950/50">
           <div className="flex flex-col">
             <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">MusiGemini Console</h2>
             <p className="text-xl font-black tracking-tight">{activeMenu === 'dashboard' ? 'Thống kê hệ thống' : 'Quản lý kho bài hát'}</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black">Admin Manager</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online Now</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10 shadow-lg flex items-center justify-center font-black">AD</div>
           </div>
        </header>

        <div className="p-12">
          {activeMenu === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
               {/* Quick Stats Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Thư viện nhạc</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-6xl font-black tracking-tighter">{songs.length}</h3>
                      <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-1">
                        +3 Mới <ZapIcon />
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Dung lượng Data</p>
                    <h3 className="text-6xl font-black tracking-tighter">1.2<span className="text-2xl text-zinc-600 ml-2">GB</span></h3>
                  </div>
                  
                  <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Lượt dùng AI</p>
                    <h3 className="text-6xl font-black tracking-tighter">248</h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Genre Distribution Chart */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-10">
                      <h4 className="text-xl font-black tracking-tight">Phân phối Thể loại</h4>
                      <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tự động</div>
                    </div>
                    
                    <div className="space-y-8">
                      {genreStats.length > 0 ? genreStats.map(([genre, count]) => (
                        <div key={genre} className="space-y-3">
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                             <span className="text-zinc-300">{genre}</span>
                             <span className="text-indigo-400">{count} bài hát</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${(count / songs.length) * 100}%` }}
                             ></div>
                           </div>
                        </div>
                      )) : (
                        <p className="text-center text-zinc-600 italic py-10">Chưa có dữ liệu phân tích</p>
                      )}
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] p-10">
                    <h4 className="text-xl font-black tracking-tight mb-8">Nhật ký Hệ thống</h4>
                    <div className="space-y-6">
                      {[
                        { time: 'Vừa xong', user: 'Gemini DJ', action: 'Gợi ý nhạc cho User_88', color: 'text-indigo-400' },
                        { time: '10 phút trước', user: 'Admin', action: 'Cập nhật metadata bài: Faded', color: 'text-emerald-400' },
                        { time: '1 giờ trước', user: 'System', action: 'Tự động tối ưu Database', color: 'text-zinc-400' },
                        { time: '2 giờ trước', user: 'User_42', action: 'Tìm kiếm "Pop 2024"', color: 'text-indigo-400' },
                      ].map((log, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_8px_#6366f1]"></div>
                           <div className="flex-1 flex justify-between items-start">
                             <div className="space-y-1">
                               <p className="text-xs font-black uppercase tracking-tight text-white">{log.user}</p>
                               <p className={`text-[11px] font-medium ${log.color}`}>{log.action}</p>
                             </div>
                             <span className="text-[9px] font-black text-zinc-600 uppercase">{log.time}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeMenu === 'songs' && (
            <div className="animate-in fade-in duration-500">
               <SongManagement songs={songs} onRefresh={() => {}} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminApp;
