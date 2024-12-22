import React from 'react';
import { useAuth } from './context/AuthContext';

function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-gray-800 dark:to-gray-900 py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-pink-400 dark:from-blue-400 dark:to-purple-400">
          StreakMaster
        </h1>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="px-4 py-2 border border-white text-white rounded-md hover:bg-white hover:text-indigo-600 dark:hover:text-gray-900 transition-colors duration-200"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;