document.addEventListener('DOMContentLoaded', function() {
    // Token validation function
    async function validateToken() {
        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
            handleUnauthenticatedState();
            return;
        }

        try {
            // Send token to backend for validation
            const response = await fetch('/api/validate-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                handleAuthenticatedState();
            } else {
                handleUnauthenticatedState();
                localStorage.removeItem('jwt_token');
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            handleUnauthenticatedState();
            localStorage.removeItem('jwt_token');
        }
    }

    // Handle authenticated state
    function handleAuthenticatedState() {
        document.querySelectorAll('.logged-in').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.non-logged-in').forEach(el => el.classList.add('hidden'));
    }

    // Handle unauthenticated state
    function handleUnauthenticatedState() {
        document.querySelectorAll('.logged-in').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.non-logged-in').forEach(el => el.classList.remove('hidden'));
    }

    // Validate token on page load
    validateToken();
});
