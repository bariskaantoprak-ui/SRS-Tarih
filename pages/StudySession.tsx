import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDueCards, updateCard, trackStudyProgress, getSettings } from '../services/storageService';
import { processReview } from '../services/srsAlgorithm';
import { Flashcard, Rating, Achievement } from '../types';
import FlashcardView from '../components/FlashcardView';
// @ts-ignore
import confetti from 'canvas-confetti';

interface HistoryState {
  originalCard: Flashcard;
  queueIndex: number;
  wasRequeued: boolean;
  action: 'rate';
}

const StudySession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionOver, setSessionOver] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  
  // Cram Mode State
  const [isCramMode, setIsCramMode] = useState(false);
  const [cramStats, setCramStats] = useState({ correct: 0, total: 0 });
  
  // Undo History Stack
  const [history, setHistory] = useState<HistoryState[]>([]);
  
  // Feedback states
  const [feedback, setFeedback] = useState<{text: string, type: 'success' | 'warning' | 'info'} | null>(null);
  const [screenFlash, setScreenFlash] = useState<'green' | 'red' | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  // Timer
  const cardStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const initSession = () => {
      // Check router state
      const state = location.state as { cramMode?: boolean; cards?: Flashcard[]; selectedTags?: string[] } | null;

      if (state?.cramMode && state.cards && state.cards.length > 0) {
        // Cram Mode: Use passed cards, shuffle them
        setIsCramMode(true);
        const shuffled = [...state.cards].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
      } else {
        // Standard Mode: Get due cards
        let due = getDueCards();
        
        // Filter by Selected Tags/Packs if provided
        if (state?.selectedTags && state.selectedTags.length > 0) {
            due = due.filter(card => state.selectedTags!.includes(card.tag));
        }

        const sessionQueue = due.slice(0, 20); 
        setQueue(sessionQueue);
      }
      setIsLoading(false);
    };

    initSession();
  }, [location.state]);

  // Reset timer when card changes
  useEffect(() => {
    cardStartTime.current = Date.now();
  }, [currentCardIndex]);

  const showFeedbackMessage = (type: 'success' | 'warning' | 'info', text: string) => {
    setFeedback({ type, text });
    if (type === 'success' || type === 'warning') {
        setScreenFlash(type === 'success' ? 'green' : 'red');
        setTimeout(() => {
            setScreenFlash(null);
        }, 300);
    }
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleRate = useCallback((rating: Rating) => {
    const currentCard = queue[currentCardIndex];
    if (!currentCard) return;

    // Calculate duration
    const duration = Math.round((Date.now() - cardStartTime.current) / 1000);
    
    // 1. HISTORY FOR UNDO
    const wasRequeued = rating === Rating.Again;
    setHistory(prev => [...prev, {
      originalCard: JSON.parse(JSON.stringify(currentCard)), 
      queueIndex: currentCardIndex,
      wasRequeued: wasRequeued && !isCramMode, // In Cram mode we don't requeue usually, just count
      action: 'rate'
    }]);

    // 2. PROCESS LOGIC
    if (isCramMode) {
      // CRAM MODE LOGIC: Don't update DB, just track stats
      setCramStats(prev => ({
        correct: prev.correct + (rating > Rating.Again ? 1 : 0),
        total: prev.total + 1
      }));
      
      // Visual Feedback only
      if (rating === Rating.Again) {
        showFeedbackMessage('warning', 'Yanlış');
      } else {
        showFeedbackMessage('success', 'Doğru');
      }
    } else {
      // STANDARD SRS LOGIC
      const updatedCard = processReview(currentCard, rating);
      updateCard(updatedCard); // Save to DB

      // GAMIFICATION: Track Streak, Achievements, and Time
      const { achievement, reviewsToday } = trackStudyProgress(rating, duration);
      const settings = getSettings();

      // Confetti Trigger
      if (reviewsToday === settings.dailyGoal) {
         confetti({
           particleCount: 100,
           spread: 70,
           origin: { y: 0.6 },
           colors: ['#6366f1', '#f43f5e', '#10b981', '#fbbf24']
         });
         setTimeout(() => showFeedbackMessage('success', 'Günlük Hedef Tamamlandı! 🎉'), 400);
      }

      if (achievement) {
        setNewAchievement(achievement);
        setTimeout(() => setNewAchievement(null), 4000); // Hide after 4s
      }

      if (rating === Rating.Again) {
        setQueue(prev => [...prev, { ...updatedCard, dueDate: Date.now() }]);
        showFeedbackMessage('warning', 'Bilemedin: Destenin sonuna eklendi');
      } else {
        setCompletedCount(prev => prev + 1);
        const days = updatedCard.interval;
        const message = days <= 1 
          ? 'Tekrar: Yarın sorulacak' 
          : `Süper: ${days} gün sonra sorulacak`;
        showFeedbackMessage('success', message);
      }
    }

    // 3. MOVE NEXT
    if (currentCardIndex < queue.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setSessionOver(true);
    }
  }, [queue, currentCardIndex, isCramMode]);

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    const { originalCard, queueIndex, wasRequeued } = lastAction;

    // If Standard Mode, Revert DB
    if (!isCramMode) {
        updateCard(originalCard);
        if (!wasRequeued) {
            setCompletedCount(prev => Math.max(0, prev - 1));
        }
    } else {
        // Revert Cram Stats
         setCramStats(prev => ({
            correct: prev.correct, 
            total: Math.max(0, prev.total - 1)
        }));
    }

    setQueue(prev => {
        const newQueue = [...prev];
        newQueue[queueIndex] = originalCard;
        if (wasRequeued) {
            newQueue.pop(); 
        }
        return newQueue;
    });

    setCurrentCardIndex(queueIndex);
    setSessionOver(false);
    showFeedbackMessage('info', 'İşlem geri alındı');
    setHistory(prev => prev.slice(0, -1));
  };

  // --- EDITING LOGIC ---
  const startEditing = () => {
    const card = queue[currentCardIndex];
    if (card) {
        setEditFront(card.front);
        setEditBack(card.back);
        setIsEditing(true);
    }
  };

  const saveEdit = () => {
    const card = queue[currentCardIndex];
    if (card) {
        const updatedCard = { ...card, front: editFront, back: editBack };
        
        // 1. Update DB
        updateCard(updatedCard);
        
        // 2. Update Queue State
        setQueue(prev => {
            const newQueue = [...prev];
            newQueue[currentCardIndex] = updatedCard;
            return newQueue;
        });
        
        setIsEditing(false);
        showFeedbackMessage('success', 'Kart güncellendi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper dark:bg-slate-950 text-primary transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessionOver || queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-paper dark:bg-slate-950 transition-colors">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-soft animate-bounce ${isCramMode ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-500' : 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'}`}>
          {isCramMode ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m11.172-7.684c.963-.203 1.934-.377 2.916-.52M19.5 4.5c.102.07.202.143.3.222a5.99 5.99 0 0 1 1.432 4.992 6 6 0 0 1-2.636 3.518M19.5 4.5v1.526c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0C18.25 9.11 18 8.07 18 7.057V4.5m-2.48 5.228a6.726 6.726 0 0 1-2.748 1.35" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )}
        </div>
        
        <h2 className="text-3xl font-display font-bold text-dark dark:text-white mb-2">
            {isCramMode ? 'Sınav Bitti' : 'Harika İş!'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
            {isCramMode ? 'Sonuçların aşağıda.' : 'Bugünkü çalışma hedefini tamamladın.'}
        </p>
        
        {isCramMode ? (
            <div className="w-full max-w-xs mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-gray-50 dark:border-slate-800">
                <div className="text-5xl font-black text-dark dark:text-white mb-2">
                    %{Math.round((cramStats.correct / cramStats.total) * 100) || 0}
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Başarı Oranı</div>
                <div className="flex justify-between text-sm font-medium border-t dark:border-slate-800 pt-4">
                    <span className="text-green-500">{cramStats.correct} Doğru</span>
                    <span className="text-red-500">{cramStats.total - cramStats.correct} Yanlış</span>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-center shadow-sm border border-green-100 dark:border-green-900/30">
                    <span className="block text-3xl font-bold text-emerald-500">{completedCount}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Öğrenilen</span>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-center shadow-sm border border-orange-100 dark:border-orange-900/30">
                    <span className="block text-3xl font-bold text-orange-500">{queue.length - completedCount}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tekrar Sayısı</span>
                 </div>
            </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => navigate('/')}
              className="bg-dark dark:bg-white dark:text-dark text-white px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Ana Ekrana Dön
            </button>
            {isCramMode && (
                <button 
                  onClick={() => navigate('/library')}
                  className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-8 py-4 rounded-2xl font-bold active:scale-95 transition-transform"
                >
                  Kütüphaneye Dön
                </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-slate-950 pt-4 pb-20 overflow-hidden relative transition-colors">
      
      <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-300 ${
          screenFlash === 'green' ? 'bg-green-500/10' : 
          screenFlash === 'red' ? 'bg-red-500/10' : 'bg-transparent'
      }`}></div>

      {/* Achievement Celebration Notification (Top Slide Down - Softened) */}
      {newAchievement && (
        <div className="fixed top-8 left-0 right-0 z-[70] flex justify-center pointer-events-none animate-in slide-in-from-top-full fade-in duration-700 ease-out">
           <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-amber-300 dark:border-amber-500/50 p-4 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-4 mx-4 max-w-md w-full">
              <div className="text-4xl shrink-0 animate-bounce">
                  {newAchievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-amber-500 font-black uppercase tracking-widest text-[10px] mb-0.5">Yeni Başarım!</h2>
                <h3 className="text-lg font-display font-bold text-dark dark:text-white leading-tight truncate">{newAchievement.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{newAchievement.description}</p>
              </div>
           </div>
        </div>
      )}

      {/* Feedback Toast */}
      <div className={`fixed top-28 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
        feedback ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        {feedback && (
          <div className={`px-6 py-3 rounded-full shadow-xl font-bold text-sm backdrop-blur-md flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-green-500/90 text-white' : 
            feedback.type === 'warning' ? 'bg-red-500/90 text-white' :
            'bg-gray-700/90 text-white'
          }`}>
            {feedback.text}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="px-6 mb-2 flex justify-between items-center z-10">
        <button onClick={() => navigate(isCramMode ? '/library' : '/study')} className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>

        {isCramMode && (
             <div className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm border border-orange-200 dark:border-orange-900">
                 Sınav Modu
             </div>
        )}

        <div className="flex items-center gap-3">
            <button 
                onClick={startEditing}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                title="Kartı Düzenle"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>

            <div className="flex flex-col items-end">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kalan</div>
                 <div className="text-lg font-display font-bold text-dark dark:text-white">
                   {queue.length - currentCardIndex}
                 </div>
            </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full px-6 mb-4 relative z-10">
          <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out rounded-full ${isCramMode ? 'bg-orange-500' : 'bg-gradient-to-r from-primary to-secondary'}`}
                style={{ width: `${((currentCardIndex) / queue.length) * 100}%` }}
              ></div>
          </div>
      </div>

      <div className="flex-grow px-4 relative flex flex-col justify-start pt-4 z-10">
        {queue[currentCardIndex] && (
            <FlashcardView 
              card={queue[currentCardIndex]} 
              onRate={handleRate} 
              onUndo={handleUndo}
              canUndo={history.length > 0}
            />
        )}
        
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500 font-medium px-10">
            {isCramMode 
                ? <span className="text-orange-500">Sınav modunda sonuçlar veritabanına kaydedilmez.</span>
                : <>Kartı <span className="text-red-400 font-bold">SOLA</span> kaydırırsan sona atılır.<br/>
                  <span className="text-green-500 font-bold">SAĞA</span> kaydırırsan öğrenilmiş sayılır.</>
            }
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-dark dark:text-white">Kartı Düzenle</h2>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-dark dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Soru</label>
                        <textarea 
                            value={editFront}
                            onChange={(e) => setEditFront(e.target.value)}
                            rows={3}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-primary outline-none font-medium text-dark dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cevap</label>
                        <input 
                            type="text"
                            value={editBack}
                            onChange={(e) => setEditBack(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-primary outline-none font-medium text-dark dark:text-white"
                        />
                    </div>

                    <button 
                        onClick={saveEdit}
                        className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
                    >
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudySession;