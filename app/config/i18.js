// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next with default configuration
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en', // Set initial language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  resources: {
    en: { translation: {} }, // Default empty resources
  },
});

export default i18n;
