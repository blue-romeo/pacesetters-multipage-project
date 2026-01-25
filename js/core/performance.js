/**
 * Performance Monitoring Utilities
 * Track and optimize frontend performance
 */

/**
 * Measure function execution time
 */
export function measurePerformance(name, func) {
    return async function(...args) {
        const start = performance.now();
        try {
            const result = await func.apply(this, args);
            const end = performance.now();
            console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const end = performance.now();
            console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms`, error);
            throw error;
        }
    };
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics() {
    if (!window.performance) return;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    console.group('📊 Performance Metrics');
    console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
    console.log(`Page Load Time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
    console.log(`DNS Lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms`);
    console.log(`TCP Connection: ${navigation.connectEnd - navigation.connectStart}ms`);
    console.log(`Request Time: ${navigation.responseEnd - navigation.requestStart}ms`);
    console.groupEnd();
}

/**
 * Monitor API call performance
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    
    start(id) {
        this.metrics.set(id, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }
    
    end(id) {
        const metric = this.metrics.get(id);
        if (!metric) return;
        
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        
        if (metric.duration > 1000) {
            console.warn(`⚠️ Slow operation: ${id} took ${metric.duration.toFixed(2)}ms`);
        }
        
        return metric.duration;
    }
    
    getMetrics() {
        const results = {};
        this.metrics.forEach((value, key) => {
            results[key] = value.duration;
        });
        return results;
    }
    
    clear() {
        this.metrics.clear();
    }
}

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Preload critical resources
 */
export function preloadResources(resources) {
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.url;
        link.as = resource.type; // 'image', 'script', 'style', etc.
        if (resource.type === 'font') {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    });
}

/**
 * Virtual scroll implementation for large lists
 */
export class VirtualScroller {
    constructor(container, itemHeight, items, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.items = items;
        this.renderItem = renderItem;
        this.visibleStart = 0;
        this.visibleEnd = 20;
        
        this.init();
    }
    
    init() {
        this.container.style.height = `${this.items.length * this.itemHeight}px`;
        this.container.style.position = 'relative';
        
        this.render();
        
        this.container.parentElement.addEventListener('scroll', () => {
            this.onScroll();
        });
    }
    
    onScroll() {
        const scrollTop = this.container.parentElement.scrollTop;
        this.visibleStart = Math.floor(scrollTop / this.itemHeight);
        this.visibleEnd = this.visibleStart + 20;
        this.render();
    }
    
    render() {
        const fragment = document.createDocumentFragment();
        
        for (let i = this.visibleStart; i < Math.min(this.visibleEnd, this.items.length); i++) {
            const item = this.items[i];
            const element = this.renderItem(item, i);
            element.style.position = 'absolute';
            element.style.top = `${i * this.itemHeight}px`;
            fragment.appendChild(element);
        }
        
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }
}

// Export performance monitor instance
export const perfMonitor = new PerformanceMonitor();
