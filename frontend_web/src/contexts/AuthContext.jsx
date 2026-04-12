import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logOut } from '../firebase/services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lắng nghe thay đổi trạng thái đăng nhập Firebase
        const unsubscribe = onAuthChange((user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await logOut();
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        currentUser,
        loading,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
