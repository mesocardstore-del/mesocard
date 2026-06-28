document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/app/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        const userProfile = data.results[0];

        // Update profile image
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = userProfile.profileImage || '/static/images/avatar/default-avatar.png';
        }
        
        // Update sidebar profile image
        const sidebarProfileImage = document.getElementById('sidebar-profile-image');
        if (sidebarProfileImage) {
            sidebarProfileImage.src = userProfile.profileImage || '/static/images/avatar/default-avatar.png';
        }
        
        // Update user name
        const userNameElement = document.getElementById('user-full-name');
        if (userNameElement) {
            userNameElement.textContent = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
        }

        // Update user full name
        const userFullNameElement = document.getElementById('sidebar-full-name');
        if (userFullNameElement) {
            userFullNameElement.textContent = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
        }

        // Update user badge
        const userBadgeElement = document.getElementById('sidebar-badge');
        if (userBadgeElement) {
            if (userProfile?.badge) {
                userBadgeElement.classList.remove('hidden');
                userBadgeElement.textContent = userProfile.badge;
            }
        }

        // Update user role
        const userRoleElement = document.getElementById('sidebar-email');
        if (userRoleElement) {
            userRoleElement.textContent = userProfile.email || 'user@example.com';
        }

        // Update user email
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = userProfile.email || 'user@example.com';
        }

        // Update balance
        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
            balanceElement.textContent = userProfile.balance ? `$ ${userProfile.balance}` : '0.00';
        }

        // Update footer year
        const footerYearElement = document.getElementById('footer-year');
        if (footerYearElement) {
            footerYearElement.textContent = new Date().getFullYear();
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Optional: Add error handling UI
        const errorBanner = document.createElement('div');
        errorBanner.classList.add('bg-red-500', 'text-white', 'p-2', 'text-center');
        errorBanner.textContent = 'Unable to load user profile. Please try again later.';
        document.body.insertBefore(errorBanner, document.body.firstChild);
    }
});
