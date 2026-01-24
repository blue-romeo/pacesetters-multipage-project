/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) || window.location.protocol === 'file:';

const API_CONFIG = {
    
    baseURL: isLocalhost
        ? 'http://localhost:5000/api' 
        : '/api',
    
    
    port: 5000,
    
    // API Endpoints
    endpoints: {
        // Authentication
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            init: '/auth/init',
            me: '/auth/me',
            profile: '/auth/profile',
            admins: '/auth/admins',
            adminById: (id) => `/auth/admins/${id}`
        },
        
        // Contacts
        contacts: {
            base: '/contacts',
            byId: (id) => `/contacts/${id}`,
            updateStatus: (id) => `/contacts/${id}/status`
        },
        
        // Newsletter
        newsletter: {
            base: '/newsletter',
            subscribe: '/newsletter/subscribe',
            byId: (id) => `/newsletter/${id}`
        },
        
        // Donations
        donations: {
            base: '/donations',
            byId: (id) => `/donations/${id}`,
            stats: '/donations/stats',
            updateStatus: (id) => `/donations/${id}/status`
        },
        
        // Events
        events: {
            base: '/events',
            byId: (id) => `/events/${id}`,
            upcoming: '/events?upcoming=true',
            adminAll: '/events/admin/all',
            adminById: (id) => `/events/admin/${id}`
        },
        
        // Gallery
        gallery: {
            base: '/gallery',
            byId: (id) => `/gallery/${id}`,
            adminAll: '/gallery/admin/all',
            adminById: (id) => `/gallery/admin/${id}`
        },
        
        // Leaders
        leaders: {
            base: '/leaders',
            id: (id) => `/leaders/${id}`,
            adminAll: '/leaders/admin/all',
            adminById: (id) => `/leaders/admin/${id}`
        }
    },
    

    getFullURL(path) {
        return `${this.baseURL}${path}`;
    },
    
    
    isDevelopment() {
        return window.location.hostname === 'localhost';
    },
    
    
    isProduction() {
        return !this.isDevelopment();
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
