/**
 * Leaders Management Module
 * Handles leader profiles management
 */

import { showToast } from '../../core/notifications.js';
import { clearFrontendCache } from '../../core/cache.js';

export class LeadersManager {
    constructor(apiClient, apiConfig) {
        this.api = apiClient;
        this.apiConfig = apiConfig;
        this.currentPage = 1;
    }

    /**
     * Load leaders list
     */
    async load(page = 1) {
        this.currentPage = page;
        const tbody = document.getElementById('leaders-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading leaders...</td></tr>';
        
        const result = await this.api.get(`/leaders/admin/all?page=${page}&limit=10`);
        if (!result || !result.data || !result.data.success) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading leaders</td></tr>';
            return;
        }
        
        const leaders = result.data.data;
        
        // Update badge count
        const countElement = document.getElementById('leaders-count');
        if (countElement) {
            countElement.textContent = result.data.total || 0;
        }
        
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
                    <button class="btn-sm btn-view" onclick="leadersManager.view('${leader._id}')">View</button>
                    <button class="btn-sm btn-edit" onclick="leadersManager.edit('${leader._id}')">Edit</button>
                    <button class="btn-sm btn-delete" onclick="leadersManager.deleteSingle('${leader._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * View leader details
     */
    async view(id) {
        const result = await this.api.get(this.apiConfig.endpoints.leaders.adminById(id));
        if (!result || !result.data || !result.data.success) return;
        
        const leader = result.data.data;
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Leader Details</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
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
                        <button class="btn-secondary" onclick="window.closeModal()">Close</button>
                        <button class="btn-primary" onclick="window.closeModal(); leadersManager.edit('${id}')">Edit</button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            modalContainer.style.display = 'flex';
        }
    }

    /**
     * Edit leader (placeholder - full implementation would require form with file upload)
     */
    async edit(id) {
        showToast('Leader editing - Use legacy admin.js for now', 'info');
        // Note: Full edit functionality with photo upload is complex
        // Keeping in legacy admin.js for now
    }
    
    /**
     * Open create modal for new leader
     */
    openCreateModal() {
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Leader</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="create-leader-form">
                        <div class="form-group">
                            <label for="new-leader-name">Name *</label>
                            <input type="text" id="new-leader-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="new-leader-role">Role *</label>
                            <input type="text" id="new-leader-role" class="form-control" required 
                                   placeholder="e.g., Director, Deputy Director, Counselor">
                        </div>
                        <div class="form-group">
                            <label for="new-leader-bio">Bio *</label>
                            <textarea id="new-leader-bio" class="form-control" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="new-leader-email">Email</label>
                            <input type="email" id="new-leader-email" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="new-leader-phone">Phone</label>
                            <input type="tel" id="new-leader-phone" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="new-leader-photoUrl">Photo URL *</label>
                            <input type="url" id="new-leader-photoUrl" class="form-control" required 
                                   placeholder="https://example.com/photo.jpg">
                            <small style="color: #64748b; font-size: 12px;">Enter the full URL of the leader's photo</small>
                        </div>
                        <div class="form-group">
                            <label for="new-leader-order">Display Order</label>
                            <input type="number" id="new-leader-order" class="form-control" value="0" min="0">
                            <small style="color: #64748b; font-size: 12px;">Lower numbers appear first</small>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="new-leader-isActive" checked>
                                Active
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Add Leader</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            modalContainer.style.display = 'flex';
            
            document.getElementById('create-leader-form').addEventListener('submit', (e) => {
                this.submitCreateLeader(e);
            });
        }
    }
    
    /**
     * Submit create leader form
     */
    async submitCreateLeader(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        
        const leaderData = {
            name: document.getElementById('new-leader-name').value,
            role: document.getElementById('new-leader-role').value,
            bio: document.getElementById('new-leader-bio').value,
            email: document.getElementById('new-leader-email').value || undefined,
            phone: document.getElementById('new-leader-phone').value || undefined,
            photoUrl: document.getElementById('new-leader-photoUrl').value,
            order: parseInt(document.getElementById('new-leader-order').value) || 0,
            isActive: document.getElementById('new-leader-isActive').checked
        };
        
        const result = await this.api.post('/leaders', leaderData);
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (result && result.data && result.data.success) {
            window.closeModal();
            clearFrontendCache(['leaders']);
            showToast('Leader added successfully', 'success');
            this.load(1);
        } else {
            showToast(result?.data?.message || 'Failed to add leader', 'error');
        }
    }

    /**
     * Delete leader
     */
    async deleteSingle(id) {
        if (!confirm('Are you sure you want to delete this leader?')) return;
        
        const result = await this.api.delete(`/leaders/${id}`);
        if (result && result.data && result.data.success) {
            clearFrontendCache(['leaders']);
            showToast('Leader deleted', 'success');
            this.load(this.currentPage);
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('leaders-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        if (currentPage > 1) {
            html += `<button class="btn-pagination" onclick="leadersManager.load(${currentPage - 1})">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn-pagination" onclick="leadersManager.load(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        if (currentPage < totalPages) {
            html += `<button class="btn-pagination" onclick="leadersManager.load(${currentPage + 1})">Next</button>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}
