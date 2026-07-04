import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NeedCard from '../components/NeedCard';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const BrowseNeeds = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Synced query parameters
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const scopeParam = searchParams.get('scope') || 'hostel';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // States
  const [searchInput, setSearchInput] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [scope, setScope] = useState(scopeParam);
  const [page, setPage] = useState(pageParam);

  const [needs, setNeeds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, totalNeeds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // ID of need undergoing deletion/fulfillment

  const limit = 12; // Items per page

  const categories = [
    'All',
    'Grocery',
    'Maggi & Snacks',
    'Stationery',
    'Books',
    'Electronics',
    'Furniture',
    'Kitchen Items',
    'Sports',
    'Rent',
    'Others'
  ];



  // 1. Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setSearchParams((params) => {
        if (searchInput) params.set('search', searchInput);
        else params.delete('search');
        params.set('page', '1');
        return params;
      });
      setPage(1);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // 2. Fetch Needs
  useEffect(() => {
    if (scope === 'hostel' && isAuthenticated && !user) return;
    fetchNeeds();
  }, [debouncedSearch, selectedCategory, scope, page, user, isAuthenticated]);

  const fetchNeeds = async () => {
    setLoading(true);
    setError('');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    // Construct search queries
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));

    if (selectedCategory && selectedCategory !== 'All') {
      queryParams.append('category', selectedCategory);
    }

    if (debouncedSearch) {
      queryParams.append('search', debouncedSearch);
    }

    if (scope === 'hostel' && user?.hostel) {
      queryParams.append('hostel', user.hostel);
    }

    try {
      const response = await axiosInstance.get('/needs', {
        params: {
          page,
          limit,
          ...(selectedCategory && selectedCategory !== 'All' && { category: selectedCategory }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(scope === 'hostel' && user?.hostel && { hostel: user.hostel })
        }
      });
      const data = response.data;

      setNeeds(data.needs || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Sync state changes to URL search params
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSearchParams((params) => {
      if (cat && cat !== 'All') params.set('category', cat);
      else params.delete('category');
      params.set('page', '1');
      return params;
    });
    setPage(1);
  };

  const handleScopeSelect = (newScope) => {
    setScope(newScope);
    setSearchParams((params) => {
      params.set('scope', newScope);
      params.set('page', '1');
      return params;
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams((params) => {
      params.set('page', String(newPage));
      return params;
    });
  };

  // Fulfill request
  const handleFulfillNeed = async (id) => {
    setActionLoading(id);
    try {
      const response = await axiosInstance.patch(`/needs/${id}/fulfill`);
      const data = response.data;

      // Optimistic update locally
      setNeeds(prev =>
        prev.map(n => (n._id === id ? { ...n, status: data.need.status } : n))
      );
      toast.success('Request marked as Fulfilled!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to fulfill request.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete request
  const handleDeleteNeed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this need request?')) {
      return;
    }
    setActionLoading(id);
    try {
      await axiosInstance.delete(`/needs/${id}`);

      // Optimistic delete locally
      setNeeds(prev => prev.filter(n => n._id !== id));
      toast.success('Need request deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete request.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">


      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="text-2xl font-black tracking-tight text-white hover:text-indigo-400 transition-colors flex items-center gap-2">
              🏠 HostelHub
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 md:hidden block">
              Needs Feed
            </span>
          </div>

          {/* Search bar */}
          <div className="w-full md:max-w-xl relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search needs requests (e.g. Maggi, Calculator)..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 focus:border-indigo-500/50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-100 placeholder-slate-500 transition-all shadow-inner"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                ✖
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/needs/new"
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              + Post a Need
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-slate-900 border border-slate-855 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Open Needs Board</h2>
          <p className="text-slate-405 text-slate-400 text-sm mt-1">See what other students in your hostel are currently looking for and lend a helping hand.</p>
        </div>

        {/* Scrollable category chips */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">Filter by Category</h3>
          <div className="flex gap-2.5 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none select-none scroll-smooth">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-indigo-650 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Toggle tabs */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-4 flex-wrap gap-4">
          <div className="bg-slate-900/50 border border-slate-850 p-1 rounded-xl inline-flex select-none">
            <button
              onClick={() => handleScopeSelect('hostel')}
              disabled={!isAuthenticated || !user?.hostel}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                scope === 'hostel'
                  ? 'bg-indigo-650 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 disabled:opacity-30'
              }`}
            >
              📍 My Hostel {user?.hostel && `(${user.hostel})`}
            </button>
            <button
              onClick={() => handleScopeSelect('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                scope === 'all'
                  ? 'bg-indigo-650 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌐 All Hostels
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{pagination.totalNeeds}</span> open requests
          </div>
        </div>

        {/* Needs Feed Grid */}
        {loading ? (
          /* Shimmer skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-slate-900/20 border border-slate-850 p-5 rounded-2xl aspect-[1.8/1] flex flex-col justify-between animate-pulse space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-850 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-850 rounded w-1/6"></div>
                  </div>
                  <div className="h-5 bg-slate-850 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-850 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                  <div className="h-6 bg-slate-850 rounded w-1/3"></div>
                  <div className="h-8 bg-slate-850 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State view */
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <span className="text-4xl">📡</span>
            <h3 className="text-lg font-bold text-white">Connection Error</h3>
            <p className="text-slate-405 text-slate-400 text-sm">{error}</p>
            <button
              onClick={fetchNeeds}
              className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all"
            >
              Reconnect
            </button>
          </div>
        ) : needs.length === 0 ? (
          /* Empty Needs board state */
          <div className="py-20 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto">
              📢
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">No requests found</h3>
              <p className="text-slate-404 text-slate-400 text-sm leading-relaxed">
                There are no open requests matching your filters. Why not post a need yourself?
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/needs/new"
                className="px-6 py-3 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md transition-all"
              >
                Post Your Request
              </Link>
            </div>
          </div>
        ) : (
          /* Content Render Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {needs.map((need) => (
                <NeedCard
                  key={need._id}
                  need={need}
                  currentUser={user}
                  onFulfill={handleFulfillNeed}
                  onDelete={handleDeleteNeed}
                  actionLoading={actionLoading}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6 border-t border-slate-900 select-none">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-xs font-semibold rounded-xl border border-slate-855 transition-all cursor-pointer"
                >
                  ◀ Prev
                </button>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-xs font-semibold rounded-xl border border-slate-855 transition-all cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseNeeds;
