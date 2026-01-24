/**
 * Notifications Module
 * Handles toast notifications and modal alerts
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const colorMap = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colorMap[type] || colorMap.info};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show a modal notification (for important actions)
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} type - Type: 'success', 'error', 'warning'
 * @param {string} containerSelector - Modal container selector (default: '#modal-container')
 */
export function showModalNotification(title, message, type = 'success', containerSelector = '#modal-container') {
    const iconMap = {
        success: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #10b981;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>`,
        error: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`,
        warning: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #f59e0b;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>`
    };

    const modalHTML = `
        <div class="modal-backdrop" onclick="window.closeNotificationModal()"></div>
        <div class="modal-content notification-modal">
            <div class="notification-icon">
                ${iconMap[type] || iconMap.success}
            </div>
            <h2 class="notification-title">${title}</h2>
            <p class="notification-message">${message}</p>
            <div class="notification-actions">
                <button class="btn-primary" onclick="window.closeNotificationModal()" style="min-width: 120px;">OK</button>
            </div>
        </div>
    `;
    
    const notificationModal = document.querySelector(containerSelector);
    if (notificationModal) {
        notificationModal.innerHTML = modalHTML;
        notificationModal.style.display = 'flex';
    }
}

/**
 * Close the notification modal
 * @param {string} containerSelector - Modal container selector
 */
export function closeNotificationModal(containerSelector = '#modal-container') {
    const modal = document.querySelector(containerSelector);
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = '';
    }
}

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 */
export function showConfirmDialog(message, onConfirm, onCancel = null) {
    if (confirm(message)) {
        onConfirm();
    } else if (onCancel) {
        onCancel();
    }
}

// Expose closeNotificationModal globally for onclick handlers
if (typeof window !== 'undefined') {
    window.closeNotificationModal = closeNotificationModal;
}
