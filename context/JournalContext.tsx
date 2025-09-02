import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { JournalEntry } from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => Promise<void>;
  updateEntry: (id: string, updatedEntryData: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  // Load entries from database
  const loadEntries = useCallback(async () => {
    if (!isAuthenticated) {
      setEntries([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('app_ba9387a6aa_journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading entries:', error);
        return;
      }

      const formattedEntries: JournalEntry[] = data.map(entry => ({
        id: entry.id,
        date: entry.created_at,
        mood: entry.mood,
        text: entry.text,
        analysis: entry.analysis
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }, [isAuthenticated]);

  // Load entries when user authenticates
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(async (entry: JournalEntry) => {
    if (user?.subscriptionStatus === 'free' && entries.length >= 5) {
      throw new Error("You have reached the 5-entry limit for the free tier. Please upgrade to premium for unlimited entries.");
    }

    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('app_ba9387a6aa_journal_entries')
        .insert({
          user_id: supabaseUser.id,
          mood: entry.mood,
          text: entry.text,
          analysis: entry.analysis
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const newEntry: JournalEntry = {
        id: data.id,
        date: data.created_at,
        mood: data.mood,
        text: data.text,
        analysis: data.analysis
      };

      setEntries(prevEntries => [newEntry, ...prevEntries]);
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }, [user, entries.length]);

  const updateEntry = useCallback(async (id: string, updatedEntryData: Partial<JournalEntry>) => {
    try {
      const { error } = await supabase
        .from('app_ba9387a6aa_journal_entries')
        .update({
          mood: updatedEntryData.mood,
          text: updatedEntryData.text,
          analysis: updatedEntryData.analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === id 
            ? { ...entry, ...updatedEntryData, date: new Date().toISOString() } 
            : entry
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('app_ba9387a6aa_journal_entries')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
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