'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProgressContextType {
  current: number;
  total: number;
  showProgress: boolean;
  setProgress: (current: number, total: number) => void;
  hideProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const setProgress = (current: number, total: number) => {
    setCurrent(current);
    setTotal(total);
    setShowProgress(true);
  };

  const hideProgress = () => {
    setShowProgress(false);
  };

  return (
    <ProgressContext.Provider value={{ current, total, showProgress, setProgress, hideProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}