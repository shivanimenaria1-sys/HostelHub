import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6 animate-pulse">
            Introducing HostelHub v1.0
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-6">
            Simplify Your <span className="text-indigo-400">Hostel Management</span> Experience
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The ultimate MERN-stack platform to easily manage rooms, bookings, student profiles, and amenities in one centralized, sleek dashboard.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-0.5 text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-300 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-24 z-10 w-full px-4">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 p-6 rounded-2xl text-left hover:border-indigo-500/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl mb-4">
              🛏️
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Room Allocation</h3>
            <p className="text-slate-400 text-sm">
              Manage room availability, types (single, double, sharing), and assign students effortlessly.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 p-6 rounded-2xl text-left hover:border-indigo-500/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl mb-4">
              📅
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Bookings & Fees</h3>
            <p className="text-slate-400 text-sm">
              Track reservation requests, check-in dates, and keep records of monthly fee collections and dues.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-850 p-6 rounded-2xl text-left hover:border-indigo-500/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl mb-4">
              📊
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Detailed Analytics</h3>
            <p className="text-slate-400 text-sm">
              Monitor overall occupancy rates, collection analytics, and student complaints from a single dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
