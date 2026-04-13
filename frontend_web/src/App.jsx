import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/tourist/Home';
import AdminDashboard from './pages/admin/Dashboard';
<<<<<<< Updated upstream
=======
import LocationManagement from './pages/admin/LocationManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminPlaceholder from './pages/admin/Placeholder';
>>>>>>> Stashed changes
import ProviderDashboard from './pages/provider/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
          {/* Trang công khai — Tourist */}
          <Route path="/" element={<HomePage />} />

<<<<<<< Updated upstream
          {/* Admin routes — cần role admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
=======
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
>>>>>>> Stashed changes

          {/* Provider routes — cần role provider */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
