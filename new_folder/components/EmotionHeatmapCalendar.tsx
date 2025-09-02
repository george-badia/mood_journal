
import React, { useMemo, useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { MOOD_CONFIG } from '../constants';

const EmotionHeatmapCalendar: React.FC = () => {
    const { entries } = useJournal();
    const [currentDate, setCurrentDate] = useState(new Date());

    const moodDataByDay = useMemo(() => {
        const moodMap = new Map<string, { total: number; count: number }>();
        entries.forEach(entry => {
            const day = new Date(entry.date).toDateString();
            const moodValue = MOOD_CONFIG[entry.mood].value;
            const existing = moodMap.get(day) || { total: 0, count: 0 };
            moodMap.set(day, { total: existing.total + moodValue, count: existing.count + 1 });
        });

        const avgMoodMap = new Map<string, number>();
        moodMap.forEach((value, key) => {
            avgMoodMap.set(key, Math.round(value.total / value.count));
        });
        return avgMoodMap;
    }, [entries]);

    const getMoodColor = (moodValue: number) => {
        if (moodValue >= 5) return 'bg-green-400';
        if (moodValue >= 4) return 'bg-lime-400';
        if (moodValue >= 3) return 'bg-yellow-400';
        if (moodValue >= 2) return 'bg-orange-400';
        if (moodValue >= 1) return 'bg-red-400';
        return 'bg-gray-100';
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="border border-gray-200"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const moodValue = moodDataByDay.get(date.toDateString());
        const bgColor = moodValue ? getMoodColor(moodValue) : 'bg-gray-100';
        const textColor = moodValue ? 'text-white' : 'text-gray-600';

        calendarDays.push(
            <div key={day} className={`h-12 border border-gray-200 flex items-center justify-center ${bgColor} transition-colors`}>
                <span className={`font-semibold ${textColor}`}>{day}</span>
            </div>
        );
    }

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&lt;</button>
                <h4 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center font-medium text-gray-500 text-sm mb-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {calendarDays}
            </div>
        </div>
    );
};

export default EmotionHeatmapCalendar;
