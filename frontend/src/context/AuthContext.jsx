import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './authContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/auth`;

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('solarUser');
    if (!storedUser) return null;

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser?.token) {
      axios.defaults.headers.common.Authorization = `Bearer ${parsedUser.token}`;
    }

    return parsedUser;
  } catch {
    localStorage.removeItem('solarUser');
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [authError, setAuthError] = useState(null);

  const storeSession = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('solarUser', JSON.stringify(userData));
    axios.defaults.headers.common.Authorization = `Bearer ${userData.token}`;
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      const userData = response.data;
      storeSession(userData);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  }, [storeSession]);

  const register = useCallback(async (name, email, password) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, { name, email, password });

      const userData = response.data;
      storeSession(userData);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Registration failed.');
      return false;
    }
  }, [storeSession]);

  const googleLogin = useCallback(async (credential) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/google`, { credential });
      const userData = response.data;
      storeSession(userData);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Google sign-in failed. Please try again.');
      return false;
    }
  }, [storeSession]);

  const forgotPassword = useCallback(async (email) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return { ok: true, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Could not start password reset.';
      setAuthError(message);
      return { ok: false, message };
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, password });
      const userData = response.data;
      storeSession(userData);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Could not reset password.');
      return false;
    }
  }, [storeSession]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('solarUser');
    delete axios.defaults.headers.common.Authorization;
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      googleLogin,
      forgotPassword,
      resetPassword,
      logout,
      loading: false,
      authError,
      clearAuthError,
    }),
    [
      authError,
      clearAuthError,
      forgotPassword,
      googleLogin,
      login,
      logout,
      register,
      resetPassword,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
