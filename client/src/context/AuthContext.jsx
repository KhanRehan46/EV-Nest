import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user info', err);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, demoRole = null) => {
    setLoading(true);
    try {
      let data;
      if (demoRole) {
        // Demo login — no password needed
        const res = await API.post('/auth/demo-login', { role: demoRole });
        data = res.data;
      } else {
        const res = await API.post('/auth/login', { email, password });
        data = res.data;
      }
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, role: data.role };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', userData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true, role: data.role };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData);
      // Update our stored user state (including token)
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
