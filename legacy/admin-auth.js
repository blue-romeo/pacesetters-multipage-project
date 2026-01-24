// Admin Authentication Script
// API_CONFIG is loaded from api-config.js
const API_URL = API_CONFIG.baseURL;

// Check if already logged in
if (localStorage.getItem('adminToken')) {
    window.location.href = 'admin-dashboard.html';
}

// Login Form Handler
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const alertDiv = document.getElementById('alert');
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

// Toggle password visibility
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = togglePassword.querySelector('.eye-icon');
        if (type === 'text') {
            icon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    });
}

// Show alert message
function showAlert(message, type = 'error') {
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    alertDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Disable button
    loginBtn.disabled = true;
    loginBtn.querySelector('span').textContent = 'Logging in...';
    loginBtn.querySelector('.spinner').style.display = 'block';
    
    try {
        const response = await fetch(API_CONFIG.getFullURL(API_CONFIG.endpoints.auth.login), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store token and admin info
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminInfo', JSON.stringify(data.admin));
            
            showAlert('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check your connection and try again.');
    } finally {
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.querySelector('span').textContent = 'Login';
        loginBtn.querySelector('.spinner').style.display = 'none';
    }
});

// Handle Enter key
loginForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
    }
});
