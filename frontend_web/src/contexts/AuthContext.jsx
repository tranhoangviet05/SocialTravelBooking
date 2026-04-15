import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logOut, getCurrentUser } from '../firebase/services/authService';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socialActive, setSocialActive] = useState(null);

    useEffect(() => {
        // Lắng nghe thay đổi trạng thái đăng nhập Firebase
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                setLoading(true);
                setCurrentUser(user);
                try {
                    // Lấy profile từ Backend để có role và thông tin chính xác
                    const idToken = await user.getIdToken();
                    const response = await authApi.getProfile(idToken);
                    const backendUser = response?.data;

                    if (backendUser) {
                        // Gộp dữ liệu từ Backend vào currentUser
                        setCurrentUser({
                            ...user,
                            ...backendUser,
                            uid: user.uid,
                            email: user.email,
                            photoURL: user.photoURL || backendUser.avatar_url,
                            displayName: user.displayName || backendUser.display_name,
                        });
                        setUserRole(backendUser.role || 'tourist');
                        setSocialActive(backendUser.social_active || false);
                    } else {
                        setUserRole('tourist');
                        setSocialActive(false);
                    }
                } catch (error) {
                    console.error('Failed to fetch user role:', error);
                    setUserRole('tourist'); // Fallback
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const refreshSocialStatus = async () => {
        try {
            const firebaseUser = getCurrentUser();
            if (!firebaseUser) return;
            const idToken = await firebaseUser.getIdToken();
            const response = await authApi.checkSocialStatus(idToken);
            setSocialActive(response.data.social_active);
        } catch (error) {
            console.error('Failed to refresh social status:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
            setCurrentUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        currentUser,
        userRole,
        loading,
        logout: handleLogout,
        refreshSocialStatus,
        socialActive,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
