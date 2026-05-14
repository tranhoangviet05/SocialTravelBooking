import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import locationApi from '../api/locationApi';
import categoryApi from '../api/categoryApi';
import adminApi from '../api/adminApi';

const AdminDataContext = createContext(null);

export const useAdminData = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminData must be used within an AdminDataProvider');
    }
    return context;
};

export const AdminDataProvider = ({ children }) => {
    const auth = useAuth();
    const currentUser = auth ? auth.currentUser : null;

    // Data states
    const [stats, setStats] = useState(null);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [reports, setReports] = useState([]);
    const [settings, setSettings] = useState(null);
    const [automation, setAutomation] = useState([]);
    const [meta, setMeta] = useState({
        users: { current_page: 1, last_page: 1, total: 0 },
        providers: { current_page: 1, last_page: 1, total: 0 },
        services: { current_page: 1, last_page: 1, total: 0 },
        bookings: { current_page: 1, last_page: 1, total: 0 },
        reviews: { current_page: 1, last_page: 1, total: 0 },
        locations: { current_page: 1, last_page: 1, total: 0 },
        categories: { current_page: 1, last_page: 1, total: 0 },
    });

    // Loading states
    const [loadingStates, setLoadingStates] = useState({});
    const [loadedStates, setLoadedStates] = useState({});

    // Refs for stable callbacks
    const loadedStatesRef = useRef({});
    const loadingStatesRef = useRef({});
    const metaRef = useRef(meta);

    useEffect(() => { loadedStatesRef.current = loadedStates; }, [loadedStates]);
    useEffect(() => { loadingStatesRef.current = loadingStates; }, [loadingStates]);
    useEffect(() => { metaRef.current = meta; }, [meta]);

    // Reset on logout
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            setStats(null); setLocations([]); setCategories([]); setUsers([]); setProviders([]);
            setServices([]); setBookings([]); setReviews([]); setCoupons([]); setReports([]);
            setSettings(null); setAutomation([]);
            setLoadedStates({});
            setLoadingStates({});
        }
    }, [currentUser]);

    const setOneLoading = (key, val) => setLoadingStates(prev => ({ ...prev, [key]: val }));
    const setOneLoaded = (key, val) => setLoadedStates(prev => ({ ...prev, [key]: val }));

    const isParamsEmpty = (p) => {
        if (!p) return true;
        return !Object.values(p).some(v => v !== undefined && v !== null && v !== '' && v !== false);
    };

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
            const apiCall = adminApi.getDashboardStats();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) { setStats(res.data); setOneLoaded('stats', true); }
        } catch (e) { console.error('AdminData: stats', e); }
        finally { setOneLoading('stats', false); }
    }, []);

    const fetchLocations = useCallback(async (force = false, page = 1, params = {}) => {
        const isDefault = page === metaRef.current.locations.current_page && isParamsEmpty(params);
        if (loadingStatesRef.current.locations && !force) return;
        if (loadedStatesRef.current.locations && !force && isDefault) return;
        setOneLoading('locations', true);
        try {
            const apiCall = adminApi.getAllLocations({ page, per_page: 8, ...params });
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setLocations(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, locations: res.meta }));
                setOneLoaded('locations', true);
            }
        } catch (e) { console.error('AdminData: locations', e); }
        finally { setOneLoading('locations', false); }
    }, []);

    const fetchCategories = useCallback(async (force = false, page = 1, params = {}) => {
        const isDefault = page === metaRef.current.categories.current_page && isParamsEmpty(params);
        if (loadingStatesRef.current.categories && !force) return;
        if (loadedStatesRef.current.categories && !force && isDefault) return;
        setOneLoading('categories', true);
        try {
            const apiCall = adminApi.getAllCategories({ page, per_page: 8, ...params });
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setCategories(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, categories: res.meta }));
                setOneLoaded('categories', true);
            }
        } catch (e) { console.error('AdminData: categories', e); }
        finally { setOneLoading('categories', false); }
    }, []);

    const fetchUsers = useCallback(async (force = false, page = 1, params = {}) => {
        const isDefault = page === metaRef.current.users.current_page && isParamsEmpty(params);
        if (loadingStatesRef.current.users && !force) return;
        if (loadedStatesRef.current.users && !force && isDefault) return;
        setOneLoading('users', true);
        try {
            const apiCall = adminApi.getAllUsers({ page, per_page: 15, ...params });
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setUsers(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, users: res.meta }));
                setOneLoaded('users', true);
            }
        } catch (e) { console.error('AdminData: users', e); }
        finally { setOneLoading('users', false); }
    }, []);

    const fetchProviders = useCallback(async (force = false, page = 1, params = {}) => {
        const isDefault = page === metaRef.current.providers.current_page && isParamsEmpty(params);
        if (loadingStatesRef.current.providers && !force) return;
        if (loadedStatesRef.current.providers && !force && isDefault) return;
        setOneLoading('providers', true);
        try {
            const apiCall = adminApi.getAllProviders({ page, per_page: 15, ...params });
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setProviders(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, providers: res.meta }));
                setOneLoaded('providers', true);
            }
        } catch (e) { console.error('AdminData: providers', e); }
        finally { setOneLoading('providers', false); }
    }, []);

    const fetchServices = useCallback(async (force = false, params = {}) => {
        const page = params.page || 1;
        const filteredParams = { ...params };
        delete filteredParams.page;
        delete filteredParams.per_page;
        
        const isDefault = page === metaRef.current.services.current_page && isParamsEmpty(filteredParams);
        if (loadingStatesRef.current.services && !force) return;
        if (loadedStatesRef.current.services && !force && isDefault) return;
        setOneLoading('services', true);
        try {
            const queryParams = { page, per_page: params.per_page || 15, ...params };
            const apiCall = adminApi.getAllServices(queryParams);
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) { 
                setServices(res.data); 
                if (res.meta) setMeta(prev => ({ ...prev, services: res.meta }));
                setOneLoaded('services', true); 
            }
        } catch (e) { console.error('AdminData: services', e); }
        finally { setOneLoading('services', false); }
    }, []);

    const fetchBookings = useCallback(async (force = false, page = 1, params = {}) => {
        const isDefault = page === metaRef.current.bookings.current_page && isParamsEmpty(params);
        if (loadingStatesRef.current.bookings && !force) return;
        if (loadedStatesRef.current.bookings && !force && isDefault) return;
        setOneLoading('bookings', true);
        try {
            const apiCall = adminApi.getAllBookings({ page, per_page: 15, ...params });
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setBookings(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, bookings: res.meta }));
                setOneLoaded('bookings', true);
            }
        } catch (e) { console.error('AdminData: bookings', e); }
        finally { setOneLoading('bookings', false); }
    }, []);

    const fetchReviews = useCallback(async (force = false, page = 1, params = {}) => {
        const isDefault = page === metaRef.current.reviews.current_page && isParamsEmpty(params);
        if (loadingStatesRef.current.reviews && !force) return;
        if (loadedStatesRef.current.reviews && !force && isDefault) return;
        setOneLoading('reviews', true);
        try {
            const apiCall = adminApi.getAllReviews({ page, per_page: 15, ...params });
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) {
                setReviews(res.data);
                if (res.meta) setMeta(prev => ({ ...prev, reviews: res.meta }));
                setOneLoaded('reviews', true);
            }
        } catch (e) { console.error('AdminData: reviews', e); }
        finally { setOneLoading('reviews', false); }
    }, []);

    const fetchCoupons = useCallback(async (force = false) => {
        if (loadingStatesRef.current.coupons && !force) return;
        if (loadedStatesRef.current.coupons && !force) return;
        setOneLoading('coupons', true);
        try {
            const apiCall = adminApi.getAllCoupons();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) { setCoupons(res.data); setOneLoaded('coupons', true); }
        } catch (e) { console.error('AdminData: coupons', e); }
        finally { setOneLoading('coupons', false); }
    }, []);

    const fetchReports = useCallback(async (force = false) => {
        if (loadingStatesRef.current.reports && !force) return;
        if (loadedStatesRef.current.reports && !force) return;
        setOneLoading('reports', true);
        try {
            const apiCall = adminApi.getAllReports();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) { setReports(res.data); setOneLoaded('reports', true); }
        } catch (e) { console.error('AdminData: reports', e); }
        finally { setOneLoading('reports', false); }
    }, []);

    const fetchSettings = useCallback(async (force = false) => {
        if (loadingStatesRef.current.settings && !force) return;
        if (loadedStatesRef.current.settings && !force) return;
        setOneLoading('settings', true);
        try {
            const apiCall = adminApi.getSettings();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) { setSettings(res.data); setOneLoaded('settings', true); }
        } catch (e) { console.error('AdminData: settings', e); }
        finally { setOneLoading('settings', false); }
    }, []);

    const fetchAutomation = useCallback(async (force = false) => {
        if (loadingStatesRef.current.automation && !force) return;
        if (loadedStatesRef.current.automation && !force) return;
        setOneLoading('automation', true);
        try {
            const apiCall = adminApi.getAutomationWorkflows();
            const res = force ? await withMinDelay(apiCall) : await apiCall;
            if (res.success) { setAutomation(res.data); setOneLoaded('automation', true); }
        } catch (e) { console.error('AdminData: automation', e); }
        finally { setOneLoading('automation', false); }
    }, []);

    const reloadAll = useCallback(async () => {
        // Only reload what is already loaded
        const reloads = [];
        if (loadedStates.stats) reloads.push(fetchStats(true));
        if (loadedStates.locations) reloads.push(fetchLocations(true));
        if (loadedStates.categories) reloads.push(fetchCategories(true));
        if (loadedStates.users) reloads.push(fetchUsers(true));
        if (loadedStates.providers) reloads.push(fetchProviders(true));
        if (loadedStates.services) reloads.push(fetchServices(true));
        if (loadedStates.bookings) reloads.push(fetchBookings(true));
        if (loadedStates.reviews) reloads.push(fetchReviews(true));
        if (loadedStates.coupons) reloads.push(fetchCoupons(true));
        if (loadedStates.reports) reloads.push(fetchReports(true));
        if (loadedStates.settings) reloads.push(fetchSettings(true));
        if (loadedStates.automation) reloads.push(fetchAutomation(true));
        await Promise.all(reloads);
    }, [loadedStates, fetchStats, fetchLocations, fetchCategories, fetchUsers, fetchProviders, fetchServices, fetchBookings, fetchReviews, fetchCoupons, fetchReports, fetchSettings, fetchAutomation]);

    // Helpers for CRUD updates (client-side state sync)
    const addLocation = (loc) => setLocations(prev => [loc, ...prev]);
    const updateLocation = (loc) => setLocations(prev => prev.map(l => l.id === loc.id ? loc : l));
    const removeLocation = (id) => setLocations(prev => prev.filter(l => l.id !== id));

    const addCategory = (cat) => setCategories(prev => [cat, ...prev]);
    const updateCategory = (cat) => setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    const removeCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

    const addService = (svc) => setServices(prev => [svc, ...prev]);
    const updateService = (svc) => setServices(prev => prev.map(s => s.id === svc.id ? svc : s));
    const removeService = (id) => setServices(prev => prev.filter(s => s.id !== id));

    const addUser = (usr) => setUsers(prev => [usr, ...prev]);
    const updateUser = (usr) => setUsers(prev => prev.map(u => u.id === usr.id ? usr : u));
    const removeUser = (id) => setUsers(prev => prev.filter(u => u.id !== id));

    const addCoupon = (cpn) => setCoupons(prev => [cpn, ...prev]);
    const updateCoupon = (cpn) => setCoupons(prev => prev.map(c => c.id === cpn.id ? cpn : c));
    const removeCoupon = (id) => setCoupons(prev => prev.filter(c => c.id !== id));

    const updateBooking = (bk) => setBookings(prev => prev.map(b => b.id === bk.id ? bk : b));
    const removeBooking = (id) => setBookings(prev => prev.filter(b => b.id !== id));
    const updateReview = (rv) => setReviews(prev => prev.map(r => r.id === rv.id ? rv : r));
    const removeReview = (id) => setReviews(prev => prev.filter(r => r.id !== id));
    const updateReport = (rep) => setReports(prev => prev.map(r => r.id === rep.id ? rep : r));
    const removeReport = (id) => setReports(prev => prev.filter(r => r.id !== id));

    const value = {
        // Data
        stats, locations, categories, users, providers, services, bookings, 
        reviews, coupons, reports, settings, automation, meta,
        
        // Loading States
        loadingStates, loadedStates,
        isLoadingUsers: loadingStates.users,
        isLoadingProviders: loadingStates.providers,
        isLoadingServices: loadingStates.services,
        isLoadingBookings: loadingStates.bookings,
        isLoadingReviews: loadingStates.reviews,
        isLoadingLocations: loadingStates.locations,
        isLoadingCategories: loadingStates.categories,

        // Setters (for optimistic updates)
        setStats, setLocations, setCategories, setUsers, setProviders, setServices, 
        setBookings, setReviews, setCoupons, setReports, setSettings, setAutomation, setMeta,

        // Fetch Functions
        fetchStats, fetchLocations, fetchCategories, fetchUsers, fetchProviders, 
        fetchServices, fetchBookings, fetchReviews, fetchCoupons, fetchReports, 
        fetchSettings, fetchAutomation, reloadAll,

        // CRUD Helpers
        addLocation, updateLocation, removeLocation,
        addCategory, updateCategory, removeCategory,
        addCoupon, updateCoupon, removeCoupon,
        addService, updateService, removeService,
        addUser, updateUser, removeUser,
        updateBooking, removeBooking, updateReview, removeReview,
        updateReport, removeReport
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
};
