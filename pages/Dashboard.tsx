import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStats, getDueCards } from '../services/storageService';
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

  const chartData = [
    { name: 'Yeni', count: stats.new, color: '#6366f1' }, // Primary
    { name: 'Tekrar', count: stats.due, color: '#f43f5e' }, // Accent
    { name: 'Bitmiş', count: stats.mastered, color: '#10b981' }, // Success
  ];

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

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Main Action & Stats */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
            {/* Main Call to Action */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
                <div className="relative z-10">
                <h2 className="text-indigo-100 font-medium mb-2 uppercase tracking-wider text-xs">Günlük Hedef</h2>
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-soft border border-gray-50 dark:border-slate-800">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <div className="text-3xl font-bold text-dark dark:text-white font-display">{stats.total}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mt-1">Toplam Kart</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-soft border border-gray-50 dark:border-slate-800">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <div className="text-3xl font-bold text-dark dark:text-white font-display">{stats.mastered}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mt-1">Ezberlenen</div>
                </div>
            </div>
        </div>

        {/* Right Column: Charts */}
        <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 h-full min-h-[300px]">
                <h3 className="text-xl font-bold text-dark dark:text-white mb-5 font-display">İlerleme Grafiği</h3>
                <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 13, fill: '#94a3b8', fontWeight: 500}} 
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                            fontFamily: 'Inter',
                            padding: '10px 15px',
                            backgroundColor: '#1e293b', // Slate 800 for dark tooltip
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={45}>
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;