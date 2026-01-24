/**
 * Newsletter Management Module
 * Handles newsletter subscribers
 */

import { showToast } from '../../core/notifications.js';

export class NewsletterManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.currentPage = 1;
        this.currentFilter = '';
    }

    /**
     * Load newsletter subscribers
     */
    async load(page = 1, isActive = '') {
        this.currentPage = page;
        this.currentFilter = isActive;
        
        const tbody = document.getElementById('newsletter-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading subscribers...</td></tr>';
        
        let url = `/newsletter?page=${page}&limit=10`;
        if (isActive) url += `&isActive=${isActive}`;
        
        const result = await this.api.get(url);
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
                    <button class="btn-sm btn-delete" onclick="newsletterManager.deleteSingle('${sub._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * Delete subscriber
     */
    async deleteSingle(id) {
        if (!confirm('Are you sure you want to delete this subscriber?')) return;
        
        const result = await this.api.delete(`/newsletter/${id}`);
        if (result && result.data && result.data.success) {
            showToast('Subscriber deleted successfully', 'success');
            this.load(this.currentPage, this.currentFilter);
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('newsletter-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        if (currentPage > 1) {
            html += `<button class="btn-pagination" onclick="newsletterManager.load(${currentPage - 1}, '${this.currentFilter}')">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn-pagination" onclick="newsletterManager.load(${i}, '${this.currentFilter}')">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        if (currentPage < totalPages) {
            html += `<button class="btn-pagination" onclick="newsletterManager.load(${currentPage + 1}, '${this.currentFilter}')">Next</button>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}
