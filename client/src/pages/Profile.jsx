import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHostels } from '../context/HostelContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Statistics counters
  const [stats, setStats] = useState({
    productsCount: 0,
    needsCount: 0
  });

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    hostel: user?.hostel || '',
    roomNumber: user?.roomNumber || '',
    phoneNumber: user?.phoneNumber || ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Dynamic hostel list from MongoDB via context
  const { hostelNames, loading: hostelsLoading, error: hostelsError } = useHostels();

  // Fetch statistics on mount
  useEffect(() => {
    if (user) {
      fetchUserStatistics();
    }
  }, [user]);

  const fetchUserStatistics = async () => {
    try {
      // Parallel requests for listings and requests
      const [productsRes, needsRes] = await Promise.all([
        axiosInstance.get('/products/my-listings'),
        axiosInstance.get('/needs/my-requests')
      ]);

      const productsData = productsRes.data;
      const needsData = needsRes.data;

      setStats({
        productsCount: (productsData.products || []).length,
        needsCount: (needsData.needs || []).length
      });
    } catch (err) {
      console.error('Failed to load user statistics:', err);
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!editForm.hostel) tempErrors.hostel = 'Hostel location is required';
    if (!editForm.roomNumber.trim()) tempErrors.roomNumber = 'Room number is required';
    
    const cleanPhone = editForm.phoneNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      tempErrors.phoneNumber = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      tempErrors.phoneNumber = 'Phone number must contain exactly 10 digits';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const cleanPhone = editForm.phoneNumber.replace(/\D/g, '');

    try {
      const response = await axiosInstance.put('/auth/onboarding', {
        hostel: editForm.hostel,
        roomNumber: editForm.roomNumber.trim(),
        phoneNumber: cleanPhone
      });

      const data = response.data;

      // Sync AuthContext immediately
      updateUser(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error. Failed to update.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format('MMMM YYYY')
    : 'New Student';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* Mobile Top Navbar placeholder */}
      <nav className="md:hidden border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <span className="text-xl font-bold tracking-tight text-slate-50">🏠 HostelHub</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          My Profile
        </span>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Profile Picture */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-indigo-500/20 bg-slate-950 flex-shrink-0 flex items-center justify-center">
            {user?.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-slate-550 select-none">👤</span>
            )}
          </div>

          {/* Profile Details summary */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50 leading-tight">{user?.name || 'Hub Student'}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-[10px] text-slate-550 font-medium font-mono uppercase tracking-wider mt-1 block">
                Member Since {memberSince}
              </p>
            </div>

            {/* Profile Statistics */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0 pt-2 border-t border-slate-850/50">
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-855 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Products Listed</span>
                <span className="block text-xl font-black text-indigo-400 mt-0.5">{stats.productsCount}</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-855 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Needs Posted</span>
                <span className="block text-xl font-indigo-400 text-indigo-400 font-black mt-0.5">{stats.needsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Shortcuts / Actions */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-850 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-405 text-slate-400 uppercase tracking-wider text-left">Quick Actions</h3>
              
              <div className="space-y-2">
                <Link
                  to="/products/my-listings"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-850 hover:border-slate-750 text-xs font-bold rounded-xl transition-all flex items-center justify-between"
                >
                  <span>📦 My Active Listings</span>
                  <span>➜</span>
                </Link>
                <Link
                  to="/needs"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-850 hover:border-slate-750 text-xs font-bold rounded-xl transition-all flex items-center justify-between"
                >
                  <span>📢 Open Needs Feed</span>
                  <span>➜</span>
                </Link>
              </div>

              <button
                onClick={handleLogoutClick}
                className="w-full py-3.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 text-rose-400 text-xs font-bold rounded-xl transition-all"
              >
                Log Out 🚪
              </button>
            </div>
          </div>

          {/* Column 2 & 3: Details or Profile Forms */}
          <div className="md:col-span-2">
            {!isEditing ? (
              /* View Details Panel */
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                  <h3 className="font-extrabold text-slate-50 text-lg">Contact & Location Info</h3>
                  <button
                    onClick={() => {
                      setEditForm({
                        hostel: user?.hostel || '',
                        roomNumber: user?.roomNumber || '',
                        phoneNumber: user?.phoneNumber || ''
                      });
                      setIsEditing(true);
                    }}
                    className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-all font-bold"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Exchange Hostel</span>
                    <p className="font-bold text-slate-100 mt-0.5">📍 {user?.hostel || 'Not Configured'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Room Number</span>
                    <p className="font-bold text-slate-100 mt-0.5">🚪 Room {user?.roomNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Phone / WhatsApp</span>
                    <p className="font-bold text-slate-100 mt-0.5">📞 {user?.phoneNumber || 'Not Configured'}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Profile Form Panel */
              <form onSubmit={handleUpdateProfile} className="bg-slate-900/40 border border-slate-850 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
                <div className="pb-4 border-b border-slate-850 text-left">
                  <h3 className="font-extrabold text-slate-50 text-lg">Edit Contact & Location Info</h3>
                  <p className="text-xs text-slate-400 mt-0.5">This information updates on your active product listings.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  {/* Hostel Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Hostel Block
                    </label>
                    <select
                      className={`w-full px-4 py-3 bg-slate-950 border ${
                        errors.hostel ? 'border-rose-500' : 'border-slate-850'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 cursor-pointer`}
                      value={editForm.hostel}
                      onChange={(e) => setEditForm({ ...editForm, hostel: e.target.value })}
                    >
                      {hostelsLoading ? (
                        <option value="" disabled>Loading hostels…</option>
                      ) : hostelsError ? (
                        <option value="" disabled>Failed to load hostels</option>
                      ) : (
                        <>
                          <option value="">-- Choose Hostel --</option>
                          {hostelNames.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {errors.hostel && (
                      <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.hostel}</p>
                    )}
                  </div>

                  {/* Room Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 bg-slate-950 border ${
                        errors.roomNumber ? 'border-rose-500' : 'border-slate-850'
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                      placeholder="e.g. 102-A"
                      value={editForm.roomNumber}
                      onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                    />
                    {errors.roomNumber && (
                      <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.roomNumber}</p>
                    )}
                  </div>
                </div>

                {/* Phone number */}
                <div className="text-left">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Phone / WhatsApp Number (10 digits)
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-slate-950 border ${
                      errors.phoneNumber ? 'border-rose-500' : 'border-slate-850'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                    placeholder="Enter 10-digit number"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  />
                  {errors.phoneNumber && (
                    <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Edit Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-850">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
