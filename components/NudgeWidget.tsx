
import React, { useMemo } from 'react';
import { useJournal } from '../hooks/useJournal';

const NudgeWidget: React.FC = () => {
    const { entries } = useJournal();

    const nudge = useMemo(() => {
        if (entries.length === 0) {
            return {
                title: "Welcome!",
                message: "Ready to start your journey? Create your first journal entry to begin understanding your emotions better.",
            };
        }

        const latestEntry = entries[0];
        if (latestEntry.analysis) {
            const sentiment = latestEntry.analysis.overallSentiment;
            if (sentiment === 'Negative') {
                 return {
                    title: "A Moment for You",
                    message: "It seems like things might be tough right now. Remember to be kind to yourself. A few deep breaths can make a world of difference. You've got this.",
                };
            }
            if (sentiment === 'Positive') {
                return {
                    title: "Keep the Momentum",
                    message: "It's wonderful to see you're feeling positive! What's one small thing you can do today to carry this good feeling forward?",
                };
            }
        }
        
        return {
            title: "Daily Reflection",
            message: "Consistency is key to understanding your emotional landscape. Keep up the great work of checking in with yourself.",
        };

    }, [entries]);

    return (
        <div className="bg-indigo-50 border-l-4 border-brand-primary p-4 rounded-r-lg h-full flex flex-col justify-center">
            <h4 className="font-bold text-brand-primary">{nudge.title}</h4>
            <p className="mt-2 text-gray-700">{nudge.message}</p>
        </div>
    );
};

export default NudgeWidget;
