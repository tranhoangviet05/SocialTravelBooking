import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const isProd = window.location.protocol === 'https:';

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'stb_app_key',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT || (isProd ? 443 : 8080),
    wssPort: import.meta.env.VITE_REVERB_PORT || (isProd ? 443 : 8080),
    forceTLS: isProd,
    enabledTransports: ['ws', 'wss'],
});

export default echo;
