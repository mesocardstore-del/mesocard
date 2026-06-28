module.exports = {
    FIRSTNAME: { min: 3, max: 30, regex: /^[A-Za-z][A-Za-z' -]{1,29}$/ },
    LASTNAME: { min: 3, max: 30, regex: /^[A-Za-z][A-Za-z' -]{1,29}$/ },
    USERNAME: { min: 3, max: 20 , regex: /^[a-zA-Z0-9_]{3,20}$/},
    PASSWORD: { min: 8, max: 128, regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/ },
    EMAIL: { allowedTLDS: ['oauth', 'com', 'net', 'org', 'edu', 'gov', 'co', 'io', 'info', 'biz']},
    EMAIL_VERIFICATION_COOLDOWN: 2,
    EMAIL_TOKEN_EXPIRY: 20, // in minutes
    VERIFY_CODE: { length: 6, regex: /^[0-9]{6}$/ },
    PHONE: { min: 6, max: 15, regex: /^[0-9]{6,15}$/ },
    CART_DIALOG: {
        DETAILS: { min: 2, max: 50, regex: /^[a-zA-Z0-9._\-]{2,50}$/ }
    }
}