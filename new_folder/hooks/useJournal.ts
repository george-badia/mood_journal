
import { useContext } from 'react';
import { JournalContext } from '../context/JournalContext';

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
