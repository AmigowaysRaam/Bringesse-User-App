import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();

  const [theme, setTheme] = useState(systemTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem('theme')
      .then(themeString => {
        if (themeString) {
          console.log('DEFAULT_THEME', themeString);
          setTheme(themeString);
        }
      })
      .catch(error => {
        console.error('Error retrieving data:', error);
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    AsyncStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
