import { Flashcard, DeckStats, CardStatus, LeaderboardUser, UserSettings, UserPack, UserProgress, Achievement, Rating, DailyStat } from '../types';

const STORAGE_KEY = 'tarihkart_db_v1';
const SETTINGS_KEY = 'tarihkart_settings_v1';
const PACKS_KEY = 'tarihkart_packs_v1';
const PROGRESS_KEY = 'tarihkart_progress_v1';
const PREMADE_TRACK_KEY = 'tarihkart_premade_tracking_v1';

// --- ACHIEVEMENTS DEFINITION ---
export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlockedAt'>[] = [
  // Starter
  { id: 'first_step', title: 'Başlangıç', description: 'İlk kartını tamamla', icon: '🚀' },
  { id: 'creator', title: 'Mimar', description: 'İlk paketini oluştur', icon: '🏗️' },
  
  // Streaks
  { id: 'streak_3', title: 'Alev Aldı', description: '3 gün üst üste çalış', icon: '🔥' },
  { id: 'streak_7', title: 'Haftalık Seri', description: '7 gün üst üste çalış', icon: '🗓️' },
  { id: 'streak_30', title: 'Aylık İstikrar', description: '30 gün üst üste çalış', icon: '🏆' },
  
  // Mastery
  { id: 'master_10', title: 'Bilge', description: '10 kartı ezberle', icon: '🧠' },
  { id: 'master_50', title: 'Profesör', description: '50 kartı ezberle', icon: '🎓' },
  
  // Volume
  { id: 'dedicated_50', title: 'Adanmış', description: 'Toplam 50 inceleme yap', icon: '📚' },
  { id: 'review_100', title: 'Yüzler Kulübü', description: 'Toplam 100 inceleme yap', icon: '💯' },
  { id: 'review_500', title: 'Maratoncu', description: 'Toplam 500 inceleme yap', icon: '🏃' },
  { id: 'library_50', title: 'Kütüphaneci', description: 'Kütüphanene 50 kart ekle', icon: '📖' },

  // Time / Habit
  { id: 'night_owl', title: 'Gece Kuşu', description: 'Saat 22:00 - 04:00 arası çalış', icon: '🦉' },
  { id: 'early_bird', title: 'Erkenci Kuş', description: 'Saat 05:00 - 09:00 arası çalış', icon: '🌅' },
  { id: 'weekend_warrior', title: 'Hafta Sonu Savaşçısı', description: 'Hafta sonu çalışma yap', icon: '🏖️' },
];

// --- CARD SERVICES ---

export const getCards = (): Flashcard[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load cards", e);
    return [];
  }
};

export const saveCards = (cards: Flashcard[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

export const addCards = (newCards: Flashcard[]) => {
  const current = getCards();
  saveCards([...current, ...newCards]);
};

export const updateCard = (updatedCard: Flashcard) => {
  const cards = getCards();
  const index = cards.findIndex(c => c.id === updatedCard.id);
  if (index !== -1) {
    cards[index] = updatedCard;
    saveCards(cards);
  }
};

export const deleteCard = (id: string) => {
  const cards = getCards();
  const filtered = cards.filter(c => c.id !== id);
  saveCards(filtered);
}

export const getDueCards = (): Flashcard[] => {
  const cards = getCards();
  const now = Date.now();
  return cards.filter(card => card.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
};

// --- PACKS SERVICES ---

export const getUserPacks = (): UserPack[] => {
  try {
    const data = localStorage.getItem(PACKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const createUserPack = (name: string): UserPack => {
  const packs = getUserPacks();
  const newPack: UserPack = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now()
  };
  localStorage.setItem(PACKS_KEY, JSON.stringify([...packs, newPack]));
  return newPack;
};

// --- PREMADE DECK TRACKING ---

export const getAddedPremadeDecks = (): string[] => {
  try {
    const data = localStorage.getItem(PREMADE_TRACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const markPremadeDeckAdded = (id: string) => {
  const current = getAddedPremadeDecks();
  if (!current.includes(id)) {
    localStorage.setItem(PREMADE_TRACK_KEY, JSON.stringify([...current, id]));
  }
};

// --- PROGRESS & GAMIFICATION SERVICES ---

const getUserProgress = (): UserProgress => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {
      lastStudyDate: null,
      currentStreak: 0,
      unlockedAchievements: [],
      totalReviews: 0,
      reviewsToday: 0,
      history: []
    };
  } catch (e) {
    return { 
        lastStudyDate: null, 
        currentStreak: 0, 
        unlockedAchievements: [], 
        totalReviews: 0,
        reviewsToday: 0,
        history: []
    };
  }
};

const saveUserProgress = (progress: UserProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

// Called every time a card is reviewed
export const trackStudyProgress = (rating: Rating, durationSeconds: number = 0): { achievement: Achievement | null, reviewsToday: number } => {
  const progress = getUserProgress();
  const now = new Date();
  // Normalize to midnight for daily stats
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  let newAchievement: Achievement | null = null;
  let updatedProgress = { ...progress, totalReviews: progress.totalReviews + 1 };

  // Handle Daily Reset for Counter
  if (progress.lastStudyDate) {
      const lastDate = new Date(progress.lastStudyDate);
      const lastStudyDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
      
      if (today > lastStudyDay) {
          updatedProgress.reviewsToday = 1;
      } else {
          updatedProgress.reviewsToday = (progress.reviewsToday || 0) + 1;
      }
  } else {
      updatedProgress.reviewsToday = 1;
  }

  // Update Daily History
  let history = [...(progress.history || [])];
  const todayStatIndex = history.findIndex(h => h.date === today);
  const isCorrect = rating === Rating.Good || rating === Rating.Easy;

  if (todayStatIndex >= 0) {
    history[todayStatIndex] = {
      ...history[todayStatIndex],
      count: history[todayStatIndex].count + 1,
      correctCount: history[todayStatIndex].correctCount + (isCorrect ? 1 : 0),
      timeSpent: history[todayStatIndex].timeSpent + durationSeconds
    };
  } else {
    history.push({
      date: today,
      count: 1,
      correctCount: isCorrect ? 1 : 0,
      timeSpent: durationSeconds
    });
  }
  // Keep only last 365 days
  if (history.length > 365) history = history.slice(-365);
  updatedProgress.history = history;

  // 1. STREAK LOGIC
  if (progress.lastStudyDate) {
    const lastDate = new Date(progress.lastStudyDate);
    const lastStudyDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (today === lastStudyDay) {
      // Same day, do nothing to streak
    } else if (today === lastStudyDay + oneDay) {
      // Consecutive day
      updatedProgress.currentStreak += 1;
      updatedProgress.lastStudyDate = now.getTime();
    } else if (today > lastStudyDay + oneDay) {
      // Missed a day (or more)
      updatedProgress.currentStreak = 1;
      updatedProgress.lastStudyDate = now.getTime();
    }
  } else {
    // First ever study
    updatedProgress.currentStreak = 1;
    updatedProgress.lastStudyDate = now.getTime();
  }

  // 2. ACHIEVEMENT CHECKS
  const unlockedIds = new Set(progress.unlockedAchievements);
  const cards = getCards();
  const packs = getUserPacks();
  const masteredCount = cards.filter(c => c.status === CardStatus.Graduated).length;

  const checkAndUnlock = (id: string, condition: boolean) => {
    if (condition && !unlockedIds.has(id)) {
      unlockedIds.add(id);
      const achievementDef = ACHIEVEMENTS_LIST.find(a => a.id === id);
      if (achievementDef) {
        newAchievement = { ...achievementDef, unlockedAt: Date.now() };
      }
    }
  };

  // Starters
  checkAndUnlock('first_step', updatedProgress.totalReviews >= 1);
  checkAndUnlock('creator', packs.length >= 1);
  checkAndUnlock('library_50', cards.length >= 50);

  // Streaks
  checkAndUnlock('streak_3', updatedProgress.currentStreak >= 3);
  checkAndUnlock('streak_7', updatedProgress.currentStreak >= 7);
  checkAndUnlock('streak_30', updatedProgress.currentStreak >= 30);

  // Mastery
  checkAndUnlock('master_10', masteredCount >= 10);
  checkAndUnlock('master_50', masteredCount >= 50);

  // Volume
  checkAndUnlock('dedicated_50', updatedProgress.totalReviews >= 50);
  checkAndUnlock('review_100', updatedProgress.totalReviews >= 100);
  checkAndUnlock('review_500', updatedProgress.totalReviews >= 500);
  
  // Time based
  checkAndUnlock('night_owl', hour >= 22 || hour < 4);
  checkAndUnlock('early_bird', hour >= 5 && hour < 9);
  checkAndUnlock('weekend_warrior', dayOfWeek === 0 || dayOfWeek === 6); // Sunday or Saturday

  updatedProgress.unlockedAchievements = Array.from(unlockedIds);
  saveUserProgress(updatedProgress);

  return { achievement: newAchievement, reviewsToday: updatedProgress.reviewsToday };
};

// --- SETTINGS SERVICES ---

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 20,
  notificationsEnabled: true,
  showVisualHints: true,
  theme: 'light',
  srsSettings: {
    easyBonus: 1.3,
    hardPenalty: 0.8,
    maxInterval: 365
  }
};

export const getSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
       const parsed = JSON.parse(data);
       const defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
       return {
         ...defaults,
         ...parsed,
         srsSettings: {
           ...defaults.srsSettings,
           ...(parsed.srsSettings || {})
         }
       };
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
};

export const saveSettings = (settings: UserSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- DATA MANAGEMENT ---

export const exportData = () => {
    const allData = {
        cards: getCards(),
        settings: getSettings(),
        progress: getUserProgress(),
        packs: getUserPacks(),
        addedPremadeDecks: getAddedPremadeDecks(),
        timestamp: Date.now()
    };
    return JSON.stringify(allData);
};

export const resetProgress = () => {
    const cards = getCards();
    // Reset card stats but keep content
    const resetCards = cards.map(c => ({
        ...c,
        status: CardStatus.New,
        dueDate: Date.now(),
        interval: 0,
        easeFactor: 2.5,
        reps: 0
    }));
    saveCards(resetCards);
    // Reset Progress
    localStorage.removeItem(PROGRESS_KEY);
};

export const clearAllData = () => {
    localStorage.clear();
}

// --- STATS ---

export const getStats = (): DeckStats => {
  const cards = getCards();
  const progress = getUserProgress();
  const settings = getSettings();
  const now = Date.now();
  
  const mastered = cards.filter(c => c.status === CardStatus.Graduated).length;
  const learning = cards.filter(c => c.status === CardStatus.Review || c.status === CardStatus.Learning).length;
  const newCardsCount = cards.filter(c => c.status === CardStatus.New).length;
  
  // Calculate XP
  const xp = (mastered * 50) + (learning * 10) + (progress.currentStreak * 20) + (progress.unlockedAchievements.length * 100);

  // Achievements
  const achievements: Achievement[] = ACHIEVEMENTS_LIST.map(a => ({
    ...a,
    unlockedAt: progress.unlockedAchievements.includes(a.id) ? Date.now() : undefined
  }));

  // Daily Review Logic
  let reviewsToday = progress.reviewsToday || 0;
  if (progress.lastStudyDate) {
     const lastDate = new Date(progress.lastStudyDate);
     const today = new Date();
     if (lastDate.getDate() !== today.getDate() || lastDate.getMonth() !== today.getMonth()) {
         reviewsToday = 0;
     }
  }

  // --- Advanced Stats Calculation ---
  
  // 1. Heatmap Data (Last 30 days)
  const history = progress.history || [];
  const heatmapData = [];
  const todayDate = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    d.setHours(0,0,0,0);
    const ts = d.getTime();
    const entry = history.find(h => h.date === ts);
    const count = entry ? entry.count : 0;
    
    // Level 0-4 for coloring
    let level = 0;
    if (count > 0) level = 1;
    if (count > 5) level = 2;
    if (count > 15) level = 3;
    if (count > 30) level = 4;

    heatmapData.push({
      date: d.toISOString().split('T')[0], // YYYY-MM-DD
      count: count,
      level: level
    });
  }

  // 2. Average Time
  const totalTime = history.reduce((acc, curr) => acc + curr.timeSpent, 0);
  const daysWithActivity = history.filter(h => h.timeSpent > 0).length;
  const averageTimePerDay = daysWithActivity > 0 ? Math.round(totalTime / daysWithActivity) : 0;

  // 3. Retention Rate (Overall or last 7 days)
  // Let's calculate global rate for simplicity or last 7 days
  const last7Days = history.slice(-7);
  const totalReviewedLast7 = last7Days.reduce((acc, curr) => acc + curr.count, 0);
  const totalCorrectLast7 = last7Days.reduce((acc, curr) => acc + curr.correctCount, 0);
  const retentionRate = totalReviewedLast7 > 0 ? Math.round((totalCorrectLast7 / totalReviewedLast7) * 100) : 0;

  // 4. Retention Graph Data
  const retentionGraphData = last7Days.map(h => {
    const rate = h.count > 0 ? Math.round((h.correctCount / h.count) * 100) : 0;
    const date = new Date(h.date);
    const name = date.toLocaleDateString('tr-TR', { weekday: 'short' });
    return { name, rate };
  });

  // 5. Forecast
  // Average new cards/day. If 0, assume 5 for default.
  // We don't strictly track "New cards per day", but reviews per day is a proxy.
  // Let's use dailyGoal as the speed if history is empty.
  const avgDailyReviews = daysWithActivity > 0 ? Math.round(history.reduce((acc, c) => acc + c.count, 0) / daysWithActivity) : settings.dailyGoal;
  const forecastDays = avgDailyReviews > 0 ? Math.ceil(newCardsCount / avgDailyReviews) : 0;

  return {
    total: cards.length,
    due: cards.filter(c => c.dueDate <= now).length,
    new: newCardsCount,
    mastered: mastered,
    streak: progress.currentStreak,
    xp: xp,
    achievements: achievements,
    reviewsToday: reviewsToday,
    dailyGoal: settings.dailyGoal,
    averageTimePerDay,
    retentionRate,
    forecastDays,
    heatmapData,
    retentionGraphData
  };
};

export const getTags = (): string[] => {
  const cards = getCards();
  const tags = new Set(cards.map(c => c.tag));
  return Array.from(tags);
};

export const getLeaderboard = (): LeaderboardUser[] => {
  const myStats = getStats();
  
  const users: LeaderboardUser[] = [
    { id: '1', name: 'Selin Y.', xp: Math.max(1250, myStats.xp + 200), avatar: '👩‍🎓' },
    { id: '2', name: 'Ahmet K.', xp: Math.max(900, myStats.xp - 100), avatar: '👨‍💻' },
    { id: '3', name: 'Mehmet T.', xp: 3200, avatar: '👨‍🏫' },
    { id: '4', name: 'Ayşe B.', xp: 2100, avatar: '👩‍🔬' },
    { id: 'me', name: 'Sen', xp: myStats.xp, avatar: '👤', isCurrentUser: true },
  ];

  return users.sort((a, b) => b.xp - a.xp).map((u, i) => ({...u, rank: i + 1}));
};