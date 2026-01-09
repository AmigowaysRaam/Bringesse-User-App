import React, { useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native'; import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchData } from '../api/api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { IMAGE_ASSETS } from '../resources/images';

const UserToggleStatus = ({ address }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const profile = useSelector(state => state.Auth.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
  useEffect(() => {
    fetchProfileData();
  }, []);
  const showChristmasLottie = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const cutoffDate = new Date(year, 11, 25); // Dec = 11
    // return today <= cutoffDate;
    return false;
  }, []);

  const fetchProfileData = async () => {
    if (!accessToken || !profile?.user_id) return;

    try {
      const data = await fetchData(
        `userprofile/${profile.user_id}`,
        'GET',
        null,
        {
          Authorization: accessToken,
          user_id: profile.user_id,
          type: 'user',
        }
      );

      if (data?.status === 'true') {
        dispatch({
          type: 'PROFILE_DETAILS',
          payload: data,
        });
      } else {
        await AsyncStorage.clear();
        navigation.reset({
          index: 0,
          routes: [{ name: 'GetStartedScreen' }],
        });
      }
    } catch (error) {
      console.error('Profile API Error:', error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: COLORS[theme].accent }
      ]}
      onPress={() => navigation.navigate('SelectLocation')}
    >
      {/* 🎄 CHRISTMAS LOTTIE (AUTO REMOVED AFTER DEC 26) */}
      {showChristmasLottie && IMAGE_ASSETS?.ChristmasS && (
        <LottieView
          source={IMAGE_ASSETS.ChristmasS}
          autoPlay
          loop={false}
          speed={0.7}
          resizeMode="cover"
          pointerEvents="none"
          style={styles.lottieBackground}
        />
      )}

      {/* CONTENT */}
      <View style={styles.contentRow}>
        <View style={styles.userInfo}>
          <MaterialCommunityIcons
            name="map-marker"
            size={wp(5.8)}
            color={COLORS[theme].white}
            style={{
              marginTop: hp(0.2),
              textShadowColor: '#555',      // stroke color
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1.5,
            }}
          />
          <View style={styles.textContainer}>
            <Text
              numberOfLines={1}
              style={[
                poppins.semi_bold.h5,
                styles.titleText,
                {
                  color: COLORS[theme].white,
                  textShadowColor: '#555',      // stroke color
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 1.5,
                }
              ]}
            >
              {profileDetails?.primary_address?.address_type ||
                t('Current Location')}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                poppins.regular.h8,
                {
                  color: COLORS[theme].white,
                  textShadowColor: '#555',      // stroke color
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 1.5,
                }
              ]}
            >
              {
                profileDetails?.primary_address?.location
                  ? `${profileDetails.primary_address.location
                    ?.trim()}`
                  : address?.replace(/^[A-Za-z0-9\+]+,?\s*/, '').trim()
                // profileDetails?.primary_address?.location
              }
            </Text>
          </View>
        </View>

        {/* DROPDOWN ICON */}
        <MaterialCommunityIcons
          name="chevron-down"
          size={wp(7)}
          color={COLORS[theme].white}
        />
      </View>
    </TouchableOpacity>
  );
};
export default UserToggleStatus;
/* ================= STYLES ================= */
const styles = StyleSheet.create({
  card: {
    borderRadius: wp(0),
    marginVertical: hp(1),
    overflow: 'hidden',
  },
  lottieBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(28),
    opacity: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textContainer: {
    marginLeft: wp(3),
    maxWidth: wp(65),
  },

  titleText: {
    textTransform: 'capitalize',
  },
});
