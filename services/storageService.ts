import { Flashcard, DeckStats, CardStatus, LeaderboardUser, UserSettings, UserPack } from '../types';

const STORAGE_KEY = 'tarihkart_db_v1';
const SETTINGS_KEY = 'tarihkart_settings_v1';
const PACKS_KEY = 'tarihkart_packs_v1';

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
       // Deep copy defaults to prevent reference mutation
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

// --- STATS & MOCK DATA ---

export const getStats = (): DeckStats => {
  const cards = getCards();
  const now = Date.now();
  
  const mastered = cards.filter(c => c.status === CardStatus.Graduated).length;
  const learning = cards.filter(c => c.status === CardStatus.Review || c.status === CardStatus.Learning).length;
  
  const xp = (mastered * 50) + (learning * 10);

  return {
    total: cards.length,
    due: cards.filter(c => c.dueDate <= now).length,
    new: cards.filter(c => c.status === CardStatus.New).length,
    mastered: mastered,
    streak: 3, // Mock streak for now
    xp: xp
  };
};

export const getTags = (): string[] => {
  const cards = getCards();
  const tags = new Set(cards.map(c => c.tag));
  return Array.from(tags);
};

export const getLeaderboard = (): LeaderboardUser[] => {
  const myStats = getStats();
  
  // Mock users
  const users: LeaderboardUser[] = [
    { id: '1', name: 'Selin Y.', xp: Math.max(1250, myStats.xp + 200), avatar: '👩‍🎓' },
    { id: '2', name: 'Ahmet K.', xp: Math.max(900, myStats.xp - 100), avatar: '👨‍💻' },
    { id: '3', name: 'Mehmet T.', xp: 3200, avatar: '👨‍🏫' },
    { id: '4', name: 'Ayşe B.', xp: 2100, avatar: '👩‍🔬' },
    { id: 'me', name: 'Sen', xp: myStats.xp, avatar: '👤', isCurrentUser: true },
  ];

  return users.sort((a, b) => b.xp - a.xp).map((u, i) => ({...u, rank: i + 1}));
};