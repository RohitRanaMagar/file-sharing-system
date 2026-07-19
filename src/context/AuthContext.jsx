import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client, { fetchCsrfToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('easyshare_token');
      const stored = localStorage.getItem('easyshare_user');
      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
          setIsAuthenticated(true);
        } catch {}
      }
      await fetchCsrfToken();
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('easyshare_token', data.token);
      localStorage.setItem('easyshare_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await client.post('/auth/register', { name, email, password });
      return { success: true, verificationToken: data.verificationToken };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await client.post('/auth/verify-email', { token });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Verification failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await client.post('/auth/forgot-password', { email });
      return { success: true, resetToken: data.resetToken };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Request failed' };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await client.post('/auth/reset-password', { token, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Reset failed' };
    }
  };

  const resendVerification = async (email) => {
    try {
      const { data } = await client.post('/auth/resend-verification', { email });
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend verification email' };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('easyshare_token');
    localStorage.removeItem('easyshare_user');
  }, []);

  const updateProfile = async (data) => {
    try {
      const { data: res } = await client.put('/auth/profile', data);
      setUser(res.user);
      localStorage.setItem('easyshare_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        verifyEmail,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {throw new Error('useAuth must be used within AuthProvider');}
  return ctx;
};
