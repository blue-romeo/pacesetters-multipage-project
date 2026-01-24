/**
 * API Client Module
 * Handles all API requests with authentication and error handling
 */

export class ApiClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.token = options.token || null;
        this.onUnauthorized = options.onUnauthorized || null;
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Make an authenticated API request
     */
    async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
        };

        // Add auth token if available
        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        let requestUrl = `${this.baseURL}${endpoint}`;
        const method = (config.method || 'GET').toUpperCase();
        
        // Add cache busting for GET requests
        if (method === 'GET' && !config.cacheBustDisabled) {
            const separator = requestUrl.includes('?') ? '&' : '?';
            requestUrl = `${requestUrl}${separator}ts=${Date.now()}`;
        }
        
        try {
            const response = await fetch(requestUrl, config);
            const data = await response.json();
            
            // Handle unauthorized
            if (response.status === 401) {
                if (this.onUnauthorized) {
                    this.onUnauthorized();
                }
                return null;
            }
            
            return { response, data };
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }
}

/**
 * Public API Client (no authentication)
 */
export class PublicApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Fetch with cache busting
     */
    async fetch(endpoint, options = {}) {
        let url = `${this.baseURL}${endpoint}`;
        
        // Add cache busting
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}_t=${Date.now()}`;
        
        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    ...options.headers
                },
                ...options
            });
            
            return await response.json();
        } catch (error) {
            console.error(`API fetch error for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.fetch(endpoint);
    }

    /**
     * POST request
     */
    async post(endpoint, body) {
        return this.fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
}
