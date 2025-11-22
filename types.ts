export enum CardStatus {
  New = 'NEW',
  Learning = 'LEARNING',
  Review = 'REVIEW',
  Graduated = 'GRADUATED'
}

export enum Rating {
  Again = 1, // Failed/Forgot
  Hard = 2,  // Recalled with effort
  Good = 3,  // Recalled correctly
  Easy = 4   // Recalled instantly
}

export interface Flashcard {
  id: string;
  front: string; // Question
  back: string;  // Answer
  tag: string;   // Topic e.g., "Osmanlı", "İnkılap"
  createdAt: number;
  
  // SRS Data
  status: CardStatus;
  dueDate: number; // Timestamp
  interval: number; // Days
  easeFactor: number; // Multiplier (starts at 2.5)
  reps: number; // Number of consecutive successful reviews
}

export interface UserPack {
  id: string;
  name: string;
  createdAt: number;
}

export interface DeckStats {
  total: number;
  due: number;
  new: number;
  mastered: number;
  streak: number; // Days in a row
  xp: number; // Gamification score
}

export interface UserSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  showVisualHints: boolean; // Toggle for card icons
  theme: 'light' | 'dark'; // New theme setting
  srsSettings: {
    easyBonus: number; // Multiplier for Easy (default 1.3)
    hardPenalty: number; // Multiplier for Hard (default 0.8)
    maxInterval: number; // Max days (default 365)
  };
}

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
  rank?: number;
}

export interface CommunityDeck {
  id: string;
  title: string;
  author: string;
  description: string;
  likes: number;
  downloads: number;
  cardCount: number;
  cards: Array<{ front: string; back: string; tag: string }>;
}

export type ExamType = 'KPSS' | 'TYT' | 'AYT';