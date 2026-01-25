/**
 * Admin Dashboard - Main Entry Point
 * Modular architecture for maintainability and scalability
 */

import { ApiClient } from '../core/api.js';
import { showToast, showModalNotification, closeNotificationModal } from '../core/notifications.js';
import { clearFrontendCache } from '../core/cache.js';
import { perfMonitor, logPerformanceMetrics } from '../core/performance.js';
import { GalleryManager } from './modules/gallery.js';
import { EventsManager } from './modules/events.js';
import { VolunteersManager } from './modules/volunteers.js';
import { ContactsManager } from './modules/contacts.js';
import { DonationsManager } from './modules/donations.js';
import { LeadersManager } from './modules/leaders.js';
import { NewsletterManager } from './modules/newsletter.js';

// ========== INITIALIZATION ========== 
// API Configuration (loaded from api-config.js globally)
const API_URL = API_CONFIG.baseURL;

// Check authentication
const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = 'admin-login.html';
}

const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');

// Initialize API client
const apiClient = new ApiClient(API_URL, {
    token: token,
    onUnauthorized: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = 'admin-login.html';
    }
});

// Initialize modules
const galleryManager = new GalleryManager(apiClient, API_CONFIG);
const eventsManager = new EventsManager(apiClient, API_CONFIG);
const volunteersManager = new VolunteersManager(apiClient);
const contactsManager = new ContactsManager(apiClient);
const donationsManager = new DonationsManager(apiClient);
const leadersManager = new LeadersManager(apiClient, API_CONFIG);
const newsletterManager = new NewsletterManager(apiClient);

// Expose globally for onclick handlers (temporary until full refactor)
window.galleryManager = galleryManager;
window.eventsManager = eventsManager;
window.volunteersManager = volunteersManager;
window.contactsManager = contactsManager;
window.donationsManager = donationsManager;
window.leadersManager = leadersManager;
window.newsletterManager = newsletterManager;
window.closeModal = closeNotificationModal;
window.closeNotificationModal = closeNotificationModal;

// ========== LEGACY API REQUEST WRAPPER ========== 
// Keep for backward compatibility with existing admin.js code
async function apiRequest(endpoint, options = {}) {
    try {
        const result = await apiClient.request(endpoint, options);
        return result;
    } catch (error) {
        showToast('Network error. Please try again.', 'error');
        return null;
    }
}

// ========== DASHBOARD FUNCTIONS (from original admin.js) ========== 
async function loadDashboardStats() {
    perfMonitor.start('dashboard-stats');
    
    const statsResult = await apiClient.get(API_CONFIG.endpoints.stats);
    
    if (!statsResult || !statsResult.data || !statsResult.data.success) {
        console.error('Failed to load dashboard stats');
        perfMonitor.end('dashboard-stats');
        return;
    }
    
    const stats = statsResult.data.data;
    
    // Update stat cards
    document.getElementById('stat-contacts').textContent = stats.contacts || 0;
    document.getElementById('stat-donations').textContent = `$${(stats.donations || 0).toLocaleString()}`;
    document.getElementById('stat-events').textContent = stats.events || 0;
    document.getElementById('stat-gallery').textContent = stats.gallery || 0;
    document.getElementById('stat-newsletters').textContent = stats.newsletters || 0;
    
    const duration = perfMonitor.end('dashboard-stats');
    console.log(`✅ Dashboard stats loaded in ${duration?.toFixed(2)}ms`);
}

async function loadRecentData() {
    // Load contacts and donations in parallel for faster performance
    const [contactsResult, donationsResult] = await Promise.all([
        apiClient.get(`${API_CONFIG.endpoints.contacts}?limit=5&sort=-submittedAt`),
        apiClient.get(`${API_CONFIG.endpoints.donations}?limit=5&sort=-date`)
    ]);
    
    if (contactsResult && contactsResult.data && contactsResult.data.success) {
        renderRecentContacts(contactsResult.data.data);
    }
    
    if (donationsResult && donationsResult.data && donationsResult.data.success) {
        renderRecentDonations(donationsResult.data.data);
    }
}

function renderRecentContacts(contacts) {
    const container = document.getElementById('recent-contacts');
    if (contacts.length === 0) {
        container.innerHTML = '<div class="text-center">No recent contacts</div>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <div class="recent-item">
            <div class="recent-item-header">
                <strong>${contact.name}</strong>
                <span class="badge badge-${contact.status}">${contact.status}</span>
            </div>
            <div class="recent-item-body">${contact.subject}</div>
            <div class="recent-item-footer">${new Date(contact.submittedAt).toLocaleDateString()}</div>
        </div>
    `).join('');
}

function renderRecentDonations(donations) {
    const container = document.getElementById('recent-donations');
    if (donations.length === 0) {
        container.innerHTML = '<div class="text-center">No recent donations</div>';
        return;
    }
    
    container.innerHTML = donations.map(donation => `
        <div class="recent-item">
            <div class="recent-item-header">
                <strong>${donation.name}</strong>
                <span class="badge badge-${donation.status}">${donation.status}</span>
            </div>
            <div class="recent-item-body">$${donation.amount.toFixed(2)}</div>
            <div class="recent-item-footer">${new Date(donation.date).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// ========== SECTION LOADING ========== 
const loadedSections = new Set();

async function loadSectionData(section, forceReload = false) {
    // Skip if already loaded (lazy loading optimization)
    if (loadedSections.has(section) && !forceReload) {
        return;
    }
    
    loadedSections.add(section);
    
    switch (section) {
        case 'dashboard':
            await Promise.all([
                loadDashboardStats(),
                loadRecentData()
            ]);
            break;
        case 'gallery':
            galleryManager.load();
            break;
        case 'events':
            eventsManager.load();
            break;
        case 'volunteers':
            volunteersManager.load();
            break;
        case 'contacts':
            contactsManager.load();
            break;
        case 'newsletter':
            newsletterManager.load();
            break;
        case 'donations':
            donationsManager.load();
            break;
        case 'leaders':
            leadersManager.load();
            break;
        case 'admins':
            loadAdmins();
            break;
    }
}

// ========== PLACEHOLDER FUNCTIONS (To be extracted in future refactoring) ========== 
// These functions are still in the original admin.js and will be modularized later
function loadAdmins() { console.log('Loading admins...'); }

// ========== DOCUMENT READY ========== 
document.addEventListener('DOMContentLoaded', async () => {
    // Set admin info
    document.getElementById('admin-name').textContent = adminInfo.fullName || 'Admin';
    document.getElementById('admin-role').textContent = adminInfo.role === 'super-admin' ? 'Super Admin' : 'Administrator';
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show section
            sections.forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(`section-${sectionId}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update page title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
            }
            
            // Load section data
            loadSectionData(sectionId);
        });
    });
    
    // Profile Edit - Click on admin profile to edit
    document.getElementById('admin-profile')?.addEventListener('click', () => {
        // editCurrentUserProfile(); // To be implemented in user module
        showToast('Profile editing coming soon', 'info');
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            window.location.href = 'admin-login.html';
        }
    });
    
    // Refresh button
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');
        if (activeSection) {
            loadedSections.delete(activeSection);
            loadSectionData(activeSection, true);
            showToast('Data refreshed successfully', 'success');
        }
    });
    
    // Gallery filter - with debounce for better performance
    const galleryFilter = document.getElementById('filter-gallery-category');
    if (galleryFilter) {
        galleryFilter.addEventListener('change', (e) => {
            // Use debounced load instead of immediate load
            galleryManager.debouncedLoad(1, e.target.value);
        });
    }
    
    // Delete selected gallery button
    const deleteSelectedBtn = document.getElementById('delete-selected-gallery-btn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            galleryManager.deleteSelected();
        });
    }
    
    // Create Event button
    const createEventBtn = document.getElementById('create-event-btn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            eventsManager.openCreateModal();
        });
    }
    
    // Create Leader button
    const createLeaderBtn = document.getElementById('create-leader-btn');
    if (createLeaderBtn) {
        createLeaderBtn.addEventListener('click', () => {
            leadersManager.openCreateModal();
        });
    }
    
    // Create Admin button
    const createAdminBtn = document.getElementById('create-admin-btn');
    if (createAdminBtn) {
        createAdminBtn.addEventListener('click', () => {
            showToast('Admin creation requires super admin privileges. Contact system administrator.', 'info');
            // TODO: Implement admin creation modal with role checks
        });
    }
    
    // Upload Gallery button
    const uploadGalleryBtn = document.getElementById('upload-gallery-btn');
    if (uploadGalleryBtn) {
        uploadGalleryBtn.addEventListener('click', () => {
            galleryManager.openUploadModal();
        });
    }
    
    // Load initial data in parallel
    perfMonitor.start('initial-load');
    await Promise.all([
        loadDashboardStats(),
        loadRecentData()
    ]);
    const loadTime = perfMonitor.end('initial-load');
    console.log(`🚀 Admin dashboard loaded in ${loadTime?.toFixed(2)}ms`);
    
    // Log overall performance metrics
    if (process.env.NODE_ENV === 'development') {
        setTimeout(() => logPerformanceMetrics(), 1000);
    }
});

// ========== EXPORTS FOR FUTURE USE ========== 
export { 
    apiClient, 
    galleryManager, 
    eventsManager, 
    volunteersManager,
    contactsManager,
    donationsManager,
    leadersManager,
    newsletterManager,
    showToast, 
    showModalNotification 
};