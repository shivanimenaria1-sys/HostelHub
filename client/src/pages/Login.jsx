import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away from login
  if (isAuthenticated) {
    if (user?.needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    
    const idToken = credentialResponse.credential;

    try {
      const response = await axiosInstance.post('/auth/google', { idToken });
      const data = response.data;

      // Save token and user details in context
      login(data.token, data.user);
      
      toast.success('Logged in successfully!');

      // Navigate based on onboarding requirement
      if (data.needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      const errMsg = err.response?.data?.message || 'Server connection failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google Sign-In was unsuccessful. Please check your credentials or network and try again.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold tracking-tight text-white hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
            🏠 HostelHub
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Your all-in-one hostel community manager</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/55 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Sign In / Sign Up</h2>
            <p className="text-xs text-slate-400 mt-1">Access rooms registry, needs board, and services</p>
          </div>



          {loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 text-xs">Verifying Google Credentials...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 bg-slate-950/50 rounded-xl border border-slate-850 p-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                theme="filled_dark"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>
          )}

          {/* Details / Help */}
          <div className="pt-4 border-t border-slate-850 text-center">
            <p className="text-xs text-slate-500">
              Sign-in is managed securely via Google. You will complete your hostel configuration in the next step.
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          Having trouble? <a href="#" className="text-indigo-400 hover:underline">Contact hostel support</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
