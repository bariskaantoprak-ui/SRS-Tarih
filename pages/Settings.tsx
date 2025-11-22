import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../services/storageService';
import { UserSettings } from '../types';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const toggleTheme = () => {
    if (!settings) return;
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings({...settings, theme: newTheme});
    
    // Apply immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save immediately for better UX
    saveSettings({...settings, theme: newTheme});
  };

  if (!settings) return <div className="p-6 dark:text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-paper dark:bg-slate-950 pb-24 p-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8 pt-2">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/')} 
                    className="md:hidden w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h1 className="text-3xl font-display font-bold text-dark dark:text-white">Ayarlar</h1>
            </div>
            <button 
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isSaved ? 'bg-green-500 text-white' : 'bg-primary text-white active:scale-95'
            }`}
            >
            {isSaved ? 'Kaydedildi!' : 'Kaydet'}
            </button>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Theme Toggle - New */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${settings.theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-50 text-orange-500'}`}>
                        {settings.theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-dark dark:text-white text-lg">{settings.theme === 'dark' ? 'Koyu Tema' : 'Açık Tema'}</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Görünümü değiştir</p>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

            {/* Study Goal */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-dark dark:text-white text-lg">Günlük Hedef</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Günde kaç kart çalışmak istiyorsun?</p>
                    </div>
                </div>
                
                <div className="mt-6">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-gray-400">10 Kart</span>
                        <span className="text-primary text-xl">{settings.dailyGoal}</span>
                        <span className="text-gray-400">100 Kart</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5"
                        value={settings.dailyGoal}
                        onChange={(e) => setSettings({...settings, dailyGoal: Number(e.target.value)})}
                        className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>

            {/* Visual Hints */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-dark dark:text-white text-lg">Görsel İpuçları</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Kartlardaki ikonları göster/gizle</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSettings({...settings, showVisualHints: !settings.showVisualHints})}
                    className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.showVisualHints ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.showVisualHints ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft border border-gray-50 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-dark dark:text-white text-lg">Bildirimler</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Hatırlatıcıları aç/kapat</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSettings({...settings, notificationsEnabled: !settings.notificationsEnabled})}
                    className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${settings.notificationsEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;