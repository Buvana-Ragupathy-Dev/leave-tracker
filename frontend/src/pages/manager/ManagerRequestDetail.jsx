import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api/client';
import { toast } from '../../utils/swal';

export default function ManagerRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/manager/leave-requests/${encodeURIComponent(id)}`),
      api.get(`/manager/leave-requests/${encodeURIComponent(id)}/activities`),
    ]).then(([reqRes, actRes]) => {
      setRequest(reqRes.data);
      setActivities(actRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    const { value: remarks, isConfirmed } = await Swal.fire({
      title: 'Approve Leave Request',
      input: 'textarea',
      inputLabel: 'Remarks (optional)',
      inputPlaceholder: 'Add any remarks...',
      inputAttributes: { rows: 3 },
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Approve',
    });
    if (!isConfirmed) return;
    try {
      await api.patch(`/manager/leave-requests/${encodeURIComponent(id)}/approve`, { remarks: remarks || undefined });
      toast('success', 'Leave request approved');
      navigate('/manager/requests');
    } catch (err) {
      toast('error', err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    const { value: rejection_reason, isConfirmed } = await Swal.fire({
      title: 'Reject Leave Request',
      input: 'textarea',
      inputLabel: 'Rejection Reason (required)',
      inputPlaceholder: 'State the reason for rejection...',
      inputAttributes: { rows: 3 },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reject',
      inputValidator: (value) => !value?.trim() && 'Rejection reason is required',
    });
    if (!isConfirmed) return;
    try {
      await api.patch(`/manager/leave-requests/${encodeURIComponent(id)}/reject`, { rejection_reason });
      toast('success', 'Leave request rejected');
      navigate('/manager/requests');
    } catch (err) {
      toast('error', err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (!request) return <div className="page"><p>Request not found</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Leave Request — {request.ticket_number}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      </div>
      <div className="detail-card">
        <div className="detail-row"><label>Employee</label><span>{request.employee_name}</span></div>
        <div className="detail-row"><label>Leave Type</label><span>{request.leave_type}</span></div>
        <div className="detail-row"><label>From</label><span>{request.start_date?.slice(0, 10)}</span></div>
        <div className="detail-row"><label>To</label><span>{request.end_date?.slice(0, 10)}</span></div>
        <div className="detail-row"><label>Working Days</label><span>{request.leave_days}</span></div>
        <div className="detail-row"><label>Status</label><span className={`badge ${request.status === 'PENDING' ? 'badge-warning' : request.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>{request.status}</span></div>
        <div className="detail-row"><label>Reason</label><span>{request.reason}</span></div>
      </div>

      {request.status === 'PENDING' && (
        <div className="action-buttons">
          <button className="btn btn-success" onClick={handleApprove}>Approve</button>
          <button className="btn btn-danger" onClick={handleReject}>Reject</button>
        </div>
      )}

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
