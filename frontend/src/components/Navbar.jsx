import { Link, useNavigate } from 'react-router-dom';
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
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/apply-leave">Apply Leave</Link>
            <Link to="/my-requests">My Requests</Link>
          </>
        )}
        {user?.roleset?.includes('manager') && (
          <Link to="/manager/requests">Team Requests</Link>
        )}
        {user?.roleset?.includes('admin') && (
          <>
            <Link to="/admin/requests">All Requests</Link>
            <Link to="/admin/employees">Employees</Link>
            <Link to="/admin/calendar">Calendar</Link>
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
