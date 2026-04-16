import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';

const RealtimeContext = createContext(null);

export const useRealtime = () => useContext(RealtimeContext);

export const SocketProvider = ({ children }) => {
    const [listeners, setListeners] = useState({});

    // Hàm để đăng ký lắng nghe một channel
    const listen = (channel, callback) => {
        if (!channel) return;

        const docRef = doc(db, 'realtime_sync', channel);
        
        // Trả về hàm unsubscribe
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                callback(data);
            }
        });
    };

    return (
        <RealtimeContext.Provider value={{ listen }}>
            {children}
        </RealtimeContext.Provider>
    );
};
