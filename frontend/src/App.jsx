import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ApprovedTickets from './pages/manager/ApprovedTickets';

import AdminRequests from './pages/admin/AdminRequests';
import AdminRequestDetail from './pages/admin/AdminRequestDetail';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminEditEmployee from './pages/admin/AdminEditEmployee';
import AdminCalendar from './pages/admin/AdminCalendar';

// Map URL prefixes to required role + which nav link to highlight
const ROUTE_ROLE_MAP = [
  { prefix: '/admin/', role: 'admin' },
  { prefix: '/manager/requests', role: 'manager', activeLink: '/manager/requests' },
  { prefix: '/manager/approved-tickets', role: 'manager', activeLink: '/manager/approved-tickets' },
  { prefix: '/manager/', role: 'manager' },
  { prefix: '/dashboard', role: 'employee' },
  { prefix: '/apply-leave', role: 'employee' },
  { prefix: '/my-requests', role: 'employee' },
];

function defaultHomeFor(role) {
  if (role === 'admin') return '/admin/requests';
  if (role === 'manager') return '/manager/requests';
  return '/dashboard';
}

function AppRoutes() {
  const { user, activeRole } = useAuth();
  const location = useLocation();

  // Detect which role the current URL belongs to
  const routeMatch = ROUTE_ROLE_MAP.find((m) => location.pathname.startsWith(m.prefix));
  const routeRole = routeMatch?.role;
  const activeLink = routeMatch?.activeLink;

  return (
    <>
      {user && <Navbar routeRole={routeRole} activeLink={activeLink} />}
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Employee */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['employee', 'manager']}><Dashboard /></ProtectedRoute>} />
        <Route path="/apply-leave" element={<ProtectedRoute roles={['employee', 'manager']}><ApplyLeave /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute roles={['employee', 'manager']}><MyRequests /></ProtectedRoute>} />
        <Route path="/my-requests/:id/activity" element={<ProtectedRoute roles={['employee', 'manager']}><RequestActivity /></ProtectedRoute>} />

        {/* Manager */}
        <Route path="/manager/requests" element={<ProtectedRoute roles={['manager']}><ManagerRequests /></ProtectedRoute>} />
        <Route path="/manager/requests/:id" element={<ProtectedRoute roles={['manager']}><ManagerRequestDetail /></ProtectedRoute>} />
        <Route path="/manager/approved-tickets" element={<ProtectedRoute roles={['manager']}><ApprovedTickets /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/requests" element={<ProtectedRoute roles={['admin']}><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/requests/:id" element={<ProtectedRoute roles={['admin']}><AdminRequestDetail /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute roles={['admin']}><AdminEmployees /></ProtectedRoute>} />
        <Route path="/admin/employees/:id/edit" element={<ProtectedRoute roles={['admin']}><AdminEditEmployee /></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute roles={['admin']}><AdminCalendar /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to={user ? defaultHomeFor(activeRole) : '/login'} replace />} />
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
