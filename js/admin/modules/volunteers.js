/**
 * Volunteers Management Module
 * Handles volunteer application management
 */

import { showToast } from '../../core/notifications.js';

export class VolunteersManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.currentPage = 1;
    }

    /**
     * Load volunteers list
     */
    async load(page = 1) {
        this.currentPage = page;
        const tbody = document.getElementById('volunteers-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading volunteers...</td></tr>';
        
        const result = await this.api.get(`/volunteers?page=${page}&limit=10`);
        if (!result || !result.data || !result.data.success) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading volunteers</td></tr>';
            return;
        }
        
        const volunteers = result.data.data;
        
        // Update badge count
        const countElement = document.getElementById('volunteers-count');
        if (countElement) {
            countElement.textContent = result.data.total || 0;
        }
        
        if (volunteers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No volunteers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = volunteers.map(volunteer => `
            <tr>
                <td>${volunteer.name}</td>
                <td>${volunteer.email}</td>
                <td>${volunteer.phone}</td>
                <td>${volunteer.age}</td>
                <td><span class="interests-badge">${volunteer.interests.length} areas</span></td>
                <td><span class="status-badge status-${volunteer.status}">${volunteer.status}</span></td>
                <td>${new Date(volunteer.submittedAt).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="btn-sm btn-view" onclick="volunteersManager.view('${volunteer._id}')">View</button>
                    <button class="btn-sm btn-edit" onclick="volunteersManager.updateStatus('${volunteer._id}')">Status</button>
                    <button class="btn-sm btn-delete" onclick="volunteersManager.deleteSingle('${volunteer._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * View volunteer details
     */
    async view(id) {
        const result = await this.api.get(`/volunteers/${id}`);
        if (!result || !result.data || !result.data.success) {
            showToast('Failed to load volunteer details', 'error');
            return;
        }
        
        const volunteer = result.data.data;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog" style="max-width: 700px;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Volunteer Details</h2>
                        <button class="btn-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div class="detail-section">
                            <h3>Personal Information</h3>
                            <div class="detail-grid">
                                <div class="detail-item"><strong>Name:</strong> <span>${volunteer.name}</span></div>
                                <div class="detail-item"><strong>Email:</strong> <span>${volunteer.email}</span></div>
                                <div class="detail-item"><strong>Phone:</strong> <span>${volunteer.phone}</span></div>
                                <div class="detail-item"><strong>Age:</strong> <span>${volunteer.age}</span></div>
                                ${volunteer.occupation ? `<div class="detail-item"><strong>Occupation:</strong> <span>${volunteer.occupation}</span></div>` : ''}
                                ${volunteer.address ? `<div class="detail-item"><strong>Address:</strong> <span>${volunteer.address}</span></div>` : ''}
                                <div class="detail-item"><strong>Status:</strong> <span class="status-badge status-${volunteer.status}">${volunteer.status}</span></div>
                                <div class="detail-item"><strong>Submitted:</strong> <span>${new Date(volunteer.submittedAt).toLocaleString()}</span></div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Volunteer Interests</h3>
                            <div class="interests-list">
                                ${volunteer.interests.map(interest => {
                                    const labels = {
                                        'honor-classes': 'Lead Honor Classes',
                                        'camping-trips': 'Chaperone Camping Trips',
                                        'administrative': 'Administrative Tasks',
                                        'mentoring': 'Mentoring Pathfinders',
                                        'fundraising': 'Fundraising Events',
                                        'community-service': 'Community Service Projects',
                                        'other': 'Other'
                                    };
                                    return `<span class="interest-tag">${labels[interest] || interest}</span>`;
                                }).join('')}
                            </div>
                        </div>
                        
                        ${volunteer.skills ? `
                        <div class="detail-section">
                            <h3>Skills & Expertise</h3>
                            <p>${volunteer.skills}</p>
                        </div>` : ''}
                        
                        <div class="detail-section">
                            <h3>Availability</h3>
                            <p>${volunteer.availability}</p>
                        </div>
                        
                        ${volunteer.experience ? `
                        <div class="detail-section">
                            <h3>Previous Experience</h3>
                            <p>${volunteer.experience}</p>
                        </div>` : ''}
                        
                        ${volunteer.message ? `
                        <div class="detail-section">
                            <h3>Additional Information</h3>
                            <p>${volunteer.message}</p>
                        </div>` : ''}
                        
                        ${volunteer.notes ? `
                        <div class="detail-section">
                            <h3>Admin Notes</h3>
                            <p>${volunteer.notes}</p>
                        </div>` : ''}
                        
                        <div class="detail-section">
                            <div class="detail-item">
                                <strong>Background Check Consent:</strong>
                                <span class="status-badge status-${volunteer.backgroundCheck ? 'approved' : 'rejected'}">
                                    ${volunteer.backgroundCheck ? 'Provided' : 'Not Provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button class="btn-primary" onclick="volunteersManager.updateStatus('${volunteer._id}'); this.closest('.modal-overlay').remove();">Update Status</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Update volunteer status
     */
    async updateStatus(id) {
        const result = await this.api.get(`/volunteers/${id}`);
        if (!result || !result.data || !result.data.success) {
            showToast('Failed to load volunteer details', 'error');
            return;
        }
        
        const volunteer = result.data.data;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Update Volunteer Status</h2>
                        <button class="btn-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <form id="update-volunteer-status-form">
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Volunteer: ${volunteer.name}</label>
                            </div>
                            <div class="form-group">
                                <label for="volunteer-status">Status</label>
                                <select id="volunteer-status" name="status" class="form-control" required>
                                    <option value="pending" ${volunteer.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="reviewed" ${volunteer.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                                    <option value="approved" ${volunteer.status === 'approved' ? 'selected' : ''}>Approved</option>
                                    <option value="active" ${volunteer.status === 'active' ? 'selected' : ''}>Active</option>
                                    <option value="rejected" ${volunteer.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="volunteer-notes">Admin Notes</label>
                                <textarea id="volunteer-notes" name="notes" class="form-control" rows="4" placeholder="Add any notes about this volunteer...">${volunteer.notes || ''}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Update Status</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('update-volunteer-status-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const status = document.getElementById('volunteer-status').value;
            const notes = document.getElementById('volunteer-notes').value;
            
            const updateResult = await this.api.patch(`/volunteers/${id}/status`, { status, notes });
            
            if (updateResult && updateResult.data && updateResult.data.success) {
                showToast('Volunteer status updated successfully', 'success');
                modal.remove();
                this.load(this.currentPage);
            } else {
                showToast(updateResult.data?.message || 'Failed to update volunteer status', 'error');
            }
        });
    }

    /**
     * Delete volunteer
     */
    async deleteSingle(id) {
        if (!confirm('Are you sure you want to delete this volunteer application? This action cannot be undone.')) {
            return;
        }
        
        const result = await this.api.delete(`/volunteers/${id}`);
        
        if (result && result.data && result.data.success) {
            showToast('Volunteer deleted successfully', 'success');
            this.load(this.currentPage);
        } else {
            showToast(result.data?.message || 'Failed to delete volunteer', 'error');
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('volunteers-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        if (currentPage > 1) {
            html += `<button class="btn-pagination" onclick="volunteersManager.load(${currentPage - 1})">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn-pagination" onclick="volunteersManager.load(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        if (currentPage < totalPages) {
            html += `<button class="btn-pagination" onclick="volunteersManager.load(${currentPage + 1})">Next</button>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}
