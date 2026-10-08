import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function ApprovedTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  useEffect(() => {
    const params = { page, limit };
    if (search) params.search = search;
    api.get('/manager/approved-tickets', { params })
      .then((res) => { setTickets(res.data.data); setTotal(res.data.total); });
  }, [page, search]);

  return (
    <div className="page">
      <h2>Approved Tickets</h2>
      <div className="filters">
        <input
          type="text" placeholder="Search by employee or ticket..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Ticket</th><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Approved On</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 && <tr><td colSpan={8} className="text-center">No approved tickets found</td></tr>}
          {tickets.map((r) => (
            <tr key={r.id}>
              <td>{r.ticket_number}</td>
              <td>{r.employee_name}</td>
              <td>{r.leave_type}</td>
              <td>{r.start_date?.slice(0,10)}</td>
              <td>{r.end_date?.slice(0,10)}</td>
              <td>{r.leave_days}</td>
              <td>{r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : '—'}</td>
              <td>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/manager/requests/${r.id}`)}>
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
