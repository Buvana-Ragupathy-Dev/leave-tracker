import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', employee: 'Employee' };

export default function Navbar({ routeRole, activeLink }) {
  const { user, logout, activeRole, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleRoleSwitch = (role) => {
    switchRole(role);
    if (role === 'admin') navigate('/admin/requests');
    else if (role === 'manager') navigate('/manager/requests');
    else navigate('/dashboard');
  };

  const displayRole = routeRole || activeRole;
  const multiRole = user?.roleset?.length > 1;

  // Helper: force active class on a specific link (overrides NavLink's own matching)
  const linkClass = (to) =>
    activeLink === to ? 'active' : undefined;

  return (
    <nav className="navbar">
      <span className="navbar-brand">Leave Tracker</span>
      <div className="navbar-links">
        {displayRole === 'employee' && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/apply-leave">Apply Leave</NavLink>
            <NavLink to="/my-requests">My Requests</NavLink>
          </>
        )}
        {displayRole === 'manager' && (
          <>
            <NavLink to="/manager/requests" end className={linkClass('/manager/requests')}>Team Requests</NavLink>
          </>
        )}
        {displayRole === 'admin' && (
          <>
            <NavLink to="/admin/requests">All Requests</NavLink>
            <NavLink to="/admin/employees">Employees</NavLink>
            <NavLink to="/admin/calendar">Calendar</NavLink>
          </>
        )}
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        {multiRole && (
          <select
            className="role-switcher"
            value={displayRole || activeRole}
            onChange={(e) => handleRoleSwitch(e.target.value)}
          >
            {user.roleset.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
        )}
        {!multiRole && <span className="role-badge">{ROLE_LABELS[activeRole] || activeRole}</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
