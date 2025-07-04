import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ProtectedPage from './pages/ProtectedPage';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/public" element={<PublicPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/protected" element={<ProtectedPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/roles" element={<RoleManagementPage />} />
          <Route path="/manager" element={<ManagerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <h1 className="text-4xl font-bold text-gray-800">Bem-vindo ao RBAC App!</h1>
  </div>
);

const PublicPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <h1 className="text-4xl font-bold text-gray-800">Esta é uma página pública.</h1>
  </div>
);

export default App;
