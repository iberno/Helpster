import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen dark:bg-zinc-700">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 flex-grow bg-gray-100 dark:bg-zinc-700">
          <Outlet /> {/* As rotas aninhadas serão renderizadas aqui */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;