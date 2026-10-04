import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function ManagerRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/manager/leave-requests/${id}`)
      .then((res) => setRequest(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm('Approve this leave request?')) return;
    try {
      await api.patch(`/manager/leave-requests/${id}/approve`);
      navigate('/manager/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/manager/leave-requests/${id}/reject`, { rejection_reason: rejectionReason });
      navigate('/manager/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (!request) return <div className="page"><p>Request not found</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Leave Request — {request.ticket_number}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/manager/requests')}>Back</button>
      </div>
      <div className="detail-card">
        <div className="detail-row"><label>Employee</label><span>{request.employee_name}</span></div>
        <div className="detail-row"><label>Leave Type</label><span>{request.leave_type}</span></div>
        <div className="detail-row"><label>From</label><span>{request.start_date?.slice(0,10)}</span></div>
        <div className="detail-row"><label>To</label><span>{request.end_date?.slice(0,10)}</span></div>
        <div className="detail-row"><label>Working Days</label><span>{request.leave_days}</span></div>
        <div className="detail-row"><label>Status</label><span className="badge badge-warning">{request.status}</span></div>
        <div className="detail-row"><label>Reason</label><span>{request.reason}</span></div>
      </div>
      {error && <p className="error">{error}</p>}
      {request.status === 'PENDING' && (
        <div className="action-buttons">
          <button className="btn btn-success" onClick={handleApprove}>Approve</button>
          <button className="btn btn-danger" onClick={() => setShowRejectForm(!showRejectForm)}>Reject</button>
        </div>
      )}
      {showRejectForm && (
        <form onSubmit={handleReject} className="form-card">
          <div className="form-group">
            <label>Rejection Reason</label>
            <textarea required rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-danger">Confirm Rejection</button>
        </form>
      )}
    </div>
  );
}
