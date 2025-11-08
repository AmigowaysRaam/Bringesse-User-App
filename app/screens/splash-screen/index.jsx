import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Image, Platform,
  BackHandler, Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { IMAGE_ASSETS } from '../../resources/images';
import { hp, wp } from '../../resources/dimensions';
import { useTheme } from '../../context/ThemeContext';
import { getAccesstoken, getrefreshtoken, getUserData } from '../../utils/utils';
import { useAuthHoc } from '../../config/config';
const _ = require('lodash');
export default function SplashScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const {
    actions: {
      APP_REGISTER_OTP_LOGIN_API_CALL,
      APP_SITE_SETTING_API_CALL, // <- Make sure this exists in API_REQUESTS
    },
  } = useAuthHoc();
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
      const initialize = async () => {
        const userData = await getUserData();
        const aToken = await getAccesstoken();
        const refreshToken = await getrefreshtoken();
        // Alert.alert(JSON.stringify(aToken))
        if (!isConnected) {
          Alert.alert(
            'No Internet Connection',
            'Please check your network settings and try again.',
            [{ text: 'OK', onPress: () => BackHandler.exitApp() }]
          );
          return;
        }
        // ✅ Call siteSetting API and store in Redux as APP_DEFAULT
        APP_SITE_SETTING_API_CALL({
          request: {},
          callback: {
            successCallback: (response) => {
              if (response?.response) {
                console?.log(response, 'Site Setting API response');
                dispatch({
                  type: 'SET_SITE_DETAILS',
                  payload: response?.response?.data,
                });
              }
            },
            errorCallback: (err) => {
              console.log('Site Setting API error:', err);
            },
          },
        });
        setTimeout(() => {
          if (userData && !_.isEmpty(userData) && aToken) {
            const parsedData = JSON.parse(userData);
            dispatch({
              type: 'SET_TOKENS',
              payload: {
                access_token: aToken,
                refresh_token: refreshToken,
              },
            });
            dispatch({
              type: 'UPDATE_PROFILE',
              payload: parsedData,
            });
            navigation.reset({
              index: 0,
              routes: [{ name: 'home-screen' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'GetStartedScreen' }],
            });
          }
        }, 2000); // Splash delay
      };
      initialize();
  }, [isConnected]);



  return (
    <View style={[styles.container, { backgroundColor: '#FFF1E2' }]}>
      <Image
        style={styles.splashLogo}
        resizeMode="contain"
        source={IMAGE_ASSETS.splash_screen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    height: hp(100),
    width: wp(100),
  },
});
