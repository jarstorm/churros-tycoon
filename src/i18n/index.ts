import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import es from './locales/es';

const LANGUAGE_STORAGE_KEY = 'churros-tycoon-language';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
  if (saved === 'en') {
    i18n.changeLanguage('en');
  }
});

export async function setAppLanguage(lang: 'es' | 'en') {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
