import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const ProductCard = ({ product }) => {
  const { _id, title, price, category, hostel, roomNumber, images, createdAt } = product;

  // Fallback SVG placeholder image
  const fallbackImage = (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-600 gap-1.5">
      <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-[10px] uppercase font-bold tracking-wider">No Image</span>
    </div>
  );

  const displayImage = images && images.length > 0 ? (
    <img
      src={images[0]}
      alt={title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
    />
  ) : fallbackImage;

  const timeAgo = dayjs(createdAt).fromNow();

  return (
    <Link
      to={`/products/${_id}`}
      className="group bg-slate-900/30 border border-slate-850 hover:border-indigo-500/30 rounded-2xl overflow-hidden shadow-md hover:shadow-indigo-950/20 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Aspect Ratio Image Container */}
        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden border-b border-slate-850">
          {displayImage}
          {/* Category Tag Overlay */}
          <div className="absolute top-2 left-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-slate-950/80 backdrop-blur-md text-indigo-400 border border-indigo-500/10">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2 text-left">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <span>📍</span>
            <span>{hostel} {roomNumber && `• Room ${roomNumber}`}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 text-left">
        <div className="flex justify-between items-end border-t border-slate-850/50 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Price</span>
            <span className="text-lg font-black text-indigo-455 text-indigo-400">${price.toFixed(2)}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium mb-1">{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
