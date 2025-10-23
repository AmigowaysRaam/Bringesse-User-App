import React, { createContext, useState, useEffect, useContext } from 'react';
import { i18n } from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Language Context
const LanguageContext = createContext();

// Language Provider to wrap the app
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // Default language is English

    // On mount, check if there's a saved language preference in AsyncStorage
    // useEffect(() => {
    //     AsyncStorage.getItem('language')
    //         .then((savedLanguage) => {
    //             if (savedLanguage) {
    //                 setLanguage(savedLanguage);
    //                 i18n.changeLanguage(savedLanguage); // Set language in i18n
    //             }
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching language from AsyncStorage', error);
    //         });
    // }, []);

    const toggleLanguage = (lang) => {
        setLanguage(lang);
        AsyncStorage.setItem('language', lang); // Save the selected language
        // i18n.changeLanguage(lang); // Update the language globally
    };

    return (
        <LanguageContext.Provider value= {{ language, toggleLanguage }
}>
    { children }
    </LanguageContext.Provider>
  );
};

// Custom hook to use the Language Context
export const useLanguage = () => useContext(LanguageContext);
