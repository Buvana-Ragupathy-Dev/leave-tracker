import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function RequestActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/leave-requests/${id}/activities`)
      .then((res) => setActivities(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Request Activity</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/my-requests')}>Back</button>
      </div>
      {loading ? <p>Loading...</p> : (
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
      )}
    </div>
  );
}
