import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useDarkMode from '../hooks/useDarkMode';
import { SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useDarkMode();

  const handleLogout = () => {
    logout(() => {
      navigate('/login');
    });
  };

  return (
    <nav className="bg-white dark:bg-zinc-800 shadow-md p-4 sticky top-0 z-10 ">
      <div className="container mx-auto flex justify-end items-center">
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
          {user ? (
            <li className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-700 font-semibold dark:text-gray-300">{user.email || user.role}</span>
              </div>
              <button onClick={handleLogout} className="bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-lg text-sm">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-semibold">
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
