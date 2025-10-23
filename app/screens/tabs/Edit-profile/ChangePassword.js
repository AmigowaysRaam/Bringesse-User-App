/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, Platform,
  KeyboardAvoidingView, TouchableOpacity,
  Text, ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../../../resources/dimensions';
import { poppins } from '../../../resources/fonts';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import HeaderBar from '../../../components/header';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../../../api/api';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';  // Add this import for icons

const ChangePassword = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);

  const [formValues, setFormValues] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Manage visibility state per field
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Verify old password, Step 2: Enter new passwords

  const handleChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleShowPassword = (field) => {
    // Alert.alert("test")
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formValues.oldPassword.trim()) newErrors.oldPassword = 'Old password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formValues.newPassword.trim()) newErrors.newPassword = 'New password is required.';
    if (!formValues.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password.';
    if (formValues.newPassword !== formValues.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOldPassword = async () => {
    if (!validateStep1()) return;
    if (!accessToken || !profileDetails?.driver_id) return;

    const payload = {
      driver_id: profileDetails.driver_id,
      old_password: formValues.oldPassword,
      email: profileDetails.email,
    };

    try {
      setLoading(true);
      const response = await fetchData('verifypassword', 'POST', payload, {
        Authorization: `${accessToken}`,
        driver_id: profileDetails.driver_id,
      });

      if (response?.status === 'true') {
        ToastAndroid.show( response?.message, ToastAndroid.SHORT);
        showMessage({ message: response?.message || 'Old password verified.', type: 'success' });
        setStep(2); // Move to Step 2
      } else {
        ToastAndroid.show( response?.message, ToastAndroid.SHORT);
        showMessage({ message: response?.message || 'Verification failed.', type: 'danger' });
      }
    } catch (error) {
      console.error('Old Password Verification Error:', error);
      showMessage({ message: 'An error occurred. Please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validateStep2()) return;
    if (!accessToken || !profileDetails?.driver_id) return;
    const payload = {
      driver_id: profileDetails.driver_id,
      password: formValues.newPassword,
    };
    try {
      setLoading(true);
      const data = await fetchData('updateprofile', 'PATCH', payload, {
        Authorization: `${accessToken}`,
        driver_id: profileDetails?.driver_id,
      });

      if (data?.status === 'true') {
        ToastAndroid.show( data?.message, ToastAndroid.SHORT);
        showMessage({ message: data?.message, type: 'success' });
        setTimeout(() => {
          navigation?.goBack();
          setLoading(false);
        }, 2000);
      } else {
        ToastAndroid.show( data?.message, ToastAndroid.SHORT);
        showMessage({ message: data?.message, type: 'error' });
        setLoading(false);
      }
    } catch (error) {
      console.error('updateprofile API Error:', error);
      showMessage({ message: 'Failed to update profile.', type: 'error' });
      setLoading(false);
    }
  };

  const renderTextField = (label, value, field, secure = false) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          maxLength={8}
          mode="outlined"
          placeholder={label}
          value={value}
          style={[styles.input, { paddingRight: 40 }]}  // extra padding for icon space
          onChangeText={text => handleChange(field, text)}
          secureTextEntry={secure && !showPassword[field]}
          outlineColor={errors[field] ? 'red' : COLORS[theme].textPrimary}
          activeOutlineColor={COLORS[theme].textPrimary}
          textColor={COLORS[theme].textPrimary}
          placeholderTextColor={COLORS[theme].textPrimary}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleShowPassword(field)}
        >
          <Icon
            name={showPassword[field] ? 'eye-off' : 'eye'}
            size={24}
            color={COLORS[theme].textPrimary}
          />
        </TouchableOpacity>
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: COLORS[theme].background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HeaderBar showBackArrow title={t('Change Password')} />
      <FlashMessage position="top" />
      <ScrollView
        style={{ paddingHorizontal: wp(5), marginTop: wp(3) }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderTextField('Old Password', formValues.oldPassword, 'oldPassword', true)}

        {step === 2 && (
          <>
            {renderTextField('New Password', formValues.newPassword, 'newPassword', true)}
            {renderTextField('Confirm Password', formValues.confirmPassword, 'confirmPassword', true)}
          </>
        )}
        <View style={{ marginTop: hp(2), marginBottom: hp(3) }}>
          <TouchableOpacity
            onPress={step === 1 ? handleVerifyOldPassword : handleChangePassword}
            style={[
              styles.saveButton,
              { backgroundColor: COLORS[theme].accent },
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS[theme].white} />
            ) : (
              <Text style={[poppins.regular.h4, { color: COLORS[theme].white }]}>
                {step === 1 ? t('Verify') : t('Save')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: hp(2),
  },
  label: {
    marginBottom: hp(0.8),
    fontSize: wp(3.8),
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  input: {
    backgroundColor: 'transparent',
    height: hp(5.5),
  },
  errorText: {
    color: 'red',
    marginTop: hp(0.5),
    fontSize: wp(3.5),
  },
  saveButton: {
    paddingVertical: hp(1.5),
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default ChangePassword;
