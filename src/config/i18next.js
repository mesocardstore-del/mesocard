const i18next = require('i18next');
const path = require('path');
const fs = require('fs');

const ALLOWED_LANGUAGES = ['en', 'ar'];
const loadTranslations = (lng) => {
    if (!ALLOWED_LANGUAGES.includes(lng)) return {};
    try {
        const translationPath = path.join(__dirname, '..', '..', 'client', 'locales', `${lng}.json`);
        return JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
    } catch(error) {
        console.error('Failed to load translations:', error);
        return {};
    }
}

i18next
    .init({
        fallbackLng: 'en',
        defaultLocale: 'en',
        supportedLngs: ALLOWED_LANGUAGES,
        resources: {
            en: { translation: loadTranslations('en') },
            ar: { translation: loadTranslations('ar') }
        },
        interpolation: { 
            escapeValue: false // disable automatic HTML escaping
        }
    });

module.exports = i18next;
