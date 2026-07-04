import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Reusable Multi-Image Upload Component
 * @param {Array} value - Current array of uploaded Cloudinary image URLs
 * @param {Function} onChange - Callback triggered when URLs are updated (passes array of URLs)
 * @param {number} maxImages - Maximum allowed images (default 5)
 */
const ImageUpload = ({ value = [], onChange, maxImages = 5 }) => {
  const [localFiles, setLocalFiles] = useState([]); // [{ file: File, id: string, preview: string }]
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Trigger file dialog
  const handleSelectClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // Process selected files
  const handleFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files || []);
    
    // Check total limit
    const currentTotal = value.length + localFiles.length;
    if (currentTotal + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images in total.`);
      return;
    }

    // Validate size and format
    const validated = [];
    for (const file of files) {
      // 5 MB Limit
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Max limit is 5 MB.`);
        return;
      }
      
      // Mime check
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} has an unsupported format. Only JPG, JPEG, PNG and WEBP are allowed.`);
        return;
      }

      validated.push({
        file,
        id: Math.random().toString(36).substring(2, 9),
        preview: URL.createObjectURL(file)
      });
    }

    setLocalFiles((prev) => [...prev, ...validated]);
    
    // Clear input so same file can be re-selected if needed
    if (e.target) e.target.value = '';
  };

  // Remove a locally selected file before uploading
  const removeLocalFile = (idToRemove) => {
    setLocalFiles((prev) => {
      const fileToRevoke = prev.find(item => item.id === idToRemove);
      if (fileToRevoke) {
        URL.revokeObjectURL(fileToRevoke.preview);
      }
      return prev.filter(item => item.id !== idToRemove);
    });
  };

  // Remove an already uploaded Cloudinary image
  const removeUploadedImage = (urlToRemove) => {
    const updatedUrls = value.filter(url => url !== urlToRemove);
    onChange(updatedUrls);
  };

  // Perform upload to server
  const handleUpload = async () => {
    if (localFiles.length === 0) {
      console.log('ImageUpload: handleUpload called but localFiles is empty');
      return;
    }
    console.log('ImageUpload: handleUpload triggered. localFiles:', localFiles);
    setUploading(true);
    setError('');

    const formData = new FormData();
    localFiles.forEach((item) => {
      formData.append('images', item.file);
    });

    console.log('ImageUpload: sending POST request to /upload with formData...');
    try {
      const response = await axiosInstance.post('/upload', formData);
      console.log('ImageUpload: upload response received successfully:', response);
      const data = response.data;

      // Append new URLs to the parent array
      const newUrls = data.urls || [];
      console.log('ImageUpload: response urls:', newUrls);
      const updatedUrls = [...value, ...newUrls];
      console.log('ImageUpload: updating parent state with updatedUrls:', updatedUrls);
      onChange(updatedUrls);

      toast.success('Images uploaded successfully!');

      // Clear local files and revoke objects
      localFiles.forEach(item => URL.revokeObjectURL(item.preview));
      setLocalFiles([]);
    } catch (err) {
      console.error('ImageUpload: error uploading files:', err);
      const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Error uploading files. Please try again.';
      console.error('ImageUpload: error message parsed:', errMsg);
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setUploading(false);
      console.log('ImageUpload: handleUpload completed.');
    }
  };

  const remainingSlots = maxImages - value.length - localFiles.length;

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Product Images ({value.length + localFiles.length} / {maxImages})
        </label>
        {localFiles.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            {uploading ? 'Uploading...' : `Upload Selected (${localFiles.length})`}
          </button>
        )}
      </div>

      {/* Upload Zone */}
      {remainingSlots > 0 && (
        <div
          onClick={handleSelectClick}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-slate-800 bg-slate-900/10 cursor-not-allowed opacity-50'
              : 'border-slate-800 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-900/50'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">📸</span>
            <p className="text-sm text-slate-300 font-medium">Click to select files</p>
            <p className="text-xs text-slate-550 text-slate-400">
              JPG, PNG or WEBP formats (Max 5MB each)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Image Grid Previews */}
      {(value.length > 0 || localFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          
          {/* 1. Already Uploaded Cloudinary Images */}
          {value.map((url, index) => (
            <div key={`cloud-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-indigo-500/30 bg-slate-900 group">
              <img
                src={url}
                alt="Product upload"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[8px] font-bold px-1.5 shadow-md">
                Uploaded
              </div>
              <button
                type="button"
                onClick={() => removeUploadedImage(url)}
                disabled={uploading}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity rounded-xl cursor-pointer"
              >
                Delete 🗑️
              </button>
            </div>
          ))}

          {/* 2. Locally Selected Files (Waiting Upload) */}
          {localFiles.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
              <img
                src={item.preview}
                alt="Local preview"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 text-[8px] font-bold px-1.5 shadow-md">
                Pending
              </div>
              <button
                type="button"
                onClick={() => removeLocalFile(item.id)}
                disabled={uploading}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity rounded-xl cursor-pointer"
              >
                Remove ✖
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading Overlay when uploading */}
      {uploading && (
        <div className="flex items-center gap-2.5 text-indigo-400 text-xs font-semibold">
          <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span>Uploading images to cloud storage...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
