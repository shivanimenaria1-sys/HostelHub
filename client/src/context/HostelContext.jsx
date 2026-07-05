import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const HostelContext = createContext(null);

export const HostelProvider = ({ children }) => {
  const [hostels, setHostels] = useState([]);       // full Hostel objects from API
  const [hostelNames, setHostelNames] = useState([]); // just the name strings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/hostels');
        if (res.data.status === 'success') {
          const data = res.data.data;
          setHostels(data);
          setHostelNames(data.map(h => h.name));
        } else {
          throw new Error('Unexpected response from /api/hostels');
        }
      } catch (err) {
        console.error('HostelContext fetch error:', err);
        setError(err.message || 'Failed to load hostel list');
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  return (
    <HostelContext.Provider value={{ hostels, hostelNames, loading, error }}>
      {children}
    </HostelContext.Provider>
  );
};

// Reusable hook
export const useHostels = () => {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error('useHostels must be used within a HostelProvider');
  }
  return context;
};
