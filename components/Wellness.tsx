
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PremiumModal from './PremiumModal';
import EmotionHeatmapCalendar from './EmotionHeatmapCalendar';
import TriggerDetection from './TriggerDetection';
import SelfCareRecommendations from './SelfCareRecommendations';
import { CrownIcon } from '../constants';

const Wellness: React.FC = () => {
    const { user } = useAuth();
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    if (user?.subscriptionStatus !== 'premium') {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-lg max-w-2xl mx-auto">
                    <CrownIcon className="mx-auto h-16 w-16 text-amber-400" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-800">Unlock Your Wellness Insights</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        This is a premium feature. Upgrade your account to access powerful AI-driven tools like the Emotion Heatmap, Trigger Detection, and personalized Self-Care Recommendations to gain deeper insights into your mental wellbeing.
                    </p>
                    <button
                        onClick={() => setIsPremiumModalOpen(true)}
                        className="mt-8 px-8 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Upgrade to Premium
                    </button>
                </div>
                {isPremiumModalOpen && (
                    <PremiumModal onClose={() => setIsPremiumModalOpen(false)} />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Wellness Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Emotion Heatmap Calendar */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Emotion Heatmap Calendar</h3>
                        <EmotionHeatmapCalendar />
                    </div>
                </div>
                
                <div className="lg:col-span-2 space-y-8">
                    {/* Trigger Detection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">AI-Powered Trigger Detection</h3>
                        <TriggerDetection />
                    </div>

                    {/* Self-Care Recommendations */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Personalized Self-Care Tips</h3>
                        <SelfCareRecommendations />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wellness;
