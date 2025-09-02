
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { useAuth } from '../hooks/useAuth';
import { Mood, JournalEntry } from '../types';
import { MOOD_CONFIG, SparklesIcon } from '../constants';
import { analyzeJournalEntry } from '../services/geminiService';
import PremiumModal from './PremiumModal';

const Journal: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const { addEntry, loading, setLoading, entries } = useJournal();
  const { user } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const navigate = useNavigate();

  const isLimitReached = user?.subscriptionStatus === 'free' && entries.length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
        setError('You have reached your entry limit. Please upgrade to continue.');
        return;
    }
    if (!selectedMood) {
      setError('Please select your mood.');
      return;
    }
    if (!text.trim()) {
      setError('Please write something in your journal.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const analysis = await analyzeJournalEntry(text);
      
      const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        mood: selectedMood,
        text,
        analysis,
      };
      
      addEntry(newEntry);
      navigate('/dashboard');

    } catch (apiError: any) {
      setError(apiError.message || 'An error occurred. Please try again.');
      console.error(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">New Journal Entry</h2>
      
      <div className="bg-white p-8 rounded-xl shadow-lg">
        {isLimitReached ? (
          <div className="text-center bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-amber-800">Free Limit Reached</h3>
            <p className="mt-2 text-amber-700">You have used all 5 of your free journal entries. Please upgrade to Premium to add unlimited entries and unlock all features.</p>
            <button 
                onClick={() => setIsPremiumModalOpen(true)}
                className="mt-4 px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Upgrade to Premium
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4">How are you feeling?</label>
              <div className="flex justify-around items-center bg-gray-50 p-4 rounded-lg">
                {Object.values(Mood).map((mood) => {
                  const config = MOOD_CONFIG[mood];
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setSelectedMood(mood)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 w-20 h-20 justify-center ${
                        selectedMood === mood ? 'bg-brand-primary text-white shadow-md scale-110' : 'hover:bg-indigo-100'
                      }`}
                    >
                      <span className="text-3xl">{config.emoji}</span>
                      <span className="text-sm font-medium mt-1">{mood}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="journal-text" className="block text-xl font-semibold text-gray-700 mb-4">
                What's on your mind?
              </label>
              <textarea
                id="journal-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                placeholder="Let it all out..."
              ></textarea>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                    <>
                    <SparklesIcon className="mr-2 h-5 w-5"/>
                    Save & Analyze
                    </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {isPremiumModalOpen && (
        <PremiumModal onClose={() => setIsPremiumModalOpen(false)} />
      )}
    </div>
  );
};

export default Journal;
