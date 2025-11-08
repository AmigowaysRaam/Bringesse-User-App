import React, {  } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/header';
import { useSelector } from 'react-redux';
import { IMAGE_ASSETS } from '../resources/images';

const RevenueScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profile = useSelector(state => state.Auth.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
    return (
    <GestureHandlerRootView style={{ flex: 1, padding: wp(1) }}>
      <HeaderBar title={t('Store') || 'Store'} showBackArrow={true} />
      <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        {/* Total Revenue Card */}
        <Image source={IMAGE_ASSETS?.mantainceModde} style={{ width: wp(80), height: wp(50), alignSelf: "center" }} />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: wp(4),
    marginTop: hp(2),
    padding: wp(3),
    borderRadius: wp(2),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: 'center',justifyContent:"center",flex:1
  },
  chartContainer: {
    marginTop: hp(3),
    height: hp(35),
    marginHorizontal: wp(4),
    borderRadius: wp(2),
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: wp(2),
  },
  tabButton: {
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(1),
    borderWidth: 1,
  },
});

export default RevenueScreen;
