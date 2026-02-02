
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_USER } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider= ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check session storage on mount
    const savedSession = sessionStorage.getItem('admin_session');
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

  const login = async (email, password) => {
    // Simulated login delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation for mock
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      const user = MOCK_USER;
      console.log(user)
      const session = sessionStorage.setItem('admin_session', JSON.stringify(user));
      console.log(`Session: ${session}`)
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      navigate('/');
      console.log(state)
    } else {
      throw new Error('Invalid credentials. Use admin@platform.com / password');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_session');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
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
