import React, { useState, useRef } from 'react';
import { editHistoryImage } from '../services/geminiService';

const VisualEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix for API if present, but for preview we keep it.
        // Gemini API expects pure base64 for inlineData, so we'll strip it before sending.
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt.trim()) return;
    
    setIsProcessing(true);
    try {
      // Strip header (data:image/jpeg;base64,)
      const base64Data = selectedImage.split(',')[1];
      const resultBase64 = await editHistoryImage(base64Data, prompt);
      
      setSelectedImage(`data:image/png;base64,${resultBase64}`);
      setPrompt(''); // Clear prompt after success
    } catch (error) {
      alert("Görsel işlenirken hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-paper dark:bg-slate-950 transition-colors">
      <header className="mb-6 pt-2">
        <h1 className="text-3xl font-display font-bold text-dark dark:text-white">Tarihi Görselleştir</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Eski fotoğrafları onar veya düzenle.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 p-4 flex flex-col items-center gap-6 min-h-[400px]">
        
        {/* Image Preview Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-64 rounded-2xl flex items-center justify-center border-2 border-dashed transition-all cursor-pointer overflow-hidden relative ${
            selectedImage ? 'border-transparent bg-black' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
           {selectedImage ? (
             <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
           ) : (
             <div className="text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-sm font-bold">Fotoğraf Yükle</span>
             </div>
           )}
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleImageUpload} 
             className="hidden" 
             accept="image/*"
           />
        </div>

        {/* Controls */}
        <div className="w-full space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Düzenleme Komutu</label>
             <input
               type="text"
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="Örn: Sepya filtresi ekle, Arka planı temizle..."
               className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-dark dark:text-white font-medium"
             />
           </div>

           <button
             onClick={handleEdit}
             disabled={!selectedImage || isProcessing || !prompt.trim()}
             className="w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-500/20 bg-indigo-600 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
           >
             {isProcessing ? (
               <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 İşleniyor...
               </>
             ) : (
               'Sihirli Düzenle ✨'
             )}
           </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => setPrompt("Renklendir ve canlandır")} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800">
          🎨 Renklendir
        </button>
        <button onClick={() => setPrompt("Eski yıpranmış fotoğraf efekti ekle")} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800">
          📜 Eskitme Yap
        </button>
        <button onClick={() => setPrompt("Arka plana Türk bayrağı ekle")} className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800">
          🇹🇷 Bayrak Ekle
        </button>
        <button onClick={() => setSelectedImage(null)} className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 shadow-sm">
          🗑️ Temizle
        </button>
      </div>
    </div>
  );
};

export default VisualEditor;