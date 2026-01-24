/**
 * Donations Management Module
 * Handles donation tracking and management
 */

import { showToast } from '../../core/notifications.js';

export class DonationsManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.currentPage = 1;
        this.currentStatus = '';
    }

    /**
     * Load donations list
     */
    async load(page = 1, status = '') {
        this.currentPage = page;
        this.currentStatus = status;
        
        const tbody = document.getElementById('donations-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading donations...</td></tr>';
        
        let url = `/donations?page=${page}&limit=10`;
        if (status) url += `&paymentStatus=${status}`;
        
        const result = await this.api.get(url);
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
                    <button class="btn-sm btn-view" onclick="donationsManager.view('${don._id}')">View</button>
                    <button class="btn-sm btn-edit" onclick="donationsManager.updateStatus('${don._id}')">Update</button>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * View donation details
     */
    async view(id) {
        const result = await this.api.get(`/donations/${id}`);
        if (!result || !result.data || !result.data.success) return;
        
        const donation = result.data.data;
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Donation Details</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
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
                        <button class="btn-secondary" onclick="window.closeModal()">Close</button>
                        <button class="btn-primary" onclick="window.closeModal(); donationsManager.updateStatus('${id}')">Update Status</button>
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
     * Update donation payment status
     */
    async updateStatus(id) {
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Update Payment Status</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="update-donation-form">
                        <div class="form-group">
                            <label for="donation-status">Payment Status *</label>
                            <select id="donation-status" class="form-control" required>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
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
            
            document.getElementById('update-donation-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const paymentStatus = document.getElementById('donation-status').value;
                
                const result = await this.api.patch(`/donations/${id}/status`, { paymentStatus });
                
                if (result && result.data && result.data.success) {
                    showToast('Payment status updated successfully', 'success');
                    window.closeModal();
                    this.load(this.currentPage, this.currentStatus);
                } else {
                    showToast(result?.data?.message || 'Failed to update status', 'error');
                }
            });
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('donations-pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        if (currentPage > 1) {
            html += `<button class="btn-pagination" onclick="donationsManager.load(${currentPage - 1}, '${this.currentStatus}')">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="btn-pagination" onclick="donationsManager.load(${i}, '${this.currentStatus}')">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        if (currentPage < totalPages) {
            html += `<button class="btn-pagination" onclick="donationsManager.load(${currentPage + 1}, '${this.currentStatus}')">Next</button>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}
