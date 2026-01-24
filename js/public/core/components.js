/**
 * Component Loader - Load HTML components dynamically
 */

/**
 * Load an HTML component and insert it into the page
 * @param {string} componentPath - Path to the component HTML file
 * @param {string} targetSelector - CSS selector for the target element
 * @returns {Promise<boolean>} Success status
 */
export async function loadComponent(componentPath, targetSelector) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}`);
        }
        
        const html = await response.text();
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
            targetElement.outerHTML = html;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return false;
    }
}

/**
 * Set active navigation link based on current page
 */
export function setActiveNavLink() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = currentPage.replace('.html', '');
    
    // Set active class on current page link
    const navLinks = document.querySelectorAll('.nav-links a[data-page]');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === pageName || (pageName === '' && linkPage === 'index')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
