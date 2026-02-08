
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Sidebar } from './components/SideBar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { AITools } from './pages/Courses';
import CourseDetails from './pages/CourseDetails';


const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <TopNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users" element={<Users />} />
            <Route path="/courses" element={<AITools />} />
            <Route path="/courses" element={<AITools />} />
            <Route path="/course-details/:id" element={<CourseDetails />} />
            <Route path="*" element={<div className="p-8 text-slate-500 font-bold">Page coming soon...</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App= () => {
  return (
      <Router>
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          />
        </Routes>
    </AuthProvider>
      </Router>
  );
};

export default App;
