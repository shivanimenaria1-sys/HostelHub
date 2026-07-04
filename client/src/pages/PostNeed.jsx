import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const PostNeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Results states
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [possibleMatches, setPossibleMatches] = useState([]);

  const categories = [
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

  const validate = () => {
    const tempErrors = {};
    if (!formData.title.trim()) {
      tempErrors.title = 'Request title is required';
    } else if (formData.title.trim().length < 5 || formData.title.trim().length > 100) {
      tempErrors.title = 'Title must be between 5 and 100 characters long';
    }
    if (!formData.category) {
      tempErrors.category = 'Please select a category';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setPostedSuccess(false);
    setPossibleMatches([]);

    try {
      const response = await axiosInstance.post('/needs', {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim()
      });

      const data = response.data;

      setPostedSuccess(true);
      setPossibleMatches(data.possibleMatches || []);

      // Reset form fields
      setFormData({
        title: '',
        category: '',
        description: ''
      });

      toast.success('Request posted successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit need request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col animate-fade-in">


      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-50 hover:text-indigo-400 transition-colors">
            🏠 HostelHub
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Post Need
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/needs"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-850 transition-all font-semibold"
          >
            Needs Feed
          </Link>
          <Link
            to="/"
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-850 transition-all"
          >
            Marketplace
          </Link>
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="z-10 relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight">Post a Need Request</h2>
            <p className="text-slate-400 text-sm mt-1">Can't find an item? Post what you need and let the community know.</p>
          </div>

          {/* Success Banners and Possible Matches Grid */}
          {postedSuccess && (
            <div className="space-y-6 animate-fade-in">
              {possibleMatches.length > 0 ? (
                /* Matches Found */
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-left space-y-6 shadow-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <h3 className="font-extrabold text-emerald-450 text-slate-50 text-lg">Good news! These are already available:</h3>
                      <p className="text-xs text-slate-305 text-slate-300 mt-1">
                        We found matches in the same category in your hostel. Take a look before waiting!
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {possibleMatches.slice(0, 5).map((match) => (
                      <ProductCard key={match._id} product={match} />
                    ))}
                  </div>
                </div>
              ) : (
                /* No Matches Found Banner */
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl text-left flex items-start gap-3 shadow-xl">
                  <span className="text-2xl">📢</span>
                  <div>
                    <h3 className="font-extrabold text-slate-50 text-lg">Request Posted Successfully!</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Your request has been posted on the open board. We'll notify you if someone lists a matching item.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posting Form */}
          <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-855 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
            {/* Title / Need Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                What do you need?
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 bg-slate-950 border ${
                  errors.title ? 'border-rose-500' : 'border-slate-850'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                placeholder="e.g. Need Maggi urgently, Borrowing Calculator for exam"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && (
                <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.title}</p>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                className={`w-full px-4 py-3 bg-slate-950 border ${
                  errors.category ? 'border-rose-500' : 'border-slate-850'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 cursor-pointer`}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.category}</p>
              )}
            </div>

            {/* Description Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Extra Details (Optional)
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 resize-none"
                placeholder="Provide details: how long you need it, when you can return it, or if you can pay/trade..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Hostel Pre-fill Display */}
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">Request Location (Hostel)</span>
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 font-bold rounded-lg">
                📍 {user?.hostel || 'Not Configured'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 disabled:scale-100 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-indigo-650/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Post to Board'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostNeed;
