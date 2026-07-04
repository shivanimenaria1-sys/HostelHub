import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Onboarding = () => {
  const { user, token, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    hostel: '',
    roomNumber: '',
    phoneNumber: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded list of hostels
  const hostelOptions = ['Hostel A', 'Hostel B', 'Hostel C'];

  // Prevent onboarded users from accessing /onboarding (redirect them to Home /)
  if (isAuthenticated && user && !user.needsOnboarding) {
    return <Navigate to="/" replace />;
  }

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.hostel) {
      tempErrors.hostel = 'Please select your hostel';
    }
    if (!formData.roomNumber.trim()) {
      tempErrors.roomNumber = 'Room number is required';
    }
    
    // Clean and validate 10-digit phone number
    const cleanedPhone = formData.phoneNumber.replace(/\s+/g, '');
    if (!cleanedPhone) {
      tempErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(cleanedPhone)) {
      tempErrors.phoneNumber = 'Phone number must contain exactly 10 digits (e.g. 9876543210)';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    setLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${apiBaseUrl}/auth/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hostel: formData.hostel,
          roomNumber: formData.roomNumber.trim(),
          phoneNumber: formData.phoneNumber.replace(/\s+/g, '')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete onboarding details');
      }

      // Update user details in context
      updateUser(data.user);

      // Redirect user to the Home page (/) after successful onboarding
      navigate('/');
    } catch (err) {
      console.error('Onboarding Submission Error:', err);
      setApiError(err.message || 'Connection error. Failed to save details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Premium backdrop glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            Step 2 of 2: Setup Details
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            🏠 Configure Profile
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
            Provide your hostel and room details to finalize your account access.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-850 p-8 rounded-2xl shadow-2xl hover:border-slate-800 transition-colors duration-300">
          {apiError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl text-center font-medium animate-shake">
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hostel Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Hostel
              </label>
              <select
                className={`w-full px-4 py-3 bg-slate-950 border ${
                  errors.hostel ? 'border-rose-500' : 'border-slate-850'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 appearance-none cursor-pointer`}
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
              >
                <option value="">-- Choose Your Hostel --</option>
                {hostelOptions.map((hostel, index) => (
                  <option key={index} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
              {errors.hostel && (
                <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.hostel}</p>
              )}
            </div>

            {/* Room Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Room Number
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-slate-950 border ${
                  errors.roomNumber ? 'border-rose-500' : 'border-slate-850'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                placeholder="e.g. 204-B"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              />
              {errors.roomNumber && (
                <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.roomNumber}</p>
              )}
            </div>

            {/* Phone/WhatsApp Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-3 bg-slate-950 border ${
                  errors.phoneNumber ? 'border-rose-500' : 'border-slate-850'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                placeholder="e.g. 9876543210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
              {errors.phoneNumber && (
                <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-650/20 transition-all duration-150 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Finalize Registration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
