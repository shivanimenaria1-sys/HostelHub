import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    images: [],
    hostel: '',
    roomNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);

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

  const hostelOptions = ['Hostel A', 'Hostel B', 'Hostel C'];

  // Fetch product to edit if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProductToEdit = async () => {
        setFetchingProduct(true);
        try {
          const res = await axiosInstance.get(`/products/${id}`);
          const data = res.data;

          // Verify ownership
          if (user && data.product.seller._id !== user._id) {
            toast.error('Unauthorized: You are not the owner of this listing');
            setTimeout(() => navigate('/products/my-listings'), 2000);
            return;
          }

          setFormData({
            title: data.product.title,
            price: data.product.price.toString(),
            category: data.product.category,
            description: data.product.description || '',
            images: data.product.images || [],
            hostel: data.product.hostel,
            roomNumber: data.product.roomNumber
          });
        } catch (err) {
          console.error(err);
          toast.error('Failed to load listing details for editing');
        } finally {
          setFetchingProduct(false);
        }
      };

      if (user) {
        fetchProductToEdit();
      }
    }
  }, [id, isEditMode, user]);

  // Pre-fill hostel and roomNumber from user context once available (for Create Mode only)
  useEffect(() => {
    if (user && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        hostel: prev.hostel || user.hostel || '',
        roomNumber: prev.roomNumber || user.roomNumber || ''
      }));
    }
  }, [user, isEditMode]);

  const validate = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = 'Product name is required';
    if (!formData.price) {
      tempErrors.price = 'Price is required';
    } else if (Number(formData.price) <= 0) {
      tempErrors.price = 'Price must be greater than 0';
    }
    if (!formData.category) tempErrors.category = 'Please select a category';
    if (!formData.hostel) tempErrors.hostel = 'Hostel is required';
    if (!formData.roomNumber.trim()) tempErrors.roomNumber = 'Room number is required';
    if (!formData.images || formData.images.length === 0) {
      tempErrors.images = 'Please upload at least one image';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleImageChange = (newImageUrls) => {
    setFormData((prev) => ({ ...prev, images: newImageUrls }));
    if (errors.images && newImageUrls.length > 0) {
      setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors below.');
      return;
    }

    setSubmitting(true);

    try {
      const url = isEditMode ? `/products/${id}` : '/products';
      const response = await (isEditMode ? axiosInstance.put(url, formData) : axiosInstance.post(url, formData));
      
      toast.success(isEditMode ? 'Listing updated successfully! Redirecting...' : 'Product listed successfully! Redirecting...');
      
      // Reset form
      if (!isEditMode) {
        setFormData({
          title: '',
          price: '',
          category: '',
          description: '',
          images: [],
          hostel: user?.hostel || '',
          roomNumber: user?.roomNumber || ''
        });
      }

      // Redirect after brief delay
      setTimeout(() => {
        navigate('/products/my-listings');
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || (isEditMode ? 'Failed to update listing' : 'Failed to create listing'));
    } finally {
      setSubmitting(false);
    }
  };
  if (fetchingProduct) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-555 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading listing details...</p>
        </div>
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
            {isEditMode ? 'Edit Listing' : 'Create Listing'}
          </span>
        </div>
        <Link
          to="/products/my-listings"
          className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-50 px-3 py-1.5 rounded-lg border border-slate-850 transition-all"
        >
          Cancel
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 relative">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="z-10 relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-50 tracking-tight">
              {isEditMode ? 'Edit Listing' : 'Sell an Item'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isEditMode ? 'Modify your product details and images.' : 'List pre-loved stuff, food, or electronics for other hostel tenants.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-850 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
            {/* Image Upload Input */}
            <div className="space-y-1">
              <ImageUpload value={formData.images} onChange={handleImageChange} maxImages={5} />
              {errors.images && (
                <p className="text-rose-455 text-xs text-rose-400 mt-1">{errors.images}</p>
              )}
            </div>

            {/* Title / Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Product Name
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-slate-950 border ${
                  errors.title ? 'border-rose-500' : 'border-slate-850'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                placeholder="e.g. Electric Kettle, Study Lamp, Maggi Packet"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && (
                <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.title}</p>
              )}
            </div>

            {/* Price & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-slate-950 border ${
                    errors.price ? 'border-rose-500' : 'border-slate-850'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && (
                  <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
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
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 resize-none"
                placeholder="Give details about the item's condition, age, usage, or exchange options..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Hostel & Room Override */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-850">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Exchange Location (Hostel)
                </label>
                <select
                  className={`w-full px-4 py-3 bg-slate-950 border ${
                    errors.hostel ? 'border-rose-500' : 'border-slate-850'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 cursor-pointer`}
                  value={formData.hostel}
                  onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                >
                  <option value="">-- Select Hostel --</option>
                  {hostelOptions.map((h, i) => (
                    <option key={i} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                {errors.hostel && (
                  <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.hostel}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Exchange Room Number
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-slate-950 border ${
                    errors.roomNumber ? 'border-rose-500' : 'border-slate-850'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100`}
                  placeholder="e.g. 102-A"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
                {errors.roomNumber && (
                  <p className="text-rose-455 text-xs mt-1.5 text-rose-400">{errors.roomNumber}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 disabled:scale-100 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-indigo-650/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isEditMode ? 'Save Changes' : 'Publish Listing'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
