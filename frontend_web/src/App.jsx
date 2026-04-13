import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/tourist/Home';
import SearchPage from './pages/tourist/Search';
import ServiceDetailPage from './pages/tourist/ServiceDetail';
import ProfilePage from './pages/tourist/Profile';
import MyBookingsPage from './pages/tourist/MyBookings';
import CommunityPage from './pages/tourist/Community';
import CheckoutPage from './pages/tourist/Checkout';
import SuccessPage from './pages/tourist/Success';
import CartPage from './pages/tourist/Cart';
import WishlistPage from './pages/tourist/Wishlist';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProviders from './pages/admin/Providers';
import AdminLocations from './pages/admin/Locations';
import AdminServices from './pages/admin/Services';
import AdminBookings from './pages/admin/Bookings';
import AdminCoupons from './pages/admin/Coupons';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminReviews from './pages/admin/Reviews';
import AdminAutomation from './pages/admin/Automation';
import ProviderDashboard from './pages/provider/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <Routes>
            {/* Trang công khai — Tourist, bọc bằng MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/service/:id" element={<ServiceDetailPage />} />
              <Route path="/community" element={<CommunityPage />} />
              
              {/* Các trang dành cho Tourist yêu cầu đăng nhập */}
              <Route element={<ProtectedRoute allowedRoles={['tourist', 'admin', 'provider']} />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout-success" element={<SuccessPage />} />
              </Route>
            </Route>

            {/* Admin routes — cần role admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="providers" element={<AdminProviders />} />
              <Route path="locations" element={<AdminLocations />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="automation" element={<AdminAutomation />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Provider routes — cần role provider */}
            <Route
              path="/provider"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <DashboardLayout roleTitle="Provider Dashboard" />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ProviderDashboard />} />
            </Route>
          </Routes>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
