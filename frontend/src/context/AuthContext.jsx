import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('taskflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await usersApi.getMe();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('taskflow_user', JSON.stringify(res.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res?.data) {
      const authData = res.data;
      localStorage.setItem('taskflow_token', authData.accessToken);
      setToken(authData.accessToken);

      const userData = {
        id: authData.userId,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
      };
      setUser(userData);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Login failed');
  };

  const register = async (username, email, password, fullName) => {
    const res = await authApi.register({ username, email, password, fullName });
    if (res?.data) {
      const authData = res.data;
      localStorage.setItem('taskflow_token', authData.accessToken);
      setToken(authData.accessToken);

      const userData = {
        id: authData.userId,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
      };
      setUser(userData);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || user?.roles?.includes(`ROLE_${role}`);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

