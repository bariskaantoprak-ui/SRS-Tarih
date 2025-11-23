import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStats, getCards } from '../services/storageService';
import { DeckStats, Achievement, Flashcard } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Widget States
  const [dailyCard, setDailyCard] = useState<Flashcard | null>(null);
  const [isDailyCardFlipped, setIsDailyCardFlipped] = useState(false);

  useEffect(() => {
    const data = getStats();
    setStats(data);
    setDueCount(data.due);
    pickDailyCard();
  }, []);

  const pickDailyCard = () => {
    const allCards = getCards();
    if (allCards.length > 0) {
        const random = allCards[Math.floor(Math.random() * allCards.length)];
        setDailyCard(random);
        setIsDailyCardFlipped(false);
    }
  };

  if (!stats) return <div className="p-6 text-center flex items-center justify-center h-screen dark:text-white">Yükleniyor...</div>;

  const cardDistributionData = [
    { name: 'Yeni', count: stats.new, color: '#06b6d4' }, // Cyan 500 (Primary)
    { name: 'Tekrar', count: stats.due, color: '#f43f5e' }, // Accent
    { name: 'Bitmiş', count: stats.mastered, color: '#10b981' }, // Success
  ];

  const progressPercent = Math.min(100, Math.round((stats.reviewsToday / stats.dailyGoal) * 100));
  
  // Format time
  const formatTime = (seconds: number) => {
      if (seconds < 60) return `${seconds}sn`;
      return `${Math.floor(seconds / 60)}dk`;
  };

  return (
    <div className="p-6 md:p-10 min-h-screen pb-24 bg-paper dark:bg-slate-950 transition-colors relative">
      <header className="mb-8 flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-dark dark:text-white tracking-tight">NetKart</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Bugünün Çalışma Özeti</p>
        </div>
        <Link to="/settings" className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-gray-400 hover:text-primary transition-colors border border-gray-100 dark:border-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </Link>
      </header>

      {/* Streak Counter */}
      <div className="flex items-center gap-2 mb-6">
         <div className="flex items-center bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900 px-4 py-2 rounded-full">
            <span className="text-xl animate-pulse mr-2">🔥</span>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
               {stats.streak} Günlük Seri
            </span>
         </div>
      </div>

      {/* Daily Goal Progress Bar */}
      <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft border border-gray-50 dark:border-slate-800">
         <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Günlük Hedef</span>
            <span className="text-sm font-bold text-dark dark:text-white">
                <span className="text-primary">{stats.reviewsToday}</span> / {stats.dailyGoal}
            </span>
         </div>
         <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
            ></div>
         </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Action, Forecast, Heatmap */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
            
            {/* Forecast & Average Time Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-soft border border-gray-50 dark:border-slate-800">
                   <div className="text-xs font-bold text-gray-400 uppercase mb-1">Tahmini Bitiş</div>
                   <div className="text-2xl font-display font-bold text-dark dark:text-white">
                       {stats.forecastDays === 0 ? 'Bitti 🎉' : `${stats.forecastDays} Gün`}
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1 leading-tight">Yeni kartların bitmesi için gereken süre.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-soft border border-gray-50 dark:border-slate-800">
                   <div className="text-xs font-bold text-gray-400 uppercase mb-1">Ortalama Süre</div>
                   <div className="text-2xl font-display font-bold text-dark dark:text-white">
                       {formatTime(stats.averageTimePerDay)}
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1 leading-tight">Günlük ortalama çalışma süren.</p>
                </div>
            </div>

            {/* Main Call to Action */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white shadow-lg shadow-cyan-500/30 relative overflow-hidden">
                <div className="relative z-10">
                <h2 className="text-cyan-100 font-medium mb-2 uppercase tracking-wider text-xs">Bekleyen Kartlar</h2>
                <div className="text-6xl font-display font-bold mb-3 tracking-tight">{dueCount}</div>
                <p className="text-cyan-100 opacity-90 mb-8 font-medium">kart tekrar edilmeyi bekliyor.</p>
                
                <div className="flex gap-4 max-w-md">
                    {dueCount > 0 ? (
                        <Link 
                        to="/study" 
                        className="flex-1 inline-block bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform text-center hover:bg-gray-50"
                        >
                        Çalışmaya Başla
                        </Link>
                    ) : (
                        <Link 
                        to="/create" 
                        className="flex-1 inline-block bg-white/20 border border-white/40 text-white px-8 py-4 rounded-2xl font-bold backdrop-blur-sm text-center hover:bg-white/30 transition-colors"
                        >
                        Yeni Kart Ekle
                        </Link>
                    )}
                </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl"></div>
            </div>

            {/* "Card of the Day" Widget */}
            {dailyCard && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                             <div className="bg-amber-100 dark:bg-amber-500/20 p-1.5 rounded-lg text-amber-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                             </div>
                             <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Günün Kartı</h3>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); pickDailyCard(); }}
                            className="text-gray-400 hover:text-primary transition-colors p-1"
                            title="Yeni kart getir"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>

                    <div 
                        onClick={() => setIsDailyCardFlipped(!isDailyCardFlipped)}
                        className="cursor-pointer perspective-1000 min-h-[140px] flex items-center justify-center text-center p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all"
                    >
                         <div className="w-full">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">
                                {isDailyCardFlipped ? 'Cevap' : 'Soru'}
                            </p>
                            <p className={`text-lg font-display font-bold ${isDailyCardFlipped ? 'text-primary dark:text-cyan-400' : 'text-dark dark:text-white'} transition-all`}>
                                {isDailyCardFlipped ? dailyCard.back : dailyCard.front}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                Çevirmek için tıkla
                            </p>
                         </div>
                    </div>
                </div>
            )}

            {/* Heatmap Calendar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800">
               <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Son 30 Günlük Aktivite</h3>
               <div className="flex flex-wrap gap-2">
                  {stats.heatmapData.map((day, i) => (
                      <div 
                        key={i} 
                        title={`${day.date}: ${day.count} kart`}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-lg transition-all ${
                            day.level === 0 ? 'bg-gray-100 dark:bg-slate-800' :
                            day.level === 1 ? 'bg-cyan-200 dark:bg-cyan-900/40' :
                            day.level === 2 ? 'bg-cyan-300 dark:bg-cyan-800/60' :
                            day.level === 3 ? 'bg-cyan-400 dark:bg-cyan-600/80' :
                            'bg-cyan-600 dark:bg-cyan-500'
                        }`}
                      ></div>
                  ))}
               </div>
            </div>
        </div>

        {/* Right Column: Charts & Achievements */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
            
            {/* Retention Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 min-h-[220px]">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Haftalık Başarı Oranı</h3>
                <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.retentionGraphData}>
                         <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#94a3b8'}} 
                            dy={10}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                            formatter={(value: number) => [`%${value}`, 'Başarı']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="rate" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={{r: 3, fill: '#10b981', strokeWidth: 0}}
                        />
                    </LineChart>
                </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-emerald-500">%{stats.retentionRate}</span>
                    <span className="text-xs text-gray-400 ml-2">Genel Doğruluk</span>
                </div>
            </div>

             {/* Distribution Chart */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 min-h-[200px]">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">Kart Durumları</h3>
                <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cardDistributionData}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#94a3b8'}} 
                        dy={10}
                    />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={30}>
                        {cardDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Başarımlar</h3>
                  <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                    {stats.achievements.filter(a => a.unlockedAt).length} / {stats.achievements.length}
                  </span>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  {stats.achievements.map(ach => {
                    const isUnlocked = !!ach.unlockedAt;
                    return (
                      <button 
                        key={ach.id} 
                        onClick={() => setSelectedAchievement(ach)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border transition-all duration-300 cursor-pointer active:scale-95 hover:shadow-sm ${
                          isUnlocked 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/50' 
                            : 'bg-gray-50 dark:bg-slate-800 border-transparent opacity-60 grayscale'
                        }`}
                        title="Detay için tıkla"
                      >
                         <div className="text-2xl mb-1">{ach.icon}</div>
                         <div className={`text-[9px] font-bold leading-tight ${isUnlocked ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'}`}>
                           {ach.title}
                         </div>
                      </button>
                    )
                  })}
               </div>
            </div>
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedAchievement(null)}>
                <div 
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 ${
                             selectedAchievement.unlockedAt ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-gray-100 dark:bg-slate-800 grayscale'
                        }`}>
                            {selectedAchievement.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">{selectedAchievement.title}</h2>
                        <div className="mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                selectedAchievement.unlockedAt ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400'
                            }`}>
                                {selectedAchievement.unlockedAt ? 'Kazanıldı' : 'Kilitli'}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium mb-6">{selectedAchievement.description}</p>
                        
                        <button 
                            onClick={() => setSelectedAchievement(null)}
                            className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-dark dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;