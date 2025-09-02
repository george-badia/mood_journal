
import React from 'react';
import { useJournal } from '../hooks/useJournal';
import { MOOD_CONFIG } from '../constants';

interface RecentEntriesProps {
    limit?: number;
}

const RecentEntries: React.FC<RecentEntriesProps> = ({ limit }) => {
    const { entries } = useJournal();
    const displayEntries = limit ? entries.slice(0, limit) : entries;

    if (entries.length === 0) {
        return <p className="text-gray-500">No entries yet. Create one to get started!</p>;
    }

    return (
        <div className="space-y-4">
            {displayEntries.map(entry => (
                <div key={entry.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                             <p className="font-semibold text-gray-800">
                                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{entry.text.substring(0, 100)}{entry.text.length > 100 ? '...' : ''}</p>
                            {entry.analysis && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {entry.analysis.keywords.map(keyword => (
                                        <span key={keyword} className="text-xs font-medium bg-indigo-100 text-brand-primary px-2 py-1 rounded-full">{keyword}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 text-2xl flex-shrink-0 ml-4">
                           <span className={MOOD_CONFIG[entry.mood].color}>{MOOD_CONFIG[entry.mood].emoji}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentEntries;
