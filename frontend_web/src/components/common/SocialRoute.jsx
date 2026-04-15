import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SocialRoute = () => {
    const { currentUser, socialActive, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm font-medium">Đang kiểm tra hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (!socialActive) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

export default SocialRoute;
