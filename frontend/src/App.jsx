import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/employee/Login';
import Dashboard from './pages/employee/Dashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyRequests from './pages/employee/MyRequests';
import RequestActivity from './pages/employee/RequestActivity';

import ManagerRequests from './pages/manager/ManagerRequests';
import ManagerRequestDetail from './pages/manager/ManagerRequestDetail';

import AdminRequests from './pages/admin/AdminRequests';
import AdminRequestDetail from './pages/admin/AdminRequestDetail';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminEditEmployee from './pages/admin/AdminEditEmployee';
import AdminCalendar from './pages/admin/AdminCalendar';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Employee */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['employee','manager']}><Dashboard /></ProtectedRoute>} />
        <Route path="/apply-leave" element={<ProtectedRoute roles={['employee','manager']}><ApplyLeave /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute roles={['employee','manager']}><MyRequests /></ProtectedRoute>} />
        <Route path="/my-requests/:id/activity" element={<ProtectedRoute roles={['employee','manager']}><RequestActivity /></ProtectedRoute>} />

        {/* Manager */}
        <Route path="/manager/requests" element={<ProtectedRoute roles={['manager']}><ManagerRequests /></ProtectedRoute>} />
        <Route path="/manager/requests/:id" element={<ProtectedRoute roles={['manager']}><ManagerRequestDetail /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/requests" element={<ProtectedRoute roles={['admin']}><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/requests/:id" element={<ProtectedRoute roles={['admin']}><AdminRequestDetail /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute roles={['admin']}><AdminEmployees /></ProtectedRoute>} />
        <Route path="/admin/employees/:id/edit" element={<ProtectedRoute roles={['admin']}><AdminEditEmployee /></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute roles={['admin']}><AdminCalendar /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
