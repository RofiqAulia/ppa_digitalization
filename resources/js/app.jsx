import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route } from 'ziggy-js';
import { Ziggy } from './ziggy.js';

const appName = import.meta.env.VITE_APP_NAME || 'PPA Group';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        const customZiggy = {
            ...Ziggy,
            url: window.location.origin,
            port: window.location.port ? window.location.port : null
        };
        
        window.route = (name, params, absolute, config = customZiggy) => route(name, params, absolute, config);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
