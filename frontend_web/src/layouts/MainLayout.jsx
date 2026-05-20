import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoginModal from '../components/common/LoginModal';
import RegisterModal from '../components/common/RegisterModal';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

const MainLayout = () => {
    const [activeModal, setActiveModal] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const openLogin = () => setActiveModal('login');
    const openRegister = () => setActiveModal('register');
    const closeModal = () => setActiveModal(null);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            <Header onLoginClick={openLogin} />
            
            <main className="flex-grow">
                {/* Pages will be injected here */}
                <Outlet context={{ openLogin, openRegister }} />
            </main>

            <Footer />

            {/* Floating Gemini AI Chat Button — chỉ hiện khi đã đăng nhập */}
            {currentUser && (
                <button
                    onClick={() => navigate('/messages?userId=00000000-0000-0000-0000-000000000000&name=Trợ lý ảo Gemini')}
                    title="Chat với Trợ lý ảo Gemini AI"
                    className="fixed bottom-6 right-6 z-[200] group flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-blue-400/40"
                    style={{
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
                    }}
                >
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="hidden group-hover:inline whitespace-nowrap transition-all duration-200">
                        Chat với AI
                    </span>
                </button>
            )}

            <LoginModal 
                isOpen={activeModal === 'login'} 
                onClose={closeModal} 
                onSwitchToRegister={openRegister} 
            />
            <RegisterModal 
                isOpen={activeModal === 'register'} 
                onClose={closeModal} 
                onSwitchToLogin={openLogin} 
            />
        </div>
    );
};

export default MainLayout;
