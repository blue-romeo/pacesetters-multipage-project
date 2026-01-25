/**
 * Leaders Module - Load and display club leaders
 */

export class LeadersDisplay {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.isLoading = false;
        this.hasLoaded = false;
        this.leadersData = [];
    }

    /**
     * Load leaders from API
     */
    async loadLeaders() {
        const leadershipGrid = document.getElementById('leadership-grid');
        if (!leadershipGrid) {
            console.warn('Leadership grid element not found');
            return;
        }

        // Prevent multiple simultaneous loads
        if (this.isLoading) {
            console.log('Leaders already loading, skipping...');
            return;
        }

        // If already successfully loaded, don't reload
        if (this.hasLoaded && this.leadersData.length > 0) {
            console.log('Leaders already loaded, skipping...');
            return;
        }

        this.isLoading = true;

        try {
            console.log('Fetching leaders data...');
            const result = await this.apiClient.get('/leaders');
            console.log('Leaders API response:', result);
            
            if (result && result.success && result.data) {
                if (result.data.length > 0) {
                    this.leadersData = result.data;
                    this.renderLeaders(leadershipGrid, result.data);
                    this.hasLoaded = true;
                    console.log(`✅ Successfully rendered ${result.data.length} leaders`);
                } else {
                    console.log('No leaders found');
                    if (!this.hasLoaded) {
                        this.renderEmptyState(leadershipGrid);
                    }
                }
            } else {
                console.warn('Invalid leaders response structure:', result);
                if (!this.hasLoaded) {
                    this.renderEmptyState(leadershipGrid);
                }
            }
        } catch (error) {
            console.error('Error loading leaders:', error);
            if (!this.hasLoaded) {
                this.renderErrorState(leadershipGrid);
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render leaders grid
     */
    renderLeaders(container, leaders) {
        container.innerHTML = leaders.map(leader => `
            <div class="leader-card fade-in">
                <div class="leader-photo">
                    <img src="${leader.photoUrl}" alt="${leader.name}" loading="lazy">
                </div>
                <h3>${leader.name}</h3>
                <p class="leader-role">${leader.role}</p>
                <p class="leader-bio">${leader.bio}</p>
            </div>
        `).join('');
    }

    /**
     * Render empty state
     */
    renderEmptyState(container) {
        const loader = container.querySelector('.dynamic-loader');
        if (loader) loader.remove();
        
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" 
                     stroke-width="1.5" style="margin: 0 auto 1.5rem;">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h3 style="color: #6b7280; font-size: 1.25rem; margin-bottom: 0.5rem;">No Leaders Yet</h3>
                <p style="color: #9ca3af;">Leadership team members added by the admin will appear here.</p>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderErrorState(container) {
        const loader = container.querySelector('.dynamic-loader');
        if (loader) loader.remove();
        
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" 
                     stroke-width="1.5" style="margin: 0 auto 1.5rem;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3 style="color: #ef4444; font-size: 1.25rem; margin-bottom: 0.5rem;">Failed to Load Leaders</h3>
                <p style="color: #9ca3af;">Unable to connect to the server. Please try again later.</p>
            </div>
        `;
    }
}
