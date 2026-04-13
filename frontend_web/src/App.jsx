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
import DashboardManagement from './pages/admin/DashboardManagement';
import UserManagement from './pages/admin/UserManagement';
import ProviderManagement from './pages/admin/ProviderManagement';
import LocationManagement from './pages/admin/LocationManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import BookingManagement from './pages/admin/BookingManagement';
import CouponManagement from './pages/admin/CouponManagement';
import ReportManagement from './pages/admin/ReportManagement';
import SettingManagement from './pages/admin/SettingManagement';
import ReviewManagement from './pages/admin/ReviewManagement';
import AutomationManagement from './pages/admin/AutomationManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
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
                    <DashboardManagement />
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
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.PROVIDERS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProviderManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.SERVICES_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ServiceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.BOOKINGS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BookingManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.REVIEWS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ReviewManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.COUPONS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CouponManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.AUTOMATION_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AutomationManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.REPORTS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ReportManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path={API_ENDPOINTS.SETTINGS_ADMIN}
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingManagement />
                  </ProtectedRoute>
                }
              />

              {/* Tạm thời giữ lại các route cũ để tương thích (Optional) */}
              <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><ServiceManagement /></ProtectedRoute>} />
              <Route path="/admin/hotels" element={<ProtectedRoute allowedRoles={['admin']}><ServiceManagement /></ProtectedRoute>} />
              <Route path="/admin/tours" element={<ProtectedRoute allowedRoles={['admin']}><ServiceManagement /></ProtectedRoute>} />
              <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['admin']}><DashboardManagement /></ProtectedRoute>} />

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
