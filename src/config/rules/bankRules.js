module.exports = {
    NAME: {
        MIN: 1,
        MAX: 255
    },
    IMAGE_PATH: {
        MIN: 5,
        MAX: 750
    },
    DIALOG_DESCRIPTION: {
        MIN: 5,
        MAX: 3000,
        REGEX: /^[^<>"]*$/
    }
}