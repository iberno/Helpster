import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ChartBarIcon, TicketIcon, BookOpenIcon, UserGroupIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user } = useAuth();

  const activeLink = "bg-blue-500 dark:bg-blue-700";
  const normalLink = "hover:bg-gray-200 dark:hover:bg-zinc-700";

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0 dark:bg-zinc-800">
      <div className="p-6">
        <NavLink to="/dashboard" className="text-2xl font-bold text-gray-800 dark:text-gray-100">Helpster</NavLink>
      </div>
      <nav className="p-2">
        <NavLink to="/dashboard" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink}`}>
          <ChartBarIcon className="h-6 w-6 mr-3" /> Dashboard
        </NavLink>
        {user && (
          <>
            <NavLink to="/tickets" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink}`}>
              <TicketIcon className="h-6 w-6 mr-3" /> Tickets
            </NavLink>
            <NavLink to="/knowledge-base" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink}`}>
              <BookOpenIcon className="h-6 w-6 mr-3" /> Base de Conhecimento
            </NavLink>
            {user.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink}`}>
                <UserGroupIcon className="h-6 w-6 mr-3" /> Admin
              </NavLink>
            )}
            {(user.role === 'admin' || user.role === 'manager') && (
              <NavLink to="/manager" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink}`}>
                <BriefcaseIcon className="h-6 w-6 mr-3" /> Manager
              </NavLink>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;