import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useDarkMode from '../hooks/useDarkMode';
import { SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useDarkMode();

  const handleLogout = () => {
    logout(() => {
      navigate('/login');
    });
  };

  return (
    <nav className="bg-white dark:bg-zinc-800 shadow-md p-4 sticky top-0 z-10 ">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={toggleSidebar} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
        <ul className="flex items-center space-x-4">
          <li>
            <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-transparent hover:border-gray-400">
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-500" />
              )}
            </button>
          </li>
          {user && (
            <li className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-700 font-semibold dark:text-gray-300">{user.email || user.name}</span>
              </div>
              <button onClick={handleLogout} className="bg-transparent hover:text-red-500 text-blue-400 dark:text-gray-100 font-bold py-2 px-4 rounded-lg text-sm">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
