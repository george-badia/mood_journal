
import React, { useState, useEffect } from 'react';
import { useJournal } from '../hooks/useJournal';
import { getSelfCareRecommendations } from '../services/geminiService';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    </div>
);

const SelfCareRecommendations: React.FC = () => {
    const { entries } = useJournal();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (entries.length === 0) {
            setLoading(false);
            return;
        }

        const fetchRecommendations = async () => {
            setLoading(true);
            setError('');
            try {
                const result = await getSelfCareRecommendations(entries);
                setRecommendations(result);
            } catch (err) {
                setError('Could not get recommendations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [entries]);

    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-red-500 text-sm">{error}</p>;
    if (entries.length === 0) return <p className="text-gray-500 text-sm">Create an entry to receive personalized tips.</p>;

    return (
        <ul className="space-y-3">
            {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                    <span className="text-brand-secondary mr-3 mt-1">&#10003;</span>
                    <span className="text-gray-700">{rec}</span>
                </li>
            ))}
        </ul>
    );
};

export default SelfCareRecommendations;
