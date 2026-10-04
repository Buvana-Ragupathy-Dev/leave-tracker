import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function AdminEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  useEffect(() => {
    const params = { page, limit };
    if (search) params.search = search;
    api.get('/admin/employees', { params })
      .then((res) => { setEmployees(res.data.data); setTotal(res.data.total); });
  }, [page, search]);

  return (
    <div className="page">
      <h2>Employee Management</h2>
      <div className="filters">
        <input
          type="text" placeholder="Search by name or email..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Manager</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {employees.length === 0 && <tr><td colSpan={5} className="text-center">No employees found</td></tr>}
          {employees.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.email}</td>
              <td>{e.role}</td>
              <td>{e.manager_name || '—'}</td>
              <td>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/admin/employees/${e.id}/edit`)}>
                  Edit
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
