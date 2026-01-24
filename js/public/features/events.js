/**
 * Events Module - Event display and calendar functionality
 */

export class EventsDisplay {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.eventsData = [];
    }

    /**
     * Load events from API
     */
    async loadEvents() {
        const eventsList = document.querySelector('.events-list');
        if (!eventsList) return;

        try {
            const result = await this.apiClient.get('/events');
            
            if (result.success && result.data && result.data.length > 0) {
                // Transform API data
                this.eventsData = result.data.map(event => ({
                    title: event.title,
                    date: event.startDate.split('T')[0],
                    time: new Date(event.startDate).toTimeString().slice(0, 5),
                    endTime: event.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : '23:59',
                    endDate: event.endDate ? event.endDate.split('T')[0] : event.startDate.split('T')[0],
                    description: event.description,
                    location: event.location || 'TBD',
                    _id: event._id,
                    category: event.category,
                    cost: event.cost || 0,
                    requiresRegistration: event.requiresRegistration,
                    registrationDeadline: event.registrationDeadline,
                    maxParticipants: event.maxParticipants,
                    registeredParticipants: event.registeredParticipants
                }));
                
                this.renderEvents();
            } else {
                this.renderEmptyState(eventsList);
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.renderErrorState(eventsList);
        }
    }

    /**
     * Load upcoming events for homepage
     */
    async loadHomeUpcomingEvents() {
        const eventsPreview = document.querySelector('.events-preview');
        if (!eventsPreview) return;

        try {
            const result = await this.apiClient.get('/events?upcoming=true&limit=3');
            
            if (result.success && result.data && result.data.length > 0) {
                this.renderHomeEvents(eventsPreview, result.data);
            } else {
                eventsPreview.innerHTML = '<p class="fade-in" style="text-align: center; grid-column: 1/-1; padding: 2rem;">No upcoming events at the moment. Check back soon!</p>';
            }
        } catch (error) {
            console.error('Error loading home events:', error);
            eventsPreview.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem; color: #e53e3e;">Failed to load events. Please try again later.</p>';
        }
    }

    /**
     * Render homepage event cards
     */
    renderHomeEvents(container, events) {
        container.innerHTML = events.map((event, index) => {
            const eventDate = new Date(event.startDate);
            const day = eventDate.getDate();
            const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
            
            const startTime = new Date(event.startDate).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
            
            let endTimeStr = '';
            if (event.endDate) {
                const endDate = new Date(event.endDate);
                const endTime = endDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                });
                const endDay = endDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
                endTimeStr = ` - ${endDay} ${endTime}`;
            }
            
            return `
                <article class="event-card-home fade-in" style="animation-delay: ${index * 0.1}s">
                    <div class="event-date">
                        <span class="date-day">${day}</span>
                        <span class="date-month">${month}</span>
                    </div>
                    <div class="event-details">
                        <h3>${event.title}</h3>
                        <p class="event-time">${startTime}${endTimeStr}</p>
                        <p class="event-location">📍 ${event.location}</p>
                    </div>
                </article>
            `;
        }).join('');
    }

    /**
     * Render full events list
     */
    renderEvents() {
        const eventsList = document.querySelector('.events-list');
        if (!eventsList) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        eventsList.innerHTML = this.eventsData.map((event, index) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            const status = eventDate >= today ? 'upcoming' : 'past';
            
            // Format date display
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);
            
            // Format time display
            let timeDisplay = event.time;
            if (event.endDate !== event.date) {
                const endDateObj = new Date(event.endDate);
                const endDateOptions = { weekday: 'long' };
                timeDisplay = `${event.time} - ${endDateObj.toLocaleDateString('en-US', endDateOptions)} ${event.endTime}`;
            } else if (event.endTime) {
                timeDisplay = `${event.time} - ${event.endTime}`;
            }
            
            // Check if registration is open
            const now = new Date();
            const isRegistrationOpen = event.requiresRegistration && 
                                       event.registrationDeadline && 
                                       new Date(event.registrationDeadline) > now &&
                                       eventDate > now;
            
            // Registration button
            let registrationButton = '';
            if (event.requiresRegistration && status === 'upcoming') {
                if (isRegistrationOpen) {
                    registrationButton = `<a href="event-registration.html?event=${event._id}" class="register-btn">Register Now</a>`;
                } else if (event.registrationDeadline && new Date(event.registrationDeadline) < now) {
                    registrationButton = `<button class="register-btn" disabled style="opacity: 0.6; cursor: not-allowed;">Registration Closed</button>`;
                }
            }
            
            return `
                <article class="event-card" data-status="${status}" data-date="${event.date}">
                    <div class="event-content">
                        <div class="event-details">
                            <h3>${event.title}</h3>
                            <div class="event-meta">
                                <div class="meta-item">
                                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span>${formattedDate}</span>
                                </div>
                                <div class="meta-item">
                                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <span>${timeDisplay}</span>
                                </div>
                                <div class="meta-item">
                                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span>${event.location}</span>
                                </div>
                            </div>
                            <p class="event-description">${event.description}</p>
                            ${event.cost > 0 ? `<p class="event-cost"><strong>Cost:</strong> KES ${event.cost.toLocaleString()}</p>` : ''}
                            ${event.registrationDeadline && isRegistrationOpen ? `<p class="event-deadline"><strong>Register by:</strong> ${new Date(event.registrationDeadline).toLocaleDateString('en-US', dateOptions)}</p>` : ''}
                        </div>
                        <div class="event-actions">
                            ${registrationButton}
                            <button class="add-calendar-btn" data-event="${index}">Add to Calendar</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
        
        // Attach event listeners
        this.attachCalendarListeners();
        this.initializeEventFilter();
    }

    /**
     * Attach calendar download listeners
     */
    attachCalendarListeners() {
        document.querySelectorAll('.add-calendar-btn').forEach(button => {
            button.addEventListener('click', () => {
                const eventIndex = parseInt(button.getAttribute('data-event'));
                this.generateICS(this.eventsData[eventIndex]);
            });
        });
    }

    /**
     * Initialize event filter (upcoming/past)
     */
    initializeEventFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            // Remove existing listeners
            button.replaceWith(button.cloneNode(true));
        });
        
        // Reattach listeners
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter events
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                document.querySelectorAll('.event-card').forEach(card => {
                    const eventDate = new Date(card.getAttribute('data-date'));
                    eventDate.setHours(0, 0, 0, 0);
                    
                    if (filter === 'upcoming') {
                        card.classList.toggle('hidden', eventDate < today);
                    } else if (filter === 'past') {
                        card.classList.toggle('hidden', eventDate >= today);
                    }
                });
            });
        });
    }

    /**
     * Generate ICS calendar file
     */
    generateICS(event) {
        const formatDate = (dateStr, timeStr) => {
            const date = new Date(`${dateStr}T${timeStr}:00`);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pathfinders Club//Event//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART:${formatDate(event.date, event.time)}
DTEND:${formatDate(event.endDate, event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3 style="color: #6b7280; font-size: 1.25rem; margin-bottom: 0.5rem;">No Events Yet</h3>
                <p style="color: #9ca3af;">Events created by the admin will appear here. Check back soon!</p>
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
                <h3 style="color: #ef4444; font-size: 1.25rem; margin-bottom: 0.5rem;">Failed to Load Events</h3>
                <p style="color: #9ca3af;">Unable to connect to the server. Please try again later.</p>
            </div>
        `;
    }
}
