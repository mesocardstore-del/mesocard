// DOM Elements
const usersTableBody = document.getElementById('usersTableBody');
const searchInput = document.getElementById('searchUsers');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const addUserBtn = document.getElementById('addUserBtn');
const userForm = document.getElementById('userForm');
const notificationFormElement = document.getElementById('notificationForm');
const userFormModal = document.getElementById('userFormModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModalBtn = document.getElementById('closeModal');
const cancelFormBtn = document.getElementById('cancelForm');
const successNotification = document.getElementById('successNotification');
const notifyType = document.getElementById('notifyType');
const notifyBtn = document.getElementById('notify-btn');
const notificationModalCloseBtn = document.getElementById('notification-close-btn');

// State
let users = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;
let clickOutsideHandlerAdded = false;
let currentOpenMenu = null;

let language = getLangCookie();

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    const notificationForm = new NotificationForm();
    notificationForm.toggleUserInput();

    // Search and filter
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    roleFilter.addEventListener('change', handleFilterChange);
    statusFilter.addEventListener('change', handleFilterChange);
    
    // Modal and Form
    addUserBtn.addEventListener('click', showAddUserForm);
    closeModalBtn.addEventListener('click', closeModal);
    cancelFormBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    userForm.addEventListener('submit', handleFormSubmit);
    notificationFormElement.addEventListener('submit', notificationForm.handleFormSubmit);
    notifyBtn.addEventListener('click', () => notificationForm.showNotificationForm());
    notificationModalCloseBtn.addEventListener('click', () => notificationForm.closeNotificationForm());
    notifyType.addEventListener('change', () => notificationForm.toggleUserInput());
}

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

// API Functions
async function loadUsers() {
    try {
        showLoading();
        
        // Get search term and filters
        const searchTerm = searchInput.value.trim();
        const role = roleFilter.value;
        const status = statusFilter.value;
        
        // Build base URL
        let url = `/api/v1/admin/manage/users/${currentPage}/${itemsPerPage}`;
        
        // Add search term to URL if provided
        if (searchTerm) {
            url += `/${encodeURIComponent(searchTerm)}`;
        }
        
        // Add query parameters for filters
        const queryParams = new URLSearchParams();
        if (role) queryParams.append('role', role);
        if (status) queryParams.append('status', status);
        
        // Append query string if we have any parameters
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            users = data.results || [];
            totalItems = data?.totalUsersCount || 0;
            renderUsersTable();
            renderPagination();
        } else {
            showError(language === 'ar' ? 'فشل جلب بيانات المستخدمين' : 'Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError(language === 'ar' ? 'حدث خطأ أثناء جلب بيانات المستخدمين' : 'An error occurred while loading users');
    } finally {
        hideLoading();
    }
}

async function getUser(userId) {
    try {
        const response = await fetch(`/api/v1/admin/manage/users/${userId}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data.results;
        } else {
            throw new Error(data.message || 'Failed to fetch user');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        showError(language === 'ar' ? 'فشل جلب بيانات المستخدم' : 'Failed to fetch user');
        throw error;
    }
}

async function createUser(userData) {
    try {
        const response = await fetch('/api/v1/admin/manage/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create user');
        }
        
        showSuccess(language === 'ar' ? 'تم إنشاء المستخدم بنجاح!' : 'User created successfully!');
        return data.results;
    } catch (error) {
        console.error('Error creating user:', error);
        showError(language === 'ar' ? 'فشل إنشاء المستخدم' : 'Failed to create user');
        throw error;
    }
}

async function updateUser(userId, userData) {
    try {
        const response = await fetch(`/api/v1/admin/manage/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update user');
        }
        
        showSuccess(language === 'ar' ? 'تم تحديث المستخدم بنجاح!' : 'User updated successfully!');
        return data.results;
    } catch (error) {
        console.error('Error updating user:', error);
        showError(language === 'ar' ? 'فشل تحديث المستخدم' : 'Failed to update user');
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/v1/admin/manage/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete user');
        }
        
        showSuccess(language === 'ar' ? 'تم حذف المستخدم بنجاح!' : 'User deleted successfully!');
        // Refresh the users table
        loadUsers();
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        showError(language === 'ar' ? 'فشل حذف المستخدم' : 'Failed to delete user');
        throw error;
    }
}

// UI Functions
function renderUsersTable() {
    if (!users.length) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    ${language === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}
                </td>
            </tr>`;
        return;
    }
    
    usersTableBody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span class="text-gray-700 dark:text-gray-200 font-medium">
                            ${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}
                        </span>
                    </div>
                    <div class="${language === 'ar' ? 'mr-4' : 'ml-4'}">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                            ${user.firstName || ''} ${user.lastName || ''}
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${user.email || ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${user.phoneNumber || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }">
                    ${user.role}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                $${user.balance || 0.00}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : user.status === 'locked'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }">
                    ${user.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${user.lastLoginIP || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                ${new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap ${language === 'ar' ? 'text-left' : 'text-right'} text-sm font-medium">
                <div class="relative inline-block ${language === 'ar' ? 'text-right' : 'text-left'}">
                    <button type="button" 
                            class="inline-flex items-center text-gray-400 hover:text-gray-600 focus:outline-none menu-button" 
                            data-userid="${user.id}"
                            aria-haspopup="true">
                        <span class="sr-only">Actions</span>
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                    <div id="menu-${user.id}" 
                         class="hidden origin-top-right absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10" 
                         role="menu">
                        <div class="py-1" role="none">
                            <button onclick="event.stopPropagation(); editUser('${user.id}')" class="text-gray-700 dark:text-gray-300 block w-full ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                ${language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            <button onclick="event.stopPropagation(); deleteUser('${user.id}')" class="text-red-600 dark:text-red-400 block w-full ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                ${language === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>`).join('');

    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const userId = this.getAttribute('data-userid');
            const menu = document.getElementById(`menu-${userId}`);
            
            // Close any open menu
            if (currentOpenMenu && currentOpenMenu !== menu) {
                currentOpenMenu.classList.add('hidden');
            }
            
            // Toggle current menu
            menu.classList.toggle('hidden');
            currentOpenMenu = menu.classList.contains('hidden') ? null : menu;
            
            // Update aria-expanded
            const isExpanded = !menu.classList.contains('hidden');
            this.setAttribute('aria-expanded', isExpanded);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.menu-button') && !e.target.closest('[role="menu"]')) {
            if (currentOpenMenu) {
                currentOpenMenu.classList.add('hidden');
                const button = document.querySelector(`[aria-expanded="true"]`);
                if (button) button.setAttribute('aria-expanded', 'false');
                currentOpenMenu = null;
            }
        }
    });
}

// Pagination Functions
function renderPagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('desktopPagination');
    const mobilePaginationContainer = document.getElementById('mobilePagination');
    
    if (!paginationContainer || !mobilePaginationContainer) return;
    
    // Desktop pagination
    let paginationHTML = `
        <span class="text-sm text-gray-700 dark:text-gray-300">
            ${language === 'ar' ? 'عرض' : 'Showing'} <span class="font-medium">${(currentPage - 1) * itemsPerPage + 1}</span> ${language === 'ar' ? 'إلى' : 'to'} 
            <span class="font-medium">${Math.min(currentPage * itemsPerPage, totalItems)}</span> ${language === 'ar' ? 'من' : 'of'} 
            <span class="font-medium">${totalItems}</span> ${language === 'ar' ? 'مستخدم' : 'users'}
        </span>
        <div class="flex space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}">
            <button id="prevPage" class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
                ${language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <button id="nextPage" class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage >= totalPages ? 'disabled' : ''}>
                ${language === 'ar' ? 'التالي' : 'Next'}
            </button>
        </div>
    `;
    
    // Mobile pagination (simplified)
    let mobilePaginationHTML = `
        <div class="flex justify-between items-center w-full">
            <button id="prevPageMobile" class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
                ${language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
                ${language === 'ar' ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <button id="nextPageMobile" class="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage >= totalPages ? 'disabled' : ''}>
                ${language === 'ar' ? 'التالي' : 'Next'}
            </button>
        </div>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    mobilePaginationContainer.innerHTML = mobilePaginationHTML;
    
    // Add event listeners
    document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));
    document.getElementById('prevPageMobile')?.addEventListener('click', () => changePage(-1));
    document.getElementById('nextPageMobile')?.addEventListener('click', () => changePage(1));
}

function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        loadUsers();
    }
}

// Form Handling
function showAddUserForm() {
    document.getElementById('modalTitle').textContent = language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User';
    document.getElementById('userId').value = '';
    document.getElementById('passwordFields').style.display = 'block';
    document.getElementById('passwordHelp').style.display = 'block';
    userForm.reset();
    openModal();
}

async function editUser(userId) {
    try {
        const user = await getUser(userId);
        
        if (user) {
            document.getElementById('modalTitle').textContent = language === 'ar' ? 'تعديل المستخدم' : 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('firstName').value = user.firstName;
            document.getElementById('lastName').value = user.lastName || '';
            document.getElementById('email').value = user.email;
            document.getElementById('phoneNumber').value = user.phoneNumber || '';
            document.getElementById('role').value = user.role;
            document.getElementById('badge').value = user.badge || '';
            document.querySelector(`input[name="status"][value="${user.status}"]`).checked = true;
            
            // Hide password field for existing users
            document.getElementById('passwordFields').style.display = 'none';
            document.getElementById('passwordHelp').style.display = 'none';
            
            openModal();
        } else {
            throw new Error('Failed to load user data');
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showError(language === 'ar' ? 'فشل تحميل بيانات المستخدم. حاول مرة أخرى.' : 'Failed to load user data. Please try again.');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(userForm);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber') || null,
        role: formData.get('role'),
        badge: formData.get('badge') || null,
        status: formData.get('status')
    };
    
    const userId = formData.get('userId');
    if (userId) userData.id = userId;
    
    const password = formData.get('password');
    if (password) userData.password = password;
    
    if (userId) {
        await updateUser(userId, userData);
    } else {
        await createUser(userData);
    }
    
    showSuccess(language === 'ar' ? 'تم حفظ المستخدم بنجاح!' : 'User saved successfully!');
    closeModal();
    loadUsers();
}

// Modal Functions
function openModal() {
    document.body.style.overflow = 'hidden';
    userFormModal.classList.remove('hidden');
    setTimeout(() => {
        modalBackdrop.classList.add('opacity-100');
        modalBackdrop.classList.remove('opacity-0');
    }, 10);
}

function closeModal() {
    modalBackdrop.classList.remove('opacity-100');
    modalBackdrop.classList.add('opacity-0');
    
    setTimeout(() => {
        userFormModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 200);
}

// Search and Filter
function handleSearch() {
    currentPage = 1;
    loadUsers();
}

function handleFilterChange() {
    currentPage = 1;
    loadUsers();
}

class NotificationForm {
    constructor() {
        this.notificationForm = document.getElementById('notificationForm');
        this.notifyBtn = document.getElementById('notify-btn');
        this.notificationModal = document.getElementById('notification-modal');
        this.notificationModalCloseBtn = document.getElementById('notification-close-btn');
        this.notifyType = document.getElementById('notifyType');
        this.userInputContainer = document.getElementById('userInputContainer');
        this.title = document.getElementById('title');
        this.userEmail = this.userInputContainer.querySelector('#user-email');
        this.message = document.getElementById('message');
        // Bind the method to maintain 'this' context
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }
    
    toggleUserInput() {
        if (this.notifyType.value === 'everyone') {
            this.userInputContainer.classList.add('hidden');
            this.userEmail.value = '';
            this.userEmail.required = false;
        } else {
            this.userInputContainer.classList.remove('hidden');
            this.userEmail.required = true;
        }
    }
    
    showNotificationForm() {
        this.resetNotificationForm();
        this.notificationModal.classList.remove('hidden');
    }
    
    resetNotificationForm() {
        this.notifyType.value = 'one-user';
        this.userInputContainer.classList.remove('hidden');
        this.userEmail.required = true;

        this.notificationForm.reset();
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        let url = '/api/v1/user/notifications/create'; // default (single user)
        const formData = new FormData(this.notificationForm);
        // user is not always there
        const userData = {
            title: formData.get('title'),
            notifyType: formData.get('notifyType'),
            email: formData.get('user-email'),
            message: formData.get('message')
        };
        
        if (userData.notifyType === 'everyone') {
            delete userData.email;
            delete userData.notifyType;
            url = '/api/v1/user/notifications/create/everyone'; // for all users
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            this.closeNotificationForm();
            if (response.status === 404) {
                setTimeout(() => {
                    showError(language === 'ar' ? 'فشل إرسال الإشعار. المستخدم غير موجود.' : 'Failed to send notification. User not found.');
                }, 100);
                return;
            }

            setTimeout(() => {
                showError(language === 'ar' ? 'فشل إرسال الإشعار. حاول مرة أخرى.' : 'Failed to send notification. Please try again.');
            }, 100);
            return;
        }

        const data = await response.json();
        this.closeNotificationForm();

        if (data?.count) {
            setTimeout(() => {
                showSuccess(language === 'ar' ? `تم إرسال الإشعار بنجاح! لعدد ${data?.count} مستخدم` : `Notification sent successfully! to ${data?.count} users`);
            }, 100);
        }
        else {
            setTimeout(() => {
                showSuccess(language === 'ar' ? 'تم إرسال الإشعار بنجاح!' : 'Notification sent successfully!');
            }, 100);
        }
    }

    
    closeNotificationForm() {
        this.notificationModal.classList.add('hidden');
        this.resetNotificationForm();
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading() {
    usersTableBody.innerHTML = `
        <tr>
            <td colspan="9" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                <div class="flex justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ${language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
            </td>
        </tr>`;
}

function hideLoading() {
    // Loading state is automatically handled by renderUsersTable
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center`;
    notification.innerHTML = `
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>${message}</span>`;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showSuccess(message) {
    const notification = document.getElementById('successNotification');
    const messageEl = document.getElementById('successMessage');
    
    messageEl.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Make functions available globally
window.editUser = editUser;
window.deleteUser = deleteUser;