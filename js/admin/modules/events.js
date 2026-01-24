/**
 * Events Management Module
 * Handles event CRUD operations and registration management
 */

import { showToast, showModalNotification, closeNotificationModal } from '../../core/notifications.js';
import { clearFrontendCache } from '../../core/cache.js';

export class EventsManager {
    constructor(apiClient, apiConfig) {
        this.api = apiClient;
        this.apiConfig = apiConfig;
        this.currentPage = 1;
    }

    /**
     * Load events list
     */
    async load(page = 1) {
        this.currentPage = page;
        const tbody = document.getElementById('events-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading events...</td></tr>';
        
        const result = await this.api.get(`/events/admin/all?page=${page}&limit=10`);
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
                    <button class="btn-sm btn-view" onclick="eventsManager.view('${event._id}')">View</button>
                    <button class="btn-sm btn-edit" onclick="eventsManager.edit('${event._id}')">Edit</button>
                    <button class="btn-sm btn-delete" onclick="eventsManager.deleteSingle('${event._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * View event details
     */
    async view(id) {
        const result = await this.api.get(this.apiConfig.endpoints.events.adminById(id));
        if (!result || !result.data || !result.data.success) return;
        
        const event = result.data.data;
        
        // Fetch registration stats if enabled
        let registrationStats = '';
        if (event.requiresRegistration) {
            const regResult = await this.api.get(`/event-registrations/event/${id}`);
            if (regResult && regResult.data && regResult.data.success) {
                const stats = regResult.data.stats;
                registrationStats = `
                    <div class="detail-group">
                        <label>Registrations</label>
                        <p>${stats.total} total (${stats.confirmed} confirmed, ${stats.pending} pending)</p>
                        <button class="btn-sm btn-view" onclick="eventsManager.viewRegistrations('${id}', '${event.title.replace(/'/g, "\\'")}')" style="margin-top: 8px;">View Registrations</button>
                    </div>
                `;
            }
        }
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Event Details</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
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
                        <label>Registration Required</label>
                        <p>${event.requiresRegistration ? 'Yes' : 'No'}</p>
                    </div>
                    ${event.requiresRegistration ? `
                        <div class="detail-group">
                            <label>Registration Deadline</label>
                            <p>${event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleString() : '-'}</p>
                        </div>
                    ` : ''}
                    ${event.cost > 0 ? `
                        <div class="detail-group">
                            <label>Cost</label>
                            <p>KES ${event.cost.toLocaleString()}</p>
                        </div>
                    ` : ''}
                    ${registrationStats}
                    <div class="detail-group">
                        <label>Max Participants</label>
                        <p>${event.maxParticipants || 'Unlimited'}</p>
                    </div>
                    <div class="detail-group">
                        <label>Status</label>
                        <p>${event.isPublished ? 'Published' : 'Draft'}</p>
                    </div>
                    <div class="form-actions">
                        <button class="btn-secondary" onclick="window.closeModal()">Close</button>
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
     * View event registrations
     */
    async viewRegistrations(eventId, eventTitle) {
        const result = await this.api.get(`/event-registrations/event/${eventId}`);
        if (!result || !result.data || !result.data.success) {
            showToast('Failed to load registrations', 'error');
            return;
        }
        
        const registrations = result.data.data;
        const stats = result.data.stats;
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h2>Registrations for: ${eventTitle}</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="stats-summary" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="stat-box" style="background: #f3f4f6; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #667eea;">${stats.total}</div>
                            <div style="color: #6b7280; font-size: 0.9rem;">Total</div>
                        </div>
                        <div class="stat-box" style="background: #f3f4f6; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #10b981;">${stats.confirmed}</div>
                            <div style="color: #6b7280; font-size: 0.9rem;">Confirmed</div>
                        </div>
                        <div class="stat-box" style="background: #f3f4f6; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">${stats.pending}</div>
                            <div style="color: #6b7280; font-size: 0.9rem;">Pending</div>
                        </div>
                    </div>
                    
                    ${registrations.length === 0 ? '<p style="text-align: center; color: #6b7280;">No registrations yet</p>' : `
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Age</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${registrations.map(reg => `
                                        <tr>
                                            <td>${reg.name}</td>
                                            <td>${reg.email}</td>
                                            <td>${reg.phone}</td>
                                            <td>${reg.age}</td>
                                            <td><span class="status-badge status-${reg.status}">${reg.status}</span></td>
                                            <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
                                            <td class="table-actions">
                                                <button class="btn-sm btn-view" onclick="eventsManager.viewRegistrationDetails('${reg._id}')">View</button>
                                                <button class="btn-sm btn-edit" onclick="eventsManager.updateRegistrationStatus('${reg._id}')">Update</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="window.closeModal()">Close</button>
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
     * View registration details
     */
    async viewRegistrationDetails(id) {
        const result = await this.api.get(`/event-registrations/${id}`);
        if (!result || !result.data || !result.data.success) {
            showToast('Failed to load registration details', 'error');
            return;
        }
        
        const reg = result.data.data;
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Registration Details</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                    <div class="detail-section">
                        <h3>Participant Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item"><strong>Name:</strong> <span>${reg.name}</span></div>
                            <div class="detail-item"><strong>Age:</strong> <span>${reg.age}</span></div>
                            <div class="detail-item"><strong>Email:</strong> <span>${reg.email}</span></div>
                            <div class="detail-item"><strong>Phone:</strong> <span>${reg.phone}</span></div>
                            ${reg.guardian ? `<div class="detail-item"><strong>Guardian:</strong> <span>${reg.guardian}</span></div>` : ''}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Emergency Contact</h3>
                        <div class="detail-grid">
                            <div class="detail-item"><strong>Name:</strong> <span>${reg.emergencyContact.name}</span></div>
                            <div class="detail-item"><strong>Phone:</strong> <span>${reg.emergencyContact.phone}</span></div>
                            <div class="detail-item"><strong>Relationship:</strong> <span>${reg.emergencyContact.relationship}</span></div>
                        </div>
                    </div>
                    
                    ${reg.medicalInfo ? `
                        <div class="detail-section">
                            <h3>Medical Information</h3>
                            <p>${reg.medicalInfo}</p>
                        </div>
                    ` : ''}
                    
                    ${reg.dietaryRestrictions ? `
                        <div class="detail-section">
                            <h3>Dietary Restrictions</h3>
                            <p>${reg.dietaryRestrictions}</p>
                        </div>
                    ` : ''}
                    
                    ${reg.message ? `
                        <div class="detail-section">
                            <h3>Additional Notes</h3>
                            <p>${reg.message}</p>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <div class="detail-item"><strong>Status:</strong> <span class="status-badge status-${reg.status}">${reg.status}</span></div>
                        <div class="detail-item"><strong>Payment Status:</strong> <span class="status-badge status-${reg.paymentStatus}">${reg.paymentStatus}</span></div>
                        <div class="detail-item"><strong>Registered:</strong> <span>${new Date(reg.registeredAt).toLocaleString()}</span></div>
                    </div>
                    
                    ${reg.notes ? `
                        <div class="detail-section">
                            <h3>Admin Notes</h3>
                            <p>${reg.notes}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="window.closeModal()">Close</button>
                    <button class="btn-primary" onclick="eventsManager.updateRegistrationStatus('${reg._id}')">Update Status</button>
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
     * Update registration status
     */
    async updateRegistrationStatus(id) {
        const result = await this.api.get(`/event-registrations/${id}`);
        if (!result || !result.data || !result.data.success) {
            showToast('Failed to load registration', 'error');
            return;
        }
        
        const reg = result.data.data;
        
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Update Registration Status</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <form id="update-registration-form">
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Participant: ${reg.name}</label>
                        </div>
                        <div class="form-group">
                            <label for="reg-status">Status</label>
                            <select id="reg-status" name="status" class="form-control" required>
                                <option value="pending" ${reg.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${reg.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="cancelled" ${reg.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                <option value="attended" ${reg.status === 'attended' ? 'selected' : ''}>Attended</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="reg-payment">Payment Status</label>
                            <select id="reg-payment" name="paymentStatus" class="form-control">
                                <option value="not-required" ${reg.paymentStatus === 'not-required' ? 'selected' : ''}>Not Required</option>
                                <option value="pending" ${reg.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="paid" ${reg.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                                <option value="refunded" ${reg.paymentStatus === 'refunded' ? 'selected' : ''}>Refunded</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="reg-notes">Admin Notes</label>
                            <textarea id="reg-notes" name="notes" class="form-control" rows="4">${reg.notes || ''}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Update</button>
                    </div>
                </form>
            </div>
        `;
        
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            modalContainer.style.display = 'flex';
            
            document.getElementById('update-registration-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const status = document.getElementById('reg-status').value;
                const paymentStatus = document.getElementById('reg-payment').value;
                const notes = document.getElementById('reg-notes').value;
                
                const updateResult = await this.api.patch(`/event-registrations/${id}/status`, {
                    status, paymentStatus, notes
                });
                
                if (updateResult && updateResult.data && updateResult.data.success) {
                    showToast('Registration updated successfully', 'success');
                    closeNotificationModal();
                } else {
                    showToast(updateResult.data?.message || 'Failed to update registration', 'error');
                }
            });
        }
    }

    /**
     * Delete event
     */
    async deleteSingle(id) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        
        const result = await this.api.delete(`/events/${id}`);
        if (result && result.data && result.data.success) {
            const row = document.querySelector(`#events-tbody tr[data-event-id="${id}"]`);
            if (row) row.remove();
            
            clearFrontendCache(['events', 'home_events']);
            showToast('Event deleted', 'success');
            await this.load(this.currentPage);
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('events-pagination');
        if (!container) return;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination">';
        
        if (currentPage > 1) {
            paginationHTML += `<button class="btn-pagination" onclick="eventsManager.load(${currentPage - 1})">Previous</button>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += `<button class="btn-pagination" onclick="eventsManager.load(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        if (currentPage < totalPages) {
            paginationHTML += `<button class="btn-pagination" onclick="eventsManager.load(${currentPage + 1})">Next</button>`;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }
}
