import React, { useState } from 'react';
import { JournalEntry, Mood } from '../types';
import { useJournal } from '../hooks/useJournal';
import { analyzeJournalEntry } from '../services/geminiService';
import { MOOD_CONFIG, SparklesIcon, CloseIcon } from '../constants';

interface EditEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({ entry, onClose }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>(entry.mood);
  const [text, setText] = useState(entry.text);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateEntry } = useJournal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Journal entry cannot be empty.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Re-analyze the entry only if the text has changed
      const analysis = text.trim() !== entry.text.trim()
        ? await analyzeJournalEntry(text)
        : entry.analysis;

      const updatedEntryData = {
        mood: selectedMood,
        text,
        analysis,
      };
      
      updateEntry(entry.id, updatedEntryData);
      onClose();

    } catch (apiError: any) {
      setError(apiError.message || 'An error occurred while updating. Please try again.');
      console.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative transform transition-all duration-300 scale-100 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <CloseIcon />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Journal Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">Update your mood:</label>
              <div className="flex justify-center items-center bg-gray-50 p-3 rounded-lg gap-2">
                {Object.values(Mood).map((mood) => {
                  const config = MOOD_CONFIG[mood];
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setSelectedMood(mood)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 w-16 h-16 sm:w-20 sm:h-20 justify-center ${
                        selectedMood === mood ? 'bg-brand-primary text-white shadow-md scale-110' : 'hover:bg-indigo-100'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">{config.emoji}</span>
                      <span className="text-xs sm:text-sm font-medium mt-1">{mood}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="journal-text-edit" className="block text-lg font-semibold text-gray-700 mb-3">
                Update your thoughts:
              </label>
              <textarea
                id="journal-text-edit"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                placeholder="Let it all out..."
              ></textarea>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                  Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                    <>
                    <SparklesIcon className="mr-2 h-5 w-5"/>
                    Update & Re-analyze
                    </>
                )}
              </button>
            </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EditEntryModal;
