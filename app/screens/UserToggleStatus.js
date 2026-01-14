import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const screenWidth = Dimensions.get('window').height;
  const screenHeight = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isLottieVisible, setIsLottieVisible] = useState(true);
  useEffect(() => {
    fetchProfileData();
  }, []);
  // 📅 Date-based enable (hard cutoff)
  const showLottie = useMemo(() => {
    const cutoffDate = new Date('2026-01-17T23:59:59');
    return new Date() <= cutoffDate;
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

  const hideLottieWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: -screenHeight,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsLottieVisible(false);
    });
  };  
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: COLORS[theme].accent }]}
      onPress={() => navigation.navigate('SelectLocation')}
    >
      {showLottie
       && isLottieVisible 
       && IMAGE_ASSETS?.ChristmasS && (
        <Animated.View
          style={[
            styles.lottieWrapper,
            {
              transform: [{ translateY }],
            },
          ]}
          pointerEvents="none"
        >
          <LottieView
            source={IMAGE_ASSETS.ChristmasS}
            autoPlay
            loop={false}
            speed={1.8}
            resizeMode="cover"
            style={styles.lottieBackground}
            onAnimationFinish={hideLottieWithAnimation}
          />
        </Animated.View>
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
              textShadowColor: '#555',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1.5,
            }}
          />
          <View style={styles.textContainer}>
            <Text
              numberOfLines={1}
              style={[
                poppins.semi_bold.h7,
                styles.titleText,
                {
                  color: COLORS[theme].white,
                  textShadowColor: '#555',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 1.5,
                },
              ]}
            >
              {profileDetails?.primary_address?.address_type ||
                t('Current Location')}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                poppins.regular.h9,
                {
                  color: COLORS[theme].white,
                  textShadowColor: '#000',
                  textShadowOffset: { width: 2, height: 2 },
                  textShadowRadius: 1.5,
                  fontSize: wp(2.8),
                },
              ]}
            >
              {profileDetails?.primary_address?.location
                ? `${profileDetails.primary_address?.note?.trim()} , ${profileDetails.primary_address.address?.trim()} , ${profileDetails.primary_address.location?.trim()}`
                : address?.replace(/^[A-Za-z0-9\+]+,?\s*/, '').trim()}
            </Text>
          </View>
        </View>

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

const styles = StyleSheet.create({
  card: {
    borderRadius: wp(0),
    marginVertical: hp(1),
    overflow: 'hidden',
  },
  lottieWrapper: {
    // position: 'absolute',
    // zIndex: 1,
  },
  lottieBackground: {
    left: hp(5),
    height: hp(15),
    width: wp(15),
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
    maxWidth: wp(74),
  },
  titleText: {
    textTransform: 'capitalize',
  },
});
