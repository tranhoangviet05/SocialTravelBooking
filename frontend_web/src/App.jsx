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

// --- Provider Pages ---
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderMyServices from './pages/provider/MyServices';
import ProviderMyBookings from './pages/provider/MyBookings';
import ProviderMyReviews from './pages/provider/MyReviews';

import './App.css';
import { API_ENDPOINTS } from './utils/ConstantSystems';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <AdminDataProvider>
            <NotificationProvider>
              <Routes>
                {/* Trang công khai & Tourist — Bọc trong MainLayout (Header + Footer) */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/service/:id" element={<ServiceDetailPage />} />
                  <Route path="/community" element={<CommunityPage />} />

                  {/* Các route yêu cầu đăng nhập (Tourist) */}
                  <Route element={<ProtectedRoute allowedRoles={['tourist', 'admin', 'provider']} />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                  </Route>
                </Route>

                {/* Admin routes — cần role admin */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path={API_ENDPOINTS.ADMIN_DASHBOARD} element={<DashboardManagement />} />
                  <Route path={API_ENDPOINTS.LOCATIONS_ADMIN} element={<LocationManagement />} />
                  <Route path={API_ENDPOINTS.CATEGORIES_ADMIN} element={<CategoryManagement />} />
                  <Route path={API_ENDPOINTS.USERS_ADMIN} element={<UserManagement />} />
                  <Route path={API_ENDPOINTS.PROVIDERS_ADMIN} element={<ProviderManagement />} />
                  <Route path={API_ENDPOINTS.SERVICES_ADMIN} element={<ServiceManagement />} />
                  <Route path={API_ENDPOINTS.BOOKINGS_ADMIN} element={<BookingManagement />} />
                  <Route path={API_ENDPOINTS.REVIEWS_ADMIN} element={<ReviewManagement />} />
                  <Route path={API_ENDPOINTS.COUPONS_ADMIN} element={<CouponManagement />} />
                  <Route path={API_ENDPOINTS.AUTOMATION_ADMIN} element={<AutomationManagement />} />
                  <Route path={API_ENDPOINTS.REPORTS_ADMIN} element={<ReportManagement />} />
                  <Route path={API_ENDPOINTS.SETTINGS_ADMIN} element={<SettingManagement />} />
                  <Route path="/admin/services" element={<ServiceManagement />} />
                  <Route path="/admin/hotels" element={<ServiceManagement />} />
                  <Route path="/admin/tours" element={<ServiceManagement />} />
                  <Route path="/admin/stats" element={<DashboardManagement />} />
                </Route>

                {/* Provider routes — cần role provider (Mỗi page tự bọc ProviderLayout) */}
                <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
                  <Route path={API_ENDPOINTS.PROVIDER_DASHBOARD} element={<ProviderDashboard />} />
                  <Route path={API_ENDPOINTS.PROVIDER_SERVICES} element={<ProviderMyServices />} />
                  <Route path={API_ENDPOINTS.PROVIDER_BOOKINGS} element={<ProviderMyBookings />} />
                  <Route path={API_ENDPOINTS.PROVIDER_REVIEWS} element={<ProviderMyReviews />} />
                </Route>
              </Routes>
            </NotificationProvider>
          </AdminDataProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
