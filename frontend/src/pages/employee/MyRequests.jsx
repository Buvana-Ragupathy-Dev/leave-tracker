import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { confirm, toast } from '../../utils/swal';

const STATUS_COLORS = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', CANCELLED: 'badge-secondary' };

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchRequests = () => {
    setLoading(true);
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    api.get('/leave-requests', { params })
      .then((res) => { setRequests(res.data.data); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchRequests, [page, statusFilter]);

  const handleCancel = async (id) => {
    const result = await confirm('This will cancel your leave request.');
    if (!result.isConfirmed) return;
    try {
      await api.patch(`/leave-requests/${id}/cancel`);
      toast('success', 'Leave request cancelled');
      fetchRequests();
    } catch (err) {
      toast('error', err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Leave Requests</h2>
        <button className="btn btn-primary" onClick={() => navigate('/apply-leave')}>Apply Leave</button>
      </div>
      <div className="filters">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['PENDING','APPROVED','REJECTED','CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && <tr><td colSpan={7} className="text-center">No requests found</td></tr>}
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.ticket_number}</td>
                  <td>{r.leave_type}</td>
                  <td>{r.start_date?.slice(0,10)}</td>
                  <td>{r.end_date?.slice(0,10)}</td>
                  <td>{r.leave_days}</td>
                  <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/my-requests/${r.id}/activity`)}>
                      Activity
                    </button>
                    {r.status === 'PENDING' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancel(r.id)}>Cancel</button>
                    )}
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
        </>
      )}
    </div>
  );
}
