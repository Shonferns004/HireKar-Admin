
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_CREDENTIALS, MOCK_USER } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);
const SESSION_KEY = 'admin_session';

export const AuthProvider= ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      setState({
        user: JSON.parse(savedSession),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username, password) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (
      username.trim().toUpperCase() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const user = MOCK_USER;
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      navigate('/');
    } else {
      throw new Error('Invalid credentials. Use SHAWN / 12345');
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
