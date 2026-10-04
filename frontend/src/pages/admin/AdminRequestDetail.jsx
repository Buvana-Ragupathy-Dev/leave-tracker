import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/leave-requests/${id}`),
      api.get(`/admin/leave-requests/${id}/activities`),
    ]).then(([reqRes, actRes]) => {
      setRequest(reqRes.data);
      setActivities(actRes.data);
    });
  }, [id]);

  if (!request) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Leave Request — {request.ticket_number}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/requests')}>Back</button>
      </div>
      <div className="detail-card">
        <div className="detail-row"><label>Employee</label><span>{request.employee_name}</span></div>
        <div className="detail-row"><label>Manager</label><span>{request.manager_name || '—'}</span></div>
        <div className="detail-row"><label>Leave Type</label><span>{request.leave_type}</span></div>
        <div className="detail-row"><label>From</label><span>{request.start_date?.slice(0,10)}</span></div>
        <div className="detail-row"><label>To</label><span>{request.end_date?.slice(0,10)}</span></div>
        <div className="detail-row"><label>Working Days</label><span>{request.leave_days}</span></div>
        <div className="detail-row"><label>Status</label><span>{request.status}</span></div>
        <div className="detail-row"><label>Reason</label><span>{request.reason}</span></div>
        {request.rejection_reason && (
          <div className="detail-row"><label>Rejection Reason</label><span>{request.rejection_reason}</span></div>
        )}
        {request.reviewed_by_name && (
          <div className="detail-row"><label>Reviewed By</label><span>{request.reviewed_by_name}</span></div>
        )}
      </div>
      <h3>Activity History</h3>
      <div className="activity-timeline">
        {activities.map((a, i) => (
          <div key={i} className="activity-item">
            <div className="activity-action">{a.action}</div>
            <div className="activity-meta">
              <span>By: {a.performed_by}</span>
              <span>{new Date(a.created_at).toLocaleString()}</span>
            </div>
            {a.remarks && <div className="activity-remarks">{a.remarks}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
