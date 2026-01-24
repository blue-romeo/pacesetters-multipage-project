/**
 * Forms Module - Form validation and submission
 */

export class FormsManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Initialize all forms
     */
    initialize() {
        this.initializeContactForm();
        this.initializeNewsletterForm();
        this.initializeDonationForm();
    }

    /**
     * Validation functions
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\d\s\-\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (field && errorElement) {
            field.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('active');
            field.setAttribute('aria-invalid', 'true');
        }
    }

    hideError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (field && errorElement) {
            field.classList.remove('error');
            errorElement.classList.remove('active');
            field.setAttribute('aria-invalid', 'false');
        }
    }

    showFormStatus(formStatus, type, message) {
        if (formStatus) {
            formStatus.className = `form-status ${type}`;
            formStatus.textContent = message;
            
            if (type !== 'sending') {
                setTimeout(() => {
                    formStatus.className = 'form-status';
                }, 5000);
            }
        }
    }

    /**
     * Initialize contact/volunteer form
     */
    initializeContactForm() {
        const form = document.getElementById('contact-form');
        const successModal = document.getElementById('success-modal');
        const formStatus = document.getElementById('form-status');
        
        if (!form) return;

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!this.validateContactForm(form)) {
                const firstError = form.querySelector('.error');
                if (firstError) firstError.focus();
                this.showFormStatus(formStatus, 'error', 'Please fix the errors above before submitting.');
                return;
            }

            const formData = new FormData(form);
            const data = {
                name: formData.get('name').trim(),
                guardian: formData.get('guardian') ? formData.get('guardian').trim() : undefined,
                email: formData.get('email').trim(),
                phone: formData.get('phone').trim(),
                age: parseInt(formData.get('age')),
                message: formData.get('message') ? formData.get('message').trim() : undefined,
                consent: form.consent.checked
            };
            
            const submitButton = form.querySelector('.submit-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            this.showFormStatus(formStatus, 'sending', 'Sending your application...');

            try {
                const response = await this.apiClient.post('/contacts', data);

                if (response.success) {
                    this.showFormStatus(formStatus, 'success', '✓ Application submitted successfully! We\'ll be in touch soon.');
                    
                    if (successModal) {
                        successModal.classList.add('active');
                        document.body.style.overflow = 'hidden';

                        setTimeout(() => {
                            successModal.classList.remove('active');
                            document.body.style.overflow = '';
                        }, 3000);
                    }

                    form.reset();
                    this.resetPhotoPreview();
                } else {
                    const errorMsg = response.message || 'There was a problem submitting your form. Please try again.';
                    this.showFormStatus(formStatus, 'error', '✗ ' + errorMsg);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showFormStatus(formStatus, 'error', '✗ Network error. Please check your connection and try again.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Application';
            }
        });

        // Real-time validation
        this.attachContactFormValidation(form);

        // Close modal
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === successModal) {
                    successModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    /**
     * Validate contact form
     */
    validateContactForm(form) {
        let isValid = true;

        ['name', 'email', 'phone', 'age', 'consent'].forEach(field => this.hideError(field));

        const name = form.name.value.trim();
        if (!name) {
            this.showError('name', 'Name is required');
            isValid = false;
        }

        const email = form.email.value.trim();
        if (!email) {
            this.showError('email', 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        const phone = form.phone.value.trim();
        if (!phone) {
            this.showError('phone', 'Phone number is required');
            isValid = false;
        } else if (!this.validatePhone(phone)) {
            this.showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        const age = form.age.value.trim();
        if (!age) {
            this.showError('age', 'Age is required');
            isValid = false;
        } else if (age < 10 || age > 15) {
            this.showError('age', 'Age must be between 10 and 15');
            isValid = false;
        }

        if (!form.consent.checked) {
            this.showError('consent', 'You must agree to the terms');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Attach real-time validation to contact form
     */
    attachContactFormValidation(form) {
        if (form.name) {
            form.name.addEventListener('blur', () => {
                if (form.name.value.trim()) this.hideError('name');
            });
        }

        if (form.email) {
            form.email.addEventListener('blur', () => {
                const email = form.email.value.trim();
                if (email && this.validateEmail(email)) this.hideError('email');
            });
        }

        if (form.phone) {
            form.phone.addEventListener('blur', () => {
                const phone = form.phone.value.trim();
                if (phone && this.validatePhone(phone)) this.hideError('phone');
            });
        }

        if (form.age) {
            form.age.addEventListener('blur', () => {
                const age = form.age.value.trim();
                if (age && age >= 10 && age <= 15) this.hideError('age');
            });
        }

        if (form.consent) {
            form.consent.addEventListener('change', () => {
                if (form.consent.checked) this.hideError('consent');
            });
        }
    }

    /**
     * Reset photo preview
     */
    resetPhotoPreview() {
        const photoPreview = document.getElementById('photo-preview');
        const fileUploadLabel = document.querySelector('.file-upload-label');
        
        if (photoPreview) {
            photoPreview.innerHTML = '';
            photoPreview.classList.remove('active');
        }
        if (fileUploadLabel) {
            fileUploadLabel.textContent = 'Choose a photo';
        }
    }

    /**
     * Initialize newsletter form
     */
    initializeNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        const newsletterEmail = document.getElementById('newsletter-email');

        if (!newsletterForm || !newsletterEmail) return;

        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = newsletterEmail.value.trim();
            
            if (email && this.validateEmail(email)) {
                try {
                    const response = await this.apiClient.post('/newsletter/subscribe', { email });

                    if (response.success) {
                        alert(`Thank you for subscribing! We'll send updates to ${email}`);
                        newsletterForm.reset();
                    } else {
                        alert(response.message || 'Failed to subscribe. Please try again.');
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

    /**
     * Initialize donation form
     */
    initializeDonationForm() {
        const donationForm = document.getElementById('donation-form');
        const amountButtons = document.querySelectorAll('.amount-btn');
        const amountInput = document.getElementById('amount');

        if (!donationForm) return;

        // Amount button selection
        amountButtons.forEach(button => {
            button.addEventListener('click', () => {
                amountButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const amount = button.getAttribute('data-amount');
                if (amount !== 'custom') {
                    amountInput.value = amount;
                } else {
                    amountInput.value = '';
                    amountInput.focus();
                }
            });
        });

        // Custom amount input
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                amountButtons.forEach(btn => btn.classList.remove('active'));
                const customBtn = document.querySelector('.amount-btn[data-amount="custom"]');
                if (customBtn) customBtn.classList.add('active');
            });
        }

        // Form submission
        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const amount = amountInput.value;
            if (!amount || amount < 5) {
                alert('Please enter a donation amount of at least $5');
                return;
            }
            
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
                const response = await this.apiClient.post('/donations', donationData);

                if (response.success) {
                    alert(`Thank you for your donation of ${amount}! You will be redirected to the payment page.`);
                    // Redirect to payment processor would go here
                } else {
                    alert(response.message || 'Failed to process donation. Please try again.');
                }
            } catch (error) {
                console.error('Donation submission error:', error);
                alert('Network error. Please try again later.');
            }
        });
    }
}
