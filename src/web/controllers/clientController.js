const i18next = require('../../config/i18next');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../../errors');
const adminCategoryService  = require('../../services/admin/AdminCategoryService');
const productService = require('../../services/admin/ProductService');
const bankService = require('../../services/admin/BankService');
const manualTransactionService = require('../../services/ManualTransactionService');
const adminOrderService = require('../../services/admin/AdminOrderService');
const favoriteService = require('../../services/user/FavoriteService');
const userAuthService = require('../../services/UserAuthService');
const profileService = require('../../services/user/ProfileService');
const { debug } = require('../../utils/debug');

const getIndexPage = async (req, res) => {
    if (req.session?.user) return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    const categories = await adminCategoryService.readCategory(null, false, language);
    const parentCategories = categories.filter(category => category.parentId === null);

    res.status(StatusCodes.OK).render('portals/visitors/index', {
        language,
        title: t('visitors-index.registeration-prompt-box.title'),
        description: t('visitors-index.registeration-prompt-box.description'),
        registerButton: t('visitors-index.registeration-prompt-box.register-button'),
        loginButton: t('visitors-index.registeration-prompt-box.login-button'),
        navigationLinks: {
            navigation: t('visitors-index.sidebar-navigation.navigation'),
            home: t('visitors-index.sidebar-navigation.home'),
            about: t('visitors-index.sidebar-navigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        categories: parentCategories || [],
        popup_messages: {
            login_warn: t('visitors-index.popup_messages.login_warn'),
        },
        noResults: t('visitors-index.search.no-results'),
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    })
};

const getRegisterPage = async (req, res) => {
    if (req.session?.user) return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/visitors/auth/register', {
        language,
        description: t('registeration.form.description'),
        firstname: {
            label: t('registeration.form.firstname.label'),
            placeholder: t('registeration.form.firstname.placeholder'),
            patternMessage: t('registeration.form.firstname.patternMessage'),
        },
        lastname: {
            label: t('registeration.form.lastname.label'),
            placeholder: t('registeration.form.lastname.placeholder'),
            patternMessage: t('registeration.form.lastname.patternMessage'),
        },
        country: {
            label: t('registeration.form.country.label'),
            placeholder: t('registeration.form.country.placeholder')
        },
        phone: {
            label: t('registeration.form.phone.label'),
            placeholder: t('registeration.form.phone.placeholder'),
            patternMessage: t('registeration.form.phone.patternMessage')
        },
        email: {
            label: t('registeration.form.email.label'),
            placeholder: t('registeration.form.email.placeholder'),
            patternMessage: t('registeration.form.email.patternMessage')
        },
        password: {
            label: t('registeration.form.password.label'),
            placeholder: t('registeration.form.password.placeholder'),
            patternMessage: t('registeration.form.password.patternMessage')
        },
        confirmPassword: {
            label: t('registeration.form.confirmPassword.label'),
            placeholder: t('registeration.form.confirmPassword.placeholder'),
            patternMessage: t('registeration.form.confirmPassword.patternMessage')
        },
        googleSigninButton: t('registeration.form.googleSigninButton'),
        facebookSigninButton: t('registeration.form.facebookSigninButton'),
        registerButton: t('registeration.form.registerButton'),
        question: t('registeration.form.question'),
        loginButton: t('registeration.form.loginButton'),
        session: {
            lang: language
        }
    })
};

const getLoginPage = async (req, res) => {
    if (req.session?.user) return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/visitors/auth/login', {
        language,
        description: t('login.form.description'),
        email: {
            label: t('login.form.email.label'),
            placeholder: t('login.form.email.placeholder'),
            patternMessage: t('login.form.email.patternMessage'),
        },
        password: {
            label: t('login.form.password.label'),
            placeholder: t('login.form.password.placeholder'),
            patternMessage: t('login.form.password.patternMessage'),
        },
        forgotPasswordButton: t('login.form.forgotPasswordButton'),
        loginButton: t('login.form.loginButton'),
        googleSigninButton: t('login.form.googleSigninButton'),
        facebookSigninButton: t('login.form.facebookSigninButton'),
        question: t('login.form.question'),
        registerButton: t('login.form.registerButton'),
        session: {
            lang: language
        }
    });
}

const getForgotPasswordPage = async (req, res) => {
    if (req.session?.user) return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/visitors/auth/forgot-password', {
        language,
        description: t('forgotPassword.description'),
        emailLabel: t('forgotPassword.emailLabel'),
        emailPlaceholder: t('forgotPassword.emailPlaceholder'),
        sendButton: t('forgotPassword.sendButton'),
        rememberYourPassword: t('forgotPassword.rememberYourPassword'),
        backToLogin: t('forgotPassword.backToLogin'),
        text: t('forgotPassword.text'),
        session: {
            lang: language
        }
    });
}

const getResetPasswordPage = async (req, res) => {
    if (req.session?.user) return res.redirect('/app/user');
    const token = req?.params?.token;
    const tokenValidation = await userAuthService.checkPasswordResetToken(token);
    if (!token || !tokenValidation) return res.redirect('/');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/visitors/auth/reset-password', {
        language,
        description: t('resetPassword.description'),
        newPassword: t('resetPassword.NewPassword'),
        newPasswordPlaceholder: t('resetPassword.NewPasswordPlaceholder'),
        confirmPassword: t('resetPassword.ConfirmPassword'),
        confirmPasswordPlaceholder: t('resetPassword.ConfirmPasswordPlaceholder'),
        sendButton: t('resetPassword.sendButton'),
        text: t('resetPassword.text'),
        token,
        session: {
            lang: language
        }
    });
}

const getUserIndexPage = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    // Fetch root categories with translations
    const categories = await adminCategoryService.readCategory(null, false, language);
    
    const parentCategories = categories.filter(category => category.parentId === null);

    res.status(StatusCodes.OK).render('portals/user/index', {
        language,
        currentPage: 'home',
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        categories: parentCategories || [],
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        productNotAvailable: t('userIndex.productNotAvailable'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};

const getUpdateProfilePage = async (req, res) => {
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (!req.session?.user?.userId) return res.redirect('/login');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    const user = await profileService.readUser(req?.session?.user?.userId);
    
    res.status(StatusCodes.OK).render('portals/user/update_profile', {
        language,
        currentPage: 'update-profile',
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        user: user || {},
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            noNotifications: t('notifications.noNotifications'),
            viewAll: t('notifications.viewAll')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};


const getUserAddBalancePage = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    const banks = await bankService.readBanks(null, false, null);
    
    res.status(StatusCodes.OK).render('portals/user/add_balance', {
        language,
        currentPage: 'add-balance',
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('userBank.noResults'),
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        banks: banks || [],
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};

const getFavoritesPage = async (req, res) => {
    if (!req?.session?.user) return res.redirect('/login');
    if (req?.session?.user?.isNewUser) return res.redirect('/app/complete-profile');

    const language = req?.session?.lang || req?.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    let favorites = await favoriteService.getFavorites(req?.session?.user?.userId);
    // make products to have the product id data of the foreign key productId
    let products = await Promise.all(favorites.map(async favorite => {
        let product = await productService.readProduct(favorite?.productId);
        // add to product if its favorite true or false
        product.isFavorite = true;

        return product;
    }))

    res.status(StatusCodes.OK).render('portals/user/favorites', {
        language,
        currentPage: 'favorites',
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        noResults: t('userIndex.noResults'),
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        products: products || [],
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};


const getVisitorCategoryPage = async (req, res) => {
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');

    const categoryId = req.params.id;
    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    let products = [];
    let categoryInfo = '';
    let removeMarquee = false;

    const category = await adminCategoryService.getCategoryById(categoryId, language);
    if (category) {
        categoryInfo = category;
        removeMarquee = true;
    }

    // Fetch root categories with translations
    const categories = await adminCategoryService.readCategoryChildren(categoryId, language);
    if (Array.isArray(categories) && categories.length === 0) {
        products = await productService.readProductsByCategory(categoryId);
    }
    
    products = products || [];
    debug(`[getVisitorCategoryPage] Products: ${products.length}`)
    
    res.status(StatusCodes.OK).render('portals/visitors/index', {
        language,
        currentPage: 'home',
        searchBarText: t('visitors-index.search-bar.text'),
        title: t('visitors-index.registeration-prompt-box.title'),
        description: t('visitors-index.registeration-prompt-box.description'),
        registerButton: t('visitors-index.registeration-prompt-box.register-button'),
        loginButton: t('visitors-index.registeration-prompt-box.login-button'),
        noResults: t('visitors-index.search.no-results'),
        categoryInfo: categoryInfo || '',
        removeMarquee: removeMarquee || false,
        categories: categories || [],
        products: products || [],
        navigationLinks: {
            navigation: t('visitors-index.sidebar-navigation.navigation'),
            home: t('visitors-index.sidebar-navigation.home'),
            about: t('visitors-index.sidebar-navigation.about')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        popup_messages: {
            login_warn: t('visitors-index.popup_messages.login_warn'),
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};

const getVisitorAboutPage = async (req, res) => {
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    const viewName = language === 'ar' ? 'portals/visitors/aboutAr' : 'portals/visitors/about';
    
    res.status(StatusCodes.OK).render(viewName, {
        language,
        currentPage: 'home',
        searchBarText: t('visitors-index.search-bar.text'),
        title: t('visitors-index.registeration-prompt-box.title'),
        description: t('visitors-index.registeration-prompt-box.description'),
        registerButton: t('visitors-index.registeration-prompt-box.register-button'),
        loginButton: t('visitors-index.registeration-prompt-box.login-button'),
        navigationLinks: {
            navigation: t('visitors-index.sidebar-navigation.navigation'),
            home: t('visitors-index.sidebar-navigation.home'),
            about: t('visitors-index.sidebar-navigation.about')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};


const getUserCategoryPage = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (!req.params?.id) return res.redirect('/');

    const categoryId = req.params.id;
    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    let products = [];
    let categoryInfo = '';
    let removeMarquee = false;

    const category = await adminCategoryService.getCategoryById(categoryId, language);
    if (category) {
        categoryInfo = category;
        removeMarquee = true;
    }

    // Fetch root categories with translations
    const categories = await adminCategoryService.readCategoryChildren(categoryId, language);
    if (Array.isArray(categories) && categories?.length === 0) {
        products = await productService.readProductsByCategory(categoryId);
        products = await Promise.all(products.map(async product => {
            let favorite = await favoriteService.getFavorites(req?.session?.user?.userId);

            favorite = favorite?.map(favorite => favorite?.productId);
            if (favorite && Array.isArray(favorite) && favorite?.includes(product?.id)) {
                product.isFavorite = true;
            } else {
                product.isFavorite = false;
            }

            return product;
        }))
    }

    res.status(StatusCodes.OK).render('portals/user/index', {
        language,
        currentPage: 'home',
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        categoryInfo: categoryInfo || '',
        removeMarquee: removeMarquee || false,
        categories: categories || [],
        products: products || [],
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};


const getMyCartPage = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/user/my_cart', {
        language,
        currentPage: 'my-cart',
        title: t('myCart.title'),
        description: t('myCart.description'),
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        myCart: {
            title: t('myCart.title'),
            emptyCart: t('myCart.emptyCart'),
            continueShopping: t('myCart.continueShopping'),
            removeItem: t('myCart.removeItem'),
            couponCode: t('myCart.couponCode'),
            discountValue: t('myCart.discountValue'),
            total: t('myCart.total'),
            summary: t('myCart.summary'),
            checkout: t('myCart.checkout')
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    })
}

const getWalletPage = async (req, res) => {
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (!req.session?.user?.userId) return res.redirect('/login');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    
    res.status(StatusCodes.OK).render('portals/user/wallet', {
        language,
        currentPage: 'wallet',
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            noNotifications: t('notifications.noNotifications'),
            viewAll: t('notifications.viewAll')
        },
        wallet: {
            title: t('wallet.title'),
            statics: {
                balance: t('wallet.statics.balance'),
                totalPurchases: t('wallet.statics.totalPurchases'),
                receivedBalance: t('wallet.statics.receivedBalance')
            },
            table: {
                id: t('wallet.table.id'),
                amount: t('wallet.table.amount'),
                status: t('wallet.table.status'),
                type: t('wallet.table.type'),
                date: t('wallet.table.date')
            },
            loading: t('wallet.loading'),
            noResults: t('wallet.noResults')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};

const getAboutUsPage = async (req, res) => {
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (!req.session?.user?.userId) return res.redirect('/login');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });
    const template = language === 'ar' ? 'portals/aboutUsAr' : 'portals/aboutUs';
    
    res.status(StatusCodes.OK).render(template, {
        language,
        currentPage: 'about',
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            noNotifications: t('notifications.noNotifications'),
            viewAll: t('notifications.viewAll')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
};

const getMyOrdersPage = async (req, res) => {
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (!req.session?.user?.userId) return res.redirect('/login');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    res.status(StatusCodes.OK).render('portals/user/my_orders', {
        language,
        title: t('myOrders.title'),
        noOrders: t('myOrders.no-orders'),
        orderId: t('myOrders.order-id'),
        date: t('myOrders.date'),
        total: t('myOrders.total'),
        status: t('myOrders.status'),
        viewDetails: t('myOrders.view-details'),
        statuses: {
            pending: t('myOrders.statuses.pending'),
            completed: t('myOrders.statuses.completed'),
            cancelled: t('myOrders.statuses.cancelled')
        },
        currentPage: 'my-orders',
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            noNotifications: t('notifications.noNotifications'),
            viewAll: t('notifications.viewAll')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};

const getBankPage = async (req, res) => {
    if (!req.session?.user?.userId) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    const bankId = req?.params?.id;
    if (!bankId) return res.redirect('/app/user/add-balance');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    let bank = {};
    try{
        bank = await bankService.readBanks(bankId, true, null);
    } catch (error) {
        if (error instanceof NotFoundError) bank = {};
    }

    res.status(StatusCodes.OK).render('portals/user/bank', {
        language,
        currentPage: 'bank',
        sidebarNavigation: {
            navigation: t('userIndex.sidebarNavigation.navigation'),
            home: t('userIndex.sidebarNavigation.home'),
            addBalance: t('userIndex.sidebarNavigation.addBalance'),
            myCart: t('userIndex.sidebarNavigation.myCart'),
            purchaseHistory: t('userIndex.sidebarNavigation.purchaseHistory'),
            myOrders: t('userIndex.sidebarNavigation.myOrders'),
            wallet: t('userIndex.sidebarNavigation.wallet'),
            ourAgents: t('userIndex.sidebarNavigation.ourAgents'),
            security: t('userIndex.sidebarNavigation.security'),
            about: t('userIndex.sidebarNavigation.about')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            noNotifications: t('notifications.noNotifications'),
            viewAll: t('notifications.viewAll')
        },
        bank: bank || {},
        userBank: {
            title: t('userBank.title'),
            amount: t('userBank.amount'),
            paymentNotice: t('userBank.paymentNotice'),
            image_placeholder: t('userBank.image_placeholder'),
            image_note: t('userBank.image_note'),
            submit_button: t('userBank.submit_button'),
            submit_processing: t('userBank.submit_processing'),
            error: {
                load: t('userBank.error.load'),
                image_upload: t('userBank.error.image_upload'),
                data_error: t('userBank.error.data_error'),
                bank_not_found: t('userBank.error.bank_not_found'),
                bank_not_available: t('userBank.error.bank_not_available'),
                back_to_banks: t('userBank.error.back_to_banks')
            },
            success: t('userBank.success'),
            noResults: t('userBank.noResults'),
            enter: t('userBank.enter')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req?.session?.user
        }
    });
};



/* ADMIN SECTION */
const getAdminPanelPage = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (req.session?.user?.role !== 'admin') return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    res.status(StatusCodes.OK).render('portals/admin/panel', {
        language,
        currentPage: 'admin-panel',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    })
}

const getAdminHomeControl = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (req.session?.user?.role !== 'admin') return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    res.status(StatusCodes.OK).render('portals/admin/panel/home', {
        language,
        currentPage: 'panel-home',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        adminHome: {
            title: t('admin.home.title'),
            page_title: t('admin.home.page_title'),
            page_description: t('admin.home.page_description'),
            marquee_management: {
                title: t('admin.home.marquee_management.title'),
                marquee_description: t('admin.home.marquee_management.marquee_description'),
                current_marquee: t('admin.home.marquee_management.current_marquee'),
                current_marquee_placeholder: t('admin.home.marquee_management.current_marquee_placeholder'),
                update_marquee: t('admin.home.marquee_management.update_marquee')
            },
            image_slider_management: {
                title: t('admin.home.image_slider_management.title'),
                image_slider_description: t('admin.home.image_slider_management.image_slider_description'),
                add_new_slide: t('admin.home.image_slider_management.add_new_slide'),
                slide_title: t('admin.home.image_slider_management.slide_title'),
                slide_description: t('admin.home.image_slider_management.slide_description'),
                slide_image_alt: t('admin.home.image_slider_management.slide_image_alt'),
                current_slides: t('admin.home.image_slider_management.current_slides'),
                loading_slides: t('admin.home.image_slider_management.loading_slides'),
                slide_actions: {
                    add: t('admin.home.image_slider_management.slide_actions.add'),
                    edit: t('admin.home.image_slider_management.slide_actions.edit'),
                    delete: t('admin.home.image_slider_management.slide_actions.delete'),
                    save: t('admin.home.image_slider_management.slide_actions.save'),
                    cancel: t('admin.home.image_slider_management.slide_actions.cancel')
                }
            }
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    })
}

const getAdminCategoryControl = async (req, res) => {
    if (!req.session?.user) return res.redirect('/login');
    if (req.session?.user?.isNewUser) return res.redirect('/app/complete-profile');
    if (req.session?.user?.role !== 'admin') return res.redirect('/app/user');

    const language = req.session?.lang || req.language || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    res.status(StatusCodes.OK).render('portals/admin/panel/categoryManage', {
        language,
        currentPage: 'panel-category',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        adminCategory: {
            title: t('admin.categories.title'),
            page_title: t('admin.categories.page_title'),
            page_description: t('admin.categories.page_description'),
            form: {
                title_add: t('admin.categories.form.title_add'),
                title_edit: t('admin.categories.form.title_edit'),
                name: t('admin.categories.form.name'),
                name_ar: t('admin.categories.form.name_ar'),
                description: t('admin.categories.form.description'),
                parent: t('admin.categories.form.parent'),
                language: t('admin.categories.form.language'),
                select_parent: t('admin.categories.form.select_parent'),
                category_image: t('admin.categories.form.category_image'),
                language_text: {
                    arabic: t('admin.categories.form.language_text.arabic'),
                    english: t('admin.categories.form.language_text.english')
                },
                status: {
                    label: t('admin.categories.form.status.label'),
                    active: t('admin.categories.form.status.active')
                }
            },
            table: {
                title: t('admin.categories.table.title'),
                refresh: t('admin.categories.table.refresh'),
                columns: {
                    orderId: t('admin.categories.table.columns.orderId'),
                    name: t('admin.categories.table.columns.name'),
                    parent: t('admin.categories.table.columns.parent'),
                    status: t('admin.categories.table.columns.status'),
                    actions: t('admin.categories.table.columns.actions')
                },
                active: t('admin.categories.table.active'),
                inactive: t('admin.categories.table.inactive'),
                loading: t('admin.categories.table.loading')
            },
            actions: {
                add: t('admin.categories.actions.add'),
                edit: t('admin.categories.actions.edit'),
                delete: t('admin.categories.actions.delete'),
                save: t('admin.categories.actions.save'),
                cancel: t('admin.categories.actions.cancel')
            },
            buttons: {
                edit: t('admin.categories.buttons.edit'),
                delete: t('admin.categories.buttons.delete')
            },
            messages: {
                confirm_delete: t('admin.categories.messages.confirm_delete'),
                created: t('admin.categories.messages.created'),
                updated: t('admin.categories.messages.updated'),
                deleted: t('admin.categories.messages.deleted'),
                error: t('admin.categories.messages.error')
            }
        },
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    })
}

const getAdminOrderControl = async (req, res) => {
    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    if (!req.session?.user?.userId || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    res.status(StatusCodes.OK).render('portals/admin/panel/orders', {
        language,
        currentPage: 'panel-orders',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};

const getAdminManualPaymentControl = async (req, res) => {
    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    if (!req.session?.user?.userId || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    res.status(StatusCodes.OK).render('portals/admin/panel/manualPayment', {
        language,
        currentPage: 'panel-manual-payment',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};

const viewManualPaymentNotice = async (req, res) => {
    if (!req?.user?.userId) return res.redirect('/login');
    if (!req?.params?.id) return res.redirect('/app/admin/panel/manual-payment?error=Image_Not_Found');

    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    if (!req.session?.user?.userId || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    let transactionId = req?.params?.id;
    const manualTransaction = await manualTransactionService.getManualTransactions(transactionId);
    if (!manualTransaction?.noticeImagePath || !manualTransaction?.noticeImagePath?.length > 0) {
        transactionId = '';
    }

    res.status(StatusCodes.OK).render('portals/admin/panel/manualPaymentNotice', {
        language,
        currentPage: 'panel-manual-payment-notice',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        transactionId: transactionId || '',
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};

const viewOrderForms = async (req, res) => {
    if (!req?.user?.userId) return res.redirect('/login');
    if (!req?.params?.id) return res.redirect('/app/admin/panel/orders');

    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    if (!req.session?.user?.userId || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    let orderId = req?.params?.id;
    let items = {};
    try {
        items = await adminOrderService.getOrderById(orderId);
        items = JSON.parse(items?.items);
        items = items;
    } catch (error) {
        items = {};
    }
    res.status(StatusCodes.OK).render('portals/admin/panel/ordersInfo', {
        language,
        currentPage: 'panel-orders-info',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        items: items || {},
        orderId: orderId || '',
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};

const viewManualPaymentInfo = async (req, res) => {
    if (!req?.user?.userId) return res.redirect('/login');
    if (!req?.params?.id) return res.redirect('/app/admin/panel/orders');

    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    if (!req.session?.user?.userId || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    let paymentId = req?.params?.id;
    let items = {};

    try {
        items = await manualTransactionService.getManualTransactions(paymentId);
        items = JSON.parse(items?.dialogForms);
    } catch (error) {
        items = {};
    }

    res.status(StatusCodes.OK).render('portals/admin/panel/manualPaymentInfo', {
        language,
        currentPage: 'panel-orders-info',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        items: items || {},
        paymentId: paymentId || '',
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language,
            user: req.session.user
        }
    });
};

const getAdminUserControl = async (req, res) => {
    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    res.status(StatusCodes.OK).render('portals/admin/panel/users', {
        language,
        title: t('admin.users.title'),
        navigationLinks: {
            dashboard: t('admin.sidebar.home'),
            categories: t('admin.sidebar.categories'),
            orders: t('admin.sidebar.orders'),
            users: t('admin.sidebar.users'),
            settings: t('admin.sidebar.settings'),
            logout: t('admin.sidebar.logout')
        },
        currentPage: 'panel-users',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('visitors-index.search-bar.text'),
        noResults: t('visitors-index.search.no-results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('userIndex.searchBar.text')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        pageTitle: t('admin.users.page_title'),
        pageDescription: t('admin.users.page_description'),
        usersTable: {
            columns: {
                name: t('admin.users.table.columns.name'),
                email: t('admin.users.table.columns.email'),
                phone: t('admin.users.table.columns.phone'),
                role: t('admin.users.table.columns.role'),
                balance: t('admin.users.table.columns.balance'),
                status: t('admin.users.table.columns.status'),
                lastLogin: t('admin.users.table.columns.last_login'),
                registered: t('admin.users.table.columns.registered'),
                actions: t('admin.users.table.columns.actions')
            },
            filters: {
                role: {
                    label: t('admin.users.filters.role.label'),
                    all: t('admin.users.filters.role.all'),
                    user: t('admin.users.filters.role.user'),
                    admin: t('admin.users.filters.role.admin')
                },
                status: {
                    label: t('admin.users.filters.status.label'),
                    all: t('admin.users.filters.status.all'),
                    active: t('admin.users.filters.status.active'),
                    pending: t('admin.users.filters.status.pending'),
                    locked: t('admin.users.filters.status.locked')
                },
                search: {
                    placeholder: t('admin.users.filters.search.placeholder')
                },
                addUser: t('admin.users.buttons.add_user')
            },
            noUsers: t('admin.users.messages.no_users'),
            loading: t('common.loading')
        },
        userForm: {
            addTitle: t('admin.users.form.add_title'),
            notification: t('admin.users.form.notification'),
            editTitle: t('admin.users.form.edit_title'),
            fields: {
                firstName: t('admin.users.form.fields.first_name'),
                lastName: t('admin.users.form.fields.last_name'),
                email: t('admin.users.form.fields.email'),
                phoneNumber: t('admin.users.form.fields.phone_number'),
                badge: t('admin.users.form.fields.badge'),
                role: t('admin.users.form.fields.role'),
                status: t('admin.users.form.fields.status'),
                password: t('admin.users.form.fields.password'),
                confirmPassword: t('admin.users.form.fields.confirm_password'),
                passwordHelp: t('admin.users.form.fields.passwordHelp')
            },
            placeholders: {
                firstName: t('admin.users.form.placeholders.first_name'),
                lastName: t('admin.users.form.placeholders.last_name'),
                email: t('admin.users.form.placeholders.email'),
                phoneNumber: t('admin.users.form.placeholders.phone_number'),
                password: t('admin.users.form.placeholders.password'),
                confirmPassword: t('admin.users.form.placeholders.confirm_password')
            },
            statusOptions: {
                active: t('admin.users.form.status_options.active'),
                pending: t('admin.users.form.status_options.pending'),
                locked: t('admin.users.form.status_options.locked')
            },
            roleOptions: {
                user: t('admin.users.form.role_options.user'),
                admin: t('admin.users.form.role_options.admin')
            },
            buttons: {
                save: t('common.save'),
                cancel: t('common.cancel'),
                delete: t('common.delete'),
                close: t('common.close')
            },
            validation: {
                required: t('admin.users.form.validation.required'),
                email: t('admin.users.form.validation.email'),
                passwordLength: t('admin.users.form.validation.password_length'),
                passwordMatch: t('admin.users.form.validation.password_match')
            },
            messages: {
                userCreated: t('admin.users.messages.user_created'),
                userUpdated: t('admin.users.messages.user_updated'),
                userDeleted: t('admin.users.messages.user_deleted'),
                deleteConfirm: t('admin.users.messages.delete_confirm'),
                error: t('admin.users.messages.error')
            },
            session: {
                lang: language
            }
        },
        notificationForm: {
            header: t('admin.users.notificationForm.header'),
            send: t('admin.users.notificationForm.send'),
            fields: {
                title: t('admin.users.notificationForm.fields.title'),
                userEmail: t('admin.users.notificationForm.fields.userEmail'),
                type: t('admin.users.notificationForm.fields.type'),
                message: t('admin.users.notificationForm.fields.message')
            },
            placeholders: {
                title: t('admin.users.notificationForm.placeholders.title'),
                message: t('admin.users.notificationForm.placeholders.message'),
                userEmail: t('admin.users.notificationForm.placeholders.userEmail')
            },
            validation: {
                required: t('admin.users.notificationForm.validation.required')
            },
            options: {
                oneUser: t('admin.users.notificationForm.options.oneUser'),
                everyone: t('admin.users.notificationForm.options.everyone')
            }
        },
        pagination: {
            previous: t('admin.users.pagination.previous'),
            next: t('admin.users.pagination.next'),
            showing: t('admin.users.pagination.showing'),
            to: t('admin.users.pagination.to'),
            of: t('admin.users.pagination.of'),
            users: t('admin.users.pagination.users')
        },
        common: {
            close: t('common.close')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
}

const getAdminProductControl = async (req, res) => {
    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    debug(`[getAdminProductControl] language: ${language}`);

    // Get all categories for the form
    const categories = await adminCategoryService.readCategory(null, false, 'en');
    const products = await productService.readProducts();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.status(StatusCodes.OK).render('portals/admin/panel/products', {
        language,
        title: t('admin.products.title'),
        navigationLinks: {
            dashboard: t('admin.sidebar.home'),
            categories: t('admin.sidebar.categories'),
            orders: t('admin.sidebar.orders'),
            users: t('admin.sidebar.users'),
            settings: t('admin.sidebar.settings'),
            logout: t('admin.sidebar.logout')
        },
        currentPage: 'panel-products',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        searchBarText: t('admin.products.search_placeholder'),
        noResults: t('common.no_results'),
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        searchBar: {
            text: t('admin.products.search_placeholder')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        pageTitle: t('admin.products.page_title'),
        pageDescription: t('admin.products.page_description'),
        productsTable: {
            columns: {
                orderId: t('admin.products.table.orderId'),
                name: t('admin.products.table.name'),
                price: t('admin.products.table.price'),
                price_jod: t('admin.products.table.price_jod'),
                is_available: t('admin.products.table.is_available'),
                form: t('admin.products.table.form'),
                actions: t('admin.products.table.actions')
            },
            filters: {
                search: {
                    placeholder: t('admin.products.search_placeholder')
                },
                addProduct: t('admin.products.add_product'),
                manageCoupon: t('admin.products.manage_coupon')
            },
            loading: t('common.loading')
        },
        productForm: {
            addTitle: t('admin.products.form.title'),
            editTitle: t('admin.products.form.edit_title'),
            fields: {
                category: t('admin.products.form.category'),
                name: t('admin.products.form.name'),
                price: t('admin.products.form.price'),
                price_jod: t('admin.products.form.price_jod'),
                minUnits: t('admin.products.form.minUnits'),
                is_available: t('admin.products.form.is_available'),
                image: t('admin.products.form.image'),
                img_upload_file: t('admin.products.form.upload_file'),
                img_formats: t('admin.products.form.image_formats'),
                img_drag_drop: t('admin.products.form.drag_drop'),
                dialog_has_form: t('admin.products.form.dialog_has_form'),
                dialog_form_name: t('admin.products.form.dialog_form_name'),
                dialog_form_field: t('admin.products.form.dialog_form_field'),
                dialog_forms: {
                    main_label: t('admin.products.form.dialog_forms.main_label'),
                    add_field: t('admin.products.form.dialog_forms.add_field'),
                    delete_field: t('admin.products.form.dialog_forms.delete_field')
                },
                dialog_description: t('admin.products.form.dialog_description')
            },
            labels: {
                is_available: t('admin.products.form.is_available_label'),
                dialog_has_form: t('admin.products.form.dialog_has_form_label')
            },
            placeholders: {
                name: t('admin.products.form.name'),
                price: t('admin.products.form.price'),
                dialog_form_name: t('admin.products.form.dialog_form_name'),
                dialog_form_field: t('admin.products.form.dialog_form_field'),
                dialog_description: t('admin.products.form.dialog_description_placeholder')
            },
            validation: {
                required: t('admin.products.form.validation.required'),
                price: t('admin.products.form.validation.price'),
                image: t('admin.products.form.validation.image'),
                dialog_form_name: t('admin.products.form.validation.dialog_form_name'),
                dialog_form_field: t('admin.products.form.validation.dialog_form_field')
            },
            messages: {
                success: t('admin.products.form.messages.success'),
                error: t('admin.products.form.messages.error')
            }
        },
        categories: categories || [],
        products: products || [],
        common: {
            yes: t('common.yes'),
            no: t('common.no'),
            save: t('common.save'),
            cancel: t('common.cancel'),
            delete: t('common.delete'),
            edit: t('common.edit'),
            close: t('common.close')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
}

const getAdminCouponControl = async (req, res) => {
    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    res.status(StatusCodes.OK).render('portals/admin/panel/couponsManage', {
        language,
        title: t('admin.products.title'),
        navigationLinks: {
            dashboard: t('admin.sidebar.home'),
            categories: t('admin.sidebar.categories'),
            orders: t('admin.sidebar.orders'),
            users: t('admin.sidebar.users'),
            settings: t('admin.sidebar.settings'),
            logout: t('admin.sidebar.logout')
        },
        currentPage: 'panel-coupons',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        couponManage: {
            title: t('admin.couponManage.title'),
            stepper: {
                one: {
                    details: t('admin.couponManage.stepper.one.details'),
                    assignProducts: t('admin.couponManage.stepper.one.assignProducts'),
                    addCoupon: t('admin.couponManage.stepper.one.addCoupon'),
                    couponCode: t('admin.couponManage.stepper.one.couponCode'),
                    couponCodePlaceholder: t('admin.couponManage.stepper.one.couponCodePlaceholder'),
                    discountValue: t('admin.couponManage.stepper.one.discountValue'),
                    discountValuePlaceholder: t('admin.couponManage.stepper.one.discountValuePlaceholder'),
                    expirationDate: t('admin.couponManage.stepper.one.expirationDate'),
                    usageLimit: t('admin.couponManage.stepper.one.usageLimit'),
                    usageLimitPlaceholder: t('admin.couponManage.stepper.one.usageLimitPlaceholder'),
                    couponTable: {
                        activeCoupons: t('admin.couponManage.stepper.one.couponTable.activeCoupons'),
                        couponCode: t('admin.couponManage.stepper.one.couponTable.couponCode'),
                        discount: t('admin.couponManage.stepper.one.couponTable.discount'),
                        expirationDate: t('admin.couponManage.stepper.one.couponTable.expirationDate'),
                        actions: t('admin.couponManage.stepper.one.couponTable.actions'),
                        loading: t('admin.couponManage.stepper.one.couponTable.loading')
                    }
                },
                two: {
                    details: t('admin.couponManage.stepper.two.details'),
                    link: t('admin.couponManage.stepper.two.link'),
                    assignProducts: t('admin.couponManage.stepper.two.assignProducts'),
                    searchPlaceholder: t('admin.couponManage.stepper.two.searchPlaceholder'),
                    buttons: {
                        delete: t('admin.couponManage.stepper.two.buttons.delete')
                    },
                    table: {
                        productName: t('admin.couponManage.stepper.two.table.productName'),
                        category: t('admin.couponManage.stepper.two.table.category'),
                        price: t('admin.couponManage.stepper.two.table.price')
                    }
                },
                stepButtons: {
                    next: t('admin.couponManage.stepper.stepButtons.next'),
                    back: t('admin.couponManage.stepper.stepButtons.back'),
                    save: t('admin.couponManage.stepper.stepButtons.save')
                }
            }
        },
        common: {
            yes: t('common.yes'),
            no: t('common.no'),
            save: t('common.save'),
            cancel: t('common.cancel'),
            delete: t('common.delete'),
            edit: t('common.edit'),
            close: t('common.close')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
}

const getAdminBankControl = async (req, res) => {
    const language = req.session?.lang || 'en';
    const t = (key) => i18next.t(key, { lng: language });

    debug(`[getAdminBankControl]language: ${language}`);

    // Get all categories for the form
    const banks = await adminCategoryService.readCategory(null, false, 'en');

    res.status(StatusCodes.OK).render('portals/admin/panel/bankManage', {
        language,
        title: t('admin.bankManage.title'),
        navigationLinks: {
            dashboard: t('admin.sidebar.home'),
            categories: t('admin.sidebar.categories'),
            orders: t('admin.sidebar.orders'),
            users: t('admin.sidebar.users'),
            settings: t('admin.sidebar.settings'),
            logout: t('admin.sidebar.logout')
        },
        currentPage: 'panel-banks',
        sidebarNavigation: {
            navigation: t('adminPanel.sidebarNavigation.navigation'),
            categories: t('adminPanel.sidebarNavigation.categories'),
            orders: t('adminPanel.sidebarNavigation.orders'),
            products: t('adminPanel.sidebarNavigation.products'),
            coupons: t('adminPanel.sidebarNavigation.coupons'),
            analytics: t('adminPanel.sidebarNavigation.analytics'),
            home: t('adminPanel.sidebarNavigation.home'),
            users: t('adminPanel.sidebarNavigation.users'),
            BankManage: t('adminPanel.sidebarNavigation.BankManage'),
            manualPayment: t('adminPanel.sidebarNavigation.manualPayment'),
            ourAgents: t('adminPanel.sidebarNavigation.ourAgents'),
            about: t('adminPanel.sidebarNavigation.about')
        },
        userMenu: {
            myProfile: t('userIndex.userMenu.myProfile'),
            myOrders: t('userIndex.userMenu.myOrders'),
            wallet: t('userIndex.userMenu.wallet'),
            logout: t('userIndex.userMenu.logout')
        },
        isAdmin: req.session?.user?.role === 'admin',
        adminPanel: t('userIndex.sidebarNavigation.adminPanel'),
        notifications: {
            title: t('notifications.title'),
            markRead: t('notifications.markRead'),
            empty: t('notifications.empty')
        },
        pageTitle: t('admin.bankManage.page_title'),
        pageDescription: t('admin.bankManage.page_description'),
        banks: banks || [],
        adminBank: {
            title: t('admin.bankManage.title'),
            page_title: t('admin.bankManage.page_title'),
            page_description: t('admin.bankManage.page_description'),
            modal: {
                delete: {
                    title: t('admin.bankManage.modal.delete.title'),
                    message: t('admin.bankManage.modal.delete.message'),
                    confirm: t('admin.bankManage.modal.delete.confirm')
                }
            },
            table: {
                title: t('admin.bankManage.table.title'),
                search_placeholder: t('admin.bankManage.table.search_placeholder'),
                no_data: t('admin.bankManage.table.no_data'),
                pagination: {
                    showing_of: t('admin.bankManage.table.pagination.showing_of'),
                    banks: t('admin.bankManage.table.pagination.banks'),
                    previous: t('admin.bankManage.table.pagination.previous'),
                    next: t('admin.bankManage.table.pagination.next')
                },
                columns: {
                    logo: t('admin.bankManage.table.columns.logo'),
                    name: t('admin.bankManage.table.columns.name'),
                    status: t('admin.bankManage.table.columns.status'),
                    created: t('admin.bankManage.table.columns.created'),
                    actions: t('admin.bankManage.table.columns.actions')
                },
                status: {
                    active: t('admin.bankManage.table.status.active'),
                    inactive: t('admin.bankManage.table.status.inactive')
                },
                actions: {
                    edit: t('admin.bankManage.table.actions.edit'),
                    delete: t('admin.bankManage.table.actions.delete')
                },
            },
            form: {
                title_add: t('admin.bankManage.form.title_add'),
                edit_title: t('admin.bankManage.form.edit_title'),
                fields: {
                    name: t('admin.bankManage.form.fields.name'),
                    logo: t('admin.bankManage.form.fields.logo'),
                    isActive: t('admin.bankManage.form.fields.isActive'),
                    upload_hint: t('admin.bankManage.form.fields.upload_hint')
                },
                buttons: {
                    save: t('admin.bankManage.form.buttons.save'),
                    cancel: t('admin.bankManage.form.buttons.cancel'),
                    upload: t('admin.bankManage.form.buttons.upload'),
                    submit: t('admin.bankManage.form.buttons.submit')
                },
                name: {
                    label: t('admin.bankManage.form.name.label'),
                    placeholder: t('admin.bankManage.form.name.placeholder')
                },
                logo: {
                    label: t('admin.bankManage.form.logo.label'),
                    placeholder: t('admin.bankManage.form.logo.placeholder'),
                    upload_button: t('admin.bankManage.form.logo.upload_button'),
                    help_text: t('admin.bankManage.form.logo.help_text')
                },
                description: {
                    label: t('admin.bankManage.form.description.label'),
                    placeholder: t('admin.bankManage.form.description.placeholder'),
                    help_text: t('admin.bankManage.form.description.help_text')
                },
                has_form_field: {
                    label: t('admin.bankManage.form.has_form_field.label')
                },
                form_field_label: {
                    label: t('admin.bankManage.form.form_field_label.label'),
                    help_text: t('admin.bankManage.form.form_field_label.help_text'),
                    placeholder: t('admin.bankManage.form.form_field_label.placeholder')
                },
                status: {
                    label: t('admin.bankManage.form.status.label'),
                    active: t('admin.bankManage.form.status.active'),
                    inactive: t('admin.bankManage.form.status.inactive')
                }
            },
            search_placeholder: t('admin.bankManage.search_placeholder'),
            add_bank: t('admin.bankManage.add_bank'),
            delete_confirm: t('admin.bankManage.delete_confirm'),
            success: {
                created: t('admin.bankManage.success.created'),
                updated: t('admin.bankManage.success.updated'),
                deleted: t('admin.bankManage.success.deleted')
            },
            error: {
                load: t('admin.bankManage.error.load'),
                save: t('admin.bankManage.error.save'),
                delete: t('admin.bankManage.error.delete'),
                validation: {
                    name_required: t('admin.bankManage.error.validation.name_required'),
                    invalid_logo: t('admin.bankManage.error.validation.invalid_logo'),
                    logo_size: t('admin.bankManage.error.validation.logo_size')
                }
            }
        },
        common: {
            yes: t('common.yes'),
            no: t('common.no'),
            save: t('common.save'),
            cancel: t('common.cancel'),
            delete: t('common.delete'),
            edit: t('common.edit'),
            close: t('common.close')
        },
        footer: {
            siteName: t('footer.siteName'),
            rightReserved: t('footer.rightReserved'),
            aboutDev: t('footer.aboutDev')
        },
        session: {
            lang: language
        }
    });
}


module.exports = {
    getIndexPage,
    getRegisterPage,
    getLoginPage,
    getForgotPasswordPage,
    getResetPasswordPage,
    getUserIndexPage,
    getUpdateProfilePage,
    getUserAddBalancePage,
    getFavoritesPage,
    getBankPage,
    getMyCartPage,
    getWalletPage,
    getAboutUsPage,
    getMyOrdersPage,
    getAdminPanelPage,
    getAdminHomeControl,
    getAdminCategoryControl,
    getAdminOrderControl,
    getUserCategoryPage,
    getVisitorCategoryPage,
    getVisitorAboutPage,
    getAdminUserControl,
    getAdminProductControl,
    getAdminCouponControl,
    getAdminBankControl,
    getAdminManualPaymentControl,
    viewManualPaymentNotice,
    viewOrderForms,
    viewManualPaymentInfo
};
