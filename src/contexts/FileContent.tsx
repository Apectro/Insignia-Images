'use client';

import React, { createContext, useContext, useState } from 'react';

type FileContextType = {
  refreshTrigger: number;
  triggerRefresh: () => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return <FileContext.Provider value={{ refreshTrigger, triggerRefresh }}>{children}</FileContext.Provider>;
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
}
