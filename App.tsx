import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JournalProvider } from './context/JournalContext';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Analytics from './components/Analytics';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import History from './components/History';
import Wellness from './components/Wellness';
import { MenuIcon } from './constants';

const MainAppLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 lg:justify-end">
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="text-gray-500 focus:outline-none lg:hidden"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <div className="font-semibold text-lg text-brand-primary">Mood Journal AI</div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <JournalProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainAppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </JournalProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;