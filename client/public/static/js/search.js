document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('categorySearch');
    const categoryItems = document.querySelectorAll('.category-item');
    const noResults = document.getElementById('noResults');
    const categoryGrid = document.getElementById('categoryGrid');

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

    const filterCategories = debounce(function(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        let hasResults = false;

        categoryItems.forEach(item => {
            const categoryName = item.dataset.categoryName;
            const matches = categoryName.includes(searchTerm);
            item.style.display = matches ? '' : 'none';
            if (matches) hasResults = true;
        });

        if(noResults) noResults.style.display = hasResults ? 'none' : 'block';
        categoryGrid.style.display = hasResults ? 'grid' : 'none';
    }, 150);

    searchInput.addEventListener('input', (e) => {
        filterCategories(e.target.value);
    });
});
