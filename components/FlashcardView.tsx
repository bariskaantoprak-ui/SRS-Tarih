import React, { useState, useEffect, useRef } from 'react';
import { Flashcard, Rating } from '../types';
import { getSettings } from '../services/storageService';

interface Props {
  card: Flashcard;
  onRate: (rating: Rating) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

// Helper to determine icon based on keywords
const getCardIcon = (text: string, tag: string) => {
  const content = (text + " " + tag).toLowerCase();
  const iconClass = "w-12 h-12 opacity-80";

  // WAR / MILITARY
  if (content.match(/savaş|cephe|ordu|asker|fetih|taarruz|savunma|kuvay|müdafaa|sefer|muharebe/)) {
    return (
      <div className="text-rose-300 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 4.5a2.121 2.121 0 0 1 3 3L9 16l-4 1 1-4 8.5-8.5z" />
        </svg>
      </div>
    );
  }

  // LEADER / RULER
  if (content.match(/padişah|sultan|kral|bey|atatürk|paşa|lider|hükümdar|devlet|imparator|han|hakan/)) {
    return (
      <div className="text-amber-300 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
        </svg>
      </div>
    );
  }

  // LAW / AGREEMENT
  if (content.match(/antlaşma|sözleşme|kanun|ferman|genelge|kongre|anayasa|meclis|tbmm|misak/)) {
    return (
      <div className="text-blue-300 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>
    );
  }

  // CULTURE / BOOK
  if (content.match(/eser|kitap|yazar|şair|destan|alfabe|dil|edebiyat|cami|mimari/)) {
    return (
      <div className="text-purple-300 bg-purple-50 dark:bg-purple-500/10 p-4 rounded-full">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
    );
  }

  // DEFAULT / TIME
  return (
    <div className="text-indigo-200 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    </div>
  );
};

const FlashcardView: React.FC<Props> = ({ card, onRate, onUndo, canUndo }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeResult, setSwipeResult] = useState<'left' | 'right' | null>(null);
  const [showIcons, setShowIcons] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startX = useRef(0);
  const startTime = useRef(0);
  const windowWidth = window.innerWidth;
  const SWIPE_THRESHOLD = windowWidth * 0.25; 

  useEffect(() => {
    setIsFlipped(false);
    setDragX(0);
    setSwipeResult(null);
    setIsDragging(false);
    // Check settings
    const settings = getSettings();
    setShowIcons(settings.showVisualHints);
    
    // Cancel speech if card changes
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [card.id]);

  // Keyboard Shortcuts for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
         // Only rate if already flipped
         if (e.key === 'ArrowLeft') {
             triggerRate(Rating.Again);
         } else if (e.key === 'ArrowRight') {
             triggerRate(Rating.Good);
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped]);

  const handleStart = (clientX: number) => {
    if (swipeResult) return;
    startX.current = clientX;
    startTime.current = Date.now();
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || swipeResult) return;
    const deltaX = clientX - startX.current;
    setDragX(deltaX);
  };

  const handleEnd = () => {
    if (!isDragging || swipeResult) return;
    setIsDragging(false);

    const duration = Date.now() - startTime.current;
    const absDrag = Math.abs(dragX);

    // 1. Tap to Flip
    if (duration < 200 && absDrag < 10) {
      setIsFlipped(!isFlipped);
      setDragX(0);
      return;
    }

    // 2. Swipe to Rate
    if (absDrag > SWIPE_THRESHOLD) {
      // IMPORTANT: If card is NOT flipped, swiping should flip it, NOT rate it.
      if (!isFlipped) {
        setIsFlipped(true);
        setDragX(0);
        return;
      }

      const direction = dragX > 0 ? 'right' : 'left';
      triggerRate(direction === 'right' ? Rating.Good : Rating.Again);
    } else {
      setDragX(0);
    }
  };

  const triggerRate = (rating: Rating) => {
    const direction = rating === Rating.Again ? 'left' : 'right';
    setSwipeResult(direction);
    setTimeout(() => {
      onRate(rating);
    }, 300);
  };

  // Text-to-Speech Function
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    const textToSpeak = isFlipped ? card.back : card.front;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'tr-TR'; // Turkish
    utterance.rate = 0.9; // Slightly slower
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => { if(isDragging) handleEnd(); };

  const rotate = (dragX / windowWidth) * 25;
  
  // Visual Feedback Calculation
  // Only show rating overlay if card is flipped
  const opacityRight = isFlipped ? Math.min(Math.max(dragX / (SWIPE_THRESHOLD * 0.8), 0), 1) : 0;
  const opacityLeft = isFlipped ? Math.min(Math.max(-dragX / (SWIPE_THRESHOLD * 0.8), 0), 1) : 0;
  const scaleIcon = 0.5 + (Math.max(opacityRight, opacityLeft) * 0.5); 

  const flyOffX = swipeResult === 'right' ? windowWidth + 200 : swipeResult === 'left' ? -windowWidth - 200 : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-sm md:max-w-md mx-auto h-full relative">
      
      <div className="w-full h-[60vh] max-h-[600px] relative mt-4 select-none perspective-1000">
          <div className="absolute -top-8 w-full flex justify-between text-xs font-bold text-gray-300 dark:text-gray-600 px-4">
            <span className={!isFlipped ? 'opacity-0 transition-opacity' : 'transition-opacity'}>SOLA (veya ←): Tekrar</span>
            <span className={!isFlipped ? 'opacity-0 transition-opacity' : 'transition-opacity'}>SAĞA (veya →): Bildim</span>
          </div>

          {/* Swipe Container */}
          <div 
            className="relative w-full h-full cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{ 
              transform: swipeResult 
                ? `translate(${flyOffX}px, 50px) rotate(${swipeResult === 'right' ? 20 : -20}deg)` 
                : `translate(${dragX}px, 0) rotate(${rotate}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              transformStyle: 'preserve-3d'
            }}
          >
              {/* Success / Right Swipe Overlay */}
              {isFlipped && (
                <div 
                  className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center rounded-3xl bg-green-500/20 border-4 border-green-500"
                  style={{ opacity: opacityRight }}
                >
                  <div className="bg-green-500 text-white rounded-full p-6 shadow-2xl" style={{ transform: `scale(${scaleIcon})` }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                  </div>
                </div>
              )}

              {/* Fail / Left Swipe Overlay */}
              {isFlipped && (
                <div 
                  className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center rounded-3xl bg-red-500/20 border-4 border-red-500"
                  style={{ opacity: opacityLeft }}
                >
                  <div className="bg-red-500 text-white rounded-full p-6 shadow-2xl" style={{ transform: `scale(${scaleIcon})` }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                  </div>
                </div>
              )}

            {/* Flip Container */}
            <div 
              className="relative w-full h-full preserve-3d transition-transform duration-500"
              style={{ 
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-card bg-white dark:bg-slate-800 flex flex-col items-center justify-between p-8 text-center border border-gray-100 dark:border-slate-700 transition-colors"
              >
                <div className="w-full flex justify-between items-start">
                  <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide">
                    {card.tag}
                  </div>
                  {/* TTS Button */}
                  <button 
                    onClick={handleSpeak}
                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-primary'}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                   <h3 className="text-3xl font-display font-bold text-dark dark:text-white leading-tight select-none">
                     {card.front}
                   </h3>
                   
                   {showIcons && (
                     <div className="animate-in fade-in zoom-in duration-700">
                       {getCardIcon(card.front, card.tag)}
                     </div>
                   )}
                </div>

                <p className="text-sm text-gray-400 font-medium animate-pulse">
                  Çevirmek için dokun veya Boşluk tuşuna bas
                </p>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-card bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center p-8 text-center rotate-y-180 overflow-y-auto no-scrollbar"
              >
                <div className="absolute top-6 right-6 flex gap-2">
                    {/* TTS Button (Back) */}
                    <button 
                        onClick={handleSpeak}
                        className={`p-2 rounded-full transition-colors bg-white/20 hover:bg-white/30 ${isSpeaking ? 'text-yellow-300' : 'text-white'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                        </svg>
                    </button>
                </div>
                
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Cevap</span>
                <p className="text-2xl font-medium leading-relaxed select-none mb-8">
                  {card.back}
                </p>
              </div>
            </div>
          </div>
      </div>

      {/* Manual Control Buttons - Symmetrical Layout */}
      <div className="w-full flex flex-row justify-center items-center gap-6 mt-8 z-10 flex-nowrap">
        
        {/* Undo Button */}
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90 shrink-0 ${
            !canUndo ? 'bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-slate-600' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400'
          }`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
           </svg>
        </button>

        {/* Fail Button */}
        <button 
          onClick={() => triggerRate(Rating.Again)}
          disabled={!isFlipped}
          className={`w-16 h-16 rounded-full border-2 shadow-lg flex items-center justify-center active:scale-90 transition-transform shrink-0 ${
            !isFlipped 
              ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-300 dark:text-slate-600 cursor-not-allowed' 
              : 'bg-white dark:bg-slate-800 border-red-100 dark:border-red-900 text-red-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Pass Button */}
        <button 
          onClick={() => triggerRate(Rating.Good)}
          disabled={!isFlipped}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform shrink-0 ${
            !isFlipped 
              ? 'bg-gray-200 dark:bg-slate-700 shadow-none cursor-not-allowed' 
              : 'bg-emerald-500 shadow-emerald-500/30'
          }`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
           </svg>
        </button>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardView;