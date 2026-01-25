/**
 * Gallery Module - Image gallery with lightbox
 */

export class GalleryLightbox {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.galleryData = [];
        this.currentImageIndex = 0;
        this.isLoading = false;
        this.hasLoaded = false;
    }

    /**
     * Load gallery from API
     */
    async loadGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) {
            console.warn('Gallery grid element not found');
            return;
        }

        // Prevent multiple simultaneous loads
        if (this.isLoading) {
            console.log('Gallery already loading, skipping...');
            return;
        }

        // If already successfully loaded, don't reload
        if (this.hasLoaded && this.galleryData.length > 0) {
            console.log('Gallery already loaded, skipping...');
            return;
        }

        this.isLoading = true;

        try {
            console.log('Fetching gallery data...');
            const result = await this.apiClient.get('/gallery');
            console.log('Gallery API response:', result);
            
            if (result && result.success && result.data) {
                if (result.data.length > 0) {
                    this.galleryData = result.data;
                    this.renderGallery(galleryGrid);
                    this.hasLoaded = true;
                    this.initializeLightbox();
                    console.log(`✅ Successfully rendered ${result.data.length} gallery items`);
                } else {
                    console.log('No gallery items found');
                    if (!this.hasLoaded) {
                        this.renderEmptyState(galleryGrid);
                    }
                }
            } else {
                console.warn('Invalid gallery response structure:', result);
                if (!this.hasLoaded) {
                    this.renderEmptyState(galleryGrid);
                }
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            if (!this.hasLoaded) {
                this.renderErrorState(galleryGrid);
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render gallery grid
     */
    renderGallery(galleryGrid) {
        galleryGrid.innerHTML = this.galleryData.map((item, index) => `
            <button class="gallery-item fade-in" 
                    data-index="${index}" 
                    aria-label="Open image ${index + 1} in lightbox" 
                    style="animation-delay: ${index * 0.05}s">
                <img src="${item.imageUrl}" 
                     alt="${item.caption || 'Gallery image'}">
            </button>
        `).join('');
    }

    /**
     * Render empty state
     */
    renderEmptyState(galleryGrid) {
        const loader = galleryGrid.querySelector('.dynamic-loader');
        if (loader) loader.remove();
        
        galleryGrid.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" 
                     stroke-width="1.5" style="margin: 0 auto 1.5rem;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <h3 style="color: #6b7280; font-size: 1.25rem; margin-bottom: 0.5rem;">No Photos Yet</h3>
                <p style="color: #9ca3af;">Photos uploaded by the admin will appear here. Check back soon!</p>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderErrorState(galleryGrid) {
        const loader = galleryGrid.querySelector('.dynamic-loader');
        if (loader) loader.remove();
        
        galleryGrid.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" 
                     stroke-width="1.5" style="margin: 0 auto 1.5rem;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3 style="color: #ef4444; font-size: 1.25rem; margin-bottom: 0.5rem;">Failed to Load Gallery</h3>
                <p style="color: #9ca3af;">Unable to connect to the server. Please try again later.</p>
            </div>
        `;
    }

    /**
     * Initialize lightbox functionality
     */
    initializeLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        
        if (!lightbox) return;

        // Click handlers for gallery items
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-index'));
                this.openLightbox(index);
            });
        });

        // Close button
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        // Navigation buttons
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => this.showPrevImage());
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => this.showNextImage());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.showPrevImage();
            if (e.key === 'ArrowRight') this.showNextImage();
        });

        // Click backdrop to close
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });
    }

    /**
     * Open lightbox with specific image
     */
    openLightbox(index) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        
        if (!lightbox || this.galleryData.length === 0) return;
        
        this.currentImageIndex = index;
        lightboxImg.src = this.galleryData[index].imageUrl;
        lightboxImg.alt = this.galleryData[index].caption || 'Gallery image';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    /**
     * Close lightbox
     */
    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Show previous image in lightbox
     */
    showPrevImage() {
        const lightboxImg = document.getElementById('lightbox-img');
        this.currentImageIndex = this.currentImageIndex > 0 
            ? this.currentImageIndex - 1 
            : this.galleryData.length - 1;
        
        lightboxImg.src = this.galleryData[this.currentImageIndex].imageUrl;
        lightboxImg.alt = this.galleryData[this.currentImageIndex].caption || 'Gallery image';
    }

    /**
     * Show next image in lightbox
     */
    showNextImage() {
        const lightboxImg = document.getElementById('lightbox-img');
        this.currentImageIndex = this.currentImageIndex < this.galleryData.length - 1 
            ? this.currentImageIndex + 1 
            : 0;
        
        lightboxImg.src = this.galleryData[this.currentImageIndex].imageUrl;
        lightboxImg.alt = this.galleryData[this.currentImageIndex].caption || 'Gallery image';
    }
}
