import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leave-balances')
      .then((res) => setBalances(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h2>Welcome, {user?.name}</h2>
      <h3>Leave Balances</h3>
      {loading ? <p>Loading...</p> : (
        <div className="balance-grid">
          {balances.map((b) => (
            <div key={b.leave_type} className="balance-card">
              <h4>{b.leave_type}</h4>
              <div className="balance-stats">
                <span>Allocated: <strong>{b.allocated_days}</strong></span>
                <span>Used: <strong>{b.used_days}</strong></span>
                <span className="remaining">Available: <strong>{b.remaining_days}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
