import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import TicketsHistoryPage from './pages/TicketsHistoryPage';
import KnowledgeBaseListPage from './pages/KnowledgeBaseListPage';
import KnowledgeBaseFormPage from './pages/admin/KnowledgeBaseFormPage';
import KnowledgeBaseDetailPage from './pages/KnowledgeBaseDetailPage';
import DashboardPage from './pages/DashboardPage';

import { AnimatePresence } from 'framer-motion';
import AnimatedPage from './components/AnimatedPage';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
          <Route path="/protected" element={<AnimatedPage><ProtectedPage /></AnimatedPage>} />
          <Route path="/admin" element={<AnimatedPage><AdminPage /></AnimatedPage>} />
          <Route path="/admin/users" element={<AnimatedPage><UserManagementPage /></AnimatedPage>} />
          <Route path="/admin/roles" element={<AnimatedPage><RoleManagementPage /></AnimatedPage>} />
          <Route path="/admin/categories" element={<AnimatedPage><CategoryManagementPage /></AnimatedPage>} />
          <Route path="/manager" element={<AnimatedPage><ManagerPage /></AnimatedPage>} />
          <Route path="/tickets" element={<AnimatedPage><TicketListPage /></AnimatedPage>} />
          <Route path="/tickets/new" element={<AnimatedPage><CreateTicketPage /></AnimatedPage>} />
          <Route path="/tickets/history" element={<AnimatedPage><TicketsHistoryPage /></AnimatedPage>} />
          <Route path="/tickets/:id" element={<AnimatedPage><TicketDetailPage /></AnimatedPage>} />
          <Route path="/knowledge-base" element={<AnimatedPage><KnowledgeBaseListPage /></AnimatedPage>} />
          <Route path="/knowledge-base/new" element={<AnimatedPage><KnowledgeBaseFormPage /></AnimatedPage>} />
          <Route path="/knowledge-base/:id" element={<AnimatedPage><KnowledgeBaseDetailPage /></AnimatedPage>} />
          <Route path="/knowledge-base/:id/edit" element={<AnimatedPage><KnowledgeBaseFormPage /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
