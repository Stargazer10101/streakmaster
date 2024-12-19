import React from 'react';
import { useAuth } from './context/AuthContext';

function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">StreakMaster</h1>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;