/* 
========================================
PATHFINDERS CLUB COMPLETE JAVASCRIPT
========================================
Author: Front-End Developer
Description: Complete vanilla JavaScript for multi-page Pathfinders Club website
Features: Mobile menu, form validation, gallery lightbox, calendar downloads,
         testimonials slider, FAQ accordion, countdown timer, and more
Version: 2.0 - Multi-Page
*/

// ========== CACHING UTILITIES ========== 
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const CacheManager = {
    set(key, data, duration = CACHE_DURATION) {
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            duration: duration
        };
        try {
            localStorage.setItem(`pathfinders_${key}`, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    },
    
    get(key) {
        try {
            const cached = localStorage.getItem(`pathfinders_${key}`);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const now = Date.now();
            
            // Check if cache is still valid
            if (now - cacheData.timestamp < cacheData.duration) {
                return cacheData.data;
            }
            
            // Cache expired, remove it
            this.remove(key);
            return null;
        } catch (e) {
            console.warn('Cache retrieval failed:', e);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(`pathfinders_${key}`);
        } catch (e) {
            console.warn('Cache removal failed:', e);
        }
    },
    
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('pathfinders_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    }
};

// ========== OPTIMIZED API FETCH ========== 
async function fetchWithCache(url, cacheKey, cacheDuration = CACHE_DURATION) {
    // Check cache first
    const cached = CacheManager.get(cacheKey);
    if (cached) {
        console.log(`📦 Cache hit: ${cacheKey}`);
        return cached;
    }
    
    // Fetch from API
    console.log(`🌐 Fetching: ${cacheKey}`);
    try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            CacheManager.set(cacheKey, result, cacheDuration);
        }
        
        return result;
    } catch (error) {
        console.error(`Error fetching ${cacheKey}:`, error);
        throw error;
    }
}

// ========== MOBILE NAVIGATION ========== 
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// ========== TESTIMONIALS SLIDER ========== 
const testimonialSlides = document.querySelectorAll('.testimonial-slide');
const sliderPrev = document.querySelector('.slider-prev');
const sliderNext = document.querySelector('.slider-next');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let testimonialInterval;

function showSlide(index) {
    if (testimonialSlides.length === 0) return;

    testimonialSlides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (index >= testimonialSlides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = testimonialSlides.length - 1;
    } else {
        currentSlide = index;
    }
    
    testimonialSlides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
    }
}

if (sliderPrev && sliderNext) {
    sliderPrev.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });

    sliderNext.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Auto-advance testimonials every 7 seconds
if (testimonialSlides.length > 0) {
    testimonialInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 7000);

    // Pause auto-advance on hover
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        testimonialSlider.addEventListener('mouseenter', () => {
            clearInterval(testimonialInterval);
        });

        testimonialSlider.addEventListener('mouseleave', () => {
            testimonialInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 7000);
        });
    }
}

// ========== FAQ ACCORDION ========== 
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const answer = this.nextElementSibling;
        
        // Close all other FAQs
        faqQuestions.forEach(q => {
            if (q !== this) {
                q.setAttribute('aria-expanded', 'false');
                q.nextElementSibling.classList.remove('active');
            }
        });
        
        // Toggle current FAQ
        this.setAttribute('aria-expanded', !isExpanded);
        answer.classList.toggle('active');
    });
});

// ========== NEWSLETTER FORM ========== 
const newsletterForm = document.getElementById('newsletter-form');
const newsletterEmail = document.getElementById('newsletter-email');

if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = newsletterEmail.value.trim();
        
        if (email && validateEmail(email)) {
            try {
                const response = await fetch(API_CONFIG.getFullURL(API_CONFIG.endpoints.newsletter.subscribe), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert(`Thank you for subscribing! We'll send updates to ${email}`);
                    newsletterForm.reset();
                } else {
                    alert(result.message || 'Failed to subscribe. Please try again.');
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                alert('Network error. Please try again later.');
            }
        } else {
            alert('Please enter a valid email address');
        }
    });
}

// ========== COUNTDOWN TIMER ========== 
let countdownInterval;
let nextEventDate = null;
let nextEventName = '';

async function initializeCountdown() {
    try {
        const response = await fetch(API_CONFIG.getFullURL('/events?upcoming=true&limit=1'));
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const nextEvent = result.data[0];
            nextEventDate = new Date(nextEvent.startDate);
            nextEventName = nextEvent.title;
            
            // Update countdown event text
            const countdownEventElement = document.querySelector('.countdown-event');
            if (countdownEventElement) {
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                countdownEventElement.textContent = `${nextEventName} - ${nextEventDate.toLocaleDateString('en-US', dateOptions)}`;
            }
            
            // Start the countdown
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
        } else {
            // No upcoming events
            const countdownSection = document.querySelector('.countdown-section');
            if (countdownSection) {
                countdownSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading countdown:', error);
        const countdownSection = document.querySelector('.countdown-section');
        if (countdownSection) {
            countdownSection.style.display = 'none';
        }
    }
}

function updateCountdown() {
    if (!nextEventDate) return;
    
    const now = new Date().getTime();
    const distance = nextEventDate.getTime() - now;
    
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    if (distance < 0) {
        if (countdownElement) {
            countdownElement.innerHTML = '<p style="font-size: 1.5rem; color: var(--color-gold);">Event has started!</p>';
        }
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

// ========== PHOTO UPLOAD PREVIEW ========== 
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photo-preview');
const fileUploadLabel = document.querySelector('.file-upload-label span');

if (photoInput && photoPreview && fileUploadLabel) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                this.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                this.value = '';
                return;
            }
            
            // Update label text
            fileUploadLabel.textContent = file.name;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = function(event) {
                photoPreview.innerHTML = `
                    <div style="position: relative; display: inline-block;">
                        <img src="${event.target.result}" alt="Preview" style="max-width: 200px; border-radius: 0.75rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <button type="button" class="remove-photo" style="position: absolute; top: -10px; right: -10px; background: var(--color-gold); color: var(--color-green); border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">×</button>
                    </div>
                `;
                photoPreview.classList.add('active');
                
                // Add remove functionality
                const removeBtn = photoPreview.querySelector('.remove-photo');
                removeBtn.addEventListener('click', () => {
                    photoInput.value = '';
                    photoPreview.innerHTML = '';
                    photoPreview.classList.remove('active');
                    fileUploadLabel.textContent = 'Choose a photo';
                });
            };
            reader.readAsDataURL(file);
        }
    });
}



// ========== SCROLL TO TOP BUTTON ========== 
const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== PROGRAM CARDS - LEARN MORE TOGGLE ========== 
const learnMoreButtons = document.querySelectorAll('.learn-more-btn');

learnMoreButtons.forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.program-card');
        const shortDesc = card.querySelector('.program-description.short');
        const fullDesc = card.querySelector('.program-description.full');
        
        if (fullDesc.classList.contains('active')) {
            fullDesc.classList.remove('active');
            shortDesc.classList.remove('hidden');
            this.textContent = 'Learn more';
            this.setAttribute('aria-expanded', 'false');
        } else {
            fullDesc.classList.add('active');
            shortDesc.classList.add('hidden');
            this.textContent = 'Show less';
            this.setAttribute('aria-expanded', 'true');
        }
    });
});

// ========== EVENTS - CALENDAR DOWNLOAD ========== 
let eventsData = [];

// Load events dynamically from API
async function loadEventsFromAPI() {
    const eventsList = document.querySelector('.events-list');
    if (!eventsList) return;

    try {
        const result = await fetchWithCache(API_CONFIG.getFullURL(`/events?ts=${Date.now()}`), 'events', 0); // no cache to reflect admin updates
        
        if (result.success && result.data && result.data.length > 0) {
            // Transform API data to match eventsData format
            eventsData = result.data.map(event => ({
                title: event.title,
                date: event.startDate.split('T')[0],
                time: new Date(event.startDate).toTimeString().slice(0, 5),
                endTime: event.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : '23:59',
                endDate: event.endDate ? event.endDate.split('T')[0] : event.startDate.split('T')[0],
                description: event.description,
                location: event.location || 'TBD',
                _id: event._id,
                category: event.category,
                maxParticipants: event.maxParticipants,
                registeredParticipants: event.registeredParticipants
            }));
            
            // Render events to the page
            renderEvents(eventsData);
        } else {
            // Remove loader and show empty state
            const loader = eventsList.querySelector('.dynamic-loader');
            if (loader) loader.remove();
            eventsList.innerHTML = '<div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin: 0 auto 1.5rem;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><h3 style="color: #6b7280; font-size: 1.25rem; margin-bottom: 0.5rem;">No Events Yet</h3><p style="color: #9ca3af;">Events created by the admin will appear here. Check back soon!</p></div>';
        }
    } catch (error) {
        console.error('Error loading events:', error);
        const loader = eventsList.querySelector('.dynamic-loader');
        if (loader) loader.remove();
        eventsList.innerHTML = '<div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin: 0 auto 1.5rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3 style="color: #ef4444; font-size: 1.25rem; margin-bottom: 0.5rem;">Failed to Load Events</h3><p style="color: #9ca3af;">Unable to connect to the server. Please try again later.</p></div>';
    }
}

// Render events to the events list
function renderEvents(events) {
    const eventsList = document.querySelector('.events-list');
    if (!eventsList) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    eventsList.innerHTML = events.map((event, index) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const status = eventDate >= today ? 'upcoming' : 'past';
        
        // Format date display
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = eventDate.toLocaleDateString('en-US', dateOptions);
        
        // Format time display
        const startTime = event.time;
        const endTime = event.endTime;
        let timeDisplay = startTime;
        if (event.endDate !== event.date) {
            const endDateObj = new Date(event.endDate);
            const endDateOptions = { weekday: 'long' };
            timeDisplay = `${startTime} - ${endDateObj.toLocaleDateString('en-US', endDateOptions)} ${endTime}`;
        } else if (endTime) {
            timeDisplay = `${startTime} - ${endTime}`;
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
                    </div>
                    <button class="add-calendar-btn" data-event="${index}">Add to Calendar</button>
                </div>
            </article>
        `;
    }).join('');
    
    // Reattach event listeners for calendar buttons
    document.querySelectorAll('.add-calendar-btn').forEach(button => {
        button.addEventListener('click', function() {
            const eventIndex = parseInt(this.getAttribute('data-event'));
            generateICS(eventsData[eventIndex]);
        });
    });
    
    // Initialize filter after rendering
    initializeEventFilter();
}

// Initialize event filter
function initializeEventFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    
    filterButtons.forEach(button => {
        // Remove existing listeners
        button.replaceWith(button.cloneNode(true));
    });
    
    // Reattach listeners
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter events
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            document.querySelectorAll('.event-card').forEach(card => {
                const eventDate = new Date(card.getAttribute('data-date'));
                eventDate.setHours(0, 0, 0, 0);
                
                if (filter === 'upcoming') {
                    if (eventDate >= today) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                } else if (filter === 'past') {
                    if (eventDate < today) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
            
            // Show message if no events
            const visibleEvents = Array.from(document.querySelectorAll('.event-card')).filter(card => !card.classList.contains('hidden'));
            if (visibleEvents.length === 0) {
                console.log(`No ${filter} events found`);
            }
        });
    });
}

// ========== LEADERS - DYNAMIC LOADING ========== 
async function loadLeadersFromAPI() {
    const leadershipGrid = document.getElementById('leadership-grid');
    if (!leadershipGrid) return;

    try {
        const result = await fetchWithCache(API_CONFIG.getFullURL('/leaders'), 'leaders', 10 * 60 * 1000); // 10 min cache
        
        if (result.success && result.data && result.data.length > 0) {
            leadershipGrid.innerHTML = result.data.map(leader => `
                <div class="leader-card fade-in">
                    <div class="leader-photo">
                        <img src="${leader.photoUrl}" alt="${leader.name}" loading="lazy">
                    </div>
                    <h3>${leader.name}</h3>
                    <p class="leader-role">${leader.role}</p>
                    <p class="leader-bio">${leader.bio}</p>
                </div>
            `).join('');
        } else {
            // Remove loader and show empty state
            const loader = leadershipGrid.querySelector('.dynamic-loader');
            if (loader) loader.remove();
            leadershipGrid.innerHTML = '<div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin: 0 auto 1.5rem;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><h3 style="color: #6b7280; font-size: 1.25rem; margin-bottom: 0.5rem;">No Leaders Yet</h3><p style="color: #9ca3af;">Leadership team members added by the admin will appear here.</p></div>';
        }
    } catch (error) {
        console.error('Error loading leaders:', error);
        if (leadershipGrid) {
            const loader = leadershipGrid.querySelector('.dynamic-loader');
            if (loader) loader.remove();
            leadershipGrid.innerHTML = '<div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin: 0 auto 1.5rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3 style="color: #ef4444; font-size: 1.25rem; margin-bottom: 0.5rem;">Failed to Load Leaders</h3><p style="color: #9ca3af;">Unable to connect to the server. Please try again later.</p></div>';
        }
    }
}

// ========== GALLERY - DYNAMIC LOADING ========== 
let galleryData = [];

async function loadGalleryFromAPI() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    try {
        const result = await fetchWithCache(API_CONFIG.getFullURL('/gallery'), 'gallery', 10 * 60 * 1000); // 10 min cache
        
        if (result.success && result.data && result.data.length > 0) {
            galleryData = result.data;
            galleryGrid.innerHTML = galleryData.map((item, index) => `
                <button class="gallery-item fade-in" data-index="${index}" aria-label="Open image ${index + 1} in lightbox" style="animation-delay: ${index * 0.05}s">
                    <img src="${item.imageUrl}" 
                         alt="${item.caption || 'Gallery image'}" 
                         loading="lazy">
                </button>
            `).join('');
            
            // Reinitialize lightbox after loading gallery
            initializeGalleryLightbox();
        } else {
            // Remove loader and show empty state
            const loader = galleryGrid.querySelector('.dynamic-loader');
            if (loader) loader.remove();
            galleryGrid.innerHTML = '<div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin: 0 auto 1.5rem;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><h3 style="color: #6b7280; font-size: 1.25rem; margin-bottom: 0.5rem;">No Photos Yet</h3><p style="color: #9ca3af;">Photos uploaded by the admin will appear here. Check back soon!</p></div>';
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        if (galleryGrid) {
            const loader = galleryGrid.querySelector('.dynamic-loader');
            if (loader) loader.remove();
            galleryGrid.innerHTML = '<div style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1;"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin: 0 auto 1.5rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3 style="color: #ef4444; font-size: 1.25rem; margin-bottom: 0.5rem;">Failed to Load Gallery</h3><p style="color: #9ca3af;">Unable to connect to the server. Please try again later.</p></div>';
        }
    }
}

// ========== HOMEPAGE - UPCOMING EVENTS PREVIEW ========== 
async function loadHomeUpcomingEvents() {
    const eventsPreview = document.querySelector('.events-preview');
    if (!eventsPreview) return;

    try {
        const result = await fetchWithCache(API_CONFIG.getFullURL(`/events?upcoming=true&limit=3&ts=${Date.now()}`), 'home_events', 0); // no cache to reflect admin updates
        
        if (result.success && result.data && result.data.length > 0) {
            eventsPreview.innerHTML = result.data.map((event, index) => {
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
        } else {
            eventsPreview.innerHTML = '<p class="fade-in" style="text-align: center; grid-column: 1/-1; padding: 2rem;">No upcoming events at the moment. Check back soon!</p>';
        }
    } catch (error) {
        console.error('Error loading home events:', error);
        eventsPreview.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem; color: #e53e3e;">Failed to load events. Please try again later.</p>';
    }
}

// Generate ICS file for calendar
function generateICS(event) {
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

// Add to calendar button event listeners (for initial hardcoded events)
document.querySelectorAll('.add-calendar-btn').forEach(button => {
    button.addEventListener('click', function() {
        const eventIndex = parseInt(this.getAttribute('data-event'));
        generateICS(eventsData[eventIndex]);
    });
});

// ========== GALLERY LIGHTBOX ========== 
let currentImageIndex = 0;

function initializeGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    if (!lightbox) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            openLightbox(index);
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });

    // Click backdrop to close
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (!lightbox || galleryData.length === 0) return;
    currentImageIndex = index;
    lightboxImg.src = galleryData[index].imageUrl;
    lightboxImg.alt = galleryData[index].caption || 'Gallery image';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function showPrevImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : galleryData.length - 1;
    lightboxImg.src = galleryData[currentImageIndex].imageUrl;
    lightboxImg.alt = galleryData[currentImageIndex].caption || 'Gallery image';
}

function showNextImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    currentImageIndex = currentImageIndex < galleryData.length - 1 ? currentImageIndex + 1 : 0;
    lightboxImg.src = galleryData[currentImageIndex].imageUrl;
    lightboxImg.alt = galleryData[currentImageIndex].caption || 'Gallery image';
}

// ========== FAQ ACCORDION ==========

const lightbox = document.getElementById('lightbox');

// Close lightbox when clicking on background
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        showPrevImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
});

// ========== FORM VALIDATION & FORMSPREE SUBMISSION ========== 
const form = document.getElementById('contact-form');
const successModal = document.getElementById('success-modal');
const formStatus = document.getElementById('form-status');

// Validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Allow various phone formats
    const re = /^[\d\s\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (field && errorElement) {
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('active');
        field.setAttribute('aria-invalid', 'true');
    }
}

function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (field && errorElement) {
        field.classList.remove('error');
        errorElement.classList.remove('active');
        field.setAttribute('aria-invalid', 'false');
    }
}

function showFormStatus(type, message) {
    if (formStatus) {
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
        
        // Auto-hide after 5 seconds for success/error
        if (type !== 'sending') {
            setTimeout(() => {
                formStatus.className = 'form-status';
            }, 5000);
        }
    }
}

function validateForm() {
    let isValid = true;

    // Clear all errors first
    ['name', 'email', 'phone', 'age', 'consent'].forEach(hideError);

    if (!form) return false;

    // Validate name
    const name = form.name.value.trim();
    if (!name) {
        showError('name', 'Name is required');
        isValid = false;
    }

    // Validate email
    const email = form.email.value.trim();
    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate phone
    const phone = form.phone.value.trim();
    if (!phone) {
        showError('phone', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate age
    const age = form.age.value.trim();
    if (!age) {
        showError('age', 'Age is required');
        isValid = false;
    } else if (age < 10 || age > 15) {
        showError('age', 'Age must be between 10 and 15');
        isValid = false;
    }

    // Validate consent checkbox
    if (!form.consent.checked) {
        showError('consent', 'You must agree to the terms');
        isValid = false;
    }

    return isValid;
}

// Form submission with Backend API
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form first
        if (!validateForm()) {
            // Focus on first error field
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
            showFormStatus('error', 'Please fix the errors above before submitting.');
            return;
        }

        // Prepare form data as JSON
        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            guardian: formData.get('guardian') ? formData.get('guardian').trim() : undefined,
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            age: parseInt(formData.get('age')),
            message: formData.get('message') ? formData.get('message').trim() : undefined,
            consent: form.consent.checked // Use checked property directly
        };
        
        const submitButton = form.querySelector('.submit-btn');
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        showFormStatus('sending', 'Sending your application...');

        try {
            // Submit to Backend API
            const response = await fetch(API_CONFIG.getFullURL(API_CONFIG.endpoints.contacts.base), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success!
                showFormStatus('success', '✓ Application submitted successfully! We\'ll be in touch soon.');
                
                // Show success modal
                if (successModal) {
                    successModal.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    // Hide modal after 3 seconds
                    setTimeout(() => {
                        successModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }, 3000);
                }

                // Reset form
                form.reset();
                
                // Reset photo preview
                if (photoPreview) {
                    photoPreview.innerHTML = '';
                    photoPreview.classList.remove('active');
                }
                if (fileUploadLabel) {
                    fileUploadLabel.textContent = 'Choose a photo';
                }

            } else {
                // Error from API
                const errorMsg = result.message || 'There was a problem submitting your form. Please try again.';
                showFormStatus('error', '✗ ' + errorMsg);
            }
        } catch (error) {
            // Network or other error
            console.error('Form submission error:', error);
            showFormStatus('error', '✗ Network error. Please check your connection and try again.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
        }
    });

    // Real-time validation on blur
    if (form.name) {
        form.name.addEventListener('blur', function() {
            if (this.value.trim()) {
                hideError('name');
            }
        });
    }

    if (form.email) {
        form.email.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && validateEmail(email)) {
                hideError('email');
            }
        });
    }

    if (form.phone) {
        form.phone.addEventListener('blur', function() {
            const phone = this.value.trim();
            if (phone && validatePhone(phone)) {
                hideError('phone');
            }
        });
    }

    if (form.age) {
        form.age.addEventListener('blur', function() {
            const age = this.value.trim();
            if (age && age >= 10 && age <= 15) {
                hideError('age');
            }
        });
    }

    if (form.consent) {
        form.consent.addEventListener('change', function() {
            if (this.checked) {
                hideError('consent');
            }
        });
    }
}

// Close modal when clicking outside
if (successModal) {
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ========== DONATION FORM (SUPPORT PAGE) ========== 
const donationForm = document.getElementById('donation-form');
const amountButtons = document.querySelectorAll('.amount-btn');
const amountInput = document.getElementById('amount');

// Amount button selection
amountButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        amountButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update amount input
        const amount = this.getAttribute('data-amount');
        if (amount !== 'custom') {
            amountInput.value = amount;
        } else {
            amountInput.value = '';
            amountInput.focus();
        }
    });
});

// When user types in amount input, select custom button
if (amountInput) {
    amountInput.addEventListener('input', function() {
        amountButtons.forEach(btn => btn.classList.remove('active'));
        const customBtn = document.querySelector('.amount-btn[data-amount="custom"]');
        if (customBtn) {
            customBtn.classList.add('active');
        }
    });
}

// Donation form submission
if (donationForm) {
    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amount = amountInput.value;
        if (!amount || amount < 5) {
            alert('Please enter a donation amount of at least $5');
            return;
        }
        
        // Get additional form data if available
        const formData = new FormData(donationForm);
        const donationData = {
            donorName: formData.get('donorName') || 'Anonymous',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            amount: parseFloat(amount),
            currency: 'KES',
            donationType: formData.get('donationType') || 'one-time',
            purpose: formData.get('purpose') || 'general',
            message: formData.get('message') || '',
            isAnonymous: formData.get('anonymous') === 'on'
        };
        
        try {
            const response = await fetch(API_CONFIG.getFullURL(API_CONFIG.endpoints.donations.base), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(donationData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`Thank you for your donation of ${amount}! You will be redirected to the payment page.`);
                // In a real implementation, redirect to payment processor
                // window.location.href = `https://payment-processor.com?amount=${amount}&ref=${result.data._id}`;
            } else {
                alert(result.message || 'Failed to process donation. Please try again.');
            }
        } catch (error) {
            console.error('Donation submission error:', error);
            alert('Network error. Please try again later.');
        }
    });
}

// ========== SMOOTH SCROLL FOR ANCHOR LINKS ========== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for empty hash or just '#'
        if (!href || href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========== SCROLL HEADER SHADOW ========== 
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
}

// ========== SMOOTH SCROLL ENHANCEMENT - ACTIVE NAV LINKS ========== 
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a, .footer-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ========== ANIMATIONS ON SCROLL ========== 
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards and sections for animation
const animateElements = document.querySelectorAll('.card, .program-card, .event-card, .leader-card, .resource-card, .testimonial-card, .faq-item, .support-card, .stat-card, .help-card, .info-card');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ========== PAGE-SPECIFIC INITIALIZATIONS ========== 

// Check which page we're on and initialize accordingly
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Log page load
console.log(`✅ Pathfinders Club Website - ${currentPage} loaded`);

// Initialize page-specific features
if (currentPage.includes('gallery') || currentPage === '') {
    console.log('📸 Gallery features initialized');
}

if (currentPage.includes('events')) {
    console.log('📅 Events features initialized');
    console.log('⏰ Countdown timer active');
    // Load events dynamically from API
    loadEventsFromAPI();
}

if (currentPage.includes('contact') || currentPage.includes('index')) {
    console.log('📧 Contact form ready');
}

if (currentPage.includes('support')) {
    console.log('💰 Donation features initialized');
}

// ========== LAZY LOADING IMAGES ========== 
// Modern browsers support native lazy loading, but this is a fallback
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========== ACCESSIBILITY ENHANCEMENTS ========== 

// Skip to main content link (if added to HTML)
const skipLink = document.querySelector('.skip-to-main');
if (skipLink) {
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.querySelector('main');
        if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
            main.removeAttribute('tabindex');
        }
    });
}

// Trap focus in modals when open
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Apply focus trap to modals and lightbox
if (successModal) {
    successModal.addEventListener('transitionend', () => {
        if (successModal.classList.contains('active')) {
            trapFocus(successModal);
        }
    });
}

if (lightbox) {
    lightbox.addEventListener('transitionend', () => {
        if (lightbox.classList.contains('active')) {
            trapFocus(lightbox);
        }
    });
}

// ========== PERFORMANCE MONITORING ========== 

// Log performance metrics (helpful for optimization)
if (window.performance) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
    });
}

// ========== ERROR HANDLING ========== 

// Global error handler
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    // In production, you might want to send this to an error tracking service
});

// ========== BROWSER COMPATIBILITY CHECKS ========== 

// Check for required features
const requiredFeatures = {
    'Fetch API': 'fetch' in window,
    'IntersectionObserver': 'IntersectionObserver' in window,
    'CSS Grid': CSS.supports('display', 'grid'),
    'CSS Custom Properties': CSS.supports('--test', 'red')
};

let allFeaturesSupported = true;
for (const [feature, supported] of Object.entries(requiredFeatures)) {
    if (!supported) {
        console.warn(`⚠️ ${feature} is not supported in this browser`);
        allFeaturesSupported = false;
    }
}

if (allFeaturesSupported) {
    console.log('✅ All required features supported');
} else {
    console.warn('⚠️ Some features may not work in this browser');
    // Optionally show a message to the user
}

// ========== INITIALIZE ========== 
console.log('✅ Pathfinders Club Website Initialized');
console.log('✅ All interactive features loaded successfully');
console.log('📋 Active features:');
console.log('   ✓ Mobile Navigation');
console.log('   ✓ Testimonials Slider');
console.log('   ✓ FAQ Accordion');
console.log('   ✓ Newsletter Signup');
console.log('   ✓ Countdown Timer');
console.log('   ✓ Photo Upload Preview');
console.log('   ✓ Resource Downloads');
console.log('   ✓ Scroll to Top');
console.log('   ✓ Gallery Lightbox');
console.log('   ✓ Form Validation');
console.log('   ✓ Event Filtering');
console.log('   ✓ Calendar Downloads');
console.log('   ✓ Scroll Animations');
console.log('   ✓ Donation Form');
console.log('🎉 Website ready!');

// ========== PAGE-SPECIFIC INITIALIZATION ========== 
// Homepage
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    loadHomeUpcomingEvents();
}

// Events page
if (window.location.pathname.includes('events.html')) {
    loadEventsFromAPI();
    initializeCountdown();
}

// Gallery page
if (window.location.pathname.includes('gallery.html')) {
    loadGalleryFromAPI();
}

// About page
if (window.location.pathname.includes('about.html')) {
    loadLeadersFromAPI();
}

// ========== EXPORT FOR TESTING (Optional) ========== 
// If you want to test functions in browser console
if (typeof window !== 'undefined') {
    window.PathfindersApp = {
        validateEmail,
        validatePhone,
        validateForm,
        generateICS,
        openLightbox,
        closeLightbox,
        showSlide,
        updateCountdown
    };
}