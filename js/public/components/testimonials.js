/**
 * Testimonials Slider Component
 */

export class TestimonialsSlider {
    constructor() {
        this.currentSlide = 0;
        this.testimonialInterval = null;
        this.slides = [];
        this.dots = [];
    }

    /**
     * Initialize testimonials slider
     */
    initialize() {
        this.slides = document.querySelectorAll('.testimonial-slide');
        this.dots = document.querySelectorAll('.dot');
        const sliderPrev = document.querySelector('.slider-prev');
        const sliderNext = document.querySelector('.slider-next');
        const testimonialSlider = document.querySelector('.testimonial-slider');

        if (this.slides.length === 0) return;

        // Navigation buttons
        if (sliderPrev) {
            sliderPrev.addEventListener('click', () => this.showSlide(this.currentSlide - 1));
        }

        if (sliderNext) {
            sliderNext.addEventListener('click', () => this.showSlide(this.currentSlide + 1));
        }

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.showSlide(index));
        });

        // Auto-advance every 7 seconds
        this.testimonialInterval = setInterval(() => {
            this.showSlide(this.currentSlide + 1);
        }, 7000);

        // Pause on hover
        if (testimonialSlider) {
            testimonialSlider.addEventListener('mouseenter', () => {
                clearInterval(this.testimonialInterval);
            });

            testimonialSlider.addEventListener('mouseleave', () => {
                this.testimonialInterval = setInterval(() => {
                    this.showSlide(this.currentSlide + 1);
                }, 7000);
            });
        }

        // Show first slide
        this.showSlide(0);
    }

    /**
     * Show specific slide
     */
    showSlide(index) {
        if (this.slides.length === 0) return;

        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        if (index >= this.slides.length) {
            this.currentSlide = 0;
        } else if (index < 0) {
            this.currentSlide = this.slides.length - 1;
        } else {
            this.currentSlide = index;
        }
        
        this.slides[this.currentSlide].classList.add('active');
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.add('active');
        }
    }

    /**
     * Destroy slider (cleanup)
     */
    destroy() {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
    }
}
