/**
 * Bank Manager - Simplified bank management
 */
class BankManager {
    constructor() {
        // State
        this.state = {
            currentPage: 1,
            itemsPerPage: 10,
            totalBanks: 0,
            banks: [],
            currentBankId: null,
            isEditing: false,
            isLoading: false
        };

        this.language = this.getLangCookie();
        // Cache DOM elements
        this.elements = {
            // Form
            form: document.getElementById('bank-form'),
            formTitle: document.getElementById('form-title'),
            submitBtn: document.getElementById('submit-btn'),
            addFieldBtn: document.getElementById('add-field-btn'),
            deleteFieldBtn: document.getElementById('delete-field-btn'),
            cancelBtn: document.getElementById('cancel-edit'),
            
            // Table
            tableBody: document.getElementById('banks-table-body'),
            noBanksRow: document.getElementById('no-banks'),
            
            // Search & Pagination
            searchInput: document.getElementById('search-banks'),
            prevPageBtn: document.getElementById('prev-page'),
            nextPageBtn: document.getElementById('next-page'),
            pageNumbers: document.getElementById('page-numbers'),
            showingCount: document.getElementById('showing-count'),
            totalCount: document.getElementById('total-count'),
            
            // Logo
            logoInput: document.getElementById('bank-logo'),
            logoPreview: document.getElementById('logo-preview-img')
        };

        // Initialize
        this.init();
    }


    // ======================
    // Initialization
    // ======================
    
    init() {
        this.bindEvents();
        this.loadBanks();
        this.setupFormToggle();
    }

    
    getLangCookie() {
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

    bindEvents() {
        const { form, searchInput, prevPageBtn, nextPageBtn, cancelBtn, logoInput } = this.elements;
        
        // Form submission
        form?.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Search with debounce
        searchInput?.addEventListener('input', this.debounce(() => {
            this.state.currentPage = 1;
            this.loadBanks();
        }, 300));

        // Pagination
        prevPageBtn?.addEventListener('click', () => this.changePage(-1));
        nextPageBtn?.addEventListener('click', () => this.changePage(1));
        
        // Cancel edit
        cancelBtn?.addEventListener('click', () => this.resetForm());
        
        // Logo preview
        logoInput?.addEventListener('change', (e) => this.handleLogoUpload(e));
    }

    setupFormToggle() {
        const { form } = this.elements;
        const hasFormCheckbox = form?.querySelector('[name="dialogHasForms"]');
        const formFieldContainer = document.getElementById('form-field-container');
        const formFieldInput = document.getElementById('form-field');
    
        if (!hasFormCheckbox || !formFieldContainer) return;
    
        // Initial state
        formFieldContainer.classList.toggle('hidden', !hasFormCheckbox.checked);
        if (formFieldInput) {
            formFieldInput.required = hasFormCheckbox.checked;
        }
    
        // Toggle on change
        hasFormCheckbox.addEventListener('change', (e) => {
            formFieldContainer.classList.toggle('hidden', !e.target.checked);
            if (formFieldInput) {
                formFieldInput.required = e.target.checked;
                if (!e.target.checked) {
                    formFieldInput.value = ''; // Clear when hiding
                }
            }
        });
    }
    // ======================
    // Data Operations
    // ======================
    
    async loadBanks() {
        try {
            this.setLoading(true);
            const { currentPage, itemsPerPage } = this.state;
            const searchQuery = this.elements.searchInput?.value.trim() || '';
            
            const response = await fetch(
                `/api/v1/user/bank?search=${encodeURIComponent(searchQuery)}`
            );
            
            if (!response.ok) throw new Error('Failed to load banks');
            
            const { results, count } = await response.json();
            
            this.state.banks = results || [];
            this.state.totalBanks = count || 0;
            
            this.renderBanks();
            this.updatePagination();
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleSubmit(e) {
        try {
            e.preventDefault();
            if (this.state.isLoading) return;
            this.setLoading(true);
            
            const { form, logoInput } = this.elements;
            const formData = new FormData(form);
            const { currentBankId, isEditing } = this.state;
            
            // Handle upload
            let imagePath = '';
            if (logoInput.files[0]) {
                const formData = new FormData();
                formData.append('file', logoInput.files[0]);
                
                const uploadResponse = await fetch('/api/v1/upload/bank', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    throw new Error(error.message || 'File upload failed');
                }
                
                const result = await uploadResponse.json();
                imagePath = result.filePath;
            } else if (isEditing && logoInput.dataset.existingImage) {
                // Keep existing image if no new file is uploaded during edit
                imagePath = logoInput.dataset.existingImage;
            }

            // make sure its not empty
            const dynamicFieldGroups = form.querySelectorAll('.dynamic-field-group');
            if (dynamicFieldGroups?.length !== 0) {
                const dynamicFieldGroupObject = {};
                dynamicFieldGroups.forEach(group => {
                    const name = group.querySelector('input[name="spec_name[]"]').value;
                    const value = group.querySelector('select[name="spec_size[]"]').value;
                    dynamicFieldGroupObject[name] = value;
                });
                
                formData.delete('spec_name[]');
                formData.delete('spec_size[]');
                formData.append('dialogForms', JSON.stringify(dynamicFieldGroupObject));
                formData.append('dialogHasForms', true);
            } else {
                formData.append('dialogHasForms', false);
                formData.append('dialogForms', '')
            }


            const formObject = Object.fromEntries([...formData.entries()].map(([key, value]) => 
                [key, form[key]?.type === 'checkbox' ? form[key].checked : value]
            ));
            
            delete formObject.id;
            delete formObject.logo;

            if (!formObject?.isActive) {
                formObject.isActive = false;
            } else {
                formObject.isActive = true;
            }
            
            if (imagePath) {
                formObject.imagePath = imagePath;
            }

            const url = isEditing 
                ? `/api/v1/admin/manage/bank/${currentBankId}`
                : '/api/v1/admin/manage/bank';
            
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject),
            });

            if (!response.ok) {
                this.showError(this.language === 'ar' ? 'فشل في حفظ البنك' : 'Failed to save bank');
                const error = await response.json();
                throw new Error(error.message || 'Failed to save bank');
            }
            
            this.showSuccess(`البنك ${isEditing ? 'تم تحديثه بنجاح' : 'تم إضافته بنجاح'}`);
            this.resetForm();
            this.loadBanks();
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }
    
    async deleteBank(id) {
        const deleteCat = await confirmAlert('هل انت متأكد من حذف هذا البنك ؟');
        if (!deleteCat.isConfirmed) {
            return;
        }

        try {
            this.setLoading(true);
            const response = await fetch(`/api/v1/admin/manage/bank/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) { 
                this.showError(this.language === 'ar' ? 'فشل في حذف البنك' : 'Failed to delete bank');
                throw new Error('Failed to delete bank'); 
            }
            
            this.showSuccess(this.language === 'ar' ? 'تم حذف البنك بنجاح' : 'Bank deleted successfully');
            this.loadBanks();
            
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    // ======================
    // UI Rendering
    // ======================
    
    renderBanks() {
        const { tableBody, noBanksRow } = this.elements;
        const { banks } = this.state;
        
        if (!banks.length) {
            noBanksRow?.classList.remove('hidden');
            tableBody.innerHTML = '';
            return;
        }
        
        noBanksRow?.classList.add('hidden');
        
        tableBody.innerHTML = banks.map(bank => `
            <tr data-id="${bank.id}">
                <td class="px-6 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    ${bank.imagePath ? `
                        <img src="${bank.imagePath}" alt="${bank.name}" class="h-10 w-10 rounded-full object-cover">`
                        : '<div class="h-10 w-10 rounded-full bg-gray-200"></div>'
                    }
                </td>
                <td class="px-6 py-3 md:px-6 md:py-4 whitespace-nowrap dark:text-gray-300">${bank.name}</td>
                <td class="px-6 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${bank.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${bank.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-3 md:px-6 md:py-4 whitespace-nowrap dark:text-gray-300">${bank?.createdAt?.split('T')[0] || 'N/A'}</td>
                <td class="px-9 py-3 md:px-6 md:py-4 whitespace-nowrap text-right">
                    <button class="text-blue-600 hover:text-blue-900 <%= language==='ar' ? 'ml-3' : 'mr-3' %> edit-btn">${this.language === 'ar' ? 'تعديل' : 'Edit'}</button>
                    <button class="text-red-600 hover:text-red-900 delete-btn">${this.language === 'ar' ? 'حذف' : 'Delete'}</button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners
        tableBody.querySelectorAll('.edit-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.editBank(banks[index].id));
        });
        
        tableBody.querySelectorAll('.delete-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteBank(banks[index].id));
        });
    }
    
    addNewSpecification(dialogForms = null) {
        const container = document.getElementById('dynamic-fields-container');
        if (!container) {
            console.error('Dynamic fields container not found!');
            return;
        }
        
        const name_field_placeholder = this.language === 'ar' ? 'اسم حقل (مثال: رقم حساب)' : 'Field Name (Example: Account Number)';
        const field_size_selector = this.language === 'ar' ? 'حقل صغير' : 'Small Field';
        const field_size_selector_large = this.language === 'ar' ? 'حقل كبير' : 'Large Field';
        try {
            this.setLoading(true);
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
        } catch(error) {
            console.error('Error:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    };

    deleteLastSpecification() {
        try {
            this.setLoading(true);
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
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    };

    editBank(id) {
        try{
            const bank = this.state.banks.find(b => b.id == id);
            if (!bank) return;
            
            this.state.currentBankId = id;
            this.state.isEditing = true;
            
            // Update form fields
            const { form, logoPreview } = this.elements;
            form.querySelector('[name="name"]').value = bank?.name || '';
            form.querySelector('[name="dialogDescription"]').value = bank?.dialogDescription || '';
            form.querySelector('[name="logo"]').src = bank?.imagePath || '';
            if (bank?.imagePath) logoPreview.classList.remove('hidden');
            if (bank?.isActive == true) {
                form.querySelector('[name="isActive"]').checked = true;
            } else {
                form.querySelector('[name="isActive"]').checked = false;
            }
            const dialogForms = bank?.dialogForms || '';
            this.setupFormToggle();
            
            // Update logo preview
            if (bank?.imagePath) {
                logoPreview.src = bank?.imagePath;
                logoPreview.classList.remove('hidden');
            }
            
            // Add dynamic forms to form
            this.addNewSpecification(dialogForms);
            
            // Update UI
            this.elements.formTitle.textContent = this.language === 'ar' ? 'تعديل البنك' : 'Edit Bank';
            this.elements.submitBtn.textContent = this.language === 'ar' ? 'تحديث البنك' : 'Update Bank';
            this.elements.cancelBtn.classList.remove('hidden');
            this.removeDialogFields();
        } catch (error) {
            console.error('[editBank] Error:', error);
            this.showError(error.message || (this.language === 'ar' ? 'حدث خطأ أثناء تحميل بيانات البنك' : 'An error occurred while loading bank data'));
        }
    }
    
    removeDialogFields() {
        const wrapper = document.querySelector('#dynamic-fields-container');
        if (wrapper) wrapper.innerHTML = '';
    };
    
    updatePagination() {
        const { currentPage, itemsPerPage, totalBanks } = this.state;
        const { showingCount, totalCount, prevPageBtn, nextPageBtn } = this.elements;
        
        if (!showingCount || !totalCount) return;
        
        const totalPages = Math.ceil(totalBanks / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, totalBanks);
        
        showingCount.textContent = start === end ? start : `${start} - ${end}`;
        totalCount.textContent = totalBanks;
        
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    resetForm() {
        const { form, logoPreview, logoInput } = this.elements;
        
        form.reset();
        logoPreview.src = '';
        logoPreview.classList.add('hidden');
        logoInput.value = '';

        form.querySelector('[name="isActive"]').checked = false;
        
        this.state.currentBankId = null;
        this.state.isEditing = false;
        
        this.elements.formTitle.textContent = this.language === 'ar' ? 'إضافة بنك جديد' : 'Add New Bank';
        this.elements.submitBtn.textContent = this.language === 'ar' ? 'حفظ البنك' : 'Save Bank';
        this.elements.cancelBtn.classList.add('hidden');
        this.removeDialogFields();
    }
    
    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Simple validation
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            this.showError(this.language === 'ar' ? 'الرجاء تحميل صورة صالحة (JPEG/PNG/JPG)' : 'Please upload a valid image (JPEG/PNG/JPG)');
            e.target.value = '';
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.elements.logoPreview.src = e.target.result;
            this.elements.logoPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    changePage(delta) {
        const newPage = this.state.currentPage + delta;
        const totalPages = Math.ceil(this.state.totalBanks / this.state.itemsPerPage);
        
        if (newPage > 0 && newPage <= totalPages) {
            this.state.currentPage = newPage;
            this.loadBanks();
        }
    }

    // ======================
    // Helpers
    // ======================
    
    setLoading(isLoading) {
        const update = this.language === 'ar' ? 'تحديث البنك' : 'Updating bank';
        const save = this.language === 'ar' ? 'حفظ البنك' : 'Saving bank';
        const processing = this.language === 'ar' ? 'معالجة...' : 'Processing...';
        this.state.isLoading = isLoading;
        const { submitBtn, addFieldBtn, deleteFieldBtn } = this.elements;
        if (!submitBtn) return;
        
        submitBtn.disabled = isLoading;
        addFieldBtn.disabled = isLoading;
        deleteFieldBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading 
            ? '<span class="animate-spin">↻</span> ' + processing 
            : this.state.isEditing ? update : save;
    }
    
    showSuccess(message) {
        successAlert(message); 
    }
    
    showError(message) {
        errorAlert(this.language === 'ar' ? `خطأ: ${message}` : `Error: ${message}`); 
    }
    
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.bankManager = new BankManager();
});
