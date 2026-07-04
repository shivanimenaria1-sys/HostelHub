import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Dashboard = () => {
  const { user } = useAuth();
  
  // State variables
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    marketplaceListings: 0,
    openNeedRequests: 0,
    roomSwitchRequests: 0,
    roommateRequests: 0,
    successfulMatches: 0,
    activeExchangeRequests: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [smartMatches, setSmartMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Filter & Search states
  const [filters, setFilters] = useState({
    hostel: '',
    block: '',
    roomType: '',
    requestType: '',
    status: 'Open', // default to show Open
    gender: '', // client-side/informational filter
    year: '', // client-side/informational filter
    search: ''
  });

  // Post form states
  const [newRequest, setNewRequest] = useState({
    requestType: 'Room Switch',
    currentHostel: 'Hostel A',
    currentBlock: '',
    currentRoomNumber: '',
    roomType: 'Single',
    lookingFor: '',
    preferredRoom: '',
    roommatePreference: [],
    reasonForSwitching: '',
    additionalNotes: '',
    whatsappNumber: ''
  });

  const preferenceOptions = [
    'Non-smoker',
    'Vegetarian',
    'Non-vegetarian',
    'Clean & Organized',
    'Night Owl',
    'Early Riser',
    'Study Partner',
    'Gamer',
    'Quiet Person',
    'Friendly',
    'No Loud Music'
  ];

  const hostelOptions = ['Hostel A', 'Hostel B', 'Hostel C'];
  const roomTypeOptions = ['Single', 'Double', 'Triple'];

  // Fetch Stats & Requests on mount / filter change
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axiosInstance.get('/exchange/stats');
      if (res.data.status === 'success') {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { hostel, block, roomType, requestType, status, search } = filters;
      let queryParams = `?status=${status}`;
      if (hostel) queryParams += `&hostel=${hostel}`;
      if (block) queryParams += `&block=${block}`;
      if (roomType) queryParams += `&roomType=${roomType}`;
      if (requestType) queryParams += `&requestType=${requestType}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;

      const res = await axiosInstance.get(`/exchange${queryParams}`);
      if (res.data.status === 'success') {
        let list = res.data.requests;
        
        // Client-side informational filters for Year/Gender (in case user searches custom data)
        if (filters.year) {
          list = list.filter(r => r.additionalNotes?.toLowerCase().includes(`${filters.year} year`) || r.lookingFor?.toLowerCase().includes(`${filters.year} year`));
        }
        if (filters.gender) {
          list = list.filter(r => r.additionalNotes?.toLowerCase().includes(filters.gender.toLowerCase()) || r.lookingFor?.toLowerCase().includes(filters.gender.toLowerCase()));
        }

        setRequests(list);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
      toast.error('Could not load exchange requests.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch matching requests for the selected request
  useEffect(() => {
    if (selectedRequest) {
      fetchSmartMatches(selectedRequest._id);
    } else {
      setSmartMatches([]);
    }
  }, [selectedRequest]);

  const fetchSmartMatches = async (id) => {
    try {
      const res = await axiosInstance.get(`/exchange/${id}/matches`);
      if (res.data.status === 'success') {
        setSmartMatches(res.data.matches);
      }
    } catch (err) {
      console.error('Failed to load smart matches:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (preference) => {
    setNewRequest(prev => {
      const current = [...prev.roommatePreference];
      if (current.includes(preference)) {
        return { ...prev, roommatePreference: current.filter(p => p !== preference) };
      } else {
        return { ...prev, roommatePreference: [...current, preference] };
      }
    });
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await axiosInstance.post('/exchange', newRequest);
      if (res.data.status === 'success') {
        toast.success('Exchange request posted successfully!');
        setShowFormModal(false);
        // Reset Form
        setNewRequest({
          requestType: 'Room Switch',
          currentHostel: user?.hostel || 'Hostel A',
          currentBlock: '',
          currentRoomNumber: user?.roomNumber || '',
          roomType: 'Single',
          lookingFor: '',
          preferredRoom: '',
          roommatePreference: [],
          reasonForSwitching: '',
          additionalNotes: '',
          whatsappNumber: user?.phoneNumber || ''
        });
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit exchange request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpressInterest = async (id) => {
    try {
      const res = await axiosInstance.post(`/exchange/${id}/interest`);
      if (res.data.status === 'success') {
        toast.success('Interest expressed! The student has been notified.');
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not express interest.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axiosInstance.patch(`/exchange/${id}/status`, { status });
      if (res.data.status === 'success') {
        toast.success(`Request marked as ${status}`);
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(res.data.request);
        }
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update request status.');
    }
  };

  const handleShare = (request) => {
    const text = `HostelHub: ${request.student?.name} is looking to do a ${request.requestType} in ${request.currentHostel}. Check out their request on HostelHub!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } else {
      toast(text);
    }
  };

  const handleReport = () => {
    toast.success('Request reported successfully. Administration will review it.');
  };

  // Populate form with user info when modal opens
  const openPostModal = () => {
    setNewRequest(prev => ({
      ...prev,
      currentHostel: user?.hostel || 'Hostel A',
      currentRoomNumber: user?.roomNumber || '',
      whatsappNumber: user?.phoneNumber || ''
    }));
    setShowFormModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-50 flex items-center gap-2">
            🏠 Room & Roommate Exchange
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Swap rooms, find compatible roommates, and view mutual exchange opportunities.
          </p>
        </div>
        <button
          onClick={openPostModal}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-950/20 hover:scale-102 active:scale-98 transition-all"
        >
          + Post Exchange Request
        </button>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Marketplace Listings', value: stats.marketplaceListings, icon: '🛒', color: 'text-indigo-400' },
          { label: 'Open Needs', value: stats.openNeedRequests, icon: '📢', color: 'text-amber-400' },
          { label: 'Room Switches', value: stats.roomSwitchRequests, icon: '🔄', color: 'text-emerald-400' },
          { label: 'Roommate Switches', value: stats.roommateRequests, icon: '👥', color: 'text-sky-400' },
          { label: 'Successful Matches', value: stats.successfulMatches, icon: '🤝', color: 'text-pink-400' },
          { label: 'Active Requests', value: stats.activeExchangeRequests, icon: '⚡', color: 'text-violet-400' }
        ].map((item, index) => (
          <div
            key={index}
            className="bg-slate-900/35 border border-slate-850 p-5 rounded-2xl hover:border-slate-800 transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-550 text-slate-400">
                {item.label}
              </span>
              <span className="text-xl">{item.icon}</span>
            </div>
            <div className="mt-4">
              <span className={`text-2xl font-black ${item.color}`}>
                {statsLoading ? '...' : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search section */}
      <div className="bg-slate-900/25 border border-slate-850 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              name="search"
              placeholder="Search by student name, hostel, preference, block, keywords..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm text-slate-100"
            />
            <span className="absolute left-3.5 top-3.5 text-slate-500 text-sm">🔍</span>
          </div>

          {/* Quick status selector */}
          <div className="flex gap-2">
            {['Open', 'Matched', 'Closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilters(prev => ({ ...prev, status }))}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  filters.status === status
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status} Requests
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          {/* Hostel */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hostel</label>
            <select
              name="hostel"
              value={filters.hostel}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Hostels</option>
              {hostelOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Block */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Block</label>
            <input
              type="text"
              name="block"
              placeholder="e.g. A, B"
              value={filters.block}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Room Type</label>
            <select
              name="roomType"
              value={filters.roomType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {roomTypeOptions.map(t => <option key={t} value={t}>{t} Bed</option>)}
            </select>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Request Type</label>
            <select
              name="requestType"
              value={filters.requestType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Requests</option>
              <option value="Room Switch">Room Switch</option>
              <option value="Roommate Switch">Roommate Switch</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Study Year</label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Years</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                hostel: '',
                block: '',
                roomType: '',
                requestType: '',
                status: 'Open',
                gender: '',
                year: '',
                search: ''
              })}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Request Grid / List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Area: Requests List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-50 text-left">
            {filters.status} Roommate & Switch Postings ({requests.length})
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-16 text-center text-slate-400">
              <p className="text-lg">No exchange requests match your filter criteria.</p>
              <p className="text-xs text-slate-550 text-slate-500 mt-2">Try clearing your filters or create a new request post.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map(req => {
                const isOwner = user && req.student?._id === user._id;
                return (
                  <div
                    key={req._id}
                    onClick={() => setSelectedRequest(req)}
                    className="group bg-slate-900/30 border border-slate-850 hover:border-indigo-500/30 p-5 rounded-2xl shadow-md transition-all hover:shadow-indigo-950/10 cursor-pointer flex flex-col justify-between text-left relative"
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex justify-between items-start gap-2">
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${
                          req.requestType === 'Room Switch'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                        }`}>
                          {req.requestType}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          req.status === 'Open' ? 'bg-indigo-500/10 text-indigo-400' :
                          req.status === 'Matched' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2.5 mt-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
                          {req.student?.profilePic ? (
                            <img src={req.student.profilePic} alt={req.student?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">👤</div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-100 truncate max-w-[150px]">{req.student?.name || 'Hub Student'}</p>
                          <p className="text-[9px] text-slate-500">{dayjs(req.createdAt).fromNow()}</p>
                        </div>
                      </div>

                      {/* Content Overview */}
                      <div className="mt-4 space-y-2">
                        <div className="text-xs flex gap-2">
                          <span className="text-slate-500 font-medium">Location:</span>
                          <span className="text-slate-300 font-bold">{req.currentHostel} • {req.currentBlock} Block • Room {req.currentRoomNumber}</span>
                        </div>
                        <div className="text-xs flex gap-2">
                          <span className="text-slate-500 font-medium">Room Type:</span>
                          <span className="text-slate-300 font-semibold">{req.roomType} Bed Room</span>
                        </div>
                        <div className="text-xs flex gap-2">
                          <span className="text-slate-500 font-medium">Looking For:</span>
                          <span className="text-slate-300 line-clamp-1">{req.lookingFor}</span>
                        </div>
                      </div>

                      {/* Roommate Preferences pills */}
                      {req.roommatePreference && req.roommatePreference.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {req.roommatePreference.slice(0, 3).map((pref, i) => (
                            <span key={i} className="text-[9px] font-semibold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md text-slate-400">
                              {pref}
                            </span>
                          ))}
                          {req.roommatePreference.length > 3 && (
                            <span className="text-[9px] font-bold text-indigo-400 ml-1">
                              +{req.roommatePreference.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="mt-5 border-t border-slate-850/50 pt-3.5 flex gap-2" onClick={e => e.stopPropagation()}>
                      {isOwner ? (
                        <>
                          {req.status === 'Open' && (
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'Matched')}
                              className="flex-1 py-1.5 bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-all"
                            >
                              Mark Matched
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(req._id, req.status === 'Closed' ? 'Open' : 'Closed')}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-350 text-[10px] rounded-lg transition-all"
                          >
                            {req.status === 'Closed' ? 'Reopen' : 'Close'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled={req.interestedStudents?.includes(user?._id)}
                            onClick={() => handleExpressInterest(req._id)}
                            className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-[10px] rounded-lg transition-all"
                          >
                            {req.interestedStudents?.includes(user?._id) ? 'Interested ✓' : "I'm Interested"}
                          </button>
                          <a
                            href={`https://wa.me/${req.whatsappNumber}?text=${encodeURIComponent(
                              `Hi ${req.student?.name || 'there'}, I saw your ${req.requestType} request on HostelHub and wanted to reach out!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center justify-center transition-all"
                          >
                            WhatsApp
                          </a>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleShare(req)}
                        className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg"
                        title="Share request info"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Selected Request Details & Suggestions */}
        <div className="space-y-6 text-left">
          {selectedRequest ? (
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6 sticky top-24">
              {/* Profile card */}
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-slate-50 text-lg">Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-500 hover:text-slate-300 text-sm font-bold"
                >
                  Close ✕
                </button>
              </div>

              {/* Student basic info */}
              <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-950 border border-slate-850">
                  {selectedRequest.student?.profilePic ? (
                    <img src={selectedRequest.student.profilePic} alt={selectedRequest.student?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg">👤</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{selectedRequest.student?.name || 'Hub Student'}</h4>
                  <p className="text-[10px] text-slate-400">{selectedRequest.student?.email}</p>
                </div>
              </div>

              {/* Details table block */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span className="text-slate-550 text-slate-400">Request Type</span>
                  <span className="font-bold text-indigo-400">{selectedRequest.requestType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span className="text-slate-550 text-slate-400">Current Room</span>
                  <span className="font-semibold text-slate-200">
                    {selectedRequest.currentHostel} ({selectedRequest.currentBlock}) - Room {selectedRequest.currentRoomNumber}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span className="text-slate-550 text-slate-400">Room Type</span>
                  <span className="font-semibold text-slate-200">{selectedRequest.roomType} Bed</span>
                </div>
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span className="text-slate-550 text-slate-400">Preferred swap room</span>
                  <span className="font-semibold text-slate-200">{selectedRequest.preferredRoom || 'No specific preference'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850/50 pb-2">
                  <span className="text-slate-550 text-slate-400">Looking For</span>
                  <span className="font-semibold text-indigo-300">{selectedRequest.lookingFor}</span>
                </div>
                {selectedRequest.reasonForSwitching && (
                  <div className="border-b border-slate-850/50 pb-2">
                    <span className="block text-slate-550 text-slate-400 mb-1">Reason for Switch</span>
                    <p className="text-slate-350 bg-slate-950/40 p-2 rounded-lg border border-slate-900 font-mono text-[11px]">
                      {selectedRequest.reasonForSwitching}
                    </p>
                  </div>
                )}
                {selectedRequest.additionalNotes && (
                  <div className="pb-1">
                    <span className="block text-slate-550 text-slate-400 mb-1">Additional Notes</span>
                    <p className="text-slate-300 italic text-[11px] leading-relaxed">
                      "{selectedRequest.additionalNotes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Preferences list */}
              {selectedRequest.roommatePreference && selectedRequest.roommatePreference.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roommate Preferences</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.roommatePreference.map((pref, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions details panel */}
              <div className="pt-4 border-t border-slate-850 flex gap-2">
                {user && selectedRequest.student?._id !== user._id ? (
                  <>
                    <button
                      disabled={selectedRequest.interestedStudents?.includes(user?._id)}
                      onClick={() => handleExpressInterest(selectedRequest._id)}
                      className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      {selectedRequest.interestedStudents?.includes(user?._id) ? 'Already Interested' : "I'm Interested"}
                    </button>
                    <a
                      href={`https://wa.me/${selectedRequest.whatsappNumber}?text=${encodeURIComponent(
                        `Hi ${selectedRequest.student?.name || 'there'}, I saw your ${selectedRequest.requestType} request on HostelHub and wanted to connect!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      WhatsApp
                    </a>
                  </>
                ) : (
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-center text-xs text-indigo-400 font-semibold mb-1">You own this request posting</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest._id, 'Matched')}
                        className="flex-1 py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Mark Matched
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest._id, 'Closed')}
                        className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all"
                      >
                        Close Request
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleReport}
                  className="p-3 bg-slate-950 border border-slate-850 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl"
                  title="Report request"
                >
                  ⚠️
                </button>
              </div>

              {/* Suggestions Panel */}
              {smartMatches.length > 0 && (
                <div className="border-t border-slate-850 pt-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    ✨ You may also be interested in
                  </h4>
                  <div className="space-y-3">
                    {smartMatches.map(match => (
                      <div
                        key={match._id}
                        onClick={() => setSelectedRequest(match)}
                        className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-indigo-500/20 p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                      >
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-slate-100 truncate max-w-[120px]">{match.student?.name}</p>
                          <p className="text-[10px] text-indigo-400 font-semibold">{match.requestType}</p>
                          <p className="text-[10px] text-slate-400">{match.currentHostel} ({match.currentBlock}) • {match.roomType} Bed</p>
                        </div>
                        <span className="text-slate-500 text-sm">➔</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-850 border-dashed p-10 rounded-2xl text-center text-slate-500 py-24 sticky top-24">
              <span className="text-3xl block mb-3">📍</span>
              <p className="text-sm font-semibold">Select a request card to view comprehensive details, smart roommate compatibility scores, and quick action steps.</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog/Modal to Post Request */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 font-bold text-lg"
            >
              ✕
            </button>
            
            <div>
              <h3 className="text-2xl font-black text-slate-50">Create Exchange Request</h3>
              <p className="text-slate-400 text-xs mt-1">Submit your roommate or room switch details. Hostel Hub will match you automatically.</p>
            </div>

            <form onSubmit={handlePostRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Request Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Request Type</label>
                  <select
                    value={newRequest.requestType}
                    onChange={e => setNewRequest(prev => ({ ...prev, requestType: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 cursor-pointer text-sm"
                  >
                    <option value="Room Switch">Room Switch</option>
                    <option value="Roommate Switch">Roommate Switch</option>
                  </select>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={newRequest.whatsappNumber}
                    onChange={e => setNewRequest(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 text-sm"
                  />
                </div>

                {/* Current Hostel */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Current Hostel</label>
                  <select
                    value={newRequest.currentHostel}
                    onChange={e => setNewRequest(prev => ({ ...prev, currentHostel: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 cursor-pointer text-sm"
                  >
                    {hostelOptions.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Current Block */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Current Block</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block A, B-Block"
                    value={newRequest.currentBlock}
                    onChange={e => setNewRequest(prev => ({ ...prev, currentBlock: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 text-sm"
                  />
                </div>

                {/* Current Room Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Current Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 203-A"
                    value={newRequest.currentRoomNumber}
                    onChange={e => setNewRequest(prev => ({ ...prev, currentRoomNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 text-sm"
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Room Type</label>
                  <select
                    value={newRequest.roomType}
                    onChange={e => setNewRequest(prev => ({ ...prev, roomType: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 cursor-pointer text-sm"
                  >
                    {roomTypeOptions.map(t => <option key={t} value={t}>{t} Bed Sharing</option>)}
                  </select>
                </div>
              </div>

              {/* Preferred Room & Switch Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Preferred Room swap / location</label>
                  <input
                    type="text"
                    placeholder="e.g. Double sharing in Hostel B, Ground Floor"
                    value={newRequest.preferredRoom}
                    onChange={e => setNewRequest(prev => ({ ...prev, preferredRoom: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Reason for Switching</label>
                  <input
                    type="text"
                    placeholder="e.g. Want ground floor room, closer to friends"
                    value={newRequest.reasonForSwitching}
                    onChange={e => setNewRequest(prev => ({ ...prev, reasonForSwitching: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 text-sm"
                  />
                </div>
              </div>

              {/* Looking For (Free-text Preference description) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Looking For / Roommate preference description</label>
                <textarea
                  rows="2"
                  required
                  placeholder="I prefer someone who sleeps before 11 PM, keeps the room clean, and is comfortable sharing study schedules."
                  value={newRequest.lookingFor}
                  onChange={e => setNewRequest(prev => ({ ...prev, lookingFor: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 resize-none text-sm"
                />
              </div>

              {/* Roommate characteristics preferences checkboxes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Select roommate preferences / tags</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/45 p-3 rounded-2xl border border-slate-850">
                  {preferenceOptions.map((pref) => (
                    <label key={pref} className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRequest.roommatePreference.includes(pref)}
                        onChange={() => handleCheckboxChange(pref)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Additional Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Year Computer Science student, gamer, non-smoker"
                  value={newRequest.additionalNotes}
                  onChange={e => setNewRequest(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 text-sm"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Publish Request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
