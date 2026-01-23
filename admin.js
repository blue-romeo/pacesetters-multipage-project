// Admin Dashboard Script
// API_CONFIG is loaded from api-config.js
const API_URL = API_CONFIG.baseURL;

// Check authentication
const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = 'admin-login.html';
}

const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');

// ========== CACHE MANAGEMENT ========== 
// Function to clear frontend cache when admin makes changes
function clearFrontendCache(cacheKeys = []) {
    try {
        if (cacheKeys.length === 0) {
            // Clear all pathfinders cache
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (key.startsWith('pathfinders_')) {
                    localStorage.removeItem(key);
                }
            });
            console.log('✅ All frontend cache cleared');
        } else {
            // Clear specific cache keys
            cacheKeys.forEach(key => {
                localStorage.removeItem(`pathfinders_${key}`);
            });
            console.log(`✅ Cleared cache for: ${cacheKeys.join(', ')}`);
        }
    } catch (error) {
        console.warn('Failed to clear frontend cache:', error);
    }
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
    };
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    let requestUrl = `${API_URL}${endpoint}`;
    const method = (config.method || 'GET').toUpperCase();
    if (method === 'GET' && !config.cacheBustDisabled) {
        const separator = requestUrl.includes('?') ? '&' : '?';
        requestUrl = `${requestUrl}${separator}ts=${Date.now()}`;
    }
    
    try {
        const response = await fetch(requestUrl, config);
        const data = await response.json();
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            window.location.href = 'admin-login.html';
            return null;
        }
        
        return { response, data };
    } catch (error) {
        console.error('API Request Error:', error);
        showToast('Network error. Please try again.', 'error');
        return null;
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Show Modal Notification (for important actions like create/update)
function showModalNotification(title, message, type = 'success') {
    const iconMap = {
        success: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #10b981;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>`,
        error: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`,
        warning: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #f59e0b;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>`
    };

    const modalHTML = `
        <div class="modal-backdrop" onclick="closeNotificationModal()"></div>
        <div class="modal-content notification-modal">
            <div class="notification-icon">
                ${iconMap[type]}
            </div>
            <h2 class="notification-title">${title}</h2>
            <p class="notification-message">${message}</p>
            <div class="notification-actions">
                <button class="btn-primary" onclick="closeNotificationModal()" style="min-width: 120px;">OK</button>
            </div>
        </div>
    `;
    
    const notificationModal = document.getElementById('modal-container');
    notificationModal.innerHTML = modalHTML;
    notificationModal.style.display = 'flex';
}

window.closeNotificationModal = () => {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'none';
    modal.innerHTML = '';
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Set admin info
    document.getElementById('admin-name').textContent = adminInfo.fullName || 'Admin';
    document.getElementById('admin-role').textContent = adminInfo.role === 'super-admin' ? 'Super Admin' : 'Administrator';
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', () => {
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
            document.getElementById(`section-${sectionId}`).classList.add('active');
            
            // Update page title
            document.getElementById('page-title').textContent = 
                sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
            
            // Load section data
            loadSectionData(sectionId);
        });
    });
    
    // Profile Edit - Click on admin profile to edit
    document.getElementById('admin-profile').addEventListener('click', () => {
        editCurrentUserProfile();
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            window.location.href = 'admin-login.html';
        }
    });
    
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        const activeSection = document.querySelector('.nav-item.active').getAttribute('data-section');
        loadSectionData(activeSection);
        showToast('Data refreshed successfully', 'success');
    });
    
    // Load initial data
    await loadDashboardStats();
    await loadRecentData();
});

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        // Fetch all stats in parallel
        const [contactsRes, newsletterRes, donationsRes, eventsRes] = await Promise.all([
            apiRequest('/contacts?limit=1'),
            apiRequest('/newsletter?limit=1'),
            apiRequest('/donations/stats'),
            apiRequest('/events?upcoming=true&limit=1')
        ]);
        
        // Update stat cards
        if (contactsRes?.data.success) {
            document.getElementById('stat-contacts').textContent = contactsRes.data.total || 0;
            document.getElementById('contacts-count').textContent = contactsRes.data.total || 0;
        }
        
        if (newsletterRes?.data.success) {
            document.getElementById('stat-subscribers').textContent = newsletterRes.data.total || 0;
            document.getElementById('newsletter-count').textContent = newsletterRes.data.total || 0;
        }
        
        if (donationsRes?.data.success) {
            const totalAmount = donationsRes.data.data.totalCompleted[0]?.total || 0;
            document.getElementById('stat-donations').textContent = `KES ${totalAmount.toLocaleString()}`;
            document.getElementById('donations-count').textContent = donationsRes.data.data.totalCompleted[0]?.count || 0;
        }
        
        if (eventsRes?.data.success) {
            document.getElementById('stat-events').textContent = eventsRes.data.total || 0;
            document.getElementById('events-count').textContent = eventsRes.data.total || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Recent Data
async function loadRecentData() {
    // Recent Contacts
    const contactsRes = await apiRequest('/contacts?page=1&limit=5');
    if (contactsRes?.data.success) {
        renderRecentContacts(contactsRes.data.data);
    }
    
    // Recent Donations
    const donationsRes = await apiRequest('/donations?page=1&limit=5');
    if (donationsRes?.data.success) {
        renderRecentDonations(donationsRes.data.data);
    }
}

// Render Recent Contacts
function renderRecentContacts(contacts) {
    const container = document.getElementById('recent-contacts');
    
    if (contacts.length === 0) {
        container.innerHTML = '<p class="text-center text-secondary">No recent contacts</p>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <div class="recent-item">
            <div class="recent-item-icon">${contact.name.charAt(0).toUpperCase()}</div>
            <div class="recent-item-details">
                <strong>${contact.name}</strong>
                <small>${contact.email} • Age ${contact.age}</small>
            </div>
            <span class="status-badge status-${contact.status}">${contact.status}</span>
        </div>
    `).join('');
}

// Render Recent Donations
function renderRecentDonations(donations) {
    const container = document.getElementById('recent-donations');
    
    if (donations.length === 0) {
        container.innerHTML = '<p class="text-center text-secondary">No recent donations</p>';
        return;
    }
    
    container.innerHTML = donations.map(donation => `
        <div class="recent-item">
            <div class="recent-item-icon">💰</div>
            <div class="recent-item-details">
                <strong>${donation.donorName}</strong>
                <small>KES ${donation.amount.toLocaleString()} • ${donation.purpose}</small>
            </div>
            <span class="status-badge status-${donation.paymentStatus}">${donation.paymentStatus}</span>
        </div>
    `).join('');
}

// Load Section Data
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboardStats();
            await loadRecentData();
            break;
        case 'contacts':
            await loadContacts();
            break;
        case 'newsletter':
            await loadNewsletter();
            break;
        case 'donations':
            await loadDonations();
            break;
        case 'events':
            await loadEvents();
            break;
        case 'gallery':
            await loadGallery();
            break;
        case 'leaders':
            await loadLeaders();
            break;
        case 'admins':
            await loadAdmins();
            break;
    }
}

// Load Contacts
async function loadContacts(page = 1, status = '') {
    const tbody = document.getElementById('contacts-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading contacts...</td></tr>';
    
    let url = `/contacts?page=${page}&limit=10`;
    if (status) url += `&status=${status}`;
    
    const result = await apiRequest(url);
    if (!result || !result.data || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading contacts</td></tr>';
        return;
    }
    
    const contacts = result.data.data;
    
    if (contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No contacts found</td></tr>';
        return;
    }
    
    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phone}</td>
            <td>${contact.age}</td>
            <td><span class="status-badge status-${contact.status}">${contact.status}</span></td>
            <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
            <td class="table-actions">
                <button class="btn-sm btn-view" onclick="viewContact('${contact._id}')">View</button>
                <button class="btn-sm btn-edit" onclick="updateContactStatus('${contact._id}')">Update</button>
                <button class="btn-sm btn-delete" onclick="deleteContact('${contact._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    // Render pagination
    renderPagination('contacts-pagination', result.data.currentPage, result.data.totalPages, (p) => loadContacts(p, status));
}

// Load Newsletter Subscribers
async function loadNewsletter(page = 1, isActive = '') {
    const tbody = document.getElementById('newsletter-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading subscribers...</td></tr>';
    
    let url = `/newsletter?page=${page}&limit=10`;
    if (isActive) url += `&isActive=${isActive}`;
    
    const result = await apiRequest(url);
    if (!result || !result.data || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading subscribers</td></tr>';
        return;
    }
    
    const subscribers = result.data.data;
    
    if (subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No subscribers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = subscribers.map(sub => `
        <tr>
            <td>${sub.email}</td>
            <td>${sub.name || '-'}</td>
            <td><span class="status-badge status-${sub.isActive ? 'active' : 'inactive'}">${sub.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>${new Date(sub.subscribedAt).toLocaleDateString()}</td>
            <td class="table-actions">
                <button class="btn-sm btn-delete" onclick="deleteSubscriber('${sub._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('newsletter-pagination', result.data.currentPage, result.data.totalPages, (p) => loadNewsletter(p, isActive));
}

// Load Donations
async function loadDonations(page = 1, status = '') {
    const tbody = document.getElementById('donations-tbody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading donations...</td></tr>';
    
    let url = `/donations?page=${page}&limit=10`;
    if (status) url += `&paymentStatus=${status}`;
    
    const result = await apiRequest(url);
    if (!result || !result.data || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading donations</td></tr>';
        return;
    }
    
    const donations = result.data.data;
    
    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No donations found</td></tr>';
        return;
    }
    
    tbody.innerHTML = donations.map(don => `
        <tr>
            <td>${don.donorName}</td>
            <td>${don.email}</td>
            <td>KES ${don.amount.toLocaleString()}</td>
            <td>${don.donationType}</td>
            <td>${don.purpose}</td>
            <td><span class="status-badge status-${don.paymentStatus}">${don.paymentStatus}</span></td>
            <td>${new Date(don.donatedAt).toLocaleDateString()}</td>
            <td class="table-actions">
                <button class="btn-sm btn-view" onclick="viewDonation('${don._id}')">View</button>
                <button class="btn-sm btn-edit" onclick="updateDonationStatus('${don._id}')">Update</button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('donations-pagination', result.data.currentPage, result.data.totalPages, (p) => loadDonations(p, status));
}

// Load Events
async function loadEvents(page = 1) {
    const tbody = document.getElementById('events-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading events...</td></tr>';
    
    const result = await apiRequest(`/events/admin/all?page=${page}&limit=10`);
    if (!result || !result.data || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading events</td></tr>';
        return;
    }
    
    const events = result.data.data;
    
    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No events found</td></tr>';
        return;
    }
    
    tbody.innerHTML = events.map(event => `
        <tr data-event-id="${event._id}">
            <td>${event.title}</td>
            <td>${event.category}</td>
            <td>${new Date(event.startDate).toLocaleDateString()}</td>
            <td>${event.location || '-'}</td>
            <td>${event.registeredParticipants?.length || 0}${event.maxParticipants ? `/${event.maxParticipants}` : ''}</td>
            <td><span class="status-badge status-${event.isPublished ? 'approved' : 'pending'}">${event.isPublished ? 'Published' : 'Draft'}</span></td>
            <td class="table-actions">
                <button class="btn-sm btn-view" onclick="viewEvent('${event._id}')">View</button>
                <button class="btn-sm btn-edit" onclick="editEvent('${event._id}')">Edit</button>
                <button class="btn-sm btn-delete" onclick="deleteEvent('${event._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('events-pagination', result.data.currentPage, result.data.totalPages, (p) => loadEvents(p));
}

// Load Gallery
async function loadGallery(page = 1, category = '') {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '<div class="loading">Loading gallery...</div>';
    
    let url = `${API_CONFIG.endpoints.gallery.adminAll}?page=${page}&limit=12`;
    if (category) url += `&category=${category}`;
    
    const result = await apiRequest(url);
    if (!result || !result.data || !result.data.success) {
        grid.innerHTML = '<div class="text-center">Error loading gallery</div>';
        return;
    }
    
    const items = result.data.data;
    
    if (items.length === 0) {
        grid.innerHTML = '<div class="text-center">No gallery items found</div>';
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="gallery-item">
            <img src="${item.imageUrl}" alt="${item.title}">
            <div class="gallery-item-overlay">
                <button class="btn-sm" onclick="viewGalleryItem('${item._id}')">View</button>
                <button class="btn-sm btn-edit" onclick="editGalleryItem('${item._id}')">Edit</button>
                <button class="btn-sm btn-delete" onclick="deleteGalleryItem('${item._id}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    renderPagination('gallery-pagination', result.data.currentPage, result.data.totalPages, (p) => loadGallery(p, category));
}

// Load Leaders
async function loadLeaders(page = 1) {
    const tbody = document.getElementById('leaders-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading leaders...</td></tr>';
    
    const result = await apiRequest(`/leaders/admin/all?page=${page}&limit=10`);
    if (!result || !result.data || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading leaders</td></tr>';
        return;
    }
    
    const leaders = result.data.data;
    
    if (leaders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No leaders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = leaders.map(leader => `
        <tr>
            <td>${leader.name}</td>
            <td>${leader.role}</td>
            <td>${leader.email || '-'}</td>
            <td>${leader.order}</td>
            <td><span class="status-badge status-${leader.isActive ? 'approved' : 'pending'}">${leader.isActive ? 'Active' : 'Inactive'}</span></td>
            <td class="table-actions">
                <button class="btn-sm btn-view" onclick="viewLeader('${leader._id}')">View</button>
                <button class="btn-sm btn-edit" onclick="editLeader('${leader._id}')">Edit</button>
                <button class="btn-sm btn-delete" onclick="deleteLeader('${leader._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('leaders-pagination', result.data.currentPage, result.data.totalPages, (p) => loadLeaders(p));
}

// Render Pagination
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<button disabled>...</button>';
        }
    }
    
    // Next button
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    container.innerHTML = html;
    
    // Store the callback
    window.changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };
}

// Export Functions
async function exportData(type) {
    showToast('Preparing export...', 'info');
    
    const result = await apiRequest(`/${type}?limit=1000`);
    if (!result || !result.data || !result.data.success) {
        showToast('Export failed', 'error');
        return;
    }
    
    const data = result.data.data;
    const csv = convertToCSV(data);
    downloadCSV(csv, `${type}-${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Export completed successfully', 'success');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => {
        const value = obj[header];
        return typeof value === 'object' ? JSON.stringify(value) : value;
    }));
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event Listeners for Filters
document.getElementById('filter-contacts-status')?.addEventListener('change', (e) => {
    loadContacts(1, e.target.value);
});

document.getElementById('filter-newsletter-status')?.addEventListener('change', (e) => {
    loadNewsletter(1, e.target.value);
});

document.getElementById('filter-donations-status')?.addEventListener('change', (e) => {
    loadDonations(1, e.target.value);
});

document.getElementById('filter-gallery-category')?.addEventListener('change', (e) => {
    loadGallery(1, e.target.value);
});

// Export buttons
document.getElementById('export-contacts')?.addEventListener('click', () => exportData('contacts'));
document.getElementById('export-newsletter')?.addEventListener('click', () => exportData('newsletter'));
document.getElementById('export-donations')?.addEventListener('click', () => exportData('donations'));

// CRUD Operations
window.viewContact = async (id) => {
    const result = await apiRequest(`/contacts/${id}`);
    if (!result || !result.data || !result.data.success) return;
    
    const contact = result.data.data;
    const statusColors = {
        pending: '#f59e0b',
        reviewed: '#3b82f6',
        approved: '#10b981',
        rejected: '#ef4444'
    };
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content modal-large">
            <div class="modal-header">
                <div class="modal-header-content">
                    <div class="modal-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div>
                        <h2>Contact Application</h2>
                        <p class="modal-subtitle">Application ID: ${contact._id.slice(-8)}</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="status-banner" style="background: ${statusColors[contact.status] || '#64748b'}15; border-left: 4px solid ${statusColors[contact.status] || '#64748b'}; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${statusColors[contact.status] || '#64748b'}" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span style="font-weight: 600; color: ${statusColors[contact.status] || '#64748b'}; text-transform: capitalize;">${contact.status}</span>
                    </div>
                </div>
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <label>Applicant Name</label>
                            <p>${contact.name}</p>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <label>Guardian Name</label>
                            <p>${contact.guardian}</p>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <label>Email Address</label>
                            <p>${contact.email}</p>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <label>Phone Number</label>
                            <p>${contact.phone}</p>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <label>Age</label>
                            <p>${contact.age} years</p>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">
                            ${contact.consent ? 
                                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : 
                                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
                        </div>
                        <div class="detail-content">
                            <label>Consent Status</label>
                            <p style="color: ${contact.consent ? '#10b981' : '#ef4444'}; font-weight: 600;">${contact.consent ? '✓ Consent Given' : '✗ No Consent'}</p>
                        </div>
                    </div>
                </div>
                ${contact.message ? `
                <div class="message-section">
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Message
                    </label>
                    <div class="message-box">
                        <p>${contact.message}</p>
                    </div>
                </div>` : ''}
                <div class="detail-footer">
                    <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Submitted ${new Date(contact.createdAt).toLocaleString()}
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Close
                    </button>
                    <button class="btn-primary" onclick="closeModal(); updateContactStatus('${id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.updateContactStatus = async (id) => {
    // Get current contact to show current status
    const result = await apiRequest(`/contacts/${id}`);
    const currentStatus = result?.data?.data?.status || 'pending';
    
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-header-content">
                    <div class="modal-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div>
                        <h2>Update Application Status</h2>
                        <p class="modal-subtitle">Choose the new status for this application</p>
                    </div>
                </div>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="update-status-form" onsubmit="saveContactStatus(event, '${id}')">
                    <div class="form-group">
                        <label for="contact-status">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 6px;">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                            Application Status *
                        </label>
                        <div class="status-options">
                            <label class="status-option" data-status="pending">
                                <input type="radio" name="status" value="pending" ${currentStatus === 'pending' ? 'checked' : ''} required>
                                <div class="status-option-card">
                                    <div class="status-option-icon" style="background: #fef3c7; color: #f59e0b;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                    </div>
                                    <div class="status-option-content">
                                        <h4>Pending</h4>
                                        <p>Application awaiting review</p>
                                    </div>
                                </div>
                            </label>
                            <label class="status-option" data-status="reviewed">
                                <input type="radio" name="status" value="reviewed" ${currentStatus === 'reviewed' ? 'checked' : ''} required>
                                <div class="status-option-card">
                                    <div class="status-option-icon" style="background: #dbeafe; color: #3b82f6;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </div>
                                    <div class="status-option-content">
                                        <h4>Reviewed</h4>
                                        <p>Application has been reviewed</p>
                                    </div>
                                </div>
                            </label>
                            <label class="status-option" data-status="approved">
                                <input type="radio" name="status" value="approved" ${currentStatus === 'approved' ? 'checked' : ''} required>
                                <div class="status-option-card">
                                    <div class="status-option-icon" style="background: #d1fae5; color: #10b981;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <div class="status-option-content">
                                        <h4>Approved</h4>
                                        <p>Application accepted</p>
                                    </div>
                                </div>
                            </label>
                            <label class="status-option" data-status="rejected">
                                <input type="radio" name="status" value="rejected" ${currentStatus === 'rejected' ? 'checked' : ''} required>
                                <div class="status-option-card">
                                    <div class="status-option-icon" style="background: #fee2e2; color: #ef4444;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="15" y1="9" x2="9" y2="15"/>
                                            <line x1="9" y1="9" x2="15" y2="15"/>
                                        </svg>
                                    </div>
                                    <div class="status-option-content">
                                        <h4>Rejected</h4>
                                        <p>Application declined</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.saveContactStatus = async (event, id) => {
    event.preventDefault();
    
    const status = document.querySelector('input[name="status"]:checked').value;
    
    const result = await apiRequest(`/contacts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
    
    if (result && result.data && result.data.success) {
        showToast('Status updated successfully', 'success');
        closeModal();
        loadContacts();
    } else {
        showToast(result?.data?.message || 'Failed to update status', 'error');
    }
};

window.deleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    const result = await apiRequest(`/contacts/${id}`, { method: 'DELETE' });
    if (result && result.data && result.data.success) {
        showToast('Contact deleted successfully', 'success');
        loadContacts();
    }
};

window.deleteSubscriber = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    const result = await apiRequest(`/newsletter/${id}`, { method: 'DELETE' });
    if (result && result.data && result.data.success) {
        showToast('Subscriber deleted successfully', 'success');
        loadNewsletter();
    }
};

window.viewDonation = async (id) => {
    const result = await apiRequest(`/donations/${id}`);
    if (!result || !result.data || !result.data.success) return;
    
    const donation = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Donation Details</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="detail-group">
                    <label>Donor Name</label>
                    <p>${donation.donorName}</p>
                </div>
                <div class="detail-group">
                    <label>Email</label>
                    <p>${donation.email}</p>
                </div>
                <div class="detail-group">
                    <label>Phone</label>
                    <p>${donation.phone || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Amount</label>
                    <p style="font-size: 24px; font-weight: bold; color: #006837;">KES ${donation.amount.toLocaleString()}</p>
                </div>
                <div class="detail-group">
                    <label>Type</label>
                    <p>${donation.donationType}</p>
                </div>
                <div class="detail-group">
                    <label>Purpose</label>
                    <p>${donation.purpose}</p>
                </div>
                <div class="detail-group">
                    <label>Payment Status</label>
                    <p><span class="status-badge status-${donation.paymentStatus}">${donation.paymentStatus}</span></p>
                </div>
                <div class="detail-group">
                    <label>Message</label>
                    <p>${donation.message || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Donated</label>
                    <p>${new Date(donation.createdAt).toLocaleString()}</p>
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" onclick="closeModal(); updateDonationStatus('${id}')">Update Status</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.updateDonationStatus = async (id) => {
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Payment Status</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="update-donation-form" onsubmit="saveDonationStatus(event, '${id}')">
                    <div class="form-group">
                        <label for="donation-status">Payment Status *</label>
                        <select id="donation-status" required>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Update Status</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.saveDonationStatus = async (event, id) => {
    event.preventDefault();
    
    const paymentStatus = document.getElementById('donation-status').value;
    
    const result = await apiRequest(`/donations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus })
    });
    
    if (result && result.data && result.data.success) {
        showToast('Payment status updated successfully', 'success');
        closeModal();
        loadDonations();
    } else {
        showToast(result?.data?.message || 'Failed to update status', 'error');
    }
};


window.viewEvent = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.events.adminById(id));
    if (!result || !result.data || !result.data.success) return;
    
    const event = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Event Details</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="detail-group">
                    <label>Title</label>
                    <p>${event.title}</p>
                </div>
                <div class="detail-group">
                    <label>Category</label>
                    <p>${event.category}</p>
                </div>
                <div class="detail-group">
                    <label>Description</label>
                    <p>${event.description || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Start Date</label>
                    <p>${new Date(event.startDate).toLocaleString()}</p>
                </div>
                <div class="detail-group">
                    <label>End Date</label>
                    <p>${event.endDate ? new Date(event.endDate).toLocaleString() : '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Location</label>
                    <p>${event.location || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Participants</label>
                    <p>${event.registeredParticipants?.length || 0}${event.maxParticipants ? `/${event.maxParticipants}` : ''}</p>
                </div>
                <div class="detail-group">
                    <label>Status</label>
                    <p>${event.isPublished ? 'Published' : 'Draft'}</p>
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.editEvent = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.events.adminById(id));
    if (!result || !result.data || !result.data.success) return;
    
    const event = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Event</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="edit-event-form" onsubmit="saveEventChanges(event, '${id}')">
                    <div class="form-group">
                        <label for="event-title">Title *</label>
                        <input type="text" id="event-title" value="${event.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="event-category">Category *</label>
                        <select id="event-category" required>
                            <option value="meeting" ${event.category === 'meeting' ? 'selected' : ''}>Meeting</option>
                            <option value="camping" ${event.category === 'camping' ? 'selected' : ''}>Camping</option>
                            <option value="service" ${event.category === 'service' ? 'selected' : ''}>Service</option>
                            <option value="training" ${event.category === 'training' ? 'selected' : ''}>Training</option>
                            <option value="social" ${event.category === 'social' ? 'selected' : ''}>Social</option>
                            <option value="competition" ${event.category === 'competition' ? 'selected' : ''}>Competition</option>
                            <option value="other" ${event.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="event-description">Description *</label>
                        <textarea id="event-description" required>${event.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="event-startDate">Start Date *</label>
                        <input type="datetime-local" id="event-startDate" value="${new Date(event.startDate).toISOString().slice(0, 16)}" required>
                    </div>
                    <div class="form-group">
                        <label for="event-endDate">End Date</label>
                        <input type="datetime-local" id="event-endDate" value="${event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''}">
                    </div>
                    <div class="form-group">
                        <label for="event-location">Location</label>
                        <input type="text" id="event-location" value="${event.location || ''}">
                    </div>
                    <div class="form-group">
                        <label for="event-image">Event Image</label>
                        <input type="file" id="event-image" accept="image/*" onchange="previewImage(this, 'event-preview')">
                        <img id="event-preview" src="${event.imageUrl || ''}" style="max-width: 200px; margin-top: 10px; ${event.imageUrl ? '' : 'display: none;'}">
                        <small style="color: #64748b; font-size: 12px;">Or enter image URL below</small>
                        <input type="url" id="event-imageUrl" value="${event.imageUrl || ''}" placeholder="https://example.com/image.jpg" style="margin-top: 5px;">
                    </div>
                    <div class="form-group">
                        <label for="event-maxParticipants">Max Participants</label>
                        <input type="number" id="event-maxParticipants" value="${event.maxParticipants || ''}">
                    </div>
                    <div class="form-group">
                        <label for="event-cost">Cost (KES)</label>
                        <input type="number" id="event-cost" value="${event.cost || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="event-additionalInfo">Additional Info</label>
                        <textarea id="event-additionalInfo" rows="2">${event.additionalInfo || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="event-requiresRegistration" ${event.requiresRegistration ? 'checked' : ''}>
                            Requires Registration
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="event-registrationDeadline">Registration Deadline</label>
                        <input type="datetime-local" id="event-registrationDeadline" value="${event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="event-isFeatured" ${event.isFeatured ? 'checked' : ''}>
                            Featured Event
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="event-isPublished" ${event.isPublished ? 'checked' : ''}>
                            Published
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.saveEventChanges = async (event, id) => {
    event.preventDefault();
    
    
    let imageUrl = document.getElementById('event-imageUrl').value;
    const imageFile = document.getElementById('event-image').files[0];
    
    if (imageFile) {
        try {
            imageUrl = await fileToBase64(imageFile);
        } catch (error) {
            console.error('Error converting image:', error);
            showToast('Failed to process image', 'error');
            return;
        }
    }
    
    const eventData = {
        title: document.getElementById('event-title').value,
        category: document.getElementById('event-category').value,
        description: document.getElementById('event-description').value,
        startDate: toISOStringOrNull(document.getElementById('event-startDate').value),
        endDate: toISOStringOrNull(document.getElementById('event-endDate').value),
        location: document.getElementById('event-location').value,
        imageUrl: imageUrl || undefined,
        maxParticipants: document.getElementById('event-maxParticipants').value || null,
        cost: document.getElementById('event-cost').value || 0,
        additionalInfo: document.getElementById('event-additionalInfo').value || undefined,
        requiresRegistration: document.getElementById('event-requiresRegistration').checked,
        registrationDeadline: toISOStringOrNull(document.getElementById('event-registrationDeadline').value),
        isFeatured: document.getElementById('event-isFeatured').checked,
        isPublished: document.getElementById('event-isPublished').checked
    };
    
    const result = await apiRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
    });
    
    if (result && result.data && result.data.success) {
        closeModal();
        clearFrontendCache(['events', 'home_events']); // Clear frontend events cache
        showModalNotification(
            'Event Updated Successfully!',
            `The event "${eventData.title}" has been updated successfully.`,
            'success'
        );
        await loadEvents();
    } else {
        // Handle validation errors
        let errorMessage = 'Failed to update event. Please try again.';
        
        if (result?.data?.errors && Array.isArray(result.data.errors)) {
            errorMessage = result.data.errors.map(err => err.msg || err.message).join(', ');
        } else if (result?.data?.message) {
            errorMessage = result.data.message;
        }
        
        showToast(errorMessage, 'error');
    }
};

window.deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const result = await apiRequest(`/events/${id}`, { method: 'DELETE' });
    if (result && result.data && result.data.success) {
        const row = document.querySelector(`#events-tbody tr[data-event-id="${id}"]`);
        if (row) {
            row.remove();
        }
        clearFrontendCache(['events', 'home_events']); // Clear frontend events cache
        showToast('Event deleted', 'success');
        await loadEvents();
    }
};

window.viewGalleryItem = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.gallery.adminById(id));
    if (!result || !result.data || !result.data.success) return;
    
    const item = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Gallery Item Details</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                <div class="detail-group">
                    <label>Title</label>
                    <p>${item.title}</p>
                </div>
                <div class="detail-group">
                    <label>Description</label>
                    <p>${item.description || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Category</label>
                    <p>${item.category}</p>
                </div>
                <div class="detail-group">
                    <label>Uploaded</label>
                    <p>${new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.editGalleryItem = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.gallery.adminById(id));
    if (!result || !result.data || !result.data.success) return;
    
    const item = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Gallery Item</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="edit-gallery-form" onsubmit="saveGalleryChanges(event, '${id}')">
                    <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label for="gallery-title">Title *</label>
                        <input type="text" id="gallery-title" value="${item.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="gallery-description">Description</label>
                        <textarea id="gallery-description">${item.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="gallery-category">Category *</label>
                        <select id="gallery-category" required>
                            <option value="camping" ${item.category === 'camping' ? 'selected' : ''}>Camping</option>
                            <option value="activities" ${item.category === 'activities' ? 'selected' : ''}>Activities</option>
                            <option value="ceremonies" ${item.category === 'ceremonies' ? 'selected' : ''}>Ceremonies</option>
                            <option value="community-service" ${item.category === 'community-service' ? 'selected' : ''}>Community Service</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="gallery-isPublished" ${item.isPublished ? 'checked' : ''}>
                            Published
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};

window.saveGalleryChanges = async (event, id) => {
    event.preventDefault();
    
    const galleryData = {
        title: document.getElementById('gallery-title').value,
        description: document.getElementById('gallery-description').value,
        category: document.getElementById('gallery-category').value,
        isPublished: document.getElementById('gallery-isPublished').checked
    };
    
    const result = await apiRequest(`/gallery/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(galleryData)
    });
    
    if (result && result.data && result.data.success) {
        clearFrontendCache(['gallery']); // Clear frontend gallery cache
        showToast('Gallery item updated successfully', 'success');
        closeModal();
        loadGallery();
    } else {
        showToast(result?.data?.message || 'Failed to update gallery item', 'error');
    }
};

window.deleteGalleryItem = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    const result = await apiRequest(`/gallery/${id}`, { method: 'DELETE' });
    if (result && result.data && result.data.success) {
        clearFrontendCache(['gallery']); // Clear frontend gallery cache
        showToast('Gallery item deleted', 'success');
        loadGallery();
    }
};



async function loadAdmins(page = 1, role = '') {
    const tbody = document.getElementById('admins-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading admins...</td></tr>';
    
    const result = await apiRequest(API_CONFIG.endpoints.auth.admins);
    if (!result || !result.data || !result.data.success) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading admins</td></tr>';
        return;
    }
    
    let admins = result.data.admins || [];
    
    
    if (role) {
        admins = admins.filter(admin => admin.role === role);
    }
    
    
    document.getElementById('admins-count').textContent = admins.length;
    
    if (admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No admins found</td></tr>';
        return;
    }
    
    tbody.innerHTML = admins.map(admin => `
        <tr>
            <td>${admin.fullName}</td>
            <td>${admin.username}</td>
            <td>${admin.email}</td>
            <td><span class="status-badge status-${admin.role === 'super-admin' ? 'approved' : 'pending'}">${admin.role}</span></td>
            <td><span class="status-badge status-${admin.isActive ? 'approved' : 'rejected'}">${admin.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td class="table-actions">
                <button class="btn-sm btn-view" onclick="viewAdmin('${admin._id}')">View</button>
                <button class="btn-sm btn-edit" onclick="editAdmin('${admin._id}')">Edit</button>
                <button class="btn-sm btn-delete" onclick="deleteAdmin('${admin._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}


window.viewAdmin = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.auth.admins);
    if (result && result.data && result.data.success) {
        const admin = result.data.admins.find(a => a._id === id);
        if (admin) {
            const modalHTML = `
                <div class="modal-backdrop" onclick="closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Admin Details</h2>
                        <button class="modal-close" onclick="closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-group">
                            <label>Full Name:</label>
                            <p>${admin.fullName}</p>
                        </div>
                        <div class="detail-group">
                            <label>Username:</label>
                            <p>${admin.username}</p>
                        </div>
                        <div class="detail-group">
                            <label>Email:</label>
                            <p>${admin.email}</p>
                        </div>
                        <div class="detail-group">
                            <label>Role:</label>
                            <p><span class="status-badge status-${admin.role === 'super-admin' ? 'approved' : 'pending'}">${admin.role}</span></p>
                        </div>
                        <div class="detail-group">
                            <label>Status:</label>
                            <p><span class="status-badge status-${admin.isActive ? 'approved' : 'rejected'}">${admin.isActive ? 'Active' : 'Inactive'}</span></p>
                        </div>
                        <div class="detail-group">
                            <label>Created:</label>
                            <p>${new Date(admin.createdAt).toLocaleString()}</p>
                        </div>
                        <div class="detail-group">
                            <label>Last Login:</label>
                            <p>${admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}</p>
                        </div>
                        <div class="detail-group">
                            <label>Failed Login Attempts:</label>
                            <p>${admin.failedLoginAttempts || 0}</p>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('modal-container').innerHTML = modalHTML;
            document.getElementById('modal-container').style.display = 'flex';
        }
    }
};


window.editCurrentUserProfile = async () => {
    const currentUserId = adminInfo._id || adminInfo.id;
    
    if (!currentUserId) {
        showToast('Unable to load profile information', 'error');
        return;
    }
    
    
    const result = await apiRequest(API_CONFIG.endpoints.auth.adminById(currentUserId));
    
    if (result && result.data && result.data.success) {
        const admin = result.data.admin;
        const modalHTML = `
            <div class="modal-backdrop" onclick="closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit My Profile</h2>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="edit-profile-form" onsubmit="saveProfileChanges(event, '${currentUserId}')">
                        <div class="form-group">
                            <label for="profile-fullName">Full Name *</label>
                            <input type="text" id="profile-fullName" value="${admin.fullName}" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email *</label>
                            <input type="email" id="profile-email" value="${admin.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-username">Username *</label>
                            <input type="text" id="profile-username" value="${admin.username}" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-currentPassword">Current Password (required to save changes) *</label>
                            <input type="password" id="profile-currentPassword" placeholder="Enter current password" required>
                        </div>
                        <div class="form-group">
                            <label for="profile-newPassword">New Password (optional)</label>
                            <input type="password" id="profile-newPassword" placeholder="Leave blank to keep current password">
                        </div>
                        <div class="form-group">
                            <label for="profile-confirmPassword">Confirm New Password</label>
                            <input type="password" id="profile-confirmPassword" placeholder="Confirm new password">
                        </div>
                        <div class="alert alert-info" style="margin-top: 1rem;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span>Role and status can only be changed by another Super Admin.</span>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = modalHTML;
        document.getElementById('modal-container').style.display = 'flex';
    } else {
        showToast('Failed to load profile information', 'error');
    }
};


window.saveProfileChanges = async (event, id) => {
    event.preventDefault();
    
    const fullName = document.getElementById('profile-fullName').value;
    const email = document.getElementById('profile-email').value;
    const username = document.getElementById('profile-username').value;
    const currentPassword = document.getElementById('profile-currentPassword').value;
    const newPassword = document.getElementById('profile-newPassword').value;
    const confirmPassword = document.getElementById('profile-confirmPassword').value;
    
    
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }
    }
    
    const updateData = {
        fullName,
        email,
        username,
        currentPassword
    };
    

    if (newPassword) {
        updateData.password = newPassword;
    }
    
    const result = await apiRequest(API_CONFIG.endpoints.auth.profile, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
    });
    
    if (result && result.data && result.data.success) {
        showToast('Profile updated successfully', 'success');
        
        
        const updatedInfo = {
            ...adminInfo,
            fullName,
            email,
            username
        };
        localStorage.setItem('adminInfo', JSON.stringify(updatedInfo));
        
        
        document.getElementById('admin-name').textContent = fullName;
        
        closeModal();
    } else {
        showToast(result?.data?.message || 'Failed to update profile', 'error');
    }
};


window.editAdmin = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.auth.admins);
    if (result && result.data && result.data.success) {
        const admin = result.data.admins.find(a => a._id === id);
        if (admin) {
            const modalHTML = `
                <div class="modal-backdrop" onclick="closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Admin</h2>
                        <button class="modal-close" onclick="closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-admin-form" onsubmit="saveAdminChanges(event, '${id}')">
                            <div class="form-group">
                                <label for="edit-fullName">Full Name *</label>
                                <input type="text" id="edit-fullName" value="${admin.fullName}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-email">Email *</label>
                                <input type="email" id="edit-email" value="${admin.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-role">Role *</label>
                                <select id="edit-role" required>
                                    <option value="admin" ${admin.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    <option value="super-admin" ${admin.role === 'super-admin' ? 'selected' : ''}>Super Admin</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-isActive">Status *</label>
                                <select id="edit-isActive" required>
                                    <option value="true" ${admin.isActive ? 'selected' : ''}>Active</option>
                                    <option value="false" ${!admin.isActive ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                                <button type="submit" class="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.getElementById('modal-container').innerHTML = modalHTML;
            document.getElementById('modal-container').style.display = 'flex';
        }
    }
};


window.saveAdminChanges = async (event, id) => {
    event.preventDefault();
    
    const fullName = document.getElementById('edit-fullName').value;
    const email = document.getElementById('edit-email').value;
    const role = document.getElementById('edit-role').value;
    const isActive = document.getElementById('edit-isActive').value === 'true';
    
    const result = await apiRequest(API_CONFIG.endpoints.auth.adminById(id), {
        method: 'PATCH',
        body: JSON.stringify({ fullName, email, role, isActive })
    });
    
    if (result && result.data && result.data.success) {
        showToast('Admin updated successfully', 'success');
        closeModal();
        loadAdmins();
    } else {
        showToast(result?.data?.message || 'Failed to update admin', 'error');
    }
};


window.deleteAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
    
    const result = await apiRequest(API_CONFIG.endpoints.auth.adminById(id), { 
        method: 'DELETE' 
    });
    
    if (result && result.data && result.data.success) {
        showToast('Admin deleted successfully', 'success');
        loadAdmins();
    } else {
        showToast(result?.data?.message || 'Failed to delete admin', 'error');
    }
};


document.getElementById('create-admin-btn')?.addEventListener('click', () => {
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Admin</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="create-admin-form" onsubmit="createAdmin(event)">
                    <div class="form-group">
                        <label for="new-fullName">Full Name *</label>
                        <input type="text" id="new-fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="new-username">Username *</label>
                        <input type="text" id="new-username" minlength="3" required>
                    </div>
                    <div class="form-group">
                        <label for="new-email">Email *</label>
                        <input type="email" id="new-email" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">Password *</label>
                        <input type="password" id="new-password" minlength="6" required>
                    </div>
                    <div class="form-group">
                        <label for="new-role">Role *</label>
                        <select id="new-role" required>
                            <option value="admin">Admin</option>
                            <option value="super-admin">Super Admin</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Admin</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
});


window.createAdmin = async (event) => {
    event.preventDefault();
    
    const fullName = document.getElementById('new-fullName').value;
    const username = document.getElementById('new-username').value;
    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;
    
    const result = await apiRequest(API_CONFIG.endpoints.auth.register, {
        method: 'POST',
        body: JSON.stringify({ fullName, username, email, password, role })
    });
    
    if (result && result.data && result.data.success) {
        showToast('Admin created successfully', 'success');
        closeModal();
        loadAdmins();
    } else {
        showToast(result?.data?.message || 'Failed to create admin', 'error');
    }
};


window.closeModal = () => {
    document.getElementById('modal-container').innerHTML = '';
    document.getElementById('modal-container').style.display = 'none';
};


window.previewImage = (input, previewId) => {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};


async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

function toISOStringOrNull(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}


document.getElementById('search-admins')?.addEventListener('input', (e) => {
    
    loadAdmins();
});

document.getElementById('filter-admins-role')?.addEventListener('change', (e) => {
    loadAdmins(1, e.target.value);
});


if (adminInfo.role !== 'super-admin') {
    const adminsNav = document.getElementById('admins-nav');
    if (adminsNav) adminsNav.style.display = 'none';
}


document.getElementById('create-event-btn')?.addEventListener('click', () => {
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Event</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="create-event-form" onsubmit="createNewEvent(event)">
                    <div class="form-group">
                        <label for="new-event-title">Title *</label>
                        <input type="text" id="new-event-title" required>
                    </div>
                    <div class="form-group">
                        <label for="new-event-category">Category *</label>
                        <select id="new-event-category" required>
                            <option value="">Select category...</option>
                            <option value="meeting">Meeting</option>
                            <option value="camping">Camping</option>
                            <option value="service">Service</option>
                            <option value="training">Training</option>
                            <option value="social">Social</option>
                            <option value="competition">Competition</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="new-event-description">Description *</label>
                        <textarea id="new-event-description" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="new-event-startDate">Start Date *</label>
                        <input type="datetime-local" id="new-event-startDate" required>
                    </div>
                    <div class="form-group">
                        <label for="new-event-endDate">End Date</label>
                        <input type="datetime-local" id="new-event-endDate">
                    </div>
                    <div class="form-group">
                        <label for="new-event-location">Location</label>
                        <input type="text" id="new-event-location" placeholder="e.g., Main Camp Ground">
                    </div>
                    <div class="form-group">
                        <label for="new-event-image">Event Image</label>
                        <input type="file" id="new-event-image" accept="image/*" onchange="previewImage(this, 'new-event-preview')">
                        <img id="new-event-preview" style="max-width: 200px; margin-top: 10px; display: none;">
                        <small style="color: #64748b; font-size: 12px;">Or enter image URL below</small>
                        <input type="url" id="new-event-imageUrl" placeholder="https://example.com/image.jpg" style="margin-top: 5px;">
                    </div>
                    <div class="form-group">
                        <label for="new-event-maxParticipants">Max Participants</label>
                        <input type="number" id="new-event-maxParticipants" min="1" placeholder="Leave empty for unlimited">
                    </div>
                    <div class="form-group">
                        <label for="new-event-cost">Cost (KES)</label>
                        <input type="number" id="new-event-cost" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="new-event-additionalInfo">Additional Info</label>
                        <textarea id="new-event-additionalInfo" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="new-event-requiresRegistration">
                            Requires Registration
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="new-event-registrationDeadline">Registration Deadline</label>
                        <input type="datetime-local" id="new-event-registrationDeadline">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="new-event-isFeatured">
                            Featured Event
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="new-event-isPublished" checked>
                            Publish immediately
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
});

window.createNewEvent = async (event) => {
    event.preventDefault();
    
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    
    let imageUrl = document.getElementById('new-event-imageUrl').value;
    const imageFile = document.getElementById('new-event-image').files[0];
    
    if (imageFile) {
        try {
            imageUrl = await fileToBase64(imageFile);
        } catch (error) {
            console.error('Error converting image:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            showModalNotification(
                'Image Processing Failed',
                'Failed to process the selected image. Please try again or use a different image.',
                'error'
            );
            return;
        }
    }
    
    const eventData = {
        title: document.getElementById('new-event-title').value,
        category: document.getElementById('new-event-category').value,
        description: document.getElementById('new-event-description').value,
        startDate: toISOStringOrNull(document.getElementById('new-event-startDate').value),
        endDate: toISOStringOrNull(document.getElementById('new-event-endDate').value),
        location: document.getElementById('new-event-location').value,
        imageUrl: imageUrl || undefined,
        maxParticipants: document.getElementById('new-event-maxParticipants').value || null,
        cost: document.getElementById('new-event-cost').value || 0,
        additionalInfo: document.getElementById('new-event-additionalInfo').value || undefined,
        requiresRegistration: document.getElementById('new-event-requiresRegistration').checked,
        registrationDeadline: toISOStringOrNull(document.getElementById('new-event-registrationDeadline').value),
        isFeatured: document.getElementById('new-event-isFeatured').checked,
        isPublished: document.getElementById('new-event-isPublished').checked
    };
    
    const result = await apiRequest(API_CONFIG.endpoints.events.base, {
        method: 'POST',
        body: JSON.stringify(eventData)
    });
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    
    if (result && result.data && result.data.success) {
        closeModal();
        clearFrontendCache(['events', 'home_events']); // Clear frontend events cache
        showModalNotification(
            'Event Created Successfully!',
            `The event "${eventData.title}" has been ${eventData.isPublished ? 'created and published' : 'saved as draft'}. It will appear in the events list.`,
            'success'
        );
        await loadEvents();
    } else {
        // Handle validation errors
        let errorMessage = 'An error occurred while creating the event. Please check your connection and try again.';
        
        if (result?.data?.errors && Array.isArray(result.data.errors)) {
            // Display validation errors
            errorMessage = result.data.errors.map(err => err.msg || err.message).join(', ');
        } else if (result?.data?.message) {
            errorMessage = result.data.message;
        }
        
        showModalNotification(
            'Event Creation Failed',
            errorMessage,
            'error'
        );
    }
};


document.getElementById('upload-gallery-btn')?.addEventListener('click', () => {
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Upload Gallery Image</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="upload-gallery-form" onsubmit="uploadGallery(event)">
                    <div class="form-group">
                        <label for="new-gallery-title">Title *</label>
                        <input type="text" id="new-gallery-title" required>
                    </div>
                    <div class="form-group">
                        <label for="new-gallery-description">Description</label>
                        <textarea id="new-gallery-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="new-gallery-category">Category *</label>
                        <select id="new-gallery-category" required>
                            <option value="">Select category...</option>
                            <option value="camping">Camping</option>
                            <option value="activities">Activities</option>
                            <option value="ceremonies">Ceremonies</option>
                            <option value="community-service">Community Service</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="new-gallery-image">Gallery Image *</label>
                        <input type="file" id="new-gallery-image" accept="image/*" onchange="previewImage(this, 'new-gallery-preview')">
                        <img id="new-gallery-preview" style="max-width: 300px; margin-top: 10px; display: none; border-radius: 8px;">
                        <small style="color: #64748b; font-size: 12px;">Or enter image URL below</small>
                        <input type="url" id="new-gallery-imageUrl" placeholder="https://example.com/image.jpg" style="margin-top: 5px;">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="new-gallery-isPublished" checked>
                            Publish immediately
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
});


window.uploadGallery = async (event) => {
    event.preventDefault();
    
    
    let imageUrl = document.getElementById('new-gallery-imageUrl').value;
    const imageFile = document.getElementById('new-gallery-image').files[0];
    
    if (imageFile) {
        try {
            imageUrl = await fileToBase64(imageFile);
        } catch (error) {
            console.error('Error converting image:', error);
            showToast('Failed to process image', 'error');
            return;
        }
    }
    
    if (!imageUrl) {
        showToast('Please upload an image or provide an image URL', 'error');
        return;
    }
    
    const galleryData = {
        title: document.getElementById('new-gallery-title').value,
        description: document.getElementById('new-gallery-description').value,
        category: document.getElementById('new-gallery-category').value,
        imageUrl: imageUrl,
        isPublished: document.getElementById('new-gallery-isPublished').checked
    };
    
    const result = await apiRequest(API_CONFIG.endpoints.gallery.base, {
        method: 'POST',
        body: JSON.stringify(galleryData)
    });
    
    if (result && result.data && result.data.success) {
        closeModal();
        clearFrontendCache(['gallery']); // Clear frontend gallery cache
        showModalNotification(
            'Gallery Item Uploaded!',
            `The gallery item "${galleryData.title}" has been uploaded successfully.`,
            'success'
        );
        loadGallery();
    } else {
        let errorMessage = 'Failed to upload gallery item. Please try again.';
        
        if (result?.data?.errors && Array.isArray(result.data.errors)) {
            errorMessage = result.data.errors.map(err => err.msg || err.message).join(', ');
        } else if (result?.data?.message) {
            errorMessage = result.data.message;
        }
        
        showModalNotification(
            'Upload Failed',
            errorMessage,
            'error'
        );
    }
};


document.getElementById('create-leader-btn')?.addEventListener('click', () => {
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Leader</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="create-leader-form" onsubmit="createLeader(event)">
                    <div class="form-group">
                        <label for="new-leader-name">Name *</label>
                        <input type="text" id="new-leader-name" required>
                    </div>
                    <div class="form-group">
                        <label for="new-leader-role">Role *</label>
                        <input type="text" id="new-leader-role" placeholder="e.g., Club Director" required>
                    </div>
                    <div class="form-group">
                        <label for="new-leader-bio">Bio *</label>
                        <textarea id="new-leader-bio" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="new-leader-photo">Leader Photo *</label>
                        <input type="file" id="new-leader-photo" accept="image/*" onchange="previewImage(this, 'new-leader-preview')">
                        <img id="new-leader-preview" style="max-width: 150px; height: 150px; object-fit: cover; border-radius: 50%; margin-top: 10px; display: none;">
                        <small style="color: #64748b; font-size: 12px;">Or enter photo URL below *</small>
                        <input type="url" id="new-leader-photoUrl" placeholder="https://example.com/photo.jpg" style="margin-top: 5px;">
                    </div>
                    <div class="form-group">
                        <label for="new-leader-email">Email</label>
                        <input type="email" id="new-leader-email">
                    </div>
                    <div class="form-group">
                        <label for="new-leader-phone">Phone</label>
                        <input type="tel" id="new-leader-phone">
                    </div>
                    <div class="form-group">
                        <label for="new-leader-order">Display Order</label>
                        <input type="number" id="new-leader-order" value="0" min="0">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="new-leader-isActive" checked>
                            Active
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Add Leader</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
});


window.createLeader = async (event) => {
    event.preventDefault();
    
    
    let photoUrl = document.getElementById('new-leader-photoUrl').value;
    const photoFile = document.getElementById('new-leader-photo').files[0];
    
    if (photoFile) {
        try {
            photoUrl = await fileToBase64(photoFile);
        } catch (error) {
            console.error('Error converting photo:', error);
            showToast('Failed to process photo', 'error');
            return;
        }
    }
    
    if (!photoUrl) {
        showToast('Please upload a photo or provide a photo URL', 'error');
        return;
    }
    
    const leaderData = {
        name: document.getElementById('new-leader-name').value,
        role: document.getElementById('new-leader-role').value,
        bio: document.getElementById('new-leader-bio').value,
        photoUrl: photoUrl,
        email: document.getElementById('new-leader-email').value || undefined,
        phone: document.getElementById('new-leader-phone').value || undefined,
        order: document.getElementById('new-leader-order').value || 0,
        isActive: document.getElementById('new-leader-isActive').checked
    };
    
    const result = await apiRequest(API_CONFIG.endpoints.leaders.base, {
        method: 'POST',
        body: JSON.stringify(leaderData)
    });
    
    if (result && result.data && result.data.success) {
        closeModal();
        clearFrontendCache(['leaders']); // Clear frontend leaders cache
        showModalNotification(
            'Leader Added Successfully!',
            `${leaderData.name} has been added to the leadership team.`,
            'success'
        );
        loadLeaders();
    } else {
        let errorMessage = 'Failed to add leader. Please try again.';
        
        if (result?.data?.errors && Array.isArray(result.data.errors)) {
            errorMessage = result.data.errors.map(err => err.msg || err.message).join(', ');
        } else if (result?.data?.message) {
            errorMessage = result.data.message;
        }
        
        showModalNotification(
            'Failed to Add Leader',
            errorMessage,
            'error'
        );
    }
};


window.viewLeader = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.leaders.adminById(id));
    if (!result || !result.data || !result.data.success) return;
    
    const leader = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Leader Details</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <img src="${leader.photoUrl}" alt="${leader.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin-bottom: 20px;">
                <div class="detail-group">
                    <label>Name</label>
                    <p>${leader.name}</p>
                </div>
                <div class="detail-group">
                    <label>Role</label>
                    <p>${leader.role}</p>
                </div>
                <div class="detail-group">
                    <label>Bio</label>
                    <p>${leader.bio}</p>
                </div>
                <div class="detail-group">
                    <label>Email</label>
                    <p>${leader.email || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Phone</label>
                    <p>${leader.phone || '-'}</p>
                </div>
                <div class="detail-group">
                    <label>Display Order</label>
                    <p>${leader.order}</p>
                </div>
                <div class="detail-group">
                    <label>Status</label>
                    <p><span class="status-badge status-${leader.isActive ? 'approved' : 'pending'}">${leader.isActive ? 'Active' : 'Inactive'}</span></p>
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" onclick="closeModal(); editLeader('${id}')">Edit</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};


window.editLeader = async (id) => {
    const result = await apiRequest(API_CONFIG.endpoints.leaders.adminById(id));
    if (!result || !result.data || !result.data.success) return;
    
    const leader = result.data.data;
    const modalHTML = `
        <div class="modal-backdrop" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Leader</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="edit-leader-form" onsubmit="saveLeaderChanges(event, '${id}')">
                    <div class="form-group">
                        <label for="leader-name">Name *</label>
                        <input type="text" id="leader-name" value="${leader.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="leader-role">Role *</label>
                        <input type="text" id="leader-role" value="${leader.role}" required>
                    </div>
                    <div class="form-group">
                        <label for="leader-bio">Bio *</label>
                        <textarea id="leader-bio" rows="4" required>${leader.bio}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="leader-photo">Leader Photo</label>
                        <input type="file" id="leader-photo" accept="image/*" onchange="previewImage(this, 'leader-preview')">
                        <img id="leader-preview" src="${leader.photoUrl}" style="max-width: 150px; height: 150px; object-fit: cover; border-radius: 50%; margin-top: 10px;">
                        <small style="color: #64748b; font-size: 12px;">Or enter photo URL below *</small>
                        <input type="url" id="leader-photoUrl" value="${leader.photoUrl}" placeholder="https://example.com/photo.jpg" style="margin-top: 5px;">
                    </div>
                    <div class="form-group">
                        <label for="leader-email">Email</label>
                        <input type="email" id="leader-email" value="${leader.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="leader-phone">Phone</label>
                        <input type="tel" id="leader-phone" value="${leader.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="leader-order">Display Order</label>
                        <input type="number" id="leader-order" value="${leader.order}" min="0">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="leader-isActive" ${leader.isActive ? 'checked' : ''}>
                            Active
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container').innerHTML = modalHTML;
    document.getElementById('modal-container').style.display = 'flex';
};


window.saveLeaderChanges = async (event, id) => {
    event.preventDefault();
    
    
    let photoUrl = document.getElementById('leader-photoUrl').value;
    const photoFile = document.getElementById('leader-photo').files[0];
    
    if (photoFile) {
        try {
            photoUrl = await fileToBase64(photoFile);
        } catch (error) {
            console.error('Error converting photo:', error);
            showToast('Failed to process photo', 'error');
            return;
        }
    }
    
    if (!photoUrl) {
        showToast('Please upload a photo or provide a photo URL', 'error');
        return;
    }
    
    const leaderData = {
        name: document.getElementById('leader-name').value,
        role: document.getElementById('leader-role').value,
        bio: document.getElementById('leader-bio').value,
        photoUrl: photoUrl,
        email: document.getElementById('leader-email').value || undefined,
        phone: document.getElementById('leader-phone').value || undefined,
        order: document.getElementById('leader-order').value,
        isActive: document.getElementById('leader-isActive').checked
    };
    
    const result = await apiRequest(`/leaders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leaderData)
    });
    
    if (result && result.data && result.data.success) {
        clearFrontendCache(['leaders']); // Clear frontend leaders cache
        showToast('Leader updated successfully', 'success');
        closeModal();
        loadLeaders();
    } else {
        showToast(result?.data?.message || 'Failed to update leader', 'error');
    }
};


window.deleteLeader = async (id) => {
    if (!confirm('Are you sure you want to delete this leader?')) return;
    const result = await apiRequest(`/leaders/${id}`, { method: 'DELETE' });
    if (result && result.data && result.data.success) {
        clearFrontendCache(['leaders']); // Clear frontend leaders cache
        showToast('Leader deleted', 'success');
        loadLeaders();
    }
};

