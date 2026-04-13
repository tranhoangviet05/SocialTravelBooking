import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import locationApi from '../api/locationApi';
import categoryApi from '../api/categoryApi';

const AdminDataContext = createContext(null);

export const useAdminData = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminData must be used within an AdminDataProvider');
    }
    return context;
};

export const AdminDataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLocationsLoaded, setIsLocationsLoaded] = useState(false);
    const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setLocations([]);
            setCategories([]);
            setIsLocationsLoaded(false);
            setIsCategoriesLoaded(false);
        }
    }, [currentUser]);

    const fetchLocations = useCallback(async (force = false) => {
        if (isLocationsLoaded && !force) return;
        setIsLoadingLocations(true);
        try {
            const response = await locationApi.getAll();
            if (response.success) {
                setLocations(response.data);
                setIsLocationsLoaded(true);
            }
        } catch (error) {
            console.error('AdminDataContext: Fetch locations error:', error);
        } finally {
            setIsLoadingLocations(false);
        }
    }, [isLocationsLoaded]);

    const fetchCategories = useCallback(async (force = false) => {
        if (isCategoriesLoaded && !force) return;
        setIsLoadingCategories(true);
        try {
            const response = await categoryApi.getAll();
            if (response.success) {
                setCategories(response.data);
                setIsCategoriesLoaded(true);
            }
        } catch (error) {
            console.error('AdminDataContext: Fetch categories error:', error);
        } finally {
            setIsLoadingCategories(false);
        }
    }, [isCategoriesLoaded]);

    // ==========================================
    // UPDATERS: Cập nhật state thay vì gọi lại API
    // ==========================================
    const addLocation = (newLocation) => {
        setLocations(prev => [newLocation, ...prev]);
    };
    const updateLocation = (updatedLocation) => {
        setLocations(prev => prev.map(l => l.id === updatedLocation.id ? updatedLocation : l));
    };
    const removeLocation = (id) => {
        setLocations(prev => prev.filter(l => l.id !== id));
    };

    const addCategory = (newCategory) => {
        setCategories(prev => [...prev, newCategory]);
    };
    const updateCategory = (updatedCategory) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };
    const removeCategory = (id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const value = {
        // Locations
        locations,
        isLoadingLocations,
        fetchLocations,
        addLocation,
        updateLocation,
        removeLocation,

        // Categories
        categories,
        isLoadingCategories,
        fetchCategories,
        addCategory,
        updateCategory,
        removeCategory,
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
};
