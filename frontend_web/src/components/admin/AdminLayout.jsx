import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

const AdminLayout = ({ title = 'Admin Dashboard' }) => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <AdminSidebar />
            
            <div className="flex-1 ml-64 flex flex-col">
                <AdminTopBar title={title} />
                
                <main className="p-8">
                    <Outlet />
                </main>
                
                <footer className="mt-auto p-8 text-center text-sm text-gray-400 font-medium">
                    &copy; 2024 Social Travel Booking. All rights reserved. System Version 2.4.0
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
