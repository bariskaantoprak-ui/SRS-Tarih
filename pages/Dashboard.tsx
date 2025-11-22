import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStats } from '../services/storageService';
import { DeckStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const data = getStats();
    setStats(data);
    setDueCount(data.due);
  }, []);

  if (!stats) return <div className="p-6 text-center flex items-center justify-center h-screen dark:text-white">Yükleniyor...</div>;

  const cardDistributionData = [
    { name: 'Yeni', count: stats.new, color: '#6366f1' }, // Primary
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
    <div className="p-6 md:p-10 min-h-screen pb-24 bg-paper dark:bg-slate-950 transition-colors">
      <header className="mb-8 flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-dark dark:text-white tracking-tight">TarihKart</h1>
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
            <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
                <div className="relative z-10">
                <h2 className="text-indigo-100 font-medium mb-2 uppercase tracking-wider text-xs">Bekleyen Kartlar</h2>
                <div className="text-6xl font-display font-bold mb-3 tracking-tight">{dueCount}</div>
                <p className="text-indigo-100 opacity-90 mb-8 font-medium">kart tekrar edilmeyi bekliyor.</p>
                
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
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
            </div>

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
                            day.level === 1 ? 'bg-indigo-200 dark:bg-indigo-900/40' :
                            day.level === 2 ? 'bg-indigo-300 dark:bg-indigo-800/60' :
                            day.level === 3 ? 'bg-indigo-400 dark:bg-indigo-600/80' :
                            'bg-indigo-600 dark:bg-indigo-500'
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
                      <div 
                        key={ach.id} 
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border transition-all duration-300 ${
                          isUnlocked 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/50' 
                            : 'bg-gray-50 dark:bg-slate-800 border-transparent opacity-40 grayscale'
                        }`}
                        title={ach.description}
                      >
                         <div className="text-2xl mb-1">{ach.icon}</div>
                         <div className={`text-[9px] font-bold leading-tight ${isUnlocked ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'}`}>
                           {ach.title}
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;