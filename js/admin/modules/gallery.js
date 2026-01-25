/**
 * Gallery Management Module
 * Handles admin gallery operations including multi-select delete
 */

import { showToast, showConfirmDialog } from '../../core/notifications.js';
import { clearFrontendCache, debounce } from '../../core/cache.js';

export class GalleryManager {
    constructor(apiClient, apiConfig) {
        this.api = apiClient;
        this.apiConfig = apiConfig;
        this.selectedItems = new Set();
        this.currentPage = 1;
        this.currentCategory = '';
        
        // Create debounced load function for better performance
        this.debouncedLoad = debounce((page, category) => {
            this.load(page, category);
        }, 300);
    }

    /**
     * Load gallery items
     */
    async load(page = 1, category = '') {
        this.currentPage = page;
        this.currentCategory = category;
        
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '<div class="loading">Loading gallery...</div>';
        
        let url = `${this.apiConfig.endpoints.gallery.adminAll}?page=${page}&limit=12`;
        if (category) url += `&category=${category}`;
        
        const result = await this.api.request(url);
        if (!result || !result.data || !result.data.success) {
            grid.innerHTML = '<div class="text-center">Error loading gallery</div>';
            return;
        }
        
        const items = result.data.data;
        
        // Update badge count
        const countElement = document.getElementById('gallery-count');
        if (countElement) {
            countElement.textContent = result.data.total || 0;
        }
        
        if (items.length === 0) {
            grid.innerHTML = '<div class="text-center">No gallery items found</div>';
            const selectionBar = document.getElementById('gallery-selection-bar');
            if (selectionBar) selectionBar.style.display = 'none';
            return;
        }
        
        // Show selection bar when items are loaded
        const selectionBar = document.getElementById('gallery-selection-bar');
        if (selectionBar) selectionBar.style.display = 'block';
        
        grid.innerHTML = items.map(item => `
            <div class="gallery-item" data-id="${item._id}">
                <div class="gallery-item-checkbox">
                    <input type="checkbox" class="gallery-checkbox" data-id="${item._id}">
                </div>
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="gallery-item-overlay">
                    <button class="btn-sm" onclick="galleryManager.view('${item._id}')">View</button>
                    <button class="btn-sm btn-edit" onclick="galleryManager.edit('${item._id}')">Edit</button>
                    <button class="btn-sm btn-delete" onclick="galleryManager.deleteSingle('${item._id}')">Delete</button>
                </div>
            </div>
        `).join('');
        
        // Attach checkbox event listeners
        this.attachCheckboxListeners();
        
        // Render pagination
        this.renderPagination(result.data.currentPage, result.data.totalPages);
    }

    /**
     * Attach checkbox event listeners
     */
    attachCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.gallery-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelection());
        });
        
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-gallery');
        if (selectAllCheckbox) {
            // Remove old listeners by cloning
            selectAllCheckbox.replaceWith(selectAllCheckbox.cloneNode(true));
            const newSelectAll = document.getElementById('select-all-gallery');
            newSelectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.gallery-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
                this.updateSelection();
            });
        }
    }

    /**
     * Update selection state
     */
    updateSelection() {
        const checkboxes = document.querySelectorAll('.gallery-checkbox');
        const checkedBoxes = document.querySelectorAll('.gallery-checkbox:checked');
        const selectAllCheckbox = document.getElementById('select-all-gallery');
        const deleteBtn = document.getElementById('delete-selected-gallery-btn');
        const selectedCount = document.getElementById('selected-count');
        
        // Update select all checkbox state
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
        }
        
        // Show/hide delete button and update count
        if (checkedBoxes.length > 0) {
            if (deleteBtn) deleteBtn.style.display = 'flex';
            if (selectedCount) selectedCount.textContent = checkedBoxes.length;
        } else {
            if (deleteBtn) deleteBtn.style.display = 'none';
        }
    }

    /**
     * Delete selected gallery items
     */
    async deleteSelected() {
        const checkedBoxes = document.querySelectorAll('.gallery-checkbox:checked');
        const selectedIds = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
        
        if (selectedIds.length === 0) {
            showToast('No items selected', 'error');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected item(s)? This action cannot be undone.`)) {
            return;
        }
        
        const deleteBtn = document.getElementById('delete-selected-gallery-btn');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<span>Deleting...</span>';
        
        let successCount = 0;
        let errorCount = 0;
        
        // Delete items one by one
        for (const id of selectedIds) {
            const result = await this.api.delete(`/gallery/${id}`);
            if (result && result.data && result.data.success) {
                successCount++;
            } else {
                errorCount++;
            }
        }
        
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = originalText;
        
        // Show results
        if (errorCount === 0) {
            showToast(`Successfully deleted ${successCount} item(s)`, 'success');
            clearFrontendCache(['gallery']);
        } else {
            showToast(`Deleted ${successCount} item(s), ${errorCount} failed`, 'error');
        }
        
        // Reload gallery
        this.load(1, this.currentCategory);
    }

    /**
     * View gallery item details
     */
    async view(id) {
        const result = await this.api.get(this.apiConfig.endpoints.gallery.adminById(id));
        if (!result || !result.data || !result.data.success) return;
        
        const item = result.data.data;
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Gallery Item Details</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
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
     * Edit gallery item
     */
    async edit(id) {
        const result = await this.api.get(this.apiConfig.endpoints.gallery.adminById(id));
        if (!result || !result.data || !result.data.success) return;
        
        const item = result.data.data;
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Gallery Item</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="edit-gallery-form">
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
                            <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            modalContainer.style.display = 'flex';
            
            // Attach form submit handler
            document.getElementById('edit-gallery-form').addEventListener('submit', (e) => {
                this.saveChanges(e, id);
            });
        }
    }

    /**
     * Save gallery changes
     */
    async saveChanges(event, id) {
        event.preventDefault();
        
        const galleryData = {
            title: document.getElementById('gallery-title').value,
            description: document.getElementById('gallery-description').value,
            category: document.getElementById('gallery-category').value,
            isPublished: document.getElementById('gallery-isPublished').checked
        };
        
        const result = await this.api.patch(`/gallery/${id}`, galleryData);
        
        if (result && result.data && result.data.success) {
            clearFrontendCache(['gallery']);
            showToast('Gallery item updated successfully', 'success');
            window.closeModal();
            this.load(this.currentPage, this.currentCategory);
        } else {
            showToast(result?.data?.message || 'Failed to update gallery item', 'error');
        }
    }

    /**
     * Delete single gallery item
     */
    async deleteSingle(id) {
        if (!confirm('Are you sure you want to delete this gallery item?')) return;
        
        const result = await this.api.delete(`/gallery/${id}`);
        if (result && result.data && result.data.success) {
            clearFrontendCache(['gallery']);
            showToast('Gallery item deleted', 'success');
            this.load(this.currentPage, this.currentCategory);
        }
    }

    /**
     * Render pagination
     */
    renderPagination(currentPage, totalPages) {
        const container = document.getElementById('gallery-pagination');
        if (!container) return;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `<button class="btn-pagination" onclick="galleryManager.load(${currentPage - 1}, '${this.currentCategory}')">Previous</button>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="btn-pagination active">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += `<button class="btn-pagination" onclick="galleryManager.load(${i}, '${this.currentCategory}')">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `<button class="btn-pagination" onclick="galleryManager.load(${currentPage + 1}, '${this.currentCategory}')">Next</button>`;
        }
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }
    
    /**
     * Open upload modal for new gallery item
     */
    openUploadModal() {
        const modalHTML = `
            <div class="modal-backdrop" onclick="window.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Upload Gallery Image</h2>
                    <button class="modal-close" onclick="window.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="upload-gallery-form">
                        <div class="form-group">
                            <label for="new-gallery-title">Title *</label>
                            <input type="text" id="new-gallery-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="new-gallery-description">Description</label>
                            <textarea id="new-gallery-description" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="new-gallery-category">Category *</label>
                            <select id="new-gallery-category" class="form-control" required>
                                <option value="">Select category...</option>
                                <option value="activities">Activities</option>
                                <option value="camping">Camping</option>
                                <option value="awards">Awards & Achievements</option>
                                <option value="events">Events</option>
                                <option value="team">Team</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="new-gallery-imageUrl">Image URL *</label>
                            <input type="url" id="new-gallery-imageUrl" class="form-control" required 
                                   placeholder="https://example.com/image.jpg">
                            <small style="color: #64748b; font-size: 12px;">Enter the full URL of the image</small>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="new-gallery-isFeatured">
                                Featured Image
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) {
            modalContainer.innerHTML = modalHTML;
            modalContainer.style.display = 'flex';
            
            document.getElementById('upload-gallery-form').addEventListener('submit', (e) => {
                this.submitGalleryUpload(e);
            });
        }
    }
    
    /**
     * Submit gallery upload form
     */
    async submitGalleryUpload(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        
        const galleryData = {
            title: document.getElementById('new-gallery-title').value,
            description: document.getElementById('new-gallery-description').value || undefined,
            category: document.getElementById('new-gallery-category').value,
            imageUrl: document.getElementById('new-gallery-imageUrl').value,
            isFeatured: document.getElementById('new-gallery-isFeatured').checked
        };
        
        const result = await this.api.post('/gallery', galleryData);
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (result && result.data && result.data.success) {
            window.closeModal();
            clearFrontendCache(['gallery']);
            showToast('Gallery image uploaded successfully', 'success');
            this.load(1, this.currentCategory);
        } else {
            showToast(result?.data?.message || 'Failed to upload image', 'error');
        }
    }
}
