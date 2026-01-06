// Beautiful Modern QR Code Generator
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('qr-form');
    const urlInput = document.getElementById('url-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const qrImage = document.getElementById('qr-image');
    const qrUrl = document.getElementById('qr-url');
    const downloadBtn = document.getElementById('download-btn');
    const copyBtn = document.getElementById('copy-btn');
    const newQrBtn = document.getElementById('new-qr-btn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Add smooth focus animation to input
    urlInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
    });

    urlInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });

    // Form submission with enhanced UX
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a URL');
            urlInput.focus();
            return;
        }

        if (!isValidURL(url)) {
            showError('Please enter a valid URL (e.g., https://example.com)');
            urlInput.focus();
            return;
        }

        clearError();
        showLoading();
        
        try {
            const response = await fetch('/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate QR code');
            }

            const data = await response.json();
            
            // Add a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            showQRCode(data.qrCodePath, url);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to generate QR code. Please try again.');
        }
    });

    // Enhanced download functionality
    downloadBtn.addEventListener('click', function() {
        if (qrImage.src) {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            const link = document.createElement('a');
            link.href = qrImage.src;
            link.download = `qr-code-${Date.now()}.png`;
            link.click();
            
            // Show success feedback
            showTemporaryMessage('QR Code downloaded successfully!', 'success');
        }
    });

    // Enhanced copy functionality
    copyBtn.addEventListener('click', function() {
        if (qrUrl.textContent) {
            navigator.clipboard.writeText(qrUrl.textContent).then(function() {
                // Visual feedback
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.background = 'var(--success-color)';
                
                setTimeout(function() {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy URL';
                    copyBtn.style.background = '';
                }, 2000);
                
                showTemporaryMessage('URL copied to clipboard!', 'success');
            }).catch(function() {
                showTemporaryMessage('Failed to copy URL', 'error');
            });
        }
    });

    // New QR Code button
    newQrBtn.addEventListener('click', function() {
        resetForm();
        urlInput.focus();
    });

    // Enhanced URL validation
    function isValidURL(string) {
        try {
            const url = new URL(string);
            return ['http:', 'https:'].includes(url.protocol);
        } catch (_) {
            return false;
        }
    }

    function showLoading() {
        generateBtn.disabled = true;
        generateBtn.classList.add('loading');
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        // Add loading animation to the card
        const card = document.querySelector('.card');
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
    }

    function showQRCode(qrCodePath, originalUrl) {
        // Reset button
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> <span>Generate QR Code</span>';
        
        // Set QR code image with loading animation
        qrImage.style.opacity = '0';
        qrImage.src = qrCodePath;
        qrUrl.textContent = originalUrl;
        
        // Show result section with animation
        resultSection.style.display = 'block';
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        // Animate in
        requestAnimationFrame(() => {
            resultSection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        });

        // Animate QR image
        qrImage.onload = function() {
            this.style.transition = 'opacity 0.5s ease';
            this.style.opacity = '1';
        };

        // Scroll to result
        resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        errorMessage.style.opacity = '0';
        errorMessage.style.transform = 'translateY(-10px)';
        
        // Animate error message
        requestAnimationFrame(() => {
            errorMessage.style.transition = 'all 0.3s ease';
            errorMessage.style.opacity = '1';
            errorMessage.style.transform = 'translateY(0)';
        });
        
        // Reset button
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> <span>Generate QR Code</span>';
        
        // Focus input
        urlInput.focus();
    }

    function clearError() {
        if (errorMessage.style.display !== 'none') {
            errorMessage.style.transition = 'all 0.3s ease';
            errorMessage.style.opacity = '0';
            errorMessage.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 300);
        }
    }

    function resetForm() {
        // Clear input
        urlInput.value = '';
        
        // Hide result section with animation
        if (resultSection.style.display !== 'none') {
            resultSection.style.transition = 'all 0.3s ease';
            resultSection.style.opacity = '0';
            resultSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                resultSection.style.display = 'none';
            }, 300);
        }
        
        // Clear any errors
        clearError();
        
        // Reset button states
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy URL';
        copyBtn.style.background = '';
    }

    function showTemporaryMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `temp-message ${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style the message
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? 'var(--success-color)' : 'var(--primary-color)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        document.body.appendChild(messageEl);
        
        // Animate in
        requestAnimationFrame(() => {
            messageEl.style.transform = 'translateX(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to generate QR code
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to reset form
        if (e.key === 'Escape') {
            resetForm();
        }
    });

    // Add input validation on typing
    urlInput.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && !isValidURL(url)) {
            this.style.borderColor = 'var(--warning-color)';
        } else {
            this.style.borderColor = '';
        }
    });

    // Add paste event handling
    urlInput.addEventListener('paste', function(e) {
        setTimeout(() => {
            const url = this.value.trim();
            if (url && isValidURL(url)) {
                this.style.borderColor = 'var(--success-color)';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 1000);
            }
        }, 10);
    });

    // Initialize with focus
    urlInput.focus();
});