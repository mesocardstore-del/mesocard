// Get cart count
async function updateCartCount() {
    try {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const response = await fetch('/api/v1/user/cart/count', defaultOptions);
        const data = await response.json();
        document.getElementById('cart-count').textContent = data?.results[0]?.count || 0;
    } catch (error) {
        console.error('Error getting cart count:', error);
    }
}

updateCartCount();