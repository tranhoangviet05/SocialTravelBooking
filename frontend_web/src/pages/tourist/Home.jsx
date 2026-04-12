import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import HeroBanner from '../../components/tourist/home_page/HeroBanner';
import WhyChooseUs from '../../components/tourist/home_page/WhyChooseUs';
import TrendingDestinations from '../../components/tourist/home_page/TrendingDestinations';
import CommunityFeed from '../../components/tourist/home_page/CommunityFeed';
import Accommodations from '../../components/tourist/home_page/Accommodations';
import SpecialOffers from '../../components/tourist/home_page/SpecialOffers';
import PopularActivities from '../../components/tourist/home_page/PopularActivities';
import LoginModal from '../../components/common/LoginModal';
import RegisterModal from '../../components/common/RegisterModal';

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