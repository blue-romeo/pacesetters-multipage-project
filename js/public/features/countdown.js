/**
 * Countdown Timer - Show countdown to next event
 */

export class CountdownTimer {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.countdownInterval = null;
        this.nextEventDate = null;
        this.nextEventName = '';
    }

    /**
     * Initialize countdown timer
     */
    async initialize() {
        try {
            const result = await this.apiClient.get('/events?upcoming=true&limit=1');
            
            if (result.success && result.data && result.data.length > 0) {
                const nextEvent = result.data[0];
                this.nextEventDate = new Date(nextEvent.startDate);
                this.nextEventName = nextEvent.title;
                
                // Update countdown event text
                const countdownEventElement = document.querySelector('.countdown-event');
                if (countdownEventElement) {
                    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                    countdownEventElement.textContent = `${this.nextEventName} - ${this.nextEventDate.toLocaleDateString('en-US', dateOptions)}`;
                }
                
                // Start the countdown
                this.updateCountdown();
                this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
            } else {
                // No upcoming events
                this.hideCountdown();
            }
        } catch (error) {
            console.error('Error loading countdown:', error);
            this.hideCountdown();
        }
    }

    /**
     * Update countdown display
     */
    updateCountdown() {
        if (!this.nextEventDate) return;
        
        const now = new Date().getTime();
        const distance = this.nextEventDate.getTime() - now;
        
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;
        
        if (distance < 0) {
            countdownElement.innerHTML = '<p style="font-size: 1.5rem; color: var(--color-gold);">Event has started!</p>';
            clearInterval(this.countdownInterval);
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    /**
     * Hide countdown section
     */
    hideCountdown() {
        const countdownSection = document.querySelector('.countdown-section');
        if (countdownSection) {
            countdownSection.style.display = 'none';
        }
    }

    /**
     * Destroy countdown (cleanup)
     */
    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
}
