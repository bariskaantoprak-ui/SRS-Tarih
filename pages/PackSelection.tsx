import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards, getDueCards } from '../services/storageService';
import { Flashcard, CardStatus } from '../types';

interface PackStat {
  tag: string;
  total: number;
  mastered: number;
  due: number;
}

const PackSelection: React.FC = () => {
  const navigate = useNavigate();
  const [packStats, setPackStats] = useState<PackStat[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    const allCards = getCards();
    const dueCards = getDueCards();
    
    // Group by Tag to create "Virtual Packs"
    const statsMap: Record<string, PackStat> = {};

    allCards.forEach(card => {
      if (!statsMap[card.tag]) {
        statsMap[card.tag] = { tag: card.tag, total: 0, mastered: 0, due: 0 };
      }
      statsMap[card.tag].total += 1;
      if (card.status === CardStatus.Graduated) {
        statsMap[card.tag].mastered += 1;
      }
      // Check if due
      if (card.dueDate <= Date.now()) {
        statsMap[card.tag].due += 1;
      }
    });

    setPackStats(Object.values(statsMap));
    setTotalDue(dueCards.length);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleStartSession = () => {
    if (selectedTags.length === 0 && totalDue > 0) {
       // If nothing selected but cards are available, ask user or select all due
       if(window.confirm("Hiçbir paket seçmediniz. Bekleyen tüm kartlarla çalışılsın mı?")) {
           navigate('/session'); // No state means all tags
       }
       return;
    }
    
    navigate('/session', { state: { selectedTags } });
  };

  const handleSelectAll = () => {
      if (selectedTags.length === packStats.length) {
          setSelectedTags([]);
      } else {
          setSelectedTags(packStats.map(p => p.tag));
      }
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-paper dark:bg-slate-950 transition-colors">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-display font-bold text-dark dark:text-white">Çalışma Planı</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Hangi konulara odaklanmak istersin?</p>
      </header>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-cyan-500/30 mb-8 flex justify-between items-center">
          <div>
              <p className="text-cyan-100 font-medium text-xs uppercase tracking-wider mb-1">Toplam Bekleyen</p>
              <div className="text-4xl font-display font-bold">{totalDue}</div>
              <p className="text-cyan-100 text-sm opacity-80">Kart tekrar edilmeli</p>
          </div>
          <button 
            onClick={() => navigate('/session')}
            className="bg-white text-primary px-6 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
              Hızlı Başla ⚡
          </button>
      </div>

      <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-dark dark:text-white">Paketlerin</h2>
          <button 
            onClick={handleSelectAll}
            className="text-sm font-bold text-primary hover:text-secondary transition-colors"
          >
              {selectedTags.length === packStats.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </button>
      </div>

      {packStats.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800">
              <p className="text-gray-400 font-medium mb-4">Henüz hiç kart paketin yok.</p>
              <button 
                onClick={() => navigate('/create')}
                className="text-primary font-bold underline"
              >
                  Yeni Paket Oluştur
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packStats.map((pack) => {
                const isSelected = selectedTags.includes(pack.tag);
                const progress = Math.round((pack.mastered / pack.total) * 100) || 0;
                
                return (
                    <div 
                        key={pack.tag}
                        onClick={() => toggleTag(pack.tag)}
                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                            isSelected 
                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 shadow-soft' 
                            : 'bg-white dark:bg-slate-900 border-transparent dark:border-slate-800 shadow-sm hover:border-gray-200 dark:hover:border-slate-700'
                        }`}
                    >
                        {/* Selection Indicator */}
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                            ? 'bg-cyan-500 border-cyan-500' 
                            : 'border-gray-300 dark:border-slate-600'
                        }`}>
                            {isSelected && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        <h3 className="font-bold text-dark dark:text-white text-lg mb-1 pr-8">{pack.tag}</h3>
                        <div className="flex gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                            <span>{pack.total} Kart</span>
                            {pack.due > 0 && (
                                <span className="text-rose-500 font-bold">{pack.due} Bekleyen</span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-emerald-600 dark:text-emerald-400">% {progress} Öğrenildi</span>
                        </div>
                    </div>
                );
            })}
          </div>
      )}

      {/* Floating Action Button for Start */}
      {selectedTags.length > 0 && (
          <div className="fixed bottom-24 md:bottom-10 left-0 right-0 px-6 flex justify-center z-30 animate-in slide-in-from-bottom-10 fade-in">
              <button 
                onClick={handleStartSession}
                className="bg-dark dark:bg-white text-white dark:text-dark px-10 py-4 rounded-full font-bold shadow-2xl shadow-black/20 text-lg active:scale-95 transition-transform flex items-center gap-2"
              >
                  <span>{selectedTags.length} Paket ile Başla</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
              </button>
          </div>
      )}
    </div>
  );
};

export default PackSelection;