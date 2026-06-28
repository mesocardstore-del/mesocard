document.addEventListener('DOMContentLoaded', () => {
    // Step elements
    const step1Content = document.getElementById('step-1');
    const step2Content = document.getElementById('step-2');
    const indicator1 = document.getElementById('step-indicator-1');
    const indicator2 = document.getElementById('step-indicator-2');
    
    // Footer elements
    const footer1 = document.getElementById('footer-step-1');
    const footer2 = document.getElementById('footer-step-2');

    // Button elements
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const submitBtn = document.getElementById('submit-btn');

    // Coupon elements
    const couponCodeInput = document.getElementById('coupon_code');
    const discountValueInput = document.getElementById('discount_value');
    const expirationDateInput = document.getElementById('expiration_date');
    const usageLimitInput = document.getElementById('usage_limit');

    // Product search elements
    const productSearch = document.getElementById('product-search');
    const searchResults = document.getElementById('search-results');
    const productsTable = document.getElementById('products-table-body');
    const couponsTable = document.getElementById('coupons-table-body');
    const couponLoadingRow = document.getElementById('coupon-loading-row');
    const addedProductIds = new Set();
    const checkedProducts = new Set();

    let isEditing = false;
    let currentCouponId = null;

    submitBtn.addEventListener('click', () => handleSubmit());

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const getLangCookie = () => {
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

    const language = getLangCookie();

    const handleSubmit = async () => {
        try {
            let data = {}
            let products = [];
            const rows = productsTable.querySelectorAll('tr');
            if (rows?.length !== 0) {
                rows.forEach(row => {
                    const productId = row.querySelector('input[name="products[]"]').value;
                    products.push(productId);
                });
            }
            
            data['code'] = couponCodeInput.value;
            if (data['code']?.length === 0) {
                errorAlert(language === 'ar' ? 'الرجاء إدخال رمز الكوبون' : 'Please enter a coupon code');
                return;
            }
            data['discountPercent'] = (discountValueInput.value)?.replaceAll('%', '');
            if (data['discountPercent']?.length === 0) {
                errorAlert(language === 'ar' ? 'الرجاء إدخال قيمة الخصم' : 'Please enter a discount value');
                return;
            }
            data['expirationDate'] = expirationDateInput.value;
            if (data['expirationDate']?.length === 0) {
                errorAlert(language === 'ar' ? 'الرجاء إدخال تاريخ الانتهاء' : 'Please enter an expiration date');
                return;
            }
            data['usageLimit'] = usageLimitInput.value;
            if (data['usageLimit']?.length === 0) {
                errorAlert(language === 'ar' ? 'الرجاء إدخال عدد حد استخدامات الكوبون' : 'Please enter a usage limit');
                return;
            }
            data['allowedProducts'] = products;
            if (data['allowedProducts']?.length === 0) {
                errorAlert(language === 'ar' ? 'الرجاء اختيار منتج واحد علي الأقل' : 'Please select at least one product');
                return;
            }

            const response = await fetch(`/api/v1/admin/manage/coupons${isEditing ? `/${currentCouponId}` : ''}`, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            let coupon = await response.json();
            if (coupon?.success !== true) throw new Error('Failed to create coupon');
            
            coupon = coupon?.results;
            
            const message_en = isEditing ? 'Coupon updated successfully!' : 'Coupon created successfully!';
            const message_ar = isEditing ? 'تم تحديث الكوبون بنجاح!' : 'تم إنشاء الكوبون بنجاح!';
            successAlert(language === 'ar' ? message_ar : message_en);

            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error handling submit,', error);
            isEditing = false;
            currentCouponId = null;
        }
    }

    const setLoading = (isLoading) => {
        if (isLoading) {
            couponsTable.innerHTML = '';
            couponLoadingRow.classList.remove('hidden');
            return;
        } else {
            couponLoadingRow.classList.add('hidden');
        }
    }

    const getAllCoupons = async () => {
        try {
            setPageLoading(true);
            const response = await fetch('/api/v1/admin/manage/coupons');
            const coupons = await response.json();
            if (coupons?.success !== true) throw new Error('Failed to fetch coupons');
            renderCoupons(coupons?.results);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setPageLoading(false);
        }
    };

    getAllCoupons();

    // render all coupons from api
    const renderCoupons = (coupons) => {
        try{
            setLoading(true);
            if (coupons && Object.keys(coupons)?.length === 0) {
                const noResults = document.createElement('tr');
                noResults.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                noResults.innerHTML = `
                    <td colspan="5" class="px-6 py-4 text-center">
                        No coupons found
                    </td>
                `;
                setLoading(false);
                couponsTable.appendChild(noResults);
                return;
            };
            
            // make an html container to put inside a single tr or list of tr
            const rows = document.createDocumentFragment();
            coupons.forEach(coupon => {
                const row = document.createElement('tr');
                row.id = `coupon-row-${coupon?.id}`;
                row.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                row.innerHTML = `
                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        ${coupon?.code || '-'}
                    </th>
                    <td class="px-6 py-4">${(coupon?.discountPercent + '%') || '-'}</td>
                    <td class="px-6 py-4">${coupon?.expirationDate || '-'}</td>
                    <td class="flex flex-row px-6 py-4 space-x-2 justify-start">
                        <button type="button" class="p-1 rounded transition-colors" onclick="editCoupon(${coupon?.id})">
                            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
                            </svg>
                        </button>
                        <button type="button" class="p-1 rounded transition-colors" onclick="deleteCoupon(${coupon?.id})">
                            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                            </svg>
                        </button>
                    </td>
                `
                rows.appendChild(row);
            });
    
            setLoading(false);
            couponsTable.appendChild(rows);
        } catch (error) {
            console.error('Error rendering coupons:', error);
        } finally {
            setLoading(false);
        }
    }

    // Function to add product to table
    const addProductToTable = (product) => {
        if (addedProductIds.has(product?.id)) return;
        if (!product?.name || !product?.category?.name || !product?.price || !product?.minUnits) return;

        const row = document.createElement('tr');
        row.id = `product-row-${product?.id}`;
        row.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
        row.innerHTML = `
            <td class="w-4 p-4">
                <div class="flex items-center">
                    <input id="checkbox-product-${product?.id}" type="checkbox" onclick="updateCheckbox(${product?.id})"
                           class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="checkbox-product-${product?.id}" class="sr-only">checkbox</label>
                </div>
            </td>
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                ${product?.name || '-'}
            </th>
            <td class="px-6 py-4">${product?.category?.name || '-'}</td>
            <td class="px-6 py-4">$${(parseFloat(product?.price) * (product?.minUnits || 1)).toFixed(3)}</td>
            <input type="hidden" name="products[]" value="${product?.id}">
        `;
        productsTable.prepend(row);
        addedProductIds.add(product.id);
    };

    // Function to handle search
    const handleSearch = async (query) => {
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }
        
        try {
            const response = await fetch(`/api/v1/admin/manage/products/search?q=${encodeURIComponent(query)}`);
            let products = await response.json();
            
            searchResults.innerHTML = '';
            
            // make sure the server return error
            if (products?.success !== true) throw new Error('Failed to fetch products');
            
            products = products?.results;
            if (products?.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'px-4 py-2 text-sm text-gray-700 dark:text-gray-300';
                noResults.textContent = 'No products found';
                searchResults.appendChild(noResults);
            } else {
                products.slice(0, 5).forEach(product => {
                    const item = document.createElement('div');
                    item.className = 'px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center';
                    item.innerHTML = `
                        <span>${product?.name || '-'}</span>
                        <span class="text-xs text-gray-500">${product?.category?.name || '-'}</span>
                    `;
                    item.addEventListener('click', () => {
                        addProductToTable(product);
                        productSearch.value = '';
                        searchResults.classList.add('hidden');
                    });
                    searchResults.appendChild(item);
                });
            }
            
            searchResults.classList.remove('hidden');
        } catch (error) {
            console.error('Error searching products:', error);
            searchResults.classList.add('hidden');
        }
    };

    // Event listeners for search
    productSearch?.addEventListener('input', debounce((e) => {
        handleSearch(e.target.value.trim());
    }, 300));

    productSearch?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = searchResults.querySelector('div');
            if (firstResult) firstResult.click();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (productSearch && !productSearch.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });

    // Function to set the style of a step indicator
    const setIndicatorStyle = (indicator, state) => {
        const step_label = indicator.querySelector('.step-label');

        // Reset styles
        indicator.classList.remove('text-blue-600', 'dark:text-blue-500', 'text-gray-500', 'dark:text-gray-400', 'text-green-600', 'dark:text-green-400');
        step_label.classList.remove('border-blue-600', 'dark:border-blue-500', 'border-gray-500', 'dark:border-gray-400', 'border-green-600', 'dark:border-green-400');

        if (state === 'active') {
            indicator.classList.add('text-blue-600', 'dark:text-blue-500');
            step_label.classList.add('border-blue-600', 'dark:border-blue-500');
        } else if (state === 'completed') {
            indicator.classList.add('text-green-600', 'dark:text-green-400');
            step_label.classList.add('border-green-600', 'dark:border-green-400');
        } else { // inactive
            indicator.classList.add('text-gray-500', 'dark:text-gray-400');
            step_label.classList.add('border-gray-500', 'dark:border-gray-400');
        }
    };

    // Function to go to a specific step
    const goToStep = (step) => {
        if (step === 1) {
            step1Content.classList.remove('hidden');
            step2Content.classList.add('hidden');
            footer1.classList.remove('hidden');
            footer2.classList.add('hidden');
            
            setIndicatorStyle(indicator1, 'active');
            setIndicatorStyle(indicator2, 'inactive');
        } else if (step === 2) {
            step1Content.classList.add('hidden');
            step2Content.classList.remove('hidden');
            footer1.classList.add('hidden');
            footer2.classList.remove('hidden');
            
            setIndicatorStyle(indicator1, 'completed');
            setIndicatorStyle(indicator2, 'active');
        }
    };

    // Event listeners for step navigation
    nextBtn?.addEventListener('click', () => goToStep(2));
    backBtn?.addEventListener('click', () => goToStep(1));
    
    // Initialize to step 1
    goToStep(1);

    const getProductsById = async (ids) => {
        try {
            const response = await fetch(`/api/v1/admin/manage/products/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids })
            });

            let products = await response.json();
            if (products?.success !== true) throw new Error('Failed to fetch products');
            
            return products?.results;

        } catch (error) {
            console.log(`Error fetching products by id:'${ids}'`)
            return null;
        }
    }

    window.editCoupon = async (id) => {
        try {
            isEditing = true;
            currentCouponId = id;
            setPageLoading(true);
            const response = await fetch(`/api/v1/admin/manage/coupons/${id}`);
            let coupon = await response.json();
            
            // make sure the server return error
            if (coupon?.success !== true) throw new Error('Failed to fetch coupon');
            
            coupon = coupon?.results;
            // Coupon elements
            couponCodeInput.value = coupon?.code;
            discountValueInput.value = (coupon?.discountPercent + '%');
            expirationDateInput.value = coupon?.expirationDate;
            usageLimitInput.value = coupon?.usageLimit;

            const products = await getProductsById(coupon?.allowedProducts);
            if (products) {
                products.forEach(product => {
                    addProductToTable(product);
                });
            }

        } catch(error) {
            console.log(`Error editing coupon id:'${id}'`)
        } finally {
            setPageLoading(false);
        }
    }

    window.deleteCoupon = async (id) => {
        try {
            const response = await fetch(`/api/v1/admin/manage/coupons/${id}`, {
                method: 'DELETE'
            });
            let coupon = await response.json();
            
            // make sure the server return error
            if (coupon?.success !== true) throw new Error('Failed to delete coupon');
            
            const row = document.getElementById(`coupon-row-${id}`);
            if (row) {
                row.remove();
            }

        } catch(error) {
            console.log(`Error deleting coupon id:'${id}'`)
        }
    }

    window.updateCheckbox = (id) => {
        if (typeof id !== 'number') throw new Error('Invalid id');
        const checkbox = document.getElementById(`checkbox-product-${id}`);
        if (!checkbox) throw new Error('Checkbox not found');
        if (checkbox.checked) {
            checkedProducts.add(id);
        } else {
            checkedProducts.delete(id);
        }
    }

    window.checkAllProducts = (status) => {
        // if the box is checked, uncheck it and remove all products from checkedProducts
        const checkboxes = productsTable.querySelectorAll('input[type="checkbox"]');
        if (!checkboxes) throw new Error('Checkboxes not found');
        checkedProducts.clear();
        checkboxes.forEach(checkbox => {
            checkbox.checked = status;
            if (status) {
                checkedProducts.add(parseInt(checkbox.id.replace('checkbox-product-', '')));
            } else {
                checkedProducts.delete(parseInt(checkbox.id.replace('checkbox-product-', '')));
            }
        });

    }

    window.handleProductsDelete = (ids = checkedProducts) => {
        if (!ids) throw new Error('[handleProductsDelete] Ids not found');
        if (typeof ids !== 'object') throw new Error('[handleProductsDelete] Ids must be an object');
        
        ids.forEach(id => {
            const row = document.getElementById(`product-row-${id}`);
            if (row) row.remove();
            checkedProducts.delete(id);
            addedProductIds.delete(id);
        });
    }
});