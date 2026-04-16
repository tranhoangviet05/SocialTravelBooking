import React, { createContext, useContext, useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import io from 'socket.io-client';

window.io = io;

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [echo, setEcho] = useState(null);

    useEffect(() => {
        const echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY || 'itbeph5n2lkt9zsc6wje',
            wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
            wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
            wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        setEcho(echoInstance);

        return () => {
            if (echoInstance) {
                echoInstance.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={echo}>
            {children}
        </SocketContext.Provider>
    );
};
