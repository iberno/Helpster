import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen dark:bg-zinc-700">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-6 flex-grow bg-gray-100 dark:bg-zinc-700">
          <Outlet /> {/* As rotas aninhadas serão renderizadas aqui */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;