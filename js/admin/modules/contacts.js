/**
 * Contacts Management Module
 * Handles contact form submissions and applications
 */

import { showToast } from '../../core/notifications.js';

export class ContactsManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.currentPage = 1;
        this.currentStatus = '';
    }

    /**
     * Load contacts list
     */
    async load(page = 1, status = '') {
        this.currentPage = page;
        this.currentStatus = status;
        
        const tbody = document.getElementById('contacts-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading contacts...</td></tr>';
        
        let url = `/contacts?page=${page}&limit=10`;
        if (status) url += `&status=${status}`;
        
        const result = await this.api.get(url);
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
                    <button class="btn-sm btn-view" onclick="contactsManager.view('${contact._id}')">View</button>
                    <button class="btn-sm btn-edit" onclick="contactsManager.updateStatus('${contact._id}')">Update</button>
                    <button class="btn-sm btn-delete" onclick="contactsManager.deleteSingle('${contact._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * View contact details
     */
    async view(id) {
        const result = await this.api.get(`/contacts/${id}`);
        if (!result || !result.data || !result.data.success) return;
        
        const contact = result.data.data;
        const statusColors = {
            pending: '#f59e0b',
            reviewed: '#3b82f6',
            approved: '#10b981',
            rejected: '#ef4444'
        };
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Contact Application</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="status-banner" style="background: ${statusColors[contact.status] || '#64748b'}15; border-left: 4px solid ${statusColors[contact.status] || '#64748b'}; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
                        <span style="font-weight: 600; color: ${statusColors[contact.status] || '#64748b'}; text-transform: capitalize;">${contact.status}</span>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-card">
                            <label>Applicant Name</label>
                            <p>${contact.name}</p>
                        </div>
                        <div class="detail-card">
                            <label>Guardian Name</label>
                            <p>${contact.guardian}</p>
                        </div>
                        <div class="detail-card">
                            <label>Email Address</label>
                            <p>${contact.email}</p>
                        </div>
                        <div class="detail-card">
                            <label>Phone Number</label>
                            <p>${contact.phone}</p>
                        </div>
                        <div class="detail-card">
                            <label>Age</label>
                            <p>${contact.age} years</p>
                        </div>
                        <div class="detail-card">
                            <label>Consent Status</label>
                            <p style="color: ${contact.consent ? '#10b981' : '#ef4444'}; font-weight: 600;">${contact.consent ? '✓ Consent Given' : '✗ No Consent'}</p>
                        </div>
                    </div>
                    ${contact.message ? `
                    <div class="message-section">
                        <label>Message</label>
                        <div class="message-box">
                            <p>${contact.message}</p>
                        </div>
                    </div>` : ''}
                    <div class="detail-footer">
                        <p style="color: #64748b; font-size: 13px;">Submitted ${new Date(contact.createdAt).toLocaleString()}</p>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="window.closeModal()">Close</button>
                        <button class="btn-primary" onclick="window.closeModal(); contactsManager.updateStatus('${id}')">Update Status</button>
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
     * Update contact status
     */
    async updateStatus(id) {
        const result = await this.api.get(`/contacts/${id}`);
        const currentStatus = result?.data?.data?.status || 'pending';
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Update Application Status</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="update-status-form">
                        <div class="form-group">
                            <label for="contact-status">Application Status *</label>
                            <select id="contact-status" name="status" class="form-control" required>
                                <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="reviewed" ${currentStatus === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                                <option value="approved" ${currentStatus === 'approved' ? 'selected' : ''}>Approved</option>
                                <option value="rejected" ${currentStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Update Status</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            modalContainer.style.display = 'flex';
            
            document.getElementById('update-status-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const status = document.getElementById('contact-status').value;
                
                const updateResult = await this.api.patch(`/contacts/${id}/status`, { status });
                
                if (updateResult && updateResult.data && updateResult.data.success) {
                    showToast('Status updated successfully', 'success');
                    window.closeModal();
                    this.load(this.currentPage, this.currentStatus);
                } else {
                    showToast(updateResult?.data?.message || 'Failed to update status', 'error');
                }
            });
        }
    }

    /**
     * Delete contact
     */
    async deleteSingle(id) {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        
        const result = await this.api.delete(`/contacts/${id}`);
        if (result && result.data && result.data.success) {
            showToast('Contact deleted successfully', 'success');
            this.load(this.currentPage, this.currentStatus);
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('contacts-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        if (currentPage > 1) {
            html += `<button class="btn-pagination" onclick="contactsManager.load(${currentPage - 1}, '${this.currentStatus}')">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn-pagination" onclick="contactsManager.load(${i}, '${this.currentStatus}')">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        if (currentPage < totalPages) {
            html += `<button class="btn-pagination" onclick="contactsManager.load(${currentPage + 1}, '${this.currentStatus}')">Next</button>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}
