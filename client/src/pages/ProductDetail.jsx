import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [statusLoading, setStatusLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      const data = response.data;

      setProduct(data.product);
      setActiveImageIndex(0);
      
      // Fetch related products after detail is loaded
      fetchRelated(data.product.category, data.product.hostel, data.product._id);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError('404');
      } else {
        setError(err.response?.data?.message || 'Error loading product');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category, hostel, currentId) => {
    setRelatedLoading(true);
    try {
      const response = await axiosInstance.get('/products', {
        params: {
          category,
          hostel,
          status: 'Available',
          limit: 5
        }
      });
      const data = response.data;
      
      // Filter out current product and limit to 4
      const filtered = (data.products || [])
        .filter(p => p._id !== currentId)
        .slice(0, 4);
      setRelatedProducts(filtered);
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      setRelatedLoading(false);
    }
  };

  // WhatsApp click handler
  const handleContactSeller = async () => {
    if (!product?.seller) return;
    
    // 1. Construct deep link
    // Strip non-digits from phone
    const cleanPhone = product.seller.phoneNumber.replace(/\D/g, '');
    const message = `Hi! I'm interested in your ${product.title}. Is it still available?`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');

    // 2. Silently log contact click if authenticated and not the owner
    if (isAuthenticated && user?._id !== product.seller._id) {
      try {
        await axiosInstance.post(`/products/${product._id}/contact-log`);
      } catch (err) {
        console.error('Failed to log contact click:', err);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    setStatusLoading(true);
    try {
      const response = await axiosInstance.patch(`/products/${product._id}/status`);
      const data = response.data;

      setProduct(prev => ({ ...prev, status: data.product.status }));
      toast.success(`Product marked as ${data.product.status}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Web Share API
  const handleShare = async () => {
    const shareData = {
      title: product?.title || 'HostelHub Listing',
      text: product?.description || `Check out this listing on HostelHub: ${product?.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Clipboard Fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const isOwner = product && isAuthenticated && user?._id === product.seller?._id;

  // Placeholder SVGs for missing images
  const fallbackImage = (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-600 gap-1.5">
      <svg className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs uppercase font-bold tracking-wider">No Image Available</span>
    </div>
  );

  // 404 Render
  if (error === '404') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 text-center">
        <span className="text-6xl mb-4">🏷️</span>
        <h2 className="text-3xl font-extrabold text-slate-50">Listing Not Found</h2>
        <p className="text-slate-400 mt-2 text-sm max-w-sm">
          The listing you are searching for might have been sold, deleted, or expired.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-colors"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Error State
  if (error && error !== '404') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 text-center gap-4">
        <span className="text-4xl">📡</span>
        <h2 className="text-xl font-bold text-slate-50">Connection Error</h2>
        <p className="text-slate-400 text-sm">{error}</p>
        <button
          onClick={fetchProductDetail}
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-50 hover:text-indigo-400 transition-colors">
            🏠 HostelHub
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Product Detail
          </span>
        </div>
        <Link
          to="/"
          className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-350 px-3 py-1.5 rounded-lg border border-slate-850 transition-all"
        >
          Back to Listings
        </Link>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-12">
        {loading ? (
          /* Skeleton Loader Details */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
            <div className="space-y-4">
              <div className="aspect-square bg-slate-900 rounded-3xl w-full"></div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-900 rounded-xl"></div>
                <div className="w-16 h-16 bg-slate-900 rounded-xl"></div>
                <div className="w-16 h-16 bg-slate-900 rounded-xl"></div>
              </div>
            </div>
            <div className="space-y-6 text-left">
              <div className="h-4 bg-slate-900 rounded w-1/3"></div>
              <div className="h-8 bg-slate-900 rounded w-3/4"></div>
              <div className="h-6 bg-slate-900 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-900 rounded"></div>
                <div className="h-3 bg-slate-900 rounded"></div>
                <div className="h-3 bg-slate-900 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Product Details Display */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start text-left">
            
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-900 shadow-lg">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  fallbackImage
                )}

                {/* SOLD badge overlay */}
                {product.status === 'Sold' && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-8 py-3 bg-rose-600 text-white font-black text-2xl tracking-widest rounded-2xl shadow-2xl border-2 border-white/20 animate-pulse uppercase">
                      Sold out
                    </span>
                  </div>
                )}
              </div>

              {/* Clickable Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 bg-slate-900 flex-shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-indigo-500 scale-98 shadow-md' : 'border-slate-900 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-50 leading-tight">
                  {product.title}
                </h1>
                <p className="text-xs text-slate-500">
                  Listed {dayjs(product.createdAt).fromNow()}
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400">₹{product.price}</span>
                <span className="text-xs text-slate-400">Fixed Price</span>
              </div>

              {/* Location Badge Card */}
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center gap-4">
                <div className="text-2xl">📍</div>
                <div className="text-sm">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Exchange Location</p>
                  <p className="font-bold text-slate-100 mt-0.5">{product.hostel} • Room {product.roomNumber}</p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Item Description</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/10 border border-slate-900 p-4 rounded-2xl">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Seller details card */}
              <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-550/20 rounded-full flex items-center justify-center font-black text-indigo-400 border border-indigo-500/10 text-lg">
                    👤
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">Seller Profile</p>
                    <p className="font-bold text-slate-100 mt-0.5">{product.seller?.name || 'Hub Student'}</p>
                  </div>
                </div>
                
                {/* Contact analytics counter visible to owner */}
                {isOwner && (
                  <div className="text-right text-[10px] uppercase font-mono tracking-wider text-slate-500">
                    Clicks: <span className="text-indigo-400 font-bold text-sm">{product.contactCount || 0}</span>
                  </div>
                )}
              </div>

              {/* Actions Grid */}
              <div className="flex gap-4 pt-4 border-t border-slate-900 flex-wrap">
                {/* 1. Contact / Actions */}
                {!isOwner ? (
                  <button
                    onClick={handleContactSeller}
                    disabled={product.status === 'Sold'}
                    className="flex-1 py-4 bg-emerald-650 hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-900 disabled:border-slate-850 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>💬</span> Contact Seller on WhatsApp
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate(`/products/${product._id}/edit`)}
                      className="flex-1 py-4 bg-slate-900 hover:bg-slate-850 text-slate-100 border border-slate-800 font-bold rounded-2xl transition-all text-center"
                    >
                      ✏️ Edit Listing
                    </button>
                    <button
                      onClick={handleToggleStatus}
                      disabled={statusLoading}
                      className={`flex-1 py-4 font-bold rounded-2xl transition-all flex items-center justify-center ${
                        product.status === 'Available'
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-indigo-650 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {statusLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : product.status === 'Available' ? (
                        'Mark as Sold'
                      ) : (
                        'Mark as Available'
                      )}
                    </button>
                  </>
                )}

                {/* 2. Share Button */}
                <button
                  onClick={handleShare}
                  className="px-5 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-slate-50 font-semibold rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Share listing Link"
                >
                  🔗 {shareSuccess ? 'Link Copied!' : 'Share'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section: Related Products */}
        {!loading && relatedProducts.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-900">
            <h2 className="text-xl font-bold text-slate-50 text-left">More from {product?.hostel} in {product?.category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(related => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
