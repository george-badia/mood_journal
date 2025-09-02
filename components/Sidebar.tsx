import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, JournalIcon, AnalyticsIcon, HistoryIcon, CloseIcon, LogoutIcon, CrownIcon, WellnessIcon } from '../constants';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-indigo-100'
    }`;

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`flex flex-col w-64 bg-white border-r border-gray-200 p-4 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-30 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-primary">MoodFlow</h1>
              {user?.subscriptionStatus === 'premium' && (
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      <CrownIcon className="h-4 w-4" />
                      Premium
                  </span>
              )}
            </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
            <CloseIcon />
          </button>
        </div>

        {/* User Profile Section */}
        {user && user.profileCompleted && user.profile && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.profile.profilePicture ? (
                  <img 
                    src={user.profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.profile.firstName} {user.profile.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <NavLink 
              to="/profile" 
              className="mt-3 block text-center text-xs text-brand-primary hover:text-indigo-700 transition-colors"
            >
              View Profile
            </NavLink>
          </div>
        )}

        <nav className="flex-1 space-y-3">
          <NavLink to="/dashboard" className={navLinkClass}>
            <DashboardIcon className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/journal" className={navLinkClass}>
            <JournalIcon className="mr-3 h-5 w-5" />
            New Entry
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            <HistoryIcon className="mr-3 h-5 w-5" />
            History
          </NavLink>
          <NavLink to="/analytics" className={navLinkClass}>
            <AnalyticsIcon className="mr-3 h-5 w-5" />
            Analytics
          </NavLink>
           <NavLink to="/wellness" className={navLinkClass}>
            <div className="flex items-center">
              <WellnessIcon className="mr-3 h-5 w-5" />
              Wellness
            </div>
             {user?.subscriptionStatus !== 'premium' && <span className="ml-auto bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">Premium</span>}
          </NavLink>
        </nav>
        <div className="mt-auto">
            <button onClick={logout} className="flex items-center w-full px-4 py-3 text-lg text-gray-600 rounded-lg hover:bg-indigo-100 mb-2 transition-colors">
                <LogoutIcon className="mr-3 h-5 w-5" />
                Logout
            </button>
            <p className="text-center text-xs text-gray-400">&copy; 2024 MoodFlow AI</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;