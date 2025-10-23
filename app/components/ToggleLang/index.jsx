import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import icons
import { useTheme } from '../../context/ThemeContext';
import { wp } from '../../resources/dimensions';
import { COLORS } from '../../resources/colors';
import { commonStyles } from '../../resources/styles';
import i18n from '../../config/i18';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthHoc } from '../../config/config';
import _ from 'lodash';
import UseProfileHook from '../../hooks/profile-hooks';
import { useLanguage } from '../../context/LanguageContext';

const width = wp(10);

const ToggleLang = ({ Icon1, Icon2, lang }) => {
  const { profile } = UseProfileHook();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const isDarkMode = theme === 'dark';
  // Initialize the toggle value based on current language
  const [isToggleOn, setIsToggleOn] = useState(i18n.language === 'ar' ? 1 : 0); // 1 for Arabic, 0 for English
  const toggleAnimation = useSharedValue(isToggleOn);
  const toggleCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: toggleAnimation.value === 1 ? width : 0 }],
    };
  });
  const {
    reducerConstants: { },
    actions: { APP_LANG_API_CALL, APP_LANG_CHANGE_USER_API_CALL },
  } = useAuthHoc();

  const langchangeBtn = () => {
    const newLang = isToggleOn === 0 ? 'ar' : 'en';
    setIsToggleOn(!isToggleOn); // Toggle the state value
    toggleAnimation.value = withTiming(isToggleOn ? 0 : 1, { duration: 500 });
    getLangData(newLang); // Pass the new language to getLangData function
    toggleLanguage(newLang)
    APP_LANG_CHANGE_USER_API_CALL({
      task: { clearData: true },
      request: {
        payload: {
          userid: profile.id,
          lang: newLang,
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data && !_.isEmpty(data?.data)) {
            // alert(JSON.stringify(data?.data))
          }
        },
        errorCallback(message) {
          console.log('Error:', message);
        },
      },
    });
  };
  function getLangData(newLang) {
    // if (!_.isEmpty(profile)) {
    //   APP_LANG_API_CALL({
    //     task: { clearData: true },
    //     request: {
    //       payload: {
    //         userid: profile.id,
    //         locale: newLang,
    //       },
    //     },
    //     callback: {
    //       successCallback({ message, data }) {
    //         if (data && !_.isEmpty(data?.data)) {
    //           AsyncStorage.setItem('lang_data', JSON.stringify(data?.data?.data));
    //           const translations = data?.data?.data; // Assuming API response contains the translations in JSON format
    //           i18n.addResourceBundle(newLang, 'translation', translations, true, true);
    //           i18n.changeLanguage(newLang); // Change the language globally

    //         }
    //       },
    //       errorCallback(message) {
    //         console.log('Error:', message);
    //       },
    //     },
    //   });
    // }
  }
  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: COLORS[theme].viewBackground,
          borderWidth: 1,
          borderRadius: wp(10),
        },
        commonStyles[theme].shadow,
      ]}>
      <TouchableOpacity
      //  onPress={langchangeBtn} 
       style={styles.toggleContainer}>
        <Animated.View
          style={[
            styles.toggleCircle,
            toggleCircleStyle,
            { backgroundColor: isDarkMode ?  COLORS[theme].accent : '#fff' },
          ]}>
          {/* Switch icons based on the toggle state */}
          <Icon
            name={isToggleOn ? Icon2 : Icon1}
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    width: wp(20),
    height: wp(10),
    borderRadius: wp(10),
    backgroundColor: '#ccc',
    padding: 5,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default ToggleLang;
