'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LevelContext = createContext(null);

const STORAGE_KEY = 'mk_quest_completed';

export function LevelProvider({ children }) {
  // Start empty so server + client render identically (no hydration mismatch)
  const [completed, setCompleted] = useState([]);
  const [mounted,   setMounted]   = useState(false);
  // Which challenge currently holds keyboard focus (FlappyBird yields when set)
  const [activeChallenge, setActiveChallenge] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setCompleted(saved);
    } catch {}
    setMounted(true);
  }, []);

  const completeQuest = useCallback((id) => {
    setCompleted(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const level = Math.min(completed.length, 5);

  return (
    <LevelContext.Provider value={{
      completed,
      level,
      mounted,
      completeQuest,
      activeChallenge,
      setActiveChallenge,
    }}>
      {children}
    </LevelContext.Provider>
  );
}

export function useLevel() {
  const ctx = useContext(LevelContext);
  if (!ctx) throw new Error('useLevel must be used inside LevelProvider');
  return ctx;
}
