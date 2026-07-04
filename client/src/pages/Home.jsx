import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/axiosInstance';

const Home = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State Synced Params
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
  
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, totalProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // 1. Debounce Search Input (300-500 ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setSearchParams((params) => {
        if (searchInput) params.set('search', searchInput);
        else params.delete('search');
        params.set('page', '1'); // reset to page 1 on search
        return params;
      });
      setPage(1);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // 2. Fetch Products on Query Change
  useEffect(() => {
    // Wait until user profile is fully resolved if scope is set to hostel
    if (scope === 'hostel' && isAuthenticated && !user) {
      return;
    }
    fetchProducts();
  }, [debouncedSearch, selectedCategory, scope, page, user, isAuthenticated]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    // Construct query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('status', 'Available'); // Standard: fetch only available listings

    if (selectedCategory && selectedCategory !== 'All') {
      queryParams.append('category', selectedCategory);
    }
    
    if (debouncedSearch) {
      queryParams.append('search', debouncedSearch);
    }

    // Filter by user's own hostel if scope is 'hostel' and user is logged in
    if (scope === 'hostel' && user?.hostel) {
      queryParams.append('hostel', user.hostel);
    }

    try {
      const response = await axiosInstance.get('/products', {
        params: {
          page,
          limit,
          status: 'Available',
          ...(selectedCategory && selectedCategory !== 'All' && { category: selectedCategory }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(scope === 'hostel' && user?.hostel && { hostel: user.hostel })
        }
      });
      const data = response.data;

      setProducts(data.products || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not connect to service.');
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="text-2xl font-black tracking-tight text-slate-50 hover:text-indigo-400 transition-colors flex items-center gap-2">
              🏠 HostelHub
            </Link>
            {/* Quick Actions (Mobile) */}
            <div className="flex md:hidden items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/products/new" className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold transition-all">
                    + Sell
                  </Link>
                  <Link to="/products/my-listings" className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg font-semibold">
                    Listings
                  </Link>
                </>
              ) : (
                <Link to="/login" className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Search bar - Blinkit-style */}
          <div className="w-full md:max-w-xl relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products (e.g. Kettle, Books, Snacks)..."
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

          {/* Desktop User Panel */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/products/new"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-650/10 transition-all flex items-center gap-1.5"
                >
                  <span>+</span> Sell Product
                </Link>
                <Link
                  to="/products/my-listings"
                  className="px-4 py-2 bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
                >
                  My Listings
                </Link>
                <div className="w-px h-6 bg-slate-850"></div>
                <div className="flex items-center gap-3">
                  {user?.profilePic && (
                    <img src={user.profilePic} alt={user.name} className="w-7 h-7 rounded-full border border-slate-800" />
                  )}
                  <button
                    onClick={logout}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-all font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-8">
        
        {/* Banner - "Post a Need" callout */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              COMMUNITY BOARD
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50">Can't find what you are looking for?</h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Post your urgent requests on the Needs Board (e.g. borrow a calculator, request snacks late night) and let students around your hostel help you!
            </p>
          </div>
          
          <Link
            to="/needs/new"
            className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/35 transition-all text-center whitespace-nowrap z-10 active:scale-[0.98]"
          >
            Post a Need Request
          </Link>
        </div>

        {/* Scrollable category chips */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">Browse Categories</h3>
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

        {/* Scope Filters & Toggle tabs */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-4 flex-wrap gap-4">
          {/* Hostel Filters */}
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

          {/* Active filter count banner */}
          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{pagination.totalProducts}</span> available listings
          </div>
        </div>

        {/* Product Grid Area */}
        {loading ? (
          /* Shimmer Loading Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-between p-4 animate-pulse space-y-4"
              >
                <div className="w-full aspect-square bg-slate-850 rounded-xl"></div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-850 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-850 rounded w-1/2"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                  <div className="h-6 bg-slate-850 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-850 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State view */
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <span className="text-4xl">📡</span>
            <h3 className="text-lg font-bold text-white">Connection Issues</h3>
            <p className="text-slate-450 text-sm text-slate-400">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all"
            >
              Try Reconnecting
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty Filter State view */
          <div className="py-20 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto">
              🔍
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">No products match</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We couldn't find any available products matching your search or filters in this view.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/needs/new"
                className="px-5 py-3 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md transition-all"
              >
                Post a Request on Needs Board
              </Link>
            </div>
          </div>
        ) : (
          /* Content Render Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
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
                <span className="text-xs text-slate-400 font-medium">
                  Page <span className="text-white font-bold">{page}</span> of {pagination.totalPages}
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

export default Home;
