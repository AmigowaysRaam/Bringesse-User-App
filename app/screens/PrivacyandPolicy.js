import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HeaderBar from '../components/header';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useSelector } from 'react-redux';
import HTML from 'react-native-render-html';

const PrivacyandPolicy = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const privacy_policy = useSelector(state => state.Auth.siteDetails?.privacy_policy);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t('Privacy and Policy')} showBackArrow />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <HTML 
              source={{ html: privacy_policy }}
              contentWidth={wp(100)}  // Ensures the content is responsive to screen size
              tagsStyles={{
                p: {
                  color: COLORS[theme].textPrimary,
                  fontSize: wp(4),
                  lineHeight: hp(3),
                },
              }}
            />
      </ScrollView>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
  },
  termContainer: {
    marginBottom: hp(3),
  },
  termTitle: {
    ...poppins.semi_bold.h6,
    marginBottom: hp(1),
  },
});

export default PrivacyandPolicy;
