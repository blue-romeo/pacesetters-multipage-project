/**
 * Navigation Component - Mobile navigation and header/footer loading
 */

import { loadComponent, setActiveNavLink } from '../core/components.js';

export class Navigation {
    constructor() {
        this.hamburger = null;
        this.navLinks = null;
    }

    /**
     * Load header and footer components
     */
    async loadComponents() {
        if (!document.querySelector('#header-placeholder') || !document.querySelector('#footer-placeholder')) {
            return;
        }

        const headerLoaded = await loadComponent('components/header.html', '#header-placeholder');
        const footerLoaded = await loadComponent('components/footer.html', '#footer-placeholder');
        
        if (headerLoaded && footerLoaded) {
            setActiveNavLink();
            this.initializeMobileNav();
        }
    }

    /**
     * Initialize mobile navigation
     */
    initializeMobileNav() {
        this.hamburger = document.getElementById('hamburger');
        this.navLinks = document.getElementById('navLinks');

        if (!this.hamburger || !this.navLinks) return;

        // Toggle mobile menu
        this.hamburger.addEventListener('click', () => {
            this.navLinks.classList.toggle('active');
            this.hamburger.classList.toggle('active');
            const isExpanded = this.navLinks.classList.contains('active');
            this.hamburger.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when a link is clicked
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.hamburger.contains(e.target) && !this.navLinks.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (this.navLinks && this.hamburger) {
            this.navLinks.classList.remove('active');
            this.hamburger.classList.remove('active');
            this.hamburger.setAttribute('aria-expanded', 'false');
        }
    }
}
