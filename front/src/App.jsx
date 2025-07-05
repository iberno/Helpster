import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ProtectedPage from './pages/ProtectedPage';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import TicketListPage from './pages/TicketListPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import KnowledgeBaseListPage from './pages/KnowledgeBaseListPage';
import KnowledgeBaseFormPage from './pages/admin/KnowledgeBaseFormPage';
import KnowledgeBaseDetailPage from './pages/KnowledgeBaseDetailPage';

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
          <Route path="/admin/categories" element={<CategoryManagementPage />} />
          <Route path="/manager" element={<ManagerPage />} />
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBaseListPage />} />
          <Route path="/knowledge-base/new" element={<KnowledgeBaseFormPage />} />
          <Route path="/knowledge-base/:id" element={<KnowledgeBaseDetailPage />} />
          <Route path="/knowledge-base/:id/edit" element={<KnowledgeBaseFormPage />} />
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
