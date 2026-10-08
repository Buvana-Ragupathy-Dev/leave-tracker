import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { toast } from '../../utils/swal';

const LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave' },
  { id: 2, name: 'Sick Leave' },
  { id: 3, name: 'Earned Leave' },
];

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [balances, setBalances] = useState([]);
  const [leaveDays, setLeaveDays] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/leave-balances').then((res) => setBalances(res.data));
  }, []);

  // Fetch working days preview whenever dates change
  useEffect(() => {
    if (form.start_date && form.end_date && form.end_date >= form.start_date) {
      api.get('/leave-days-preview', { params: { start_date: form.start_date, end_date: form.end_date } })
        .then((res) => setLeaveDays(res.data.leave_days))
        .catch(() => setLeaveDays(null));
    } else {
      setLeaveDays(null);
    }
  }, [form.start_date, form.end_date]);

  const selectedBalance = balances.find(
    (b) => b.leave_type === LEAVE_TYPES.find((t) => t.id === Number(form.leave_type_id))?.name
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/leave-requests', {
        ...form,
        leave_type_id: Number(form.leave_type_id),
      });
      toast('success', `Ticket ${res.data.ticket_number} submitted — ${res.data.leave_days} working days`);
      setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Apply for Leave</h2>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Leave Type</label>
          <select required value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}>
            <option value="">Select leave type</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selectedBalance && (
            <small>Available: {selectedBalance.remaining_days} days</small>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>
        {leaveDays !== null && (
          <div className="form-group">
            <small style={{ color: leaveDays === 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
              {leaveDays === 0 ? 'No working days in selected range' : `Working days: ${leaveDays}`}
            </small>
          </div>
        )}
        <div className="form-group">
          <label>Reason</label>
          <textarea required rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/my-requests')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
