import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'jobseeker') {
        setCurrentPage('jobseeker-dashboard');
      } else if (user.role === 'jobposter') {
        setCurrentPage('employer-dashboard');
      }
    }
  }, [user, loading]);

  const navigate = (page, role = null) => {
    setCurrentPage(page);
    if (role) setUserRole(role);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'home' && <HomePage onNavigate={navigate} />}
      {currentPage === 'jobseeker-auth' && (
        <AuthPage role="jobseeker" onNavigate={navigate} />
      )}
      {currentPage === 'employer-auth' && (
        <AuthPage role="jobposter" onNavigate={navigate} />
      )}
      {currentPage === 'jobseeker-dashboard' && (
        <JobSeekerDashboard onNavigate={navigate} />
      )}
      {currentPage === 'employer-dashboard' && (
        <EmployerDashboard onNavigate={navigate} />
      )}
    </>
  );
}

export default App;