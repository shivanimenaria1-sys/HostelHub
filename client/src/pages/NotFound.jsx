import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md z-10 space-y-6">
        <h1 className="text-9xl font-black text-slate-800 tracking-widest">404</h1>
        <div className="bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider inline-block">
          Page Not Found
        </div>
        <h2 className="text-2xl font-bold text-slate-50 mt-4">Lost in Transit?</h2>
        <p className="text-slate-400">
          The page you are looking for does not exist or has been relocated to another address.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
          >
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
