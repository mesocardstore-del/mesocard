/*
    DIALOG_FORM_FIELD: {
        MIN: 1,
        MAX: 60,
        REGEX: /^[a-zA-Z0-9\-_ \u0621-\u064A]*$/
    },
 */
module.exports = {
    CATEGORY: {
        NAME: {
            MIN: 2,
            MAX: 60
        },
        NAME_AR: {
            MIN: 2,
            MAX: 60
        },
        DESCRIPTION: {
            MIN: 5,
            MAX: 100
        },
    },
    PRODUCT: {
        SEARCH: {
            MIN: 1,
            MAX: 255
        },
        IMAGE_PATH: {
            MIN: 5,
            MAX: 750
        },
        NAME: {
            MIN: 3,
            MAX: 255
        },
        PRICE: {
            MIN: 0,
            MAX: 99999999
        },
        PRICE_JOD: {
            MIN: 0,
            MAX: 99999999
        },
        DIALOG_DESCRIPTION: {
            MIN: 1,
            MAX: 3000,
            REGEX: /^[^<>"\/]*$/
        }
    }
}