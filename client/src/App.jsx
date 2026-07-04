import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import AddProduct from './pages/AddProduct';
import MyListings from './pages/MyListings';
import ProductDetail from './pages/ProductDetail';
import PostNeed from './pages/PostNeed';
import BrowseNeeds from './pages/BrowseNeeds';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          },
          duration: 3500
        }}
      />
      <Routes>
        {/* Auth outside layout */}
        <Route path="/login" element={<Login />} />

        {/* Protected Onboarding outside layout */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute isOnboardingRoute={true}>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Layout Wrapped Routes (Interactive Feed & Actions) */}
        <Route element={<Layout />}>
          {/* Public views (renders navbars if authenticated) */}
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Protected views (requires auth + redirects to onboarding if unfinished) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/needs/new"
            element={
              <ProtectedRoute>
                <PostNeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/needs"
            element={
              <ProtectedRoute>
                <BrowseNeeds />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
