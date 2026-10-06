import i18n from './config';

// Export the i18n instance for use in components
export { i18n };

// Translation hook
export { useTranslation } from 'react-i18next';

// Type-safe translation function
export const t = (key: string, options?: any) => {
  return i18n.t(key, options);
};

// Language management
export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  ];
};