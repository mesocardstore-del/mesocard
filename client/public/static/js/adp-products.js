// Function to toggle dialog fields visibility

window.removeDialogFields = function() {
    const wrapper = document.querySelector('#dynamic-fields-container');
    if (wrapper) wrapper.innerHTML = '';
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize form handling
    const productForm = document.getElementById('product-form');
    const productModal = document.getElementById('product-form-modal');
    let language = getLangCookie();

    // Add click handler for Add New Product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            productModal.classList.remove('hidden');
            document.getElementById('modal-title').textContent =  language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product';
            removeDialogFields();
            productForm.reset();
            // Reset form data attributes when adding new product
            productForm.dataset.action = '';
            productForm.dataset.productId = '';
        });
    }

    // Handle form submission
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(productForm);

        const dialogForms = {};
        const specNameInputs = productForm.querySelectorAll('input[name="spec_name[]"]');
        const specSizeInputs = productForm.querySelectorAll('select[name="spec_size[]"]');
        specNameInputs.forEach((nameInput, index) => {
            const key = nameInput.value.trim();
            const value = specSizeInputs[index] ? specSizeInputs[index].value.trim() : '';
            if (key) {
                dialogForms[key] = value;
            }
        });

        formData.delete('spec_name[]');
        formData.delete('spec_size[]');

        if (Object.keys(dialogForms).length > 0) {
            formData.append('dialogForms', JSON.stringify(dialogForms));
        }

        if (Object.keys(dialogForms).length > 0) {
            formData.append('dialogHasForms', true);
        }

        // Add isAvailable checkbox value
        formData.append('isAvailable', document.getElementById('isAvailable').checked);

        // Real price calculation per unit (USD)
        const realPrice = formData.get('price') / formData.get('minUnits');
        const realPrice_jod = formData.get('price_jod') / formData.get('minUnits');
        
        formData.set('price', realPrice);
        formData.set('price_jod', realPrice_jod);
        try {
            let response;
            if (productForm.dataset.action === 'edit') {
                response = await fetch(`/api/v1/admin/manage/products/${productForm.dataset.productId}`, {
                    method: 'PUT',
                    body: formData
                });
            } else {
                response = await fetch('/api/v1/admin/manage/products', {
                    method: 'POST',
                    body: formData
                });
            }

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save product');
            }

            showSuccess(language === 'ar' ? 'تمت إضافة المنتج بنجاح!' : 'Product added successfully!');
            closeProductForm();
            refreshProductsTable();
        } catch (error) {
            console.error('Form submission error:', error);
            showError(error.message || (language === 'ar' ? 'حدث خطأ أثناء حفظ المنتج' : 'An error occurred while saving the product'));
        }
    });

    
    const addNewSpecification = function(dialogForms = null) {
        const container = document.getElementById('dynamic-fields-container');
        if (!container) {
            console.error('Dynamic fields container not found!');
            return;
        }
        
        const name_field_placeholder = language === 'ar' ? 'اسم حقل (مثال: رقم حساب)' : 'Field Name (Example: Account Number)';
        const field_size_selector = language === 'ar' ? 'حقل صغير' : 'Small Field';
        const field_size_selector_large = language === 'ar' ? 'حقل كبير' : 'Large Field';
        
        if (dialogForms && Object?.keys(dialogForms)?.length > 0) { 
            dialogForms = JSON.parse(dialogForms);
            Object.entries(dialogForms).forEach(([name, input_type]) => {
                const fieldWrapper = document.createElement('div');
                fieldWrapper.className = 'dynamic-field-group grid grid-cols-12 gap-x-3 items-center animate__animated animate__fadeIn';
                
                fieldWrapper.innerHTML = `
                    <!-- Specification Name -->
                    <div class="col-span-12 sm:col-span-9">
                        <input type="text" name="spec_name[]" value="${name}" placeholder="${name_field_placeholder}" class="mt-1 block w-full rounded-md p-3 bg-gray-50 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                    </div>
                    <!-- Specification Size Selector -->
                    <div class="col-span-12 sm:col-span-3">
                        <select name="spec_size[]" class="spec-size-selector mt-1 block w-full p-3 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white" required>
                            <option value="small" ${input_type === 'small' ? 'selected' : ''}>${field_size_selector}</option>
                            <option value="large" ${input_type === 'large' ? 'selected' : ''}>${field_size_selector_large}</option>
                        </select>
                    </div>
                `;
                requestAnimationFrame(() => {
                    container.appendChild(fieldWrapper);
                });
            });
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'dynamic-field-group grid grid-cols-12 gap-x-3 items-center animate__animated animate__fadeIn';
        
        wrapper.innerHTML = `
            <!-- Specification Name -->
            <div class="col-span-12 sm:col-span-9">
                <input type="text" name="spec_name[]" placeholder="${name_field_placeholder}" class="mt-1 block w-full rounded-md p-3 bg-gray-50 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <!-- Specification Size Selector -->
            <div class="col-span-12 sm:col-span-3">
                <select name="spec_size[]" class="spec-size-selector mt-1 block w-full p-3 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white" required>
                    <option value="small">${field_size_selector}</option>
                    <option value="large">${field_size_selector_large}</option>
                </select>
            </div>
        `;
        container.appendChild(wrapper);
    };
    
    // --- Dynamic Specification Fields Logic ---
    window.addNewSpecification = addNewSpecification;

    // Handle edit product
    window.editProduct = async (productId) => {
        try {
            const response = await fetch(`/api/v1/admin/manage/products/${productId}`);
            const product = await response.json();
            
            // Fill form with product data
            document.getElementById('categoryId').value = product?.results?.categoryId;
            document.getElementById('name').value = product?.results?.name;
            document.getElementById('minUnits').value = product?.results.minUnits;
            document.getElementById('price').value = (product?.results?.price * product?.results.minUnits).toFixed(3);
            document.getElementById('price_jod').value = (product?.results?.price_jod * product?.results.minUnits).toFixed(3);
            document.getElementById('isAvailable').checked = product?.results?.isAvailable;
            const dialogForms = product?.results?.dialogForms || '';
            
            // Set the textarea value directly, it will handle the newlines correctly
            const dialogDescription = product?.results?.dialogDescription || '';
            document.getElementById('dialogDescription').value = dialogDescription;
            
            // Set form data attributes for edit mode
            productForm.dataset.action = 'edit';
            productForm.dataset.productId = productId;

            // Add dynamic forms to form
            addNewSpecification(dialogForms);

            // Show modal
            productModal.classList.remove('hidden');
            document.getElementById('modal-title').textContent = language === 'ar' ? 'تعديل منتج' : 'Edit Product';
            removeDialogFields();
        } catch (error) {
            console.error('[editProduct] Error:', error);
            showError(error.message || (language === 'ar' ? 'حدث خطأ أثناء تحميل بيانات المنتج' : 'An error occurred while loading product data'));
        }
    };

    // Handle delete product
    window.deleteProduct = async (productId) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/v1/admin/manage/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showSuccess(language === 'ar' ? 'تم حذف المنتج بنجاح!' : 'Product deleted successfully!');
                refreshProductsTable();
            } else {
                const error = await response.json();
                showError(error.message || (language === 'ar' ? 'حدث خطأ أثناء حذف المنتج' : 'An error occurred while deleting the product'));
            }
        } catch (error) {
            showError(error.message || (language === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product'));
        }
    };

    const fileInfo = document.getElementById('file-info');
    const uploadSvg = document.getElementById('upload-svg');

    // Close product form
    window.closeProductForm = () => {
        productModal.classList.add('hidden');
        productForm.reset();
        document.getElementById('modal-title').textContent = language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product';
        removeDialogFields();
        // Reset form data attributes when closing
        productForm.dataset.action = '';
        productForm.dataset.productId = '';

        if (fileInfo.innerHTML) {
            fileInfo.innerHTML = '';
            fileInfo.classList.add('hidden');
            uploadSvg.classList.remove('text-green-500');
        } else {
            fileInfo.classList.remove('hidden');
            uploadSvg.classList.add('text-green-500');
        }

    };

    // Handle search
    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const name = row.querySelector('td:first-child').textContent.toLowerCase();
            row.style.display = name.includes(searchTerm) ? '' : 'none';
        });
    }, 300));

    // Helper function for debouncing
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

    // Helper function to show notifications
    function showSuccess(message) {
        const notification = document.getElementById('successNotification');
        const messageEl = document.getElementById('successMessage');
        
        messageEl.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
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

    // Function to refresh products table
    async function refreshProductsTable() {
        try {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error refreshing products:', error);
            window.location.reload();
        }
    }

    let currentOpenMenu = null;

    // Add menu functionality
    function addMenuHandlers() {
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = this.getAttribute('data-productid');
                const menu = document.getElementById(`menu-${productId}`);
                
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

    addMenuHandlers();

    window.updateProductOrder = async function(productId, newOrder) {
        try {
            const response = await fetch(`/api/v1/admin/manage/products/${productId}/order/${newOrder}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to update order');
            }
    
            refreshProductsTable();
            showSuccess(language === 'ar' ? 'تم تحديث ترتيب المنتج بنجاح!' : 'Product order updated successfully!');
        } catch (error) {
            console.error('Error updating product order:', error);
            showError(language === 'ar' ? 'فشل تحديث ترتيب المنتج' : 'Failed to update product order');
        }
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
    
    window.deleteLastSpecification = function() {
        const container = document.getElementById('dynamic-fields-container');
        if (!container) return;
    
        const fields = container.querySelectorAll('.dynamic-field-group');
        if (fields.length > 0) {
            const lastField = fields[fields.length - 1];
            // Add fade out animation class
            lastField.classList.add('animate__fadeOut');
            // Remove the element after the animation completes
            lastField.addEventListener('animationend', () => {
                container.removeChild(lastField);
            }, { once: true });
        }
    };
    
});