import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  BackHandler,
} from 'react-native';
import { hp, wp } from '../../../resources/dimensions';
import { Icon } from 'react-native-paper';
import { poppins } from '../../../resources/fonts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import ToggleTheme from '../../../components/ToggleTheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToggleLang from '../../../components/ToggleLang';
import { useTranslation } from 'react-i18next';
import UserProfileCard from '../../UserProfileCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../../../api/api';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';

// --- Logout Section ---
const LogoutSection = ({ profileD, accessToken, }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const profile = useSelector(state => state.Auth.profile);
  const handleLogout = async (profileD) => {
  Alert.alert(
    t('Confirm Logout'),
    t('Are you sure you want to logout?'),
    [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes'),
        onPress: async () => {
          try {
            const data = await fetchData(
              'logout/',
              'POST',
              { user_id: profileD?.user_id },
              {
                Authorization: accessToken,
                user_id: profileD?.user_id,
                type: 'user',
              }
            );

            if (data?.status === 'true') {
             await AsyncStorage.multiRemove([
  `copilot_home_seen_${profileD?.user_id}`, //  USER BASED
  'access_token',
  'user_data',
  'refresh_token',
]);
              navigation.reset({
                index: 0,
                routes: [{ name: 'GetStartedScreen' }],
              });
            }
          } catch (error) {
            console.error('Logout API Error:', error);
          }finally{
             await AsyncStorage.multiRemove([
  `copilot_home_seen_${profileD?.user_id}`, //  USER BASED
  'access_token',
  'user_data',
  'refresh_token',
]);
 navigation.reset({
                index: 0,
                routes: [{ name: 'GetStartedScreen' }],
              });
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  return (
    <View style={{ backgroundColor: COLORS[theme].viewBackground }}>
      <TouchableOpacity onPress={() => handleLogout(profileD)} style={sectionRow}>
        <View style={leftRow}>
          <MaterialIcon name="logout" size={wp(5)} color={COLORS[theme].textPrimary} />
          <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary }]}>
            {t('Logout')}
          </Text>
        </View>
        <Icon
          source={'menu-right'}
          size={wp(8)}
          style={{ margin: wp(10) }}
          color={COLORS[theme].textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};
// --- Theme Toggle Section ---
const ThemeSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: COLORS[theme].viewBackground }}>
      <View style={sectionRow}>
        <View style={leftRow}>
          <MaterialCommunityIcon
            name="theme-light-dark"
            size={wp(5)}
            color={COLORS[theme].textPrimary}
          />
          <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary }]}>
            {t('Dark Mode')}
          </Text>
        </View>
        <ToggleTheme />
      </View>
    </View>
  );
};
// --- Language Toggle Section ---
const LangSection = () => {

  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ backgroundColor: COLORS[theme].viewBackground }}>
      <View style={sectionRow}>
        <View style={leftRow}>
          <MaterialCommunityIcon
            name="google-translate"
            size={wp(6)}
            color={COLORS[theme].textPrimary}
          />
          <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary }]}>
            {t('language')}
          </Text>
        </View>
        <ToggleLang Icon1="format-letter-case" Icon2="abjad-arabic" lang />
      </View>
    </View>
  );
};
// --- MoreScreen Main Component ---
const MoreScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profileD = useSelector(state => state.Auth.profile);
  const profile = useSelector(state => state.Auth.profileDetails);
  const navigation = useNavigation();
  const accessToken = useSelector(state => state.Auth.accessToken);
  const dispatch = useDispatch();
  const siteDetails = useSelector(state => state.Auth.siteDetails);

  const checkUpdate = async () => {
  };

  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      // block back ONLY on this screen
      return true;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [])
);
  
  useFocusEffect(
    useCallback(() => {
      checkUpdate();
      const fetchProfileData = async () => {
        if (!accessToken || !profileD?.user_id) return;
        try {
          const data = await fetchData('userprofile/' + profileD?.user_id, 'GET', null, {
            Authorization: `${accessToken}`,
            user_id: profileD.user_id,
            type: 'user',
          });
          if (data?.status == 'true') {
            dispatch({
              type: 'PROFILE_DETAILS',
              payload: data,
            });
          }
          else {
            AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'GetStartedScreen' }],
            });
          }
        } catch (error) {
          console.error('profile API Error:', error);
        } finally {
          // setLoading(false);
        }
      };
      fetchProfileData();
    }, [])
  );
  const SectionItem = ({ icon, label, navigationPath }) => (
    <TouchableOpacity onPress={
      () => {
        navigation?.navigate(navigationPath)
      }
    } style={{ backgroundColor: COLORS[theme].viewBackground}}>
      <View style={sectionRow}>
        <View style={leftRow}>
          <MaterialCommunityIcon
            name={icon}
            size={wp(6)}
            color={COLORS[theme].textPrimary}
          />
          <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary, textTransform: "capitalize" }]}>
            {t(label)}
          </Text>
        </View>
        <Icon
          source={'menu-right'}
          size={wp(8)}
          style={{ margin: wp(10) }}
          color={COLORS[theme].textPrimary}
        />
      </View>
    </TouchableOpacity>
  );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        {/* User Profile (Fixed at Top) */}
        <UserProfileCard profile={profile} />
        {/* Scrollable Settings */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: hp(5),
            gap: wp(1),
            // marginHorizontal: wp(2),
          }}>
          {/* <SectionItem icon="trackpad-lock" navigation={navigation} label="Payment screen" navigationPath='PaymentCheck' /> */}
          <SectionItem icon="cart" navigation={navigation} label="Orders History" navigationPath='OrdersHistory' />
          <SectionItem icon="heart" navigation={navigation} label="Wishlist" navigationPath='Wishlist' />
          {/* <SectionItem icon="archive-star" navigation={navigation} label="reviews" navigationPath='TermsAndCondtions' /> */}
          <SectionItem icon="shield-check" navigation={navigation} label="Terms and Conditions" navigationPath='TermsAndCondtions' />
          <SectionItem icon="trackpad-lock" navigation={navigation} label="Privacy and Policy" navigationPath='PrivacyandPolicy' />
          <SectionItem icon="share-all-outline" navigation={navigation} label="Share & Connect" navigationPath='QuickShare' />
          {/* <SectionItem icon="face-agent" navigation={navigation} label="Customer Support" navigationPath='CustomerSupport' /> */}
           <SectionItem icon="face-agent" navigation={navigation} label="Account Management" navigationPath='AccountManage' />
            {/* <SectionItem icon="face-agent" navigation={navigation} label="Category" navigationPath='Category'/> */}
          <ThemeSection />
          {/* <LangSection /> */}
          <LogoutSection profileD={profileD} accessToken={accessToken} />
          {/* App Version Info */}
          <View style={{ backgroundColor: COLORS[theme].viewBackground }}>
            <View style={sectionRow}>
              <View style={[leftRow, { justifyContent: 'space-between', width: wp(80) }]}>
                <View style={{ flexDirection: 'row', gap: wp(3) }}>
                  <MaterialCommunityIcon
                    name="information"
                    size={wp(6)}
                    color={COLORS[theme].textPrimary}
                  />
                  <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary }]}>
                    {t('version')}
                  </Text>
                </View>
                <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary }]}>
                  {`(v.${DeviceInfo?.getVersion()})`}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};
// --- Common Styles ---
const sectionRow = {
  flexDirection: 'row',
  paddingVertical: wp(3), paddingEnd: wp(4),
  alignItems: 'center', justifyContent: 'space-between',
};
const leftRow = {
  flexDirection: 'row',
  alignItems: 'center', marginStart: wp(8),
  gap: wp(4),
};
export default MoreScreen;