import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">RBAC App</Link>
        <ul className="flex space-x-4">
          <li><Link to="/public" className="hover:text-gray-300">Público</Link></li>
          {user && (
            <>
              <li><Link to="/tickets" className="hover:text-gray-300">Tickets</Link></li>
              <li><Link to="/knowledge-base" className="hover:text-gray-300">Base de Conhecimento</Link></li>
              <li><Link to="/protected" className="hover:text-gray-300">Protegido</Link></li>
              {user.role === 'admin' && (
                <li><Link to="/admin" className="hover:text-gray-300">Admin</Link></li>
              )}
              {(user.role === 'admin' || user.role === 'manager') && (
                <li><Link to="/manager" className="hover:text-gray-300">Manager</Link></li>
              )}
              <li>
                <button onClick={logout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">
                  Logout ({user.email || user.role})
                </button>
              </li>
            </>
          )}
          {!user && (
            <>
              <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
