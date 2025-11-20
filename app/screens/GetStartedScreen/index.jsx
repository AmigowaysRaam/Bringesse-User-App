import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, Image, Text, TouchableOpacity, KeyboardAvoidingView, Platform,
  TextInput as RNTextInput, ActivityIndicator,
  Keyboard
} from 'react-native';
import { IMAGE_ASSETS } from '../../resources/images';
import { hp, wp } from '../../resources/dimensions';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useAuthHoc } from '../../config/config';
import { COLORS } from '../../resources/colors';
import { useTheme } from '../../context/ThemeContext';
import { poppins } from '../../resources/fonts';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { TextInput } from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export default function GetStartedScreen() {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    actions: { APP_REGISTER_OTP_LOGIN_API_CALL, APP_REGISTER_LOGIN_API_CALL },
  } = useAuthHoc();

  const { theme } = useTheme();
  const [phone, setPhone] = useState(__DEV__ ? "8110933318" : "");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otpFromServer, setOtpFromServer] = useState('');
  const [fcmToken, setFcmToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  // Get FCM token and device ID on mount
  useEffect(() => {
    const init = async () => {
      try {
        const token = await messaging().getToken();
        const id = await DeviceInfo.getUniqueId();
        setFcmToken(token);
        setDeviceId(id);
      } catch (error) {
        console.log('Error fetching device info:', error);
      }
    };
    init();
  }, []);


  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const validatePhone = () => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  };

  const handleGetOTP = async () => {
    if (!validatePhone()) {
      return showMessage({
        message: 'Please enter a valid 10-digit mobile number.',
        type: 'danger',
      });
    }

    if (!agreed) {
      return showMessage({
        message: 'Please agree to the Terms & Conditions.',
        type: 'warning',
      });
    }
    setLoading(true);
    setOtpSent(true);
    setTimer(60);
    setOtpDigits(['', '', '', '']); // Reset OTP input

    try {
      APP_REGISTER_OTP_LOGIN_API_CALL({
        request: {
          payload: { phone_number: phone },
        },
        callback: {
          successCallback: (response) => {
            const otp = response?.response?.data?.otp?.toString() || '';
            setOtpFromServer(otp);
            // showMessage({ message: response.response?.data?.message, type: 'success' });
          },
          errorCallback: (err) => {
            console.error('OTP send failed:', err);
            setOtpSent(false);
            showMessage({ message: 'Failed to send OTP.', type: 'danger' });
          },
        },
      });
    } catch (error) {
      console.error(error);
      setOtpSent(false);
      showMessage({ message: 'Unexpected error occurred.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };
  const handleChangeText = (text, index) => {
    const updatedOtp = [...otpDigits];
    updatedOtp[index] = text;
    setOtpDigits(updatedOtp);

    if (text && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (!text && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    // Auto verify when all digits are entered
    const newOtp = updatedOtp.join('');
    if (newOtp.length === 4 && !updatedOtp.includes('')) {
      setTimeout(() => handleVerifyOTP(newOtp), 100);
      Keyboard?.dismiss();
    }
  };
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = (codeFromInput = otpDigits.join('')) => {
    if (codeFromInput.length !== 4) {
      return showMessage({
        message: 'Please enter the 4-digit OTP.',
        type: 'danger',
      });
    }
    if (codeFromInput !== otpFromServer) {
      return showMessage({
        message: 'Invalid OTP. Please try again.',
        type: 'danger',
      });
    }
    // Simulate success
    setLoading(true);
    handleLoginApi()

    setTimeout(() => {
      // setLoading(false);
      showMessage({ message: 'OTP verified successfully!', type: 'success' });
    }, 500);
  };

  const handleLoginApi = async () => {
    try {
      APP_REGISTER_LOGIN_API_CALL({
        request: {
          payload: {
            phone_no: phone,
            device_token: fcmToken,
            device_type: Platform.OS === 'ios' ? 0 : 1,
            device_id: deviceId,
          },
        },
        callback: {
          successCallback: async (response) => {
            showMessage({ message: response.response?.data?.message, type: 'success' });
            console?.log(response, "response")
            const userDatas = response?.response?.data;
            console?.log(userDatas, "userDatas")
            await AsyncStorage.setItem('user_data', JSON.stringify(userDatas));
            await AsyncStorage.setItem('access_token', userDatas.access_token);
            await AsyncStorage.setItem('refresh_token', userDatas.refresh_token);
            // Redux update
            dispatch({ type: 'UPDATE_PROFILE', payload: userDatas });
            dispatch({
              type: 'SET_TOKENS',
              payload: {
                access_token: userDatas.access_token,
                refresh_token: userDatas.refresh_token,
              },
            });

            navigation.replace('home-screen');
          },
          errorCallback: (err) => {
            showMessage({ message: 'Failed to Login.', type: 'danger' });
          },
        },
      });
    } catch (error) {
      console.error(error);
      showMessage({ message: 'Unexpected error occurred.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (otpSent && timer === 0) {
      // When timer hits 0, reset OTP fields
      setOtpDigits(['', '', '', '']);
      inputRefs[0].current?.focus(); // Move focus back to first input
      showMessage({
        message: 'OTP expired. Please resend to try again.',
        type: 'warning',
      });
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);


  const handleResendOTP = () => {
    // Reset to phone input screen
    setOtpSent(false);
    setPhone('');
    setOtpDigits(['', '', '', '']);
    setOtpFromServer('');
    setAgreed(false);
    setTimer(60);
  };
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: COLORS[theme].background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlashMessage position="top" />
      <View>
        <Image style={styles.splashLogo} source={IMAGE_ASSETS.otpBg} />
        <Image style={styles.logoCircle} source={IMAGE_ASSETS.logo_circle} />
      </View>
      {!otpSent ? (
        <>
          <View style={styles.fieldContainer}>
            <TextInput
            maxLength={12}
              placeholder="Enter Mobile Number"
              mode="outlined"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="arrow-right"
                  onPress={handleGetOTP}
                  color={COLORS[theme].textPrimary}
                />
              }
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              activeOutlineColor={COLORS[theme].textPrimary}
              textColor={COLORS[theme].textPrimary}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <MaterialIcon
              style={{ marginRight: hp(1) }}
              onPress={() => setAgreed(!agreed)}
              name={agreed ? 'check-box' : 'check-box-outline-blank'}
              color={agreed ? COLORS[theme].accent : COLORS[theme].textPrimary}
              size={hp(3)}
            />
            <TouchableOpacity onPress={() => navigation?.navigate('TermsAndCondtions')}>
              <Text style={[poppins.regular.h7, styles.termsText, { color: COLORS[theme].textPrimary, textDecorationLine: "underline" }]}>
                I agree to the Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleGetOTP()} style={{ backgroundColor: COLORS[theme].accent, height: hp(5), borderRadius: wp(8), width: wp(60), marginVertical: hp(4), alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
            <Text style={[poppins.regular.h5, { color: COLORS[theme].white,lineHeight:hp(4) }]}>
              Get OTP
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[poppins.medium.h6, { color: COLORS[theme].textPrimary, marginBottom: hp(2) }]}>
            Enter the 4-digit OTP sent to {phone}
          </Text>
          <View style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.otpInput,
                  { borderColor: COLORS[theme].accent, color: COLORS[theme].textPrimary },
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>
          {timer > 0 ? (
            <Text style={{ color: COLORS[theme].textPrimary }}>
              Resend OTP in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={{ color: COLORS[theme].accent, marginTop: hp(1.5) }}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
          {loading && <ActivityIndicator style={{ marginTop: hp(2) }} color={COLORS[theme].accent} />}
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center',
  },
  splashLogo: {
    height: hp(30),
    width: wp(100), resizeMode: 'cover',
    // backgroundColor:"#000"
  },
  logoCircle: {
    height: hp(12),
    width: hp(12), alignSelf: 'center',
    position: 'relative', bottom: hp(5),
    resizeMode: 'contain',
  },
  fieldContainer: {
    width: wp(90), marginBottom: hp(2),
  },
  input: {
    backgroundColor: 'transparent', height: hp(6),
  },
  checkboxContainer: {
    flexDirection: 'row',    // alignItems: 'center',    width: wp(90),
    marginTop: hp(1),
    // justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    flexWrap: 'wrap',
  },
  otpContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: wp(70), marginBottom: hp(2),
  },
  otpInput: {
    width: wp(14),
    height: wp(14), borderWidth: wp(0.6), borderRadius: 8,
    textAlign: 'center', fontSize: wp(5),
  },
  verifyButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(10), borderRadius: 5, alignItems: 'center',
    justifyContent: 'center', width: wp(80),
    marginTop: hp(2),
  },
  buttonText: {
    textAlign: 'center',
  },
});
