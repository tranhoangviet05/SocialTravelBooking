import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroBanner from '../components/home_page/HeroBanner';
import WhyChooseUs from '../components/home_page/WhyChooseUs';
import TrendingDestinations from '../components/home_page/TrendingDestinations';
import CommunityFeed from '../components/home_page/CommunityFeed';
import Accommodations from '../components/home_page/Accommodations';
import SpecialOffers from '../components/home_page/SpecialOffers';
import PopularActivities from '../components/home_page/PopularActivities';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const HomePage = () => {
    const [activeModal, setActiveModal] = useState(null); // null | 'login' | 'register'

    const openLogin = () => setActiveModal('login');
    const openRegister = () => setActiveModal('register');
    const closeModal = () => setActiveModal(null);

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            <Header onLoginClick={openLogin} />
            <main>
                <HeroBanner />
                <TrendingDestinations />
                <Accommodations />
                <PopularActivities />
                <SpecialOffers />
                <CommunityFeed />
                <WhyChooseUs />
            </main>
            <Footer />
            <LoginModal isOpen={activeModal === 'login'} onClose={closeModal} onSwitchToRegister={openRegister} />
            <RegisterModal isOpen={activeModal === 'register'} onClose={closeModal} onSwitchToLogin={openLogin} />
        </div>
    );
};

export default HomePage;