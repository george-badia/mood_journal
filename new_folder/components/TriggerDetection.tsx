
import React, { useState, useEffect } from 'react';
import { useJournal } from '../hooks/useJournal';
import { analyzeTriggers } from '../services/geminiService';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    </div>
);

const TriggerDetection: React.FC = () => {
    const { entries } = useJournal();
    const [triggers, setTriggers] = useState<{ positive: string[], negative: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (entries.length < 3) {
            setLoading(false);
            return;
        }

        const fetchTriggers = async () => {
            setLoading(true);
            setError('');
            try {
                const result = await analyzeTriggers(entries);
                setTriggers(result);
            } catch (err) {
                setError('Could not analyze triggers. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTriggers();
    }, [entries]);

    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-red-500 text-sm">{error}</p>;
    if (entries.length < 3) return <p className="text-gray-500 text-sm">Add at least 3 entries for the AI to detect triggers.</p>;
    if (!triggers || (triggers.positive.length === 0 && triggers.negative.length === 0)) {
        return <p className="text-gray-500 text-sm">Not enough data to identify clear triggers yet. Keep journaling!</p>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h5 className="font-semibold text-green-600 mb-2">Positive Triggers</h5>
                <div className="flex flex-wrap gap-2">
                    {triggers.positive.map(trigger => (
                        <span key={trigger} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-1 rounded-full">{trigger}</span>
                    ))}
                </div>
            </div>
            <div>
                <h5 className="font-semibold text-red-600 mb-2">Negative Triggers</h5>
                <div className="flex flex-wrap gap-2">
                    {triggers.negative.map(trigger => (
                        <span key={trigger} className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-1 rounded-full">{trigger}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TriggerDetection;
