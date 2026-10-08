import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

// Role priority for default active role
const ROLE_PRIORITY = ['admin', 'manager', 'employee'];

function defaultRole(user) {
  if (!user) return null;
  return ROLE_PRIORITY.find((r) => user.roleset?.includes(r)) || user.role;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/me')
      .then((res) => { setUser(res.data); setActiveRole(defaultRole(res.data)); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setActiveRole(defaultRole(data.user));
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveRole(null);
  };

  const switchRole = (role) => {
    if (user?.roleset?.includes(role)) setActiveRole(role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, activeRole, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
