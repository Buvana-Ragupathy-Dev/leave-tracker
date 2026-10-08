import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ is_working_day: 1, description: '' });
  const [newEntry, setNewEntry] = useState({ calendar_date: '', is_working_day: 0, description: '' });
  const [error, setError] = useState('');

  const fetchCalendar = () => {
    api.get('/admin/calendar', { params: { year, month } })
      .then((res) => setEntries(res.data));
  };

  useEffect(fetchCalendar, [year, month]);

  const handleEdit = (entry) => {
    setEditId(entry.id);
    setEditForm({ is_working_day: entry.is_working_day, description: entry.description || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await api.patch(`/admin/calendar/${id}`, editForm);
      setEditId(null);
      fetchCalendar();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/calendar', newEntry);
      setNewEntry({ calendar_date: '', is_working_day: 0, description: '' });
      fetchCalendar();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create entry');
    }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="page">
      <h3>Add Holiday / Special Day</h3>
      <form onSubmit={handleCreate} className="form-card form-inline">
        <div className="form-group">
          <label>Date</label>
          <input type="date" required value={newEntry.calendar_date} onChange={(e) => setNewEntry({ ...newEntry, calendar_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Working Day</label>
          <select value={newEntry.is_working_day} onChange={(e) => setNewEntry({ ...newEntry, is_working_day: Number(e.target.value) })}>
            <option value={0}>No (Holiday)</option>
            <option value={1}>Yes (Working)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">Add Entry</button>
      </form>
      <h2>Working Day / Holiday Calendar</h2>
      <div className="filters">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[today.getFullYear()-1, today.getFullYear(), today.getFullYear()+1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Day</th><th>Working Day</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className={!e.is_working_day ? 'row-holiday' : ''}>
              <td>{e.calendar_date?.slice(0,10)}</td>
              <td>{new Date(e.calendar_date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
              <td>
                {editId === e.id ? (
                  <select value={editForm.is_working_day} onChange={(ev) => setEditForm({ ...editForm, is_working_day: Number(ev.target.value) })}>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                ) : (e.is_working_day ? 'Yes' : 'No')}
              </td>
              <td>
                {editId === e.id ? (
                  <input value={editForm.description} onChange={(ev) => setEditForm({ ...editForm, description: ev.target.value })} />
                ) : (e.description || '—')}
              </td>
              <td>
                {editId === e.id ? (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(e.id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(e)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
