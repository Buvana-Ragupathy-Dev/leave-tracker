import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <span className="navbar-brand">Leave Tracker</span>
      <div className="navbar-links">
        {user?.roleset?.includes('employee') && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/apply-leave">Apply Leave</NavLink>
            <NavLink to="/my-requests">My Requests</NavLink>
          </>
        )}
        {user?.roleset?.includes('manager') && (
          <NavLink to="/manager/requests">Team Requests</NavLink>
        )}
        {user?.roleset?.includes('admin') && (
          <>
            <NavLink to="/admin/requests">All Requests</NavLink>
            <NavLink to="/admin/employees">Employees</NavLink>
            <NavLink to="/admin/calendar">Calendar</NavLink>
          </>
        )}
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
