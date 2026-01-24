/**
 * Cache Manager - Frontend cache utilities
 * Currently disabled for real-time updates
 */

const CACHE_DURATION = 0; // Caching disabled for real-time updates

export const CacheManager = {
    /**
     * Set cache (currently disabled)
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} duration - Cache duration
     */
    set(key, data, duration = CACHE_DURATION) {
        // Caching disabled
        return;
    },
    
    /**
     * Get cache (currently disabled)
     * @param {string} key - Cache key
     * @returns {null} Always returns null (caching disabled)
     */
    get(key) {
        return null;
    },
    
    /**
     * Remove specific cache key
     * @param {string} key - Cache key to remove
     */
    remove(key) {
        try {
            localStorage.removeItem(`pathfinders_${key}`);
        } catch (e) {
            console.warn('Cache removal failed:', e);
        }
    },
    
    /**
     * Clear all pathfinders cache
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('pathfinders_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    }
};
