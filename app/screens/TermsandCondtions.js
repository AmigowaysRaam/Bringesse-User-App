import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HeaderBar from '../components/header';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useSelector } from 'react-redux';
import HTML from 'react-native-render-html';

const TermsAndConditions = () => {
  
  const { theme } = useTheme();
  const { t } = useTranslation();
  const terms_conditions = useSelector(state => state.Auth.siteDetails?.terms_conditions);
  // Alert.alert(terms_conditions)
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t('Terms and Conditions')} showBackArrow />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <HTML 
              source={{ html: terms_conditions }}
              contentWidth={wp(100)}  // Ensures the content is responsive to screen size
              tagsStyles={{
                p: {
                  color: COLORS[theme].textPrimary,
                  fontSize: wp(4),
                  lineHeight: hp(3.5),
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

export default TermsAndConditions;
