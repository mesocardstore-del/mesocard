document.addEventListener('DOMContentLoaded', function() {
    const ordersContainer = document.getElementById('orders-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noOrdersMessage = document.getElementById('no-orders-message');
    const ordersTable = document.getElementById('orders-table');
    const ordersTableBody = document.getElementById('orders-table-body');
    const orderDetailsModal = document.getElementById('order-details-modal');
    const orderDetailsContent = document.getElementById('order-details-content');
    const closeModalBtn = document.getElementById('close-order-details');
    const language = getLangCookie();

    
    function getLangCookie() {
        try {
            const nameToFind = 'lang' + "=";
            const cookies = document.cookie.split('; ');
            const foundCookie = cookies.find(cookie => cookie.startsWith(nameToFind));
            if (foundCookie) {
                return decodeURIComponent(foundCookie.split('=')[1]);
            } else {
                return 'en'; // default lang
            }
        } catch (error) {
            console.warning('Failed to get cookie value:', error);
            return 'en'; // default lang
        }
    }

    // Function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 3
        }).format(amount);
    }

    // Function to get status class based on status
    function getStatusClass(status) {
        switch(status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }

    // Function to render orders
    function renderOrders(orders) {
        if (!orders || orders.length === 0) {
            noOrdersMessage.classList.remove('hidden');
            ordersTable.classList.add('hidden');
            return;
        }

        // Clear existing rows
        ordersTableBody.innerHTML = '';

        // Add new rows
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #${order.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${formatDate(order.createdAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${formatCurrency(order.totalAmount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                        ${language === 'ar' ? (order.status === 'completed' ? 'تم الانتهاء' : order.status === 'cancelled' ? 'تم الالغاء' : 'قيد الانتظار') : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 view-details" data-order-id="${order.id}">
                        ${language === 'ar' ? 'تفاصيل الطلب' : 'View Details'}
                    </button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });

        ordersTable.classList.remove('hidden');
    }

    // Function to show order details
    async function showOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/v1/user/orders/${orderId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const order = await response.json();
            renderOrderDetails(order);
            orderDetailsModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error fetching order details:', error);
            errorAlert('Failed to load order details. Please try again.');
        }
    }

    // Function to render order details in modal
    function renderOrderDetails(order) {
        try {
            order = order.results;
            order.items = JSON.parse(order.items);
        } catch (error) {
            console.error('Error parsing order details:', error);
            errorAlert('Failed to load order details. Please try again.');
        }

        // Ensure items is an array and handle the case where it might be undefined
        const items = Array.isArray(order.items) ? order.items : [];

        // Generate HTML for each order item
        const itemsHtml = items.length > 0 
            ? items.map(item => {
                // Check if item.items exists and has the expected properties
                const itemData = item.items || item;
                return `
                    <div class="border-b border-gray-200 dark:border-gray-700 py-3">
                        <div class="flex justify-between items-center">
                            <div class="flex-1">
                                <h4 class="text-sm font-medium text-gray-900 dark:text-white">${itemData.name || 'Unnamed Item'}</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${language === 'ar' ? 'الكمية' : 'Quantity'}: ${itemData.quantity || 1}</p>
                            </div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">
                                ${formatCurrency((itemData.unitPrice || 0) * (itemData.quantity || 1))}
                            </p>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-sm text-gray-500 py-2">No items found in this order.</p>';

        orderDetailsContent.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all max-w-2xl w-full">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">${language === 'ar' ? 'الطلب' : 'Order'} #${order.id || ''}</h3>
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status || 'pending')}">
                            ${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                        </span>
                    </div>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        ${language === 'ar' ? 'تم الطلب في' : 'Placed on'} ${order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </p>
                </div>
                
                <div class="px-6 py-4">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">${language === 'ar' ? 'العناصر في الطلب' : 'Order Items'}</h4>
                    <div class="space-y-3">
                        ${itemsHtml}
                    </div>
                </div>
                
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div class="${order?.couponCode ? 'flex' : 'hidden'} justify-between items-center">
                        <p class="text-lg font-bold text-gray-900 dark:text-white">${language === 'ar' ? 'كود الخصم' : 'Discount Code:'}</p>
                        <p class="text-lg font-bold text-emerald-500 dark:text-emerald-400">${order?.couponCode || '-'}</p>
                    </div>
                    <div class="${order?.couponDiscount ? 'flex' : 'hidden'} justify-between items-center">
                        <p class="text-lg font-bold text-gray-900 dark:text-white">${language === 'ar' ? 'الخصم' : 'Discount'}</p>
                        <p class="text-lg font-bold text-red-500 dark:text-red-400">-${formatCurrency(order?.couponDiscount || 0)}</p>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-bold text-gray-900 dark:text-white">${language === 'ar' ? 'المجموع' : 'Total'}</p>
                        <p class="text-lg font-bold text-gray-900 dark:text-white">${formatCurrency(order?.totalAmount || 0)}</p>
                    </div>
                </div>
                
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600" id="close-order-details">
                        ${language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                </div>
            </div>
        `;
    }

    // Function to fetch orders
    async function fetchOrders() {
        try {
            loadingIndicator.classList.remove('hidden');
            noOrdersMessage.classList.add('hidden');
            
            const response = await fetch('/api/v1/user/orders', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin' // Include cookies for authentication
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            renderOrders(data.results || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            noOrdersMessage.textContent = 'Error loading orders. Please try again later.';
            noOrdersMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    // Initialize
    if (ordersContainer) {
        fetchOrders();
    }

    // Event delegation for view details buttons
    document.addEventListener('click', function(e) {
        // Handle view details click
        if (e.target.closest('.view-details')) {
            e.preventDefault();
            const orderId = e.target.closest('.view-details').dataset.orderId;
            showOrderDetails(orderId);
        }
        
        // Handle close modal
        if (e.target === orderDetailsModal || e.target.closest('#close-order-details')) {
            orderDetailsModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !orderDetailsModal.classList.contains('hidden')) {
            orderDetailsModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
});
