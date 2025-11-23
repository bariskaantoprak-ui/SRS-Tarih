import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards, deleteCard, updateCard } from '../services/storageService';
import { Flashcard } from '../types';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'question' | 'answer' | 'tag'>('newest');
  
  // Modals State
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    
    // 1. Filter
    let result = allCards.filter(c => 
      c.front.toLowerCase().includes(lowerSearch) || 
      c.back.toLowerCase().includes(lowerSearch) ||
      c.tag.toLowerCase().includes(lowerSearch)
    );

    // 2. Sort
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'question':
          return a.front.localeCompare(b.front, 'tr');
        case 'answer':
          return a.back.localeCompare(b.back, 'tr');
        case 'tag':
          return a.tag.localeCompare(b.tag, 'tr');
        default:
          return 0;
      }
    });

    setFilteredCards(result);
  }, [search, allCards, sortBy]);

  const loadCards = () => {
    const cards = getCards();
    // Initial load keeps raw order, sorting happens in useEffect
    setAllCards(cards); 
  };

  const confirmDelete = () => {
    if (deletingCardId) {
        deleteCard(deletingCardId);
        setDeletingCardId(null); // Close modal
        loadCards(); // Refresh list
    }
  };

  const handleSaveEdit = () => {
    if (editingCard) {
      updateCard(editingCard);
      setEditingCard(null);
      loadCards();
    }
  };

  const startExam = () => {
    if (filteredCards.length === 0) return;
    // Navigate to study session with CRAM MODE enabled and specific cards
    navigate('/session', { state: { cramMode: true, cards: filteredCards } });
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-paper dark:bg-slate-950 transition-colors">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-display font-bold text-dark dark:text-white">Kütüphane</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{allCards.length} kart bulundu</p>
      </header>

      {/* Search & Actions Container */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-soft border border-gray-50 dark:border-slate-800 mb-6 sticky top-4 z-20">
        <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3.5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input 
                type="text" 
                placeholder="Soru, cevap veya etiket ara..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-dark dark:text-white transition-all placeholder-gray-400"
            />
            </div>

            {/* Sort Dropdown */}
            <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
            </div>
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-dark dark:text-white appearance-none cursor-pointer transition-all"
            >
                <option value="newest">En Son Eklenenler</option>
                <option value="question">Alfabetik (Soru)</option>
                <option value="answer">Alfabetik (Cevap)</option>
                <option value="tag">Alfabetik (Konu)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </div>
            </div>
            
            {/* Start Exam Button */}
            <button 
            onClick={startExam}
            disabled={filteredCards.length === 0}
            className="w-full md:w-auto md:px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 whitespace-nowrap"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {search ? 'Sınav Yap' : 'Sınav Yap'}
            </button>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-10">Kart bulunamadı.</div>
        ) : (
          filteredCards.map(card => (
            <div key={card.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 group animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-1 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 rounded uppercase tracking-wide line-clamp-1 max-w-[70%]">
                  {card.tag}
                </span>
                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingCard(card)} className="text-gray-400 hover:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button onClick={() => setDeletingCardId(card.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-dark dark:text-white text-lg mb-2">{card.front}</h3>
              <div className="flex-grow"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium border-t border-gray-50 dark:border-slate-800 pt-2">{card.back}</p>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCardId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2 dark:text-white">Kartı Sil</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Bu kartı silmek istediğine emin misin? Bu işlem geri alınamaz.</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeletingCardId(null)}
                        className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
                    >
                        Evet, Sil
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Kartı Düzenle</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Soru</label>
                <textarea 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent dark:border-slate-700 font-medium outline-none focus:border-primary"
                  rows={3}
                  value={editingCard.front}
                  onChange={(e) => setEditingCard({...editingCard, front: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Cevap</label>
                <input 
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 dark:text-white rounded-xl border border-transparent dark:border-slate-700 font-medium outline-none focus:border-primary"
                  value={editingCard.back}
                  onChange={(e) => setEditingCard({...editingCard, back: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setEditingCard(null)} 
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;