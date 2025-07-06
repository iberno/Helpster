import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ChartBarIcon, TicketIcon, BookOpenIcon, UserGroupIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isSidebarOpen }) => {
  const { user, hasPermission } = useAuth();

  const activeLink = "bg-blue-500 dark:bg-blue-700";
  const normalLink = "hover:bg-gray-200 dark:hover:bg-zinc-700";

  return (
    <aside className={`fixed inset-y-0 left-0 z-20 bg-white shadow-md flex-shrink-0 transform transition-all duration-300 dark:bg-zinc-800 ${isSidebarOpen ? 'translate-x-0 w-64' : 'w-20'}`}>
      <div className="p-6 overflow-hidden">
        <NavLink to="/dashboard" className="text-2xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          {isSidebarOpen ? 'Helpster' : ''}
        </NavLink>
      </div>
      <nav className="p-2">
        {user && hasPermission('dashboard:view') && (
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <ChartBarIcon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : ''}`} /> 
            <span className={`${isSidebarOpen ? '' : 'hidden'}`}>Dashboard</span>
          </NavLink>
        )}
        {user && (hasPermission('tickets:read_all') || hasPermission('tickets:read_own')) && (
          <>
            <NavLink to="/tickets" end className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <TicketIcon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : ''}`} /> 
              <span className={`${isSidebarOpen ? '' : 'hidden'}`}>Tickets Ativos</span>
            </NavLink>
            <NavLink to="/tickets/history" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <TicketIcon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : ''}`} /> 
              <span className={`${isSidebarOpen ? '' : 'hidden'}`}>Histórico de Tickets</span>
            </NavLink>
          </>
        )}
        {user && hasPermission('knowledge_base:view') && (
          <NavLink to="/knowledge-base" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <BookOpenIcon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : ''}`} /> 
            <span className={`${isSidebarOpen ? '' : 'hidden'}`}>Base de Conhecimento</span>
          </NavLink>
        )}
        {user && hasPermission('users:manage') && (
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <UserGroupIcon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : ''}`} /> 
            <span className={`${isSidebarOpen ? '' : 'hidden'}`}>Admin</span>
          </NavLink>
        )}
        {user && hasPermission('roles:manage') && (
          <NavLink to="/admin/roles" className={({ isActive }) => `flex items-center py-2.5 px-4 rounded transition duration-200 text-gray-700 dark:text-gray-300 ${isActive ? activeLink : normalLink} ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <BriefcaseIcon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : ''}`} /> 
            <span className={`${isSidebarOpen ? '' : 'hidden'}`}>Perfis</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;