/**
 * Public Main Entry Point - Pathfinders Club Website
 * Coordinates all public-facing modules
 */

import { PublicApiClient } from './core/api.js';
import { Navigation } from './components/navigation.js';
import { TestimonialsSlider } from './components/testimonials.js';
import { GalleryLightbox } from './features/gallery.js';
import { EventsDisplay } from './features/events.js';
import { LeadersDisplay } from './features/leaders.js';
import { CountdownTimer } from './features/countdown.js';
import { FormsManager } from './features/forms.js';

// ========== INITIALIZATION ========== 
// API Configuration (loaded from api-config.js globally)
const API_URL = API_CONFIG.baseURL;

// Initialize API client
const apiClient = new PublicApiClient(API_URL);

// Initialize modules
const navigation = new Navigation();
const testimonialsSlider = new TestimonialsSlider();
const galleryLightbox = new GalleryLightbox(apiClient);
const eventsDisplay = new EventsDisplay(apiClient);
const leadersDisplay = new LeadersDisplay(apiClient);
const countdownTimer = new CountdownTimer(apiClient);
const formsManager = new FormsManager(apiClient);

// ========== PAGE-SPECIFIC INITIALIZATION ========== 
document.addEventListener('DOMContentLoaded', async () => {
    // Always load navigation components (header/footer)
    await navigation.loadComponents();
    
    // Initialize testimonials slider if present on page
    if (document.querySelector('.testimonial-slider')) {
        testimonialsSlider.initialize();
    }
    
    // Initialize countdown timer if present on page
    if (document.querySelector('.countdown-section')) {
        countdownTimer.initialize();
    }
    
    // Initialize forms
    formsManager.initialize();
    
    // Page-specific features
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            // Homepage: Load upcoming events preview
            if (document.querySelector('.events-preview')) {
                eventsDisplay.loadHomeUpcomingEvents();
            }
            break;
            
        case 'gallery.html':
            // Gallery page: Load gallery with lightbox
            if (document.querySelector('.gallery-grid')) {
                galleryLightbox.loadGallery();
            }
            break;
            
        case 'events.html':
            // Events page: Load all events
            if (document.querySelector('.events-list')) {
                eventsDisplay.loadEvents();
            }
            break;
            
        case 'about.html':
            // About page: Load leaders
            if (document.getElementById('leadership-grid')) {
                leadersDisplay.loadLeaders();
            }
            break;
    }
    
    // Scroll-based features
    initializeScrollFeatures();
});

// ========== SCROLL-BASED FEATURES ========== 
function initializeScrollFeatures() {
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Header shadow on scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 0) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ========== ADDITIONAL UI FEATURES ========== 
// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current FAQ
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }
});

// Program cards - Learn more toggle
const learnMoreBtns = document.querySelectorAll('.learn-more-btn');
learnMoreBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.program-card');
        if (card) {
            card.classList.toggle('expanded');
            this.textContent = card.classList.contains('expanded') ? 'Show Less' : 'Learn More';
        }
    });
});

// Photo upload preview
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photo-preview');
const fileUploadLabel = document.querySelector('.file-upload-label');

if (photoInput && photoPreview) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                photoPreview.innerHTML = `
                    <img src="${event.target.result}" alt="Preview">
                    <button type="button" class="remove-photo" onclick="removePhotoPreview()">×</button>
                `;
                photoPreview.classList.add('active');
            };
            
            reader.readAsDataURL(file);
            
            if (fileUploadLabel) {
                fileUploadLabel.textContent = file.name;
            }
        }
    });
}

// Global function for removing photo preview
window.removePhotoPreview = function() {
    if (photoInput) photoInput.value = '';
    if (photoPreview) {
        photoPreview.innerHTML = '';
        photoPreview.classList.remove('active');
    }
    if (fileUploadLabel) {
        fileUploadLabel.textContent = 'Choose a photo';
    }
};

// ========== EXPORTS FOR DEBUGGING ========== 
window.pathfindersApp = {
    apiClient,
    navigation,
    testimonialsSlider,
    galleryLightbox,
    eventsDisplay,
    leadersDisplay,
    countdownTimer,
    formsManager
};

console.log('✅ Pathfinders Club - Modular JavaScript Loaded');
