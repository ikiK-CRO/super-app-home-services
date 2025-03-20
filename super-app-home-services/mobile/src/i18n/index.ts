import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';

// Import translations
import hr from './translations/hr';
import en from './translations/en';
import sr from './translations/sr';
import bs from './translations/bs';

// Set translations
i18n.translations = {
  en,
  hr,
};

// Always use Croatian locale for showcasing
i18n.locale = 'hr';
i18n.defaultLocale = 'hr';
i18n.fallbacks = true;

// Storage key for saved language
const LANGUAGE_KEY = '@superapp:language';

/**
 * Save language to AsyncStorage
 */
export const saveLanguage = async (locale: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, locale);
  } catch (error) {
    console.error('Failed to save language', error);
  }
};

/**
 * Get saved language from AsyncStorage
 */
export const getSavedLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Failed to get saved language', error);
    return null;
  }
};

/**
 * Initialize language from device or saved preference
 */
export const initializeLanguage = async () => {
  // Try to get saved language preference
  const savedLanguage = await getSavedLanguage();
  
  if (savedLanguage) {
    // Use saved language preference if available
    i18n.locale = savedLanguage;
  } else {
    // Otherwise use device locale if supported, or default to Croatian
    const deviceLocale = Localization.locale.split('-')[0]; // Extract language code (e.g., 'en' from 'en-US')
    
    if (['hr', 'en', 'sr', 'bs'].includes(deviceLocale)) {
      i18n.locale = deviceLocale;
      await saveLanguage(deviceLocale);
    } else {
      // Default to Croatian if device language is not supported
      i18n.locale = 'hr';
      await saveLanguage('hr');
    }
  }
  
  return i18n.locale;
};

/**
 * Change app language
 */
export const changeLanguage = async (locale: string) => {
  if (['hr', 'en', 'sr', 'bs'].includes(locale)) {
    i18n.locale = locale;
    await saveLanguage(locale);
    return true;
  }
  return false;
};

/**
 * Get current locale
 */
export const getCurrentLocale = () => i18n.locale;

/**
 * Custom hook to use i18n
 */
export const useI18n = () => {
  // Function to translate
  const t = useCallback(
    (key: string, options?: Record<string, any>) => {
      return i18n.t(key, options);
    },
    [i18n.locale]
  );

  // Function to change locale
  const setLocale = useCallback((locale: string) => {
    i18n.locale = locale;
  }, []);

  // Function to get current locale
  const getLocale = useCallback(() => {
    return i18n.locale;
  }, []);

  return {
    t,
    locale: i18n.locale,
    setLocale,
    getLocale,
    // Available languages for selection
    languages: [
      { code: 'hr', name: 'Hrvatski' },
      { code: 'en', name: 'English' },
      { code: 'sr', name: 'Srpski' },
      { code: 'bs', name: 'Bosanski' }
    ]
  };
};

export default i18n; 