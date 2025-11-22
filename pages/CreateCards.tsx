import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCards, getUserPacks, createUserPack, getCards, getAddedPremadeDecks, markPremadeDeckAdded } from '../services/storageService';
import { createNewCard } from '../services/srsAlgorithm';
import { PREMADE_DECKS, PremadeDeck } from '../data/premadeDecks';
import { Flashcard, UserPack } from '../types';

const CreateCards: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'packs' | 'csv'>('manual');
  
  // Manual States
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [similarCard, setSimilarCard] = useState<Flashcard | null>(null);
  
  // Pack Management
  const [packs, setPacks] = useState<UserPack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [newPackName, setNewPackName] = useState('');
  const [showPackInput, setShowPackInput] = useState(false);

  // Packs States
  const [addedDecks, setAddedDecks] = useState<string[]>([]);

  // CSV States
  const [csvPreview, setCsvPreview] = useState<Flashcard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // All Cards for similarity check
  const [allCards, setAllCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const userPacks = getUserPacks();
    setPacks(userPacks);
    if (userPacks.length > 0) {
      setSelectedPackId(userPacks[userPacks.length - 1].id); // Select latest or first
    }
    setAllCards(getCards());
    setAddedDecks(getAddedPremadeDecks());
  }, []);

  // Similarity Check Effect
  useEffect(() => {
    if (manualFront.length > 5) {
        const found = allCards.find(c => c.front.toLowerCase().includes(manualFront.toLowerCase()));
        setSimilarCard(found || null);
    } else {
        setSimilarCard(null);
    }
  }, [manualFront, allCards]);

  const handleCreatePack = () => {
    if (!newPackName.trim()) return;
    
    const newPack = createUserPack(newPackName.trim());
    const updatedPacks = [...packs, newPack];
    setPacks(updatedPacks);
    setSelectedPackId(newPack.id); // Auto select the new pack
    setNewPackName('');
    setShowPackInput(false);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFront.trim() || !manualBack.trim()) return;
    
    if (!selectedPackId && packs.length === 0) {
      alert("Lütfen önce bir paket oluşturun.");
      return;
    }

    const currentPack = packs.find(p => p.id === selectedPackId);
    const tagName = currentPack ? currentPack.name : 'Genel';

    const newCard = createNewCard(manualFront, manualBack, tagName);
    addCards([newCard]);
    
    // Refresh all cards for next similarity check
    setAllCards(prev => [...prev, newCard]);

    setManualFront('');
    setManualBack('');
  };

  const handleAddPremade = (deck: PremadeDeck) => {
    const newCards = deck.cards.map(c => createNewCard(c.front, c.back, c.tag));
    addCards(newCards);
    markPremadeDeckAdded(deck.id);
    setAddedDecks(prev => [...prev, deck.id]);
    // Removed navigation to allow adding multiple packs
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result as string;
      const lines = text.split('\n');
      const parsedCards: Flashcard[] = [];

      lines.forEach((line, index) => {
        if (!line.trim()) return; 
        let parts = line.split(';');
        if (parts.length < 2) {
            parts = line.split(',');
        }

        if (parts.length >= 2) {
          const front = parts[0].trim();
          const back = parts[1].trim();
          const tag = parts[2] ? parts[2].trim() : 'İçe Aktarılan';
          
          if (front && back) {
            parsedCards.push(createNewCard(front, back, tag));
          }
        }
      });

      setCsvPreview(parsedCards);
    };
    reader.readAsText(file);
  };

  const importCSVCards = () => {
    if (csvPreview.length === 0) return;
    addCards(csvPreview);
    alert(`${csvPreview.length} adet kart başarıyla eklendi!`);
    setCsvPreview([]);
    navigate('/');
  };

  const downloadTemplate = () => {
    const csvContent = "Soru Örneği;Cevap Örneği;Konu Etiketi\nİstanbul'un Fethi?;1453;Yükselme Dönemi";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tarihkart_sablon.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-paper dark:bg-slate-950 transition-colors">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-display font-bold text-dark dark:text-white">Kart Ekle</h1>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200/50 dark:bg-slate-800 rounded-2xl mb-8 max-w-md">
        <button 
          onClick={() => setActiveTab('manual')} 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Manuel
        </button>
        <button 
          onClick={() => setActiveTab('packs')} 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'packs' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Paketler
        </button>
        <button 
          onClick={() => setActiveTab('csv')} 
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'csv' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          CSV (Excel)
        </button>
      </div>
      
      {/* Manual Entry Section */}
      {activeTab === 'manual' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
             <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             </div>
             <h2 className="font-bold text-dark dark:text-white text-lg">Kart Oluştur</h2>
          </div>

          {/* Pack Selection Logic */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Paket (Deste) Seç</label>
            
            <div className="flex gap-2 items-start">
                {showPackInput ? (
                    <div className="flex-1 flex gap-2 animate-in fade-in zoom-in duration-200">
                        <input 
                          type="text" 
                          value={newPackName}
                          onChange={(e) => setNewPackName(e.target.value)}
                          placeholder="Yeni paket adı..."
                          className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-primary/30 focus:border-primary outline-none text-sm font-bold dark:text-white"
                          autoFocus
                        />
                        <button 
                          onClick={handleCreatePack}
                          className="bg-primary text-white px-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/30"
                        >
                          Ekle
                        </button>
                         <button 
                          onClick={() => setShowPackInput(false)}
                          className="text-gray-400 px-2 font-bold"
                        >
                          ✕
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex gap-2">
                         <select 
                          value={selectedPackId} 
                          onChange={(e) => setSelectedPackId(e.target.value)}
                          className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-dark dark:text-white font-bold outline-none focus:border-primary appearance-none"
                          disabled={packs.length === 0}
                         >
                           {packs.length === 0 && <option>Paket Yok</option>}
                           {packs.map(pack => (
                             <option key={pack.id} value={pack.id}>{pack.name}</option>
                           ))}
                         </select>
                         <button 
                            onClick={() => setShowPackInput(true)}
                            className="bg-gray-100 dark:bg-slate-800 text-primary px-4 rounded-xl font-bold text-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            title="Yeni Paket Oluştur"
                         >
                             +
                         </button>
                    </div>
                )}
            </div>
            {packs.length === 0 && !showPackInput && (
                <p className="text-xs text-orange-500 mt-2 font-bold">* Kart eklemek için önce '+' butonuna basarak bir paket oluşturun.</p>
            )}
          </div>

          <form onSubmit={handleManualAdd} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Soru (Ön Yüz)</label>
              <textarea
                value={manualFront}
                onChange={(e) => setManualFront(e.target.value)}
                placeholder="Örn: İstanbul kaç yılında fethedildi?"
                rows={3}
                disabled={packs.length === 0}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-dark dark:text-white font-medium placeholder-gray-400 disabled:opacity-50 resize-none"
              />
              {/* Similar Card Warning */}
              {similarCard && (
                  <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <span className="text-xl">⚠️</span>
                      <div>
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">Benzer Kart Bulundu</p>
                          <p className="text-sm text-dark dark:text-white font-medium">"{similarCard.front}"</p>
                      </div>
                  </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cevap (Arka Yüz)</label>
              <input
                type="text"
                value={manualBack}
                onChange={(e) => setManualBack(e.target.value)}
                placeholder="Örn: 1453"
                disabled={packs.length === 0}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-dark dark:text-white font-medium placeholder-gray-400 disabled:opacity-50"
              />
            </div>
            
            <button
              type="submit"
              disabled={packs.length === 0}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-emerald-500/20 bg-emerald-500 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              Kartı Ekle
            </button>
          </form>
        </div>
      )}

      {/* Premade Decks Section */}
      {activeTab === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {PREMADE_DECKS.map((deck) => {
            const isAdded = addedDecks.includes(deck.id);
            return (
              <div key={deck.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 flex flex-col relative overflow-hidden h-full">
                <div className="flex justify-between items-start mb-2 z-10">
                  <div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                      deck.examType === 'KPSS' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                      deck.examType === 'AYT' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {deck.examType}
                    </span>
                    <h3 className="text-lg font-display font-bold text-dark dark:text-white mt-3 leading-tight">{deck.title}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-400">
                    {deck.cardCount}
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2 z-10 font-medium">{deck.description}</p>
                <div className="mt-auto">
                    <button 
                    onClick={() => handleAddPremade(deck)}
                    disabled={isAdded}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all z-10 ${
                        isAdded 
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-600 cursor-default' 
                        : 'bg-gray-50 dark:bg-slate-800 text-primary hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95'
                    }`}
                    >
                    {isAdded ? 'Kütüphaneye Eklendi' : 'Paketi Ekle'}
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Import Section */}
      {activeTab === 'csv' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 max-w-2xl">
          {/* CSV Content kept same as previous version */}
           <div className="flex items-center gap-3 mb-5">
             <div className="bg-blue-50 dark:bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
             </div>
             <h2 className="font-bold text-dark dark:text-white text-lg">Toplu Kart Yükle</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-sm text-blue-800 dark:text-blue-300">
               <p className="font-bold mb-2">Nasıl Çalışır?</p>
               <p>Excel veya Not Defteri ile bir dosya oluşturun. Her satıra bir kart gelecek şekilde yazın. Ayraç olarak noktalı virgül (;) kullanın.</p>
               <button 
                onClick={downloadTemplate}
                className="mt-3 text-xs font-bold underline hover:text-blue-600"
               >
                 Örnek Şablonu İndir
               </button>
            </div>

            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">CSV Dosyası Seç</span>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleCSVUpload}
                    accept=".csv,.txt"
                    className="hidden" 
                />
            </div>

            {csvPreview.length > 0 && (
                <div className="animate-in fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Önizleme ({csvPreview.length} Kart)</span>
                        <button onClick={() => setCsvPreview([])} className="text-xs text-red-500 font-bold">Temizle</button>
                    </div>
                    <button
                        onClick={importCSVCards}
                        className="w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 bg-blue-600 active:scale-95 transition-transform"
                    >
                        {csvPreview.length} Kartı İçeri Aktar
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCards;