import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const STATUS_COLORS = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', CANCELLED: 'badge-secondary' };

export default function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    api.get('/admin/leave-requests', { params })
      .then((res) => { setRequests(res.data.data); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  return (
    <div className="page">
      {loading && <div className="loading-overlay"><div className="loading-spinner" /></div>}
      <h2>All Leave Requests</h2>
      <div className="filters">
        <input
          type="text" placeholder="Search by employee or ticket..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Ticket</th><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 && <tr><td colSpan={8} className="text-center">No requests found</td></tr>}
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.ticket_number}</td>
              <td>{r.employee_name}</td>
              <td>{r.leave_type}</td>
              <td>{r.start_date?.slice(0, 10)}</td>
              <td>{r.end_date?.slice(0, 10)}</td>
              <td>{r.leave_days}</td>
              <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
              <td>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/admin/requests/${r.id}`)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
        <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
