import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/tourist/Home';
import SearchPage from './pages/tourist/Search';
import ServiceDetailPage from './pages/tourist/ServiceDetail';
import ProfilePage from './pages/tourist/Profile';
import MyBookingsPage from './pages/tourist/MyBookings';
import AdminDashboard from './pages/admin/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Trang công khai — Tourist, bọc bằng MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/service/:id" element={<ServiceDetailPage />} />
            
            {/* Các trang dành cho Tourist yêu cầu đăng nhập */}
            <Route element={<ProtectedRoute allowedRoles={['tourist', 'admin', 'provider']} />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
            </Route>
          </Route>

          {/* Admin routes — cần role admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout roleTitle="Admin Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
