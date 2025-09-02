
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useJournal } from '../hooks/useJournal';
import { MOOD_CONFIG } from '../constants';
import { Mood } from '../types';

interface MoodChartProps {
    height?: number;
}

const MoodChart: React.FC<MoodChartProps> = ({ height = 300 }) => {
    const { entries } = useJournal();

    const data = useMemo(() => {
        return entries
            .map(entry => ({
                date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                mood: MOOD_CONFIG[entry.mood].value,
                moodName: entry.mood,
            }))
            .reverse();
    }, [entries]);

    if (entries.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Log your first entry to see your mood trend.</div>;
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
            <p className="font-semibold text-gray-800">{`${label}`}</p>
            <p className={`font-medium`} style={{color: '#4f46e5'}}>{`Mood: ${payload[0].payload.moodName}`}</p>
          </div>
        );
      }
      return null;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                <YAxis 
                    domain={[0, 6]} 
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(value) => Object.keys(MOOD_CONFIG).find(key => MOOD_CONFIG[key as Mood].value === value) || ''}
                    tick={{ fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} dot={{r: 5}} name="Mood Level" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MoodChart;
