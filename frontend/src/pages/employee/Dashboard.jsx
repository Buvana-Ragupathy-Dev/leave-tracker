import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const STATUS_COLORS = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', CANCELLED: 'badge-secondary' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balances, setBalances] = useState([]);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/leave-balances'),
      api.get('/leave-requests', { params: { status: 'PENDING', limit: 5 } }),
      api.get('/leave-requests', { params: { limit: 5 } }),
    ]).then(([balRes, pendRes, recRes]) => {
      setBalances(balRes.data);
      setPending(pendRes.data.data);
      setRecent(recRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <h2>Welcome, {user?.name}</h2>

      <h3>Leave Balances</h3>
      <div className="balance-grid">
        {balances.map((b) => (
          <div key={b.leave_type} className="balance-card">
            <h4>{b.leave_type}</h4>
            <div className="balance-stats">
              <span>Allocated: <strong>{b.allocated_days}</strong></span>
              <span>Used: <strong>{b.used_days}</strong></span>
              <span className="remaining">Available: <strong>{b.remaining_days}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <h3>Pending Requests</h3>
      {pending.length === 0 ? <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No pending requests.</p> : (
        <table className="table" style={{ marginBottom: 16 }}>
          <thead><tr><th>Ticket</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.id}>
                <td>{r.ticket_number}</td>
                <td>{r.leave_type}</td>
                <td>{r.start_date?.slice(0,10)}</td>
                <td>{r.end_date?.slice(0,10)}</td>
                <td>{r.leave_days}</td>
                <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Recent Requests</h3>
        <button className="btn btn-secondary" onClick={() => navigate('/my-requests')}>View All</button>
      </div>
      {recent.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No requests yet.</p> : (
        <table className="table">
          <thead><tr><th>Ticket</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td>{r.ticket_number}</td>
                <td>{r.leave_type}</td>
                <td>{r.start_date?.slice(0,10)}</td>
                <td>{r.end_date?.slice(0,10)}</td>
                <td>{r.leave_days}</td>
                <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
