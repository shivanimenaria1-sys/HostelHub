import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // SVG Icons
  const HomeIcon = () => (
    <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const SpeakerIcon = () => (
    <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  const EditIcon = () => (
    <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const BellIcon = () => (
    <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  const MoonIcon = () => (
    <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-5 h-5 stroke-current" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      
      {/* 1. Desktop Top Navigation */}
      {isAuthenticated && (
        <nav className="hidden md:block sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
                🏠 HostelHub
              </Link>
              
              {/* NavLinks */}
              <div className="flex items-center gap-5">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-xs font-bold tracking-wide transition-all ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  Marketplace
                </NavLink>
                <NavLink
                  to="/needs"
                  className={({ isActive }) =>
                    `text-xs font-bold tracking-wide transition-all ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  Open Needs
                </NavLink>
                <NavLink
                  to="/needs/new"
                  className={({ isActive }) =>
                    `text-xs font-bold tracking-wide transition-all ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  Post a Need
                </NavLink>
                <NavLink
                  to="/products/my-listings"
                  className={({ isActive }) =>
                    `text-xs font-bold tracking-wide transition-all ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  My Listings
                </NavLink>
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-4 relative">
              {/* Prominent Add Listing Button */}
              <Link
                to="/products/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-950/20"
              >
                <PlusIcon /> Add Product
              </Link>

              {/* Notification bell placeholder */}
              <button
                onClick={() => alert('Notifications feature coming soon!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 transition-all"
                title="Notifications"
              >
                <BellIcon />
              </button>

              {/* Dark mode placeholder */}
              <button
                onClick={() => alert('Dark Mode configuration is already loaded by default!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 transition-all"
                title="Toggle Theme"
              >
                <MoonIcon />
              </button>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(prev => !prev)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-slate-800 hover:border-indigo-500 transition-all"
                >
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center font-bold text-slate-400">
                      👤
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-2 z-55">
                    <div className="px-4 py-2 border-b border-slate-800 text-left">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 hover:text-rose-350"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* 2. Main Page Render */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {/* 3. Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-t border-slate-900 py-2.5 px-4 flex justify-between items-center shadow-2xl">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[9px] font-bold transition-all flex-1 ${
                isActive ? 'text-indigo-400 scale-102' : 'text-slate-500 hover:text-slate-400'
              }`
            }
          >
            <HomeIcon />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/needs"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[9px] font-bold transition-all flex-1 ${
                isActive ? 'text-indigo-400 scale-102' : 'text-slate-500 hover:text-slate-400'
              }`
            }
          >
            <SpeakerIcon />
            <span>Needs</span>
          </NavLink>

          {/* Prominent Plus Button in the Center */}
          <div className="flex-1 flex justify-center -mt-6">
            <Link
              to="/products/new"
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-650/40 border-4 border-slate-950 transition-all hover:scale-105 active:scale-95"
            >
              <PlusIcon />
            </Link>
          </div>

          <NavLink
            to="/needs/new"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[9px] font-bold transition-all flex-1 ${
                isActive ? 'text-indigo-400 scale-102' : 'text-slate-500 hover:text-slate-400'
              }`
            }
          >
            <EditIcon />
            <span>Post Need</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[9px] font-bold transition-all flex-1 ${
                isActive ? 'text-indigo-400 scale-102' : 'text-slate-500 hover:text-slate-400'
              }`
            }
          >
            <ProfileIcon />
            <span>Profile</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
};

export default Layout;
