import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdminDataProvider } from './contexts/AdminDataContext';
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
import LocationManagement from './pages/admin/LocationManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminPlaceholder from './pages/admin/Placeholder';
import ProviderDashboard from './pages/provider/Dashboard';
import './App.css';
import { API_ENDPOINTS } from './utils/ConstantSystems';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminDataProvider>
          <NotificationProvider>
            <Routes>
              {/* Trang công khai — Tourist */}
              <Route path="/" element={<HomePage />} />

              {/* Admin routes — cần role admin */}
              <Route
                path={API_ENDPOINTS.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.LOCATIONS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <LocationManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.CATEGORIES_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CategoryManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.USERS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPlaceholder title="Quản lý Người dùng" />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.HOTELS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPlaceholder title="Quản lý Lưu trú" />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.TOURS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPlaceholder title="Quản lý Tours & Hoạt động" />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.STATS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPlaceholder title="Thống kê" />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.SETTINGS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPlaceholder title="Cài đặt hệ thống" />
                  </ProtectedRoute>
                }
              />

              {/* Provider routes — cần role provider */}
              <Route
                path={API_ENDPOINTS.PROVIDER_DASHBOARD}
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </NotificationProvider>
        </AdminDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
