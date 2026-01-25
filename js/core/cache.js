/**
 * Cache Management Module
 * Handles localStorage caching for frontend data
 */

const CACHE_PREFIX = 'pathfinders_';
const CACHE_DURATION = 0; // Disabled for real-time updates

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - limits execution to once per time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Cache Manager
 */
export const CacheManager = {
    /**
     * Set cache value (currently disabled)
     */
    set(key, data, duration = CACHE_DURATION) {
        // Caching disabled for real-time updates
        return;
    },
    
    /**
     * Get cache value (currently disabled)
     */
    get(key) {
        // Caching disabled - always return null to force fresh fetch
        return null;
    },
    
    /**
     * Remove specific cache key
     */
    remove(key) {
        try {
            localStorage.removeItem(`${CACHE_PREFIX}${key}`);
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
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('✅ All cache cleared');
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    },

    /**
     * Clear specific cache keys
     */
    clearKeys(cacheKeys = []) {
        try {
            if (cacheKeys.length === 0) {
                this.clear();
            } else {
                cacheKeys.forEach(key => {
                    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
                });
                console.log(`✅ Cleared cache for: ${cacheKeys.join(', ')}`);
            }
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }
};

/**
 * Clear frontend cache (admin utility)
 * Alias for CacheManager.clearKeys for backward compatibility
 */
export function clearFrontendCache(cacheKeys = []) {
    CacheManager.clearKeys(cacheKeys);
}
