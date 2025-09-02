import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useJournal } from '../hooks/useJournal';
import { Mood, JournalEntry } from '../types';
import { MOOD_CONFIG, DotsVerticalIcon, EditIcon, TrashIcon } from '../constants';
import EditEntryModal from './EditEntryModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const EntryCard: React.FC<{
    entry: JournalEntry;
    onEdit: (entry: JournalEntry) => void;
    onDelete: (entry: JournalEntry) => void;
}> = ({ entry, onEdit, onDelete }) => {
    const config = MOOD_CONFIG[entry.mood];
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-bold text-gray-800 text-lg">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center">
                    <div className={`text-3xl p-2 rounded-full`}>
                        {config.emoji}
                    </div>
                     <div className="relative ml-2" ref={menuRef}>
                        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <DotsVerticalIcon />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <button
                                    onClick={() => { onEdit(entry); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                    <EditIcon className="mr-3 h-4 w-4" /> Edit
                                </button>
                                <button
                                    onClick={() => { onDelete(entry); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <TrashIcon className="mr-3 h-4 w-4" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <p className="text-gray-600 mb-4 flex-grow">{entry.text.substring(0, 120)}{entry.text.length > 120 ? '...' : ''}</p>
            {entry.analysis?.keywords && entry.analysis.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-gray-100">
                    {entry.analysis.keywords.slice(0, 3).map(keyword => (
                        <span key={keyword} className="text-xs font-medium bg-indigo-100 text-brand-primary px-2.5 py-1 rounded-full">{keyword}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

const History: React.FC = () => {
    const { entries, deleteEntry } = useJournal();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    
    const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
    const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

    const handleMoodToggle = (mood: Mood) => {
        setSelectedMoods(prev =>
            prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
        );
    };

    const handleDeleteConfirm = () => {
        if (entryToDelete) {
            deleteEntry(entryToDelete.id);
            setEntryToDelete(null);
        }
    };

    const filteredAndSortedEntries = useMemo(() => {
        let filtered = entries;

        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(entry =>
                entry.text.toLowerCase().includes(lowercasedFilter) ||
                (entry.analysis?.keywords.some(k => k.toLowerCase().includes(lowercasedFilter)))
            );
        }

        if (selectedMoods.length > 0) {
            filtered = filtered.filter(entry => selectedMoods.includes(entry.mood));
        }

        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    }, [entries, searchTerm, selectedMoods, sortOrder]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Journal History</h2>

            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by text or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                    {/* Sort Dropdown */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                    >
                        <option value="newest">Sort by: Newest First</option>
                        <option value="oldest">Sort by: Oldest First</option>
                    </select>
                </div>
                {/* Mood Filters */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by mood:</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(Mood).map(mood => {
                            const config = MOOD_CONFIG[mood];
                            const isSelected = selectedMoods.includes(mood);
                            return (
                                <button
                                    key={mood}
                                    onClick={() => handleMoodToggle(mood)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border-2 flex items-center gap-2 ${
                                        isSelected ? `bg-brand-primary text-white border-brand-primary` : 'bg-white text-gray-700 border-gray-200 hover:border-brand-primary'
                                    }`}
                                >
                                    <span className="text-lg">{config.emoji}</span>
                                    {mood}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Entries Grid */}
            {filteredAndSortedEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedEntries.map(entry => (
                        <EntryCard 
                            key={entry.id} 
                            entry={entry}
                            onEdit={setEntryToEdit}
                            onDelete={setEntryToDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-12 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-700">No Entries Found</h3>
                    <p className="mt-2 text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            )}
            
            {entryToEdit && (
                <EditEntryModal 
                    entry={entryToEdit}
                    onClose={() => setEntryToEdit(null)}
                />
            )}

            {entryToDelete && (
                <ConfirmDeleteModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setEntryToDelete(null)}
                    loading={false}
                />
            )}
        </div>
    );
};

export default History;
