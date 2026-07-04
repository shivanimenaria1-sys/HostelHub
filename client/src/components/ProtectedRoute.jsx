import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, isOnboardingRoute = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Authenticated but needs onboarding
  if (user?.needsOnboarding) {
    // If they are not on the onboarding page, force redirect them there
    if (!isOnboardingRoute) {
      return <Navigate to="/onboarding" replace />;
    }
  } else {
    // 3. Onboarding is already complete, but trying to access onboarding page
    if (isOnboardingRoute) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
