document.addEventListener('DOMContentLoaded', () => {
    const langButtons = {
        'en-lang': 'en',
        'ar-lang': 'ar'
    };

    Object.entries(langButtons).forEach(([buttonId, lang]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                fetch('/change-language', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ language: lang })
                })
                .then(response => {
                    if (response.ok) {
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('Language change error:', error);
                });
            });
        }
    });

    // Toggle language dropdown
    const languageDropdownBtn = document.getElementById('language-dropdown-btn');
    const languageDropdown = document.getElementById('language-dropdown');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!languageDropdownBtn.contains(event.target) && !languageDropdown.contains(event.target)) {
            languageDropdown.classList.add('hidden');
        }
    });

    // Language selection buttons
    const enLangSelect = document.getElementById('en-lang-select');
    const arLangSelect = document.getElementById('ar-lang-select');

    // Function to change language
    const changeLanguage = (lang) => {
        fetch('/change-language', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ language: lang })
        })
        .then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to change language');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    // Add event listeners for language selection
    enLangSelect.addEventListener('click', () => {
        changeLanguage('en');
    });

    arLangSelect.addEventListener('click', () => {
        changeLanguage('ar');
    });
});