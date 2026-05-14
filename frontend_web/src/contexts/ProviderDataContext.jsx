import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import providerApi from '../api/providerApi';

const ProviderDataContext = createContext(null);

export const useProviderData = () => {
    const context = useContext(ProviderDataContext);
    if (!context) {
        throw new Error('useProviderData must be used within a ProviderDataProvider');
    }
    return context;
};

export const ProviderDataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // Data states
    const [stats, setStats] = useState(null);
    const [services, setServices] = useState([]);
    const [servicesMeta, setServicesMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [walletReport, setWalletReport] = useState([]);
    const [settings, setSettings] = useState(null);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);

    // Loading & Loaded states
    const [loadingStates, setLoadingStates] = useState({});
    const [loadedStates, setLoadedStates] = useState({});

    // Refs for stable callbacks
    const loadedStatesRef = useRef({});
    const loadingStatesRef = useRef({});
    useEffect(() => { loadedStatesRef.current = loadedStates; }, [loadedStates]);
    useEffect(() => { loadingStatesRef.current = loadingStates; }, [loadingStates]);

    const setOneLoading = (key, val) => setLoadingStates(prev => ({ ...prev, [key]: val }));
    const setOneLoaded = (key, val) => setLoadedStates(prev => ({ ...prev, [key]: val }));

    const isParamsEmpty = (p) => {
        if (!p) return true;
        return !Object.values(p).some(v => v !== undefined && v !== null && v !== '' && v !== 'all' && v !== false);
    };

    // Reset data on logout
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'provider') {
            setStats(null); setServices([]); setBookings([]); setReviews([]);
            setWallet(null); setSettings(null);
            setLoadedStates({});
            setLoadingStates({});
        }
    }, [currentUser]);

    const withMinDelay = async (promise, minDelay = 500) => {
        const start = Date.now();
        const result = await promise;
        const elapsed = Date.now() - start;
        if (elapsed < minDelay) await new Promise(r => setTimeout(r, minDelay - elapsed));
        return result;
    };

    const fetchStats = useCallback(async (force = false) => {
        if (loadingStatesRef.current.stats && !force) return;
        if (loadedStatesRef.current.stats && !force) return;
        setOneLoading('stats', true);
        try {
            const apiCall = providerApi.getStats();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setStats(res.data);
                setOneLoaded('stats', true);
            }
        } catch (err) { console.error('ProviderData: fetchStats error', err); }
        finally { setOneLoading('stats', false); }
    }, []);

    const fetchServices = useCallback(async (force = false, params = {}) => {
        const isDefault = isParamsEmpty(params);
        if (loadingStatesRef.current.services && !force) return;
        if (loadedStatesRef.current.services && !force && isDefault) return;
        setOneLoading('services', true);
        try {
            const apiCall = providerApi.getServices(params);
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setServices(res.data);
                setServicesMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
                setOneLoaded('services', true);
            }
        } catch (err) { console.error('ProviderData: fetchServices error', err); }
        finally { setOneLoading('services', false); }
    }, []);

    const fetchBookings = useCallback(async (force = false, status = 'all') => {
        const isDefault = status === 'all';
        if (loadingStatesRef.current.bookings && !force) return;
        if (loadedStatesRef.current.bookings && !force && isDefault) return;
        setOneLoading('bookings', true);
        try {
            const apiCall = providerApi.getBookings(status);
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setBookings(res.data);
                setOneLoaded('bookings', true);
            }
        } catch (err) { console.error('ProviderData: fetchBookings error', err); }
        finally { setOneLoading('bookings', false); }
    }, []);

    const fetchReviews = useCallback(async (force = false) => {
        if (loadingStatesRef.current.reviews && !force) return;
        if (loadedStatesRef.current.reviews && !force) return;
        setOneLoading('reviews', true);
        try {
            const apiCall = providerApi.getReviews();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setReviews(res.data);
                setOneLoaded('reviews', true);
            }
        } catch (err) { console.error('ProviderData: fetchReviews error', err); }
        finally { setOneLoading('reviews', false); }
    }, []);

    const fetchWallet = useCallback(async (force = false) => {
        if (loadingStatesRef.current.wallet && !force) return;
        if (loadedStatesRef.current.wallet && !force) return;
        setOneLoading('wallet', true);
        try {
            const apiCall = providerApi.getWallet();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setWallet(res.data);
                setOneLoaded('wallet', true);
            }
        } catch (err) { console.error('ProviderData: fetchWallet error', err); }
        finally { setOneLoading('wallet', false); }
    }, []);

    const fetchWalletReport = useCallback(async (force = false) => {
        if (loadingStatesRef.current.walletReport && !force) return;
        if (loadedStatesRef.current.walletReport && !force) return;
        setOneLoading('walletReport', true);
        try {
            const apiCall = providerApi.getWalletReport();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setWalletReport(res.data);
                setOneLoaded('walletReport', true);
            }
        } catch (err) { console.error('ProviderData: fetchWalletReport error', err); }
        finally { setOneLoading('walletReport', false); }
    }, []);

    const fetchSettings = useCallback(async (force = false) => {
        if (loadingStatesRef.current.settings && !force) return;
        if (loadedStatesRef.current.settings && !force) return;
        setOneLoading('settings', true);
        try {
            const apiCall = providerApi.getSettings();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setSettings(res.data);
                setOneLoaded('settings', true);
            }
        } catch (err) { console.error('ProviderData: fetchSettings error', err); }
        finally { setOneLoading('settings', false); }
    }, []);

    const fetchSystemData = useCallback(async (force = false) => {
        if (loadingStatesRef.current.system && !force) return;
        if (loadedStatesRef.current.system && !force && locations.length > 0) return;
        setOneLoading('system', true);
        try {
            const apiCall = Promise.all([
                providerApi.getPublicLocations(),
                providerApi.getPublicCategories()
            ]);
            const [locRes, catRes] = force ? await withMinDelay(apiCall) : await apiCall;
            
            if (locRes.data) setLocations(locRes.data);
            else if (locRes.success) setLocations(locRes.data || []);

            if (catRes.data) setCategories(catRes.data); 
            else if (catRes.success) setCategories(catRes.data || []);

            setOneLoaded('system', true);
        } catch (err) { 
            console.error('ProviderData: fetchSystemData error', err); 
        } finally { 
            setOneLoading('system', false); 
        }
    }, [locations.length]);

    const reloadAll = useCallback(async () => {
        await Promise.all([
            fetchStats(true),
            fetchServices(true),
            fetchBookings(true),
            fetchReviews(true),
            fetchWallet(true),
            fetchWalletReport(true),
            fetchSettings(true),
            fetchSystemData(true)
        ]);
    }, [fetchStats, fetchServices, fetchBookings, fetchReviews, fetchWallet, fetchWalletReport, fetchSettings, fetchSystemData]);

    // CRUD Helpers (for client-side sync)
    const addService = (svc) => setServices(prev => [svc, ...prev]);
    const updateService = (svc) => setServices(prev => prev.map(s => s.id === svc.id ? svc : s));
    const removeService = (id) => setServices(prev => prev.filter(s => s.id !== id));

    const updateBooking = (bk) => setBookings(prev => prev.map(b => b.id === bk.id ? bk : b));

    const value = {
        // Data
        stats, services, bookings, reviews, wallet, walletReport, settings, locations, categories,
        servicesMeta,
        
        // Loading States
        loadingStates, loadedStates,
        isLoadingStats: loadingStates.stats,
        isLoadingServices: loadingStates.services,
        isLoadingBookings: loadingStates.bookings,
        
        // Setters
        setStats, setServices, setBookings, setReviews, setWallet, setWalletReport, setSettings, setLocations, setCategories,

        // Fetch Functions
        fetchStats, fetchServices, fetchBookings, fetchReviews, fetchWallet, fetchWalletReport, fetchSettings, fetchSystemData,
        reloadAll,

        // CRUD Helpers
        addService, updateService, removeService,
        updateBooking
    };

    return (
        <ProviderDataContext.Provider value={value}>
            {children}
        </ProviderDataContext.Provider>
    );
};
