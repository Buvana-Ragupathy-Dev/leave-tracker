import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function AdminEditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', role: '', roleset: [], manager_id: '' });
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/admin/employees', { params: { limit: 100 } }).then((res) => {
      const emp = res.data.data.find((e) => String(e.id) === String(id));
      if (emp) {
        const rs = typeof emp.roleset === 'string' ? JSON.parse(emp.roleset) : emp.roleset;
        setForm({ name: emp.name, role: emp.role, roleset: rs, manager_id: emp.manager_id || '' });
      }
      setManagers(res.data.data.filter((e) => {
        const rs = typeof e.roleset === 'string' ? JSON.parse(e.roleset) : e.roleset;
        return rs.includes('manager');
      }));
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.patch(`/admin/employees/${id}`, { name: form.name, role: form.role, roleset: form.roleset });
      await api.patch(`/admin/employees/${id}/manager`, { manager_id: form.manager_id || null });
      setSuccess('Employee updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const toggleRole = (role) => {
    setForm((f) => ({
      ...f,
      roleset: f.roleset.includes(role) ? f.roleset.filter((r) => r !== role) : [...f.roleset, role],
    }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Edit Employee</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/employees')}>Back</button>
      </div>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Primary Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label>Roles</label>
          <div className="checkbox-group">
            {['employee','manager','admin'].map((r) => (
              <label key={r} className="checkbox-label">
                <input type="checkbox" checked={form.roleset.includes(r)} onChange={() => toggleRole(r)} />
                {r}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Manager</label>
          <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })}>
            <option value="">No Manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
