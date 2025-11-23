import React, { useState, useEffect } from 'react';
import { getLeaderboard, addCards } from '../services/storageService';
import { LeaderboardUser, CommunityDeck } from '../types';
import { createNewCard } from '../services/srsAlgorithm';

const Community: React.FC = () => {
  const [tab, setTab] = useState<'leaderboard' | 'decks'>('leaderboard');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  
  // Mock Community Decks
  const mockCommunityDecks: CommunityDeck[] = [
    {
      id: 'comm-1',
      title: 'Coğrafya: Dağlar',
      author: 'AtlasBey',
      description: 'Türkiye\'deki dağların oluşum şekilleri ve yerleri.',
      likes: 124,
      downloads: 56,
      cardCount: 12,
      cards: [{ front: "Ağrı Dağı nasıl bir dağdır?", back: "Volkanik", tag: "Coğrafya" }]
    },
    {
      id: 'comm-2',
      title: 'Edebiyat: Divan Şairleri',
      author: 'ŞiirSever',
      description: 'Yüzyıllara göre divan şairleri ve eserleri.',
      likes: 89,
      downloads: 30,
      cardCount: 15,
      cards: [{ front: "Şikayetname kime aittir?", back: "Fuzuli", tag: "Edebiyat" }]
    },
    {
      id: 'comm-3',
      title: 'Biyoloji: Hücre',
      author: 'BioLab',
      description: 'Hücre organelleri ve görevleri.',
      likes: 210,
      downloads: 104,
      cardCount: 20,
      cards: [{ front: "Mitokondri görevi?", back: "Enerji", tag: "Biyoloji" }]
    }
  ];

  useEffect(() => {
    setUsers(getLeaderboard());
  }, []);

  const handleDownload = (deck: CommunityDeck) => {
     const newCards = deck.cards.map(c => createNewCard(c.front, c.back, c.tag));
     addCards(newCards);
     alert(`${deck.title} destesi kütüphanene eklendi!`);
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-paper dark:bg-slate-950 transition-colors">
       <header className="mb-6 pt-2">
        <h1 className="text-3xl font-display font-bold text-dark dark:text-white">Topluluk</h1>
      </header>

      <div className="flex p-1 bg-gray-200/50 dark:bg-slate-800 rounded-2xl mb-8 max-w-md">
        <button 
          onClick={() => setTab('leaderboard')} 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'leaderboard' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Liderlik Tablosu
        </button>
        <button 
          onClick={() => setTab('decks')} 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'decks' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Keşfet & İndir
        </button>
      </div>

      {tab === 'leaderboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-500/30 h-fit">
              <h3 className="font-bold text-cyan-100 text-sm uppercase tracking-wide mb-1">Haftalık Turnuva</h3>
              <p className="text-2xl font-display font-bold mb-2">İlk 3'e girmek için çalışmaya devam et!</p>
              <p className="text-sm opacity-80">Puanlar her Pazar gece yarısı sıfırlanır. En çok puanı toplayan rozet kazanır.</p>
            </div>

            <div className="space-y-3">
                {users.map((user, index) => (
                    <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-transform hover:scale-[1.01] ${
                        user.isCurrentUser 
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-900 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-gray-50 dark:border-slate-800 shadow-soft'
                        }`}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                            'text-gray-400 dark:text-gray-500'
                        }`}>
                            {index + 1}
                        </div>
                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg">
                            {user.avatar}
                        </div>
                        <div>
                            <div className="font-bold text-dark dark:text-white">{user.name} {user.isCurrentUser && '(Sen)'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Kart Ustası</div>
                        </div>
                    </div>
                    <div className="font-display font-bold text-cyan-600 dark:text-cyan-400 text-lg">
                        {user.xp} <span className="text-xs text-gray-400">XP</span>
                    </div>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
           {mockCommunityDecks.map(deck => (
             <div key={deck.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg text-dark dark:text-white line-clamp-1">{deck.title}</h3>
                   <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                     {deck.cardCount} Kart
                   </span>
                </div>
                <div className="text-sm text-gray-400 font-medium mb-4 flex items-center gap-2">
                   <span>👤 {deck.author}</span>
                   <span>•</span>
                   <span>❤️ {deck.likes}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{deck.description}</p>
                
                <div className="flex gap-2 mt-auto">
                   <button className="flex-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-700">İncele</button>
                   <button 
                    onClick={() => handleDownload(deck)}
                    className="flex-1 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 py-3 rounded-xl font-bold text-sm hover:bg-cyan-100 dark:hover:bg-cyan-500/20"
                   >
                     İndir (+{deck.downloads})
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

    </div>
  );
};

export default Community;