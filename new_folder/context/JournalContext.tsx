import React, { createContext, useState, useCallback, useMemo } from 'react';
import { JournalEntry } from '../types';
import { useAuth } from '../hooks/useAuth';

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updatedEntryData: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const JournalContext = createContext<JournalContextType | undefined>(undefined);

const initialEntries: JournalEntry[] = [];


export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const addEntry = useCallback((entry: JournalEntry) => {
    if (user?.subscriptionStatus === 'free' && entries.length >= 5) {
      throw new Error("You have reached the 5-entry limit for the free tier. Please upgrade to premium for unlimited entries.");
    }
    setEntries(prevEntries => [entry, ...prevEntries]);
  }, [user, entries]);
  
  const updateEntry = useCallback((id: string, updatedEntryData: Partial<JournalEntry>) => {
    setEntries(prevEntries => prevEntries.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntryData, date: new Date().toISOString() } : entry
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    loading,
    setLoading
  }), [entries, addEntry, updateEntry, deleteEntry, loading]);

  return (
    <JournalContext.Provider value={contextValue}>
      {children}
    </JournalContext.Provider>
  );
};
