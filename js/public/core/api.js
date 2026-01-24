/**
 * Public API Client - For unauthenticated public requests
 * Simplified version for frontend use
 */

export class PublicApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * Make API request with cache busting
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        try {
            // Add cache busting parameter
            const separator = endpoint.includes('?') ? '&' : '?';
            const url = `${this.baseURL}${endpoint}${separator}_t=${Date.now()}`;

            const response = await fetch(url, {
                ...options,
                cache: 'no-store',
                headers: {
                    ...options.headers,
                    'Cache-Control': 'no-cache'
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Request failed');
            }

            return result;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }
}
