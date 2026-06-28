document.addEventListener('DOMContentLoaded', function () {
    const notificationButton = document.getElementById('notification-button');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');
    const notificationEmpty = document.getElementById('notification-empty');
    const notificationLoading = document.getElementById('notification-loading');
    const markAllReadBtn = document.getElementById('mark-all-read');

    let notifications = [];
    const PAGE_SIZE = 10;
    let isLoading = false;


    // Toggle dropdown
    notificationButton.addEventListener('click', function (e) {
        e.stopPropagation();
        const isHidden = notificationDropdown.classList.contains('hidden');

        if (isHidden) {
            notificationDropdown.classList.remove('hidden');
            loadNotifications();
        } else {
            notificationDropdown.classList.add('hidden');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!notificationDropdown.contains(e.target) && !notificationButton.contains(e.target)) {
            notificationDropdown.classList.add('hidden');
        }
    });

    // Mark all as read
    markAllReadBtn.addEventListener('click', async function (e) {
        e.stopPropagation(); // Prevent dropdown from closing
        try {
            const response = await fetch('/api/v1/user/notifications/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update UI to show all notifications as read
                notifications.forEach(n => n.read = true);
                renderNotifications();
                updateNotificationCount(0);
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    });

    // Load notifications
    async function loadNotifications() {
        if (isLoading) {
            return;
        }

        try {
            isLoading = true;
            showLoading(true);

            const response = await fetch('/api/v1/user/notifications');
            const data = await response.json();
            let unreadCount = 0;

            if (data.success) {
                notifications = data?.results;
                unreadCount = data?.unreadCount;
                renderNotifications();
                updateUnreadCount();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            showEmpty(true);
        } finally {
            isLoading = false;
            showLoading(false);
        }
    }

    // Render notifications
    function renderNotifications() {
        notificationList.innerHTML = '';

        if (!notifications || notifications.length === 0) {
            showEmpty(true);
            return;
        }

        showEmpty(false);
        notifications.slice(0, PAGE_SIZE).forEach((notification, index) => {
            const notificationEl = createNotificationElement(notification);
            notificationList.appendChild(notificationEl);
        });
    }

    // Create notification element
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `p-4 cursor-pointer ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`;

        const timeAgo = getTimeAgo(new Date(notification.createdAt));

        div.innerHTML = `
            <div class="flex space-x-3">
                <div class="flex-1 min-w-0">
                    ${notification.title ?
                `<h4 class="text-sm font-bold text-gray-900 dark:text-gray-100 break-words line-clamp-1 mb-1">${notification.title}</h4>`
                : ''
            }
                    <p class="text-sm text-gray-700 dark:text-gray-300 break-words line-clamp-2">${notification.message}</p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">${timeAgo}</p>
                </div>
                ${!notification.read ? `
                    <div class="flex-shrink-0">
                        <div class="notification-dot w-2 h-2 bg-primary-500 rounded-full"></div>
                    </div>
                ` : ''}
            </div>
        `;

        // Create notification dialog element if it doesn't exist
        let notificationDialog = document.getElementById('notification-dialog');
        if (!notificationDialog) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/static/styles/animate.min.css';
            document.head.appendChild(link);
            notificationDialog = document.createElement('div');
            notificationDialog.id = 'notification-dialog';
            notificationDialog.className = 'fixed inset-0 z-50 hidden overflow-y-auto';
            notificationDialog.innerHTML = `
                <div class="flex min-h-screen animate__animated animate__fadeIn  items-center justify-center p-4 text-center">
                    <div class="fixed inset-0 bg-black/30 dark:bg-black/50 transition-opacity" aria-hidden="true" id="notification-dialog-backdrop"></div>
                    <div class="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 id="notification-dialog-title" class="text-lg font-medium leading-6 text-gray-900 dark:text-white"></h3>
                                <button type="button" id="notification-dialog-close" class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                                    <span class="sr-only">Close</span>
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div class="mt-2">
                                <p id="notification-dialog-message" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"></p>
                                <p id="notification-dialog-time" class="mt-2 text-xs text-gray-500 dark:text-gray-400"></p>
                            </div>
                            <div class="mt-6 flex justify-end">
                                <button type="button" id="notification-dialog-close-btn" class="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(notificationDialog);

            // Add event listeners for the dialog
            const closeBtn = document.getElementById('notification-dialog-close');
            const closeBtn2 = document.getElementById('notification-dialog-close-btn');
            const backdrop = document.getElementById('notification-dialog-backdrop');

            const closeDialog = () => {
                notificationDialog.classList.add('hidden');
            };

            closeBtn?.addEventListener('click', closeDialog);
            closeBtn2?.addEventListener('click', closeDialog);
            backdrop?.addEventListener('click', closeDialog);
        }

        // Add click handler to show notification in custom dialog
        div.addEventListener('click', async (e) => {
            e.stopPropagation();

            // Mark as read if unread
            if (!notification.read) {
                try {
                    const response = await fetch(`/api/v1/user/notifications/${notification.id}/read`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok) {
                        notification.read = true;
                        renderNotifications();
                        updateUnreadCount();
                    }
                } catch (error) {
                    console.error('Error marking notification as read:', error);
                }
            }

            // Show notification in custom dialog
            const dialog = document.getElementById('notification-dialog');
            const title = document.getElementById('notification-dialog-title');
            const message = document.getElementById('notification-dialog-message');
            const time = document.getElementById('notification-dialog-time');

            if (dialog && title && message && time) {
                title.textContent = notification.title || 'Notification';
                message.textContent = notification.message;
                time.textContent = timeAgo;
                dialog.classList.remove('hidden');
            }
        });

        return div;
    }

    // Update notification count
    function updateUnreadCount() {
        loadUnreadCount();
    }

    function updateNotificationCount(count) {
        notificationCount.textContent = count;
        notificationCount.classList.toggle('hidden', count === 0);
    }

    // Helper functions
    function showLoading(show) {
        notificationLoading.classList.toggle('hidden', !show);
        notificationList.classList.toggle('hidden', show);
        notificationEmpty.classList.add('hidden');
    }

    function showEmpty(show) {
        notificationEmpty.classList.toggle('hidden', !show);
        notificationList.classList.toggle('hidden', show);
        notificationLoading.classList.add('hidden');
    }

    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }

        return 'Just now';
    }

    // Initial load of unread count
    async function loadUnreadCount() {
        try {
            const response = await fetch('/api/v1/user/notifications/unread-count');
            const data = await response.json();

            if (data.success) {
                updateNotificationCount(data.results);
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }

    // Load initial unread count
    loadUnreadCount();
});