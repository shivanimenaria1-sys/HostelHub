import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of product currently undergoing update
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMyListings();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/products/my-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch listings');
      }
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error. Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${apiBaseUrl}/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      // Update state local mapping
      setProducts(prev =>
        prev.map(p => (p._id === id ? { ...p, status: data.product.status } : p))
      );
      setToast({ type: 'success', message: `Product status updated to ${data.product.status}` });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Failed to update status' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? All uploaded images will be removed.')) {
      return;
    }
    setActionLoading(id);
    try {
      const response = await fetch(`${apiBaseUrl}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete listing');
      }

      // Filter out deleted product
      setProducts(prev => prev.filter(p => p._id !== id));
      setToast({ type: 'success', message: 'Product listing deleted successfully' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Failed to delete listing' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm shadow-xl animate-bounce ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            🏠 HostelHub
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            My Listings
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/products/new"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-md transition-all font-semibold"
          >
            + Create New Listing
          </Link>
          <Link
            to="/dashboard"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-850 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Your Listings</h2>
            <p className="text-slate-400 text-sm mt-1">Manage and track your products listed for sale.</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Fetching your items...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4 max-w-md mx-auto">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-white">Oops! Something went wrong</h3>
            <p className="text-sm text-slate-400">{error}</p>
            <button
              onClick={fetchMyListings}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm rounded-xl font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="border border-dashed border-slate-850 bg-slate-900/10 rounded-2xl p-12 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto">
              🏷️
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">No listings found</h3>
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
          /* Listings Grid */
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
                      <h3 className="font-bold text-lg text-white line-clamp-1">{product.title}</h3>
                      <span className="text-indigo-400 font-extrabold text-lg">${product.price.toFixed(2)}</span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-850">
                    <button
                      onClick={() => handleToggleStatus(product._id)}
                      disabled={actionLoading !== null}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1 ${
                        product.status === 'Available'
                          ? 'border-amber-500/25 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10'
                          : 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {actionLoading === product._id ? (
                        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : product.status === 'Available' ? (
                        'Mark as Sold'
                      ) : (
                        'Mark Available'
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={actionLoading !== null}
                      className="py-2 px-3 text-xs font-semibold rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-450 hover:bg-rose-500/10 text-rose-400 transition-all flex items-center justify-center"
                    >
                      {actionLoading === product._id ? (
                        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Delete Listing'
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
