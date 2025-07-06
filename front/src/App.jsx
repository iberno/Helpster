import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
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
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
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
        </Route>
      </Routes>
    </Router>
  );
}



export default App;
