import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const MyListings = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of product undergoing change

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/products/my-listings');
      const data = response.data;
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    try {
      const response = await axiosInstance.patch(`/products/${id}/status`);
      const data = response.data;

      // Optimistic state update without page reload
      setProducts(prev =>
        prev.map(p => (p._id === id ? { ...p, status: data.product.status } : p))
      );
      toast.success(`Product status updated to ${data.product.status}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? All uploaded images will be permanently removed.')) {
      return;
    }
    setActionLoading(id);
    try {
      await axiosInstance.delete(`/products/${id}`);

      // State filtering update without page refresh
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product listing deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setActionLoading(null);
    }
  };

  // Compute stats dynamically from active state array
  const totalListings = products.length;
  const availableListings = products.filter(p => p.status === 'Available').length;
  const soldListings = products.filter(p => p.status === 'Sold').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Alert */}


      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-50 hover:text-indigo-400 transition-colors">
            🏠 HostelHub
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            My Listings
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/products/new"
            className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-md transition-all font-semibold"
          >
            + Create New Listing
          </Link>
          <Link
            to="/"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-850 transition-all"
          >
            Marketplace
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight">Your Listings</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and track your products listed for sale.</p>
        </div>

        {/* Statistics Summary Cards at the top */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Listings</span>
              <span className="text-2xl font-black text-slate-50 mt-1 block">{totalListings}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-left border-l-emerald-500/20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-550 text-slate-400 block">Available</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{availableListings}</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-left border-l-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Sold Out</span>
              <span className="text-2xl font-black text-slate-450 text-slate-400 mt-1 block">{soldListings}</span>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-between p-4 animate-pulse space-y-4"
              >
                <div className="w-full aspect-video bg-slate-850 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-850 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-850 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-855">
                  <div className="h-8 bg-slate-850 rounded flex-1"></div>
                  <div className="h-8 bg-slate-850 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State view */
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4 max-w-md mx-auto">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-slate-50">Oops! Something went wrong</h3>
            <p className="text-sm text-slate-400">{error}</p>
            <button
              onClick={fetchMyListings}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm rounded-xl font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty State Illustration */
          <div className="border border-dashed border-slate-850 bg-slate-900/10 rounded-2xl p-12 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto">
              🏷️
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-50">No listings found</h3>
              <p className="text-sm text-slate-400">
                You haven't listed any products yet. Share items like textbooks, snacks, or furniture with your hostel mates.
              </p>
            </div>
            <Link
              to="/products/new"
              className="inline-block px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              Post Your First Product
            </Link>
          </div>
        ) : (
          /* Listings Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-lg hover:border-slate-800 transition-all flex flex-col justify-between"
              >
                {/* Image & Status Tag */}
                <div className="relative aspect-video bg-slate-950">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400x225?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-md ${
                      product.status === 'Available'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-100">
                    {product.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-slate-50 line-clamp-1">{product.title}</h3>
                      <span className="text-indigo-400 font-extrabold text-lg">₹{product.price}</span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-850">
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-center flex items-center justify-center gap-1"
                      >
                        ✏️ Edit
                      </Link>

                      {/* Toggle status Button */}
                      <button
                        onClick={() => handleToggleStatus(product._id)}
                        disabled={actionLoading !== null}
                        className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1 ${
                          product.status === 'Available'
                            ? 'border-amber-500/25 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10'
                            : 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {actionLoading === product._id ? (
                          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : product.status === 'Available' ? (
                          'Mark Sold'
                        ) : (
                          'Mark Available'
                        )}
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={actionLoading !== null}
                      className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center"
                    >
                      {actionLoading === product._id ? (
                        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Delete Listing 🗑️'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyListings;
