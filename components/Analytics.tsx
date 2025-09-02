import React, { useState } from 'react';
import MoodChart from './MoodChart';
import EmotionPieChart from './EmotionPieChart';
import RecentEntries from './RecentEntries';
import { DownloadIcon } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useJournal } from '../hooks/useJournal';
import PremiumModal from './PremiumModal';
import { generatePDFReport, ReportData } from '../services/pdfGenerator';

const Analytics: React.FC = () => {
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const { user } = useAuth();
    const { entries } = useJournal();

    const handleGenerateReport = async () => {
        if (user?.subscriptionStatus !== 'premium') {
            setIsPremiumModalOpen(true);
            return;
        }

        try {
            setIsGeneratingReport(true);

            // Prepare report data
            const now = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);

            // Filter entries from last 3 months
            const recentEntries = entries.filter(entry => 
                new Date(entry.date) >= threeMonthsAgo
            );

            const reportData: ReportData = {
                entries: recentEntries,
                dateRange: {
                    start: threeMonthsAgo.toISOString(),
                    end: now.toISOString()
                },
                userProfile: user.profile ? {
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    email: user.email
                } : undefined
            };

            await generatePDFReport(reportData);
            
            // Show success message
            alert('PDF report generated successfully! Check your downloads folder.');

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate PDF report. Please try again.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Analytics & Reports</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Mood Trend Overview</h3>
                    <MoodChart height={400} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Emotion Breakdown</h3>
                    <div className="flex-grow flex items-center justify-center">
                        <EmotionPieChart />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">Clinician-Grade Reporting</h3>
                    <button 
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className={`flex items-center px-4 py-2 font-semibold rounded-lg transition-colors ${
                            isGeneratingReport 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-brand-secondary text-white hover:bg-emerald-600'
                        }`}
                    >
                        <DownloadIcon className="mr-2 h-5 w-5" />
                        {isGeneratingReport ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Generate PDF Report'
                        )}
                        {user?.subscriptionStatus !== 'premium' && !isGeneratingReport && (
                            <span className="ml-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">Premium</span>
                        )}
                    </button>
                </div>
                <p className="text-gray-600">
                    {user?.subscriptionStatus === 'premium' 
                        ? 'Generate detailed, shareable PDF reports of your emotional journey from the last 3 months. These reports include mood trends, emotion analysis, and journal entries - perfect for sharing with therapists or personal reflection.'
                        : 'Upgrade to Premium to generate detailed, shareable PDF reports of your emotional journey, providing summaries, trend analysis, and key insights.'
                    }
                </p>
                {user?.subscriptionStatus === 'premium' && entries.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                            No journal entries found. Start writing entries to generate meaningful reports!
                        </p>
                    </div>
                )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                 <h3 className="text-xl font-semibold mb-4 text-gray-700">All Journal Entries</h3>
                <RecentEntries />
            </div>

            {isPremiumModalOpen && (
                <PremiumModal onClose={() => setIsPremiumModalOpen(false)} />
            )}
        </div>
    );
};

export default Analytics;