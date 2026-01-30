
import React, { useState } from 'react';
import { Song } from '../../types';
import { getMusicRecommendations } from '../../services/gemini';

interface ExploreProps {
  songs: Song[];
  onPlaySong: (song: Song) => void;
}

const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>;

const Explore: React.FC<ExploreProps> = ({ songs, onPlaySong }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<{title: string, artist: string}[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moods = [
    { id: 'chill', label: 'Chill & Relax', icon: '☁️', color: 'from-blue-500 to-teal-400' },
    { id: 'energy', label: 'Năng lượng', icon: '⚡', color: 'from-orange-500 to-yellow-400' },
    { id: 'happy', label: 'Vui vẻ', icon: '🎉', color: 'from-pink-500 to-rose-400' },
    { id: 'deep', label: 'Sâu lắng', icon: '🌙', color: 'from-indigo-600 to-purple-500' },
  ];

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setIsAiLoading(true);
    const recs = await getMusicRecommendations(mood);
    setAiRecs(recs);
    setIsAiLoading(false);
  };

  const findSongInLibrary = (title: string) => {
    return songs.find(s => s.title.toLowerCase().includes(title.toLowerCase()));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 py-8">
      {/* AI Mood Discovery */}
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-4xl font-black tracking-tighter">AI Discovery</h3>
          <p className="text-zinc-500 font-medium">Chọn tâm trạng để Gemini DJ tìm nhạc cho bạn</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {moods.map(mood => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.label)}
              className={`relative h-44 rounded-[2.5rem] overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 shadow-2xl ${
                selectedMood === mood.label ? 'ring-4 ring-white ring-offset-4 ring-offset-[#020202]' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="text-5xl group-hover:scale-125 transition-transform duration-500">{mood.icon}</span>
                <span className="font-black text-lg tracking-tight">{mood.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* AI Recommendations Result */}
      {(isAiLoading || aiRecs.length > 0) && (
        <section className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">G</div>
            <div>
              <h4 className="font-black text-xl tracking-tight uppercase">Gợi ý từ Gemini</h4>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dựa trên vibe "{selectedMood}"</p>
            </div>
          </div>

          {isAiLoading ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Đang quét vũ trụ âm nhạc...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiRecs.map((rec, i) => {
                const localSong = findSongInLibrary(rec.title);
                return (
                  <div key={i} className="bg-black/40 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 group hover:bg-white/5 transition-all">
                    <div className="flex-1">
                      <p className="text-white font-black text-lg leading-tight group-hover:text-indigo-400 transition-colors">{rec.title}</p>
                      <p className="text-zinc-500 text-sm font-bold uppercase mt-1">{rec.artist}</p>
                    </div>
                    
                    {localSong ? (
                      <button 
                        onClick={() => onPlaySong(localSong)}
                        className="w-full bg-white text-black py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5"
                      >
                        <PlayIcon /> NGHE NGAY TRONG MÁY
                      </button>
                    ) : (
                      <div className="py-3 px-4 bg-zinc-900/50 rounded-xl text-[10px] font-bold text-zinc-600 uppercase text-center border border-white/5 italic">
                        Chưa có trong thư viện
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Trending / Newest in Library */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight">Mới nhất trong kho</h3>
          <div className="h-px flex-1 bg-white/5 mx-6"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {songs.slice(0, 6).map(song => (
            <div key={song.id} onClick={() => onPlaySong(song)} className="group cursor-pointer">
              <div className="aspect-square rounded-3xl overflow-hidden mb-3 relative border border-white/5 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all">
                <img src={song.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><PlayIcon /></div>
              </div>
              <p className="font-bold text-[13px] truncate">{song.title}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explore;
