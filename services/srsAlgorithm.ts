import { Flashcard, CardStatus, Rating } from '../types';
import { getSettings } from './storageService';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Processes a flashcard review and returns the updated card with new SRS metrics.
 * Based on a simplified SM-2 algorithm suitable for mobile study.
 */
export const processReview = (card: Flashcard, rating: Rating): Flashcard => {
  const now = Date.now();
  const settings = getSettings(); // Load dynamic settings
  const { easyBonus, hardPenalty, maxInterval } = settings.srsSettings;

  let newInterval = card.interval;
  let newEaseFactor = card.easeFactor;
  let newReps = card.reps;
  let newStatus = card.status;

  if (rating === Rating.Again) {
    // STRATEGY: Fail logic
    // Reset repetitions and interval completely.
    // The card enters "Learning" mode again.
    newReps = 0;
    newInterval = 0; 
    newStatus = CardStatus.Learning;
    
    // Penalty to ease factor to show this card is difficult for the user
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
  } else {
    // STRATEGY: Success logic
    
    // If it was a new card or just failed (reps 0)
    if (newReps === 0) {
      newInterval = 1; // First graduation is always 1 day
      newStatus = CardStatus.Learning;
    } else if (newReps === 1) {
      newInterval = 6; // Second step is 6 days
      newStatus = CardStatus.Review;
    } else {
      // Standard exponential growth for reviews
      let modifier = 1;
      if (rating === Rating.Hard) modifier = hardPenalty; // Use Setting (default 0.8)
      if (rating === Rating.Easy) modifier = easyBonus;   // Use Setting (default 1.3)
      
      newInterval = Math.ceil(card.interval * card.easeFactor * modifier);
    }

    newReps += 1;
    
    // Adjust Ease Factor (floored at 1.3)
    if (rating === Rating.Easy) newEaseFactor += 0.15;
    if (rating === Rating.Hard) newEaseFactor -= 0.15;
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;
    
    // Cap interval based on settings
    if (newInterval > maxInterval) newInterval = maxInterval;

    // Graduate card if interval becomes large
    if (newInterval > 21) newStatus = CardStatus.Graduated;
  }

  // Calculate due date (Today + Interval days)
  let nextDueDate = now;
  
  if (newInterval > 0) {
     nextDueDate = now + (newInterval * ONE_DAY_MS);
     // Normalize to start of that day (4 AM rollover) to avoid hour drift
     const d = new Date(nextDueDate);
     d.setHours(4, 0, 0, 0); 
     nextDueDate = d.getTime();
  } else {
     // Interval 0 means "Review Today/Immediately"
     // We keep it as 'now' so it shows up in due lists immediately
     nextDueDate = now;
  }

  return {
    ...card,
    status: newStatus,
    dueDate: nextDueDate,
    interval: newInterval,
    easeFactor: newEaseFactor,
    reps: newReps
  };
};

export const createNewCard = (front: string, back: string, tag: string): Flashcard => ({
  id: crypto.randomUUID(),
  front,
  back,
  tag,
  createdAt: Date.now(),
  status: CardStatus.New,
  dueDate: Date.now(), // Due immediately
  interval: 0,
  easeFactor: 2.5,
  reps: 0
});