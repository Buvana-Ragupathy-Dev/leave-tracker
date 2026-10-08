import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { toast } from '../../utils/swal';
import { decryptData } from '../../utils/crypto';

export default function AdminEditEmployee() {
  const { id } = useParams(); // encrypted id
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', role: '', roleset: [], manager_id: '' });
  const [managers, setManagers] = useState([]);
  const [defaultManager, setDefaultManager] = useState(null);

  useEffect(() => {
    (async () => {
      const rawId = await decryptData(decodeURIComponent(id));
      api.get('/admin/employees', { params: { limit: 100 } }).then((res) => {
        const all = res.data.data;
        const emp = all.find((e) => String(e.id) === rawId);
        if (emp) {
          const rs = typeof emp.roleset === 'string' ? JSON.parse(emp.roleset) : (emp.roleset || []);
          const role = emp.role;
          const roleset = rs.includes(role) ? rs : [role, ...rs];
          setForm({
            name: emp.name,
            role: emp.role,
            roleset,
            manager_id: emp.manager_id ? String(emp.manager_id) : '',
          });
        }

        const mgrs = all.filter((e) => {
          const rs = typeof e.roleset === 'string' ? JSON.parse(e.roleset) : (e.roleset || []);
          return rs.includes('manager');
        });
        setManagers(mgrs);

        const def = all.find((e) => e.email === 'rahul.verma@company.com');
        if (def) setDefaultManager(def);
      });
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/employees/${encodeURIComponent(id)}`, { name: form.name, role: form.role, roleset: form.roleset });
      await api.patch(`/admin/employees/${encodeURIComponent(id)}/manager`, { manager_id: form.manager_id || null });
      toast('success', 'Employee updated successfully');
      navigate('/admin/employees');
    } catch (err) {
      toast('error', err.response?.data?.message || 'Update failed');
    }
  };

  // Toggle: add if not present, remove if present — no duplicates
  const toggleRole = (role) => {
    setForm((f) => {
      if (role === f.role) return f; // primary role cannot be unchecked
      const roleset = f.roleset.includes(role)
        ? f.roleset.filter((r) => r !== role)
        : [...f.roleset, role];
      return { ...f, roleset };
    });
  };

  const handleRoleChange = (newRole) => {
    setForm((f) => ({
      ...f,
      role: newRole,
      roleset: f.roleset.includes(newRole) ? f.roleset : [...f.roleset, newRole],
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
          <select value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label>Roles</label>
          <div className="checkbox-group">
            {['employee', 'manager', 'admin'].map((r) => (
              <label key={r} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.roleset.includes(r)}
                  onChange={() => toggleRole(r)}
                />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </label>
            ))}
          </div>
        </div>
        {(form.role === 'employee' || form.roleset.includes('employee')) && (
          <div className="form-group">
            <label>Manager</label>
            <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })}>
              <option value="">
                {defaultManager
                  ? `Default: ${defaultManager.name} (${defaultManager.email})`
                  : 'No Manager'}
              </option>
              {managers.map((m) => (
                <option key={m.id} value={String(m.id)}>{m.name} ({m.email})</option>
              ))}
            </select>
            {!form.manager_id && defaultManager && (
              <small style={{ color: 'var(--text-muted)' }}>
                No manager assigned — leave requests will go to {defaultManager.name} ({defaultManager.email})
              </small>
            )}
          </div>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
