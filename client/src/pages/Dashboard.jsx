import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { label: 'Total Rooms', value: '48', icon: '🏢', change: '+2 new wings' },
    { label: 'Occupied Beds', value: '112/120', icon: '👥', change: '93% occupancy' },
    { label: 'Pending Bookings', value: '7', icon: '⏳', change: 'Require review' },
    { label: 'Monthly Revenue', value: '$8,450', icon: '💰', change: '+12% from last month' }
  ];

  const mockRooms = [
    { number: '101', wing: 'Block A', type: 'Double Sharing', status: 'Occupied', occupants: ['Alex Johnson', 'Michael Chang'] },
    { number: '102', wing: 'Block A', type: 'Single Room', status: 'Occupied', occupants: ['David Miller'] },
    { number: '103', wing: 'Block A', type: 'Double Sharing', status: 'Available', occupants: ['Sarah Conner'] },
    { number: '201', wing: 'Block B', type: 'Four Sharing', status: 'Available', occupants: ['Emma Watson', 'Taylor Swift'] },
    { number: '202', wing: 'Block B', type: 'Single Room', status: 'Maintenance', occupants: [] }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            🏠 HostelHub
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Admin Console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">Hello, <span className="font-semibold text-slate-200">Admin User</span></span>
          <Link
            to="/login"
            className="text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-slate-850 hover:border-slate-750 transition-all duration-200"
          >
            Sign Out
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Overview Dashboard</h2>
          <p className="text-slate-450 text-slate-400 text-sm mt-1">Real-time statistics of rooms, tenants, and collections.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/25 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="block text-xs text-indigo-400 mt-1 font-medium">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Hostel Rooms Table/Grid */}
        <div className="bg-slate-900/30 border border-slate-850 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-850 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Rooms Registry</h3>
              <p className="text-xs text-slate-500">List of rooms, current occupants, and availability status</p>
            </div>
            <button className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-md transition-colors">
              + Add New Room
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-855 bg-slate-900/10 text-slate-400 font-medium text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Room No.</th>
                  <th className="px-6 py-4">Wing</th>
                  <th className="px-6 py-4">Room Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Occupants</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855 text-sm">
                {mockRooms.map((room, i) => (
                  <tr key={i} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">Room {room.number}</td>
                    <td className="px-6 py-4 text-slate-350 text-slate-300">{room.wing}</td>
                    <td className="px-6 py-4 text-slate-350 text-slate-350 text-slate-400">{room.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        room.status === 'Occupied' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-450 border border-rose-500/20 text-rose-400'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {room.occupants.length > 0 ? room.occupants.join(', ') : <span className="text-slate-600 font-mono">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-400 hover:text-indigo-350 hover:underline font-semibold text-xs transition-all">
                        Edit Allocation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        &copy; 2026 HostelHub. All rights reserved. Created with React, Tailwind, and Node.js.
      </footer>
    </div>
  );
};

export default Dashboard;
