
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useJournal } from '../hooks/useJournal';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

const EmotionPieChart: React.FC = () => {
    const { entries } = useJournal();

    const emotionData = useMemo(() => {
        const emotionMap = new Map<string, number>();
        entries.forEach(entry => {
            if (entry.analysis) {
                entry.analysis.emotions.forEach(emotion => {
                    emotionMap.set(emotion.emotion, (emotionMap.get(emotion.emotion) || 0) + emotion.score);
                });
            }
        });

        if (emotionMap.size === 0) return [];
        
        return Array.from(emotionMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

    }, [entries]);

    if (emotionData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No emotion data to display. AI analysis will provide this.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [null, name]} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default EmotionPieChart;
