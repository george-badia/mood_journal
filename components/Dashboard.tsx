
import React, { useMemo } from 'react';
import StatCard from './StatCard';
import MoodChart from './MoodChart';
import EmotionPieChart from './EmotionPieChart';
import RecentEntries from './RecentEntries';
import NudgeWidget from './NudgeWidget';
import { useJournal } from '../hooks/useJournal';
import { useAuth } from '../hooks/useAuth';
import { MOOD_CONFIG } from '../constants';
import { Mood } from '../types';

const Dashboard: React.FC = () => {
    const { entries } = useJournal();
    const { user } = useAuth();

    const stats = useMemo(() => {
        const totalEntries = entries.length;
        if (totalEntries === 0) {
            return {
                streak: 0,
                todayMood: 'N/A',
                avgSentiment: 'N/A',
                totalEntries: 0
            };
        }

        const today = new Date().toDateString();
        const todaysEntry = entries.find(e => new Date(e.date).toDateString() === today);
        
        const avgMoodValue = entries.reduce((sum, entry) => sum + MOOD_CONFIG[entry.mood].value, 0) / totalEntries;
        const avgMoodKey = Object.keys(MOOD_CONFIG).find(key => MOOD_CONFIG[key as Mood].value === Math.round(avgMoodValue));

        // Simplified streak calculation
        const uniqueDates = [...new Set(entries.map(e => new Date(e.date).toDateString()))];
        let streak = 0;
        if(uniqueDates.length > 0) {
            streak = 1;
            let lastDate = new Date(uniqueDates[0]);
            for (let i = 1; i < uniqueDates.length; i++) {
                const currentDate = new Date(uniqueDates[i]);
                const diffTime = lastDate.getTime() - currentDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);
                if (diffDays === 1) {
                    streak++;
                    lastDate = currentDate;
                } else {
                    break;
                }
            }
        }


        return {
            streak,
            todayMood: todaysEntry ? todaysEntry.mood : 'Not Logged',
            avgSentiment: avgMoodKey || 'Okay',
            totalEntries
        };
    }, [entries]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            
            {user?.subscriptionStatus === 'free' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Free Entry Limit</h4>
                        <span className="text-sm font-bold text-brand-primary">{entries.length} / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(entries.length / 5) * 100}%` }}
                        ></div>
                    </div>
                    {entries.length >= 5 && (
                         <p className="text-center text-sm text-red-600 mt-3">You've reached your limit. Upgrade to add more entries.</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Entry Streak" value={`${stats.streak} Days`} />
                <StatCard title="Today's Mood" value={stats.todayMood} />
                <StatCard title="Avg. Sentiment" value={stats.avgSentiment} />
                <StatCard title="Total Entries" value={stats.totalEntries.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Mood Trend</h3>
                    <MoodChart />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Emotion Breakdown</h3>
                    <EmotionPieChart />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Entries</h3>
                    <RecentEntries limit={3} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">AI Wellness Tip</h3>
                    <NudgeWidget />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
