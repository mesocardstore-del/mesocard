document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const formErrorMessage = document.getElementById('form-error-message');
    const successPopup = document.getElementById('success-popup');
    const successPopupMessage = document.getElementById('success-popup-message');

    // Show form-specific error message
    function showFormError(message) {
        
        // Ensure message is set
        if (!message) message = 'An unknown error occurred';
        
        // Set the message text
        formErrorMessage.textContent = message;
        
        // Force reflow to ensure transition works
        formErrorMessage.offsetHeight;
        
        // Animate error message
        formErrorMessage.style.opacity = '1';
        formErrorMessage.style.transform = 'translateY(0)';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            formErrorMessage.style.opacity = '0';
            formErrorMessage.style.transform = 'translateY(-100%)';
        }, 5000);
    }

    // Show success popup and redirect after 2 seconds
    function showSuccessPopup(message) {
        successPopupMessage.textContent = message;
        successPopup.classList.remove('hidden');
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = '/login?registered=true';
        }, 2000);
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error message state
        formErrorMessage.style.opacity = '0';
        formErrorMessage.style.transform = 'translateY(-100%)';
        successPopup.classList.add('hidden');

        // Get country code and phone number
        const countryCode = document.getElementById('country').value;
        const phoneNumber = document.getElementById('phone').value;

        // Combine country code and phone number
        const phone = `${countryCode}${phoneNumber}`.replace(/\+/g, ''); // Remove + sign

        // Collect form data
        const formData = {
            firstName: document.getElementById('firstname').value,
            lastName: document.getElementById('lastname').value,
            phoneNumber: phone,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };


        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Show success popup and redirect
                showSuccessPopup('Registration successful! Redirecting to login...');
            } else {
                // Show error message from server
                console.error('Registration failed:', result);
                showFormError(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showFormError('An unexpected error occurred. Please try again.');
        }
    });
});