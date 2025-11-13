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
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = newsletterEmail.value.trim();
        
        if (email && validateEmail(email)) {
            // Show success message
            alert(`Thank you for subscribing! We'll send updates to ${email}`);
            newsletterForm.reset();
        } else {
            alert('Please enter a valid email address');
        }
    });
}

// ========== COUNTDOWN TIMER ========== 
const countdownDate = new Date('November 15, 2025 18:00:00').getTime();
const countdownElement = document.getElementById('countdown');

function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownDate - now;
    
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

// Update countdown every second
if (countdownElement) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
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

// ========== DOWNLOAD RESOURCES ========== 
const downloadButtons = document.querySelectorAll('.download-btn');

downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
        const resource = this.getAttribute('data-resource');
        
        // Create a simple text file as demonstration
        let content = '';
        let filename = '';
        
        switch(resource) {
            case 'brochure':
                content = `PATHFINDERS CLUB BROCHURE
================================

Welcome to our Pathfinders Club!

MISSION
--------
Building character, developing leadership, and growing faith through adventure.

PROGRAMS
---------
- Camping & Outdoor Skills
- Community Service
- Honor Classes
- Spiritual Development

MEETING TIMES
--------------
Every Friday: 6:00 PM - 8:30 PM
Ages: 10-15 years old

CONTACT
--------
Email: info@pathfindersclub.org
Phone: (555) 123-4567
Address: 123 Church Street, Your City, ST 12345

For more information, visit our website or contact us today!`;
                filename = 'Pathfinders_Brochure.txt';
                break;
                
            case 'registration':
                content = `PATHFINDERS CLUB REGISTRATION FORM
====================================

PATHFINDER INFORMATION
-----------------------
Full Name: _______________________________
Date of Birth: ___________________________
Age: ______
Grade: ______

PARENT/GUARDIAN INFORMATION
----------------------------
Name: ____________________________________
Relationship: ____________________________
Email: ___________________________________
Phone: ___________________________________
Address: _________________________________
         _________________________________

EMERGENCY CONTACT
------------------
Name: ____________________________________
Relationship: ____________________________
Phone: ___________________________________

MEDICAL INFORMATION
--------------------
Allergies: _______________________________
Medications: _____________________________
Special Needs: ___________________________

CONSENT
--------
I give permission for my child to participate in Pathfinders Club activities.

Parent/Guardian Signature: _______________
Date: ___________________________________`;
                filename = 'Registration_Form.txt';
                break;
                
            case 'calendar':
                content = `PATHFINDERS CLUB ANNUAL CALENDAR 2025
========================================

NOVEMBER
---------
Nov 15 - Monthly Campout
         Pine Ridge Campground, 6:00 PM - Sunday 2:00 PM
         
Nov 22 - Community Service Day
         Local Food Bank, 9:00 AM - 2:00 PM

DECEMBER
---------
Dec 6  - Investiture Ceremony
         Church Auditorium, 10:00 AM - 12:00 PM
         
Dec 13 - Christmas Party & Talent Show
         Church Fellowship Hall, 6:00 PM - 9:00 PM

JANUARY 2026
-------------
Jan 10 - New Year Kickoff Meeting
Jan 17 - Winter Hiking Trip
Jan 24 - Honor Class: First Aid
Jan 31 - Game Night

FEBRUARY
---------
Feb 7  - Valentine's Community Service
Feb 14 - Parent Appreciation Night
Feb 21 - Honor Class: Nature Study
Feb 28 - Monthly Campout

... and many more exciting events throughout the year!

For the most up-to-date calendar, visit our website or contact us.`;
                filename = 'Annual_Calendar_2025.txt';
                break;

            case 'checklist':
                content = `CAMPING CHECKLIST
=================

SHELTER
-------
□ Tent
□ Ground tarp
□ Sleeping bag
□ Sleeping pad/mat
□ Pillow

CLOTHING
--------
□ Weather-appropriate layers
□ Rain jacket
□ Extra socks
□ Hat
□ Sturdy shoes/boots
□ Flip-flops for shower

PERSONAL ITEMS
--------------
□ Toothbrush & toothpaste
□ Soap & shampoo
□ Towel
□ Sunscreen
□ Bug spray
□ Prescription medications
□ First aid kit

EQUIPMENT
---------
□ Flashlight/headlamp
□ Extra batteries
□ Water bottle
□ Backpack
□ Mess kit (plate, cup, utensils)
□ Pocket knife (with permission)

OPTIONAL
--------
□ Camera
□ Book
□ Games
□ Musical instrument
□ Bible/devotional

Remember: Pack light and check weather forecast before departure!`;
                filename = 'Camping_Checklist.txt';
                break;

            case 'honors':
                content = `PATHFINDERS HONORS GUIDE
========================

NATURE HONORS
-------------
- Bird Study
- Insects
- Trees
- Flowers
- Rocks & Minerals
- Weather
- Stars

OUTDOOR INDUSTRIES
------------------
- Camping Skills I-IV
- Fire Building & Camp Cookery
- Hiking
- Orienteering
- Knot Tying
- First Aid

ARTS & CRAFTS
-------------
- Drawing
- Painting
- Photography
- Leathercraft
- Woodworking
- Needlecraft

HEALTH & SCIENCE
----------------
- First Aid
- Nutrition
- Physical Fitness
- Temperance

HOUSEHOLD ARTS
--------------
- Cooking
- Nutrition
- House Repair
- Laundering

For complete honor requirements, visit the official Pathfinders website.`;
                filename = 'Honors_Guide.txt';
                break;

            case 'uniform':
                content = `PATHFINDERS UNIFORM GUIDE
=========================

OFFICIAL UNIFORM
---------------
- Pathfinder shirt (official club shirt)
- Dark pants or skirt
- Belt
- Closed-toe shoes

INSIGNIA PLACEMENT
------------------
Left Sleeve:
- Club name strip (top)
- Conference patch (below name)
- World patch (below conference)

Right Sleeve:
- Class level patch (Friend, Companion, Explorer, Ranger, etc.)
- Honor tokens (below class patch)

Front:
- Name badge (right chest)
- Pathfinder pin (left chest)

CARE INSTRUCTIONS
-----------------
- Machine wash cold
- Hang dry or low heat
- Iron on low if needed
- Sew patches securely

WHEN TO WEAR
------------
- Club meetings
- Church services (when requested)
- Investiture ceremonies
- Official club events
- Community service (when appropriate)

For outdoor activities, activity-appropriate clothing may be worn.`;
                filename = 'Uniform_Guide.txt';
                break;

            default:
                content = 'Resource content';
                filename = 'resource.txt';
        }
        
        // Create and download file
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show feedback
        const originalHTML = this.innerHTML;
        this.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Downloaded!';
        this.style.pointerEvents = 'none';
        
        setTimeout(() => {
            this.innerHTML = originalHTML;
            this.style.pointerEvents = 'auto';
        }, 2000);
    });
});

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
const eventsData = [
    {
        title: 'Monthly Campout',
        date: '2025-11-15',
        time: '18:00',
        endTime: '14:00',
        endDate: '2025-11-17',
        description: 'Join us for a weekend of outdoor adventure, worship, and fellowship. Bring your tent, sleeping bag, and sense of adventure!',
        location: 'Pine Ridge Campground'
    },
    {
        title: 'Community Service Day',
        date: '2025-11-22',
        time: '09:00',
        endTime: '14:00',
        endDate: '2025-11-22',
        description: 'Help us serve our community by volunteering at the food bank. We will sort donations, pack boxes, and make a real difference.',
        location: 'Local Food Bank'
    },
    {
        title: 'Investiture Ceremony',
        date: '2025-12-06',
        time: '10:00',
        endTime: '12:00',
        endDate: '2025-12-06',
        description: 'Celebrate achievements as Pathfinders receive their honors and badges. Families and friends welcome!',
        location: 'Church Auditorium'
    }
];

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

// Add to calendar button event listeners
document.querySelectorAll('.add-calendar-btn').forEach(button => {
    button.addEventListener('click', function() {
        const eventIndex = parseInt(this.getAttribute('data-event'));
        generateICS(eventsData[eventIndex]);
    });
});

// ========== EVENTS - FILTER (UPCOMING/PAST) ========== 
const filterButtons = document.querySelectorAll('.filter-btn');
const eventCards = document.querySelectorAll('.event-card');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Filter events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        eventCards.forEach(card => {
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
        const visibleEvents = Array.from(eventCards).filter(card => !card.classList.contains('hidden'));
        if (visibleEvents.length === 0) {
            console.log(`No ${filter} events found`);
        }
    });
});

// ========== GALLERY LIGHTBOX ========== 
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentImageIndex = 0;
const galleryImages = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return {
        src: img.src,
        alt: img.alt
    };
});

function openLightbox(index) {
    if (!lightbox || galleryImages.length === 0) return;
    currentImageIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function showPrevImage() {
    currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : galleryImages.length - 1;
    lightboxImg.src = galleryImages[currentImageIndex].src;
    lightboxImg.alt = galleryImages[currentImageIndex].alt;
}

function showNextImage() {
    currentImageIndex = currentImageIndex < galleryImages.length - 1 ? currentImageIndex + 1 : 0;
    lightboxImg.src = galleryImages[currentImageIndex].src;
    lightboxImg.alt = galleryImages[currentImageIndex].alt;
}

// Gallery item click handlers
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        openLightbox(index);
    });
});

// Lightbox navigation
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
}
if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });
}

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

// Form submission with Formspree
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

        // Prepare form data
        const formData = new FormData(form);
        const submitButton = form.querySelector('.submit-btn');
        
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        showFormStatus('sending', 'Sending your application...');

        try {
            // Submit to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
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
                // Error from Formspree
                const data = await response.json();
                if (data.errors) {
                    showFormStatus('error', '✗ ' + data.errors.map(error => error.message).join(', '));
                } else {
                    showFormStatus('error', '✗ There was a problem submitting your form. Please try again.');
                }
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
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = amountInput.value;
        if (!amount || amount < 5) {
            alert('Please enter a donation amount of at least $5');
            return;
        }
        
        // In a real implementation, this would redirect to payment processor
        alert(`Thank you for your donation of ${amount}! You will be redirected to the payment page.`);
        
        // Example: Redirect to payment processor
        // window.location.href = `https://payment-processor.com?amount=${amount}`;
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