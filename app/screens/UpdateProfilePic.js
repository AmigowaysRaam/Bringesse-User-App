import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, Platform, ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../components/header';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  check, request, PERMISSIONS, RESULTS, openSettings,
} from 'react-native-permissions';
import { showMessage } from 'react-native-flash-message';
import { fetchData } from '../api/api';
import { IMAGE_ASSETS } from '../resources/images';

const UpdateProfilePic = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const siteDetails = useSelector(state => state.Auth.siteDetails);
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);

  const [imageUri, setImageUri] = useState(profileDetails?.user_image
  );
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    try {
      const result = await check(permission);
      switch (result) {
        case RESULTS.UNAVAILABLE:
          Alert.alert('Camera not available on this device.');
          return false;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        case RESULTS.LIMITED:
        case RESULTS.GRANTED:
          return true;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission Blocked',
            'Camera permission is blocked. Please enable it in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openSettings },
            ]
          );
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Permission Error', 'Could not request camera permission.');
      return false;
    }
  };

  const handleOpenCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 1,
        includeBase64: false,
        saveToPhotos: false,
        allowsEditing: true, // iOS cropping UI
      });

      if (result?.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const fileName = asset.fileName || 'profile.jpg';
        const type = asset.type || 'image/jpeg';
        setImageUri(uri);
        handleImageUpload(uri, fileName, type);
      } else if (result?.didCancel) {
        console.log('User cancelled camera.');
      } else if (result?.errorMessage) {
        console.error('Camera error: ', result.errorMessage);
        Alert.alert('Camera Error', result.errorMessage);
        ToastAndroid.show(result.errorMessage, ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error('Camera launch failed', err);
      ToastAndroid.show('Failed to update profile picture.', ToastAndroid.SHORT);
    }
  };

  const handleOpenGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
        allowMultiple: false,
      });

      if (result?.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const fileName = asset.fileName || 'profile.jpg';
        const type = asset.type || 'image/jpeg';
        setImageUri(uri);
        handleImageUpload(uri, fileName, type);
      } else if (result?.didCancel) {
        console.log('User cancelled gallery.');
      } else if (result?.errorMessage) {
        console.error('Gallery error: ', result.errorMessage);
        Alert.alert('Gallery Error', result.errorMessage);
        ToastAndroid.show(result.errorMessage, ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error('Gallery launch failed', err);
      ToastAndroid.show('Failed to update profile picture.', ToastAndroid.SHORT);
    }
  };

  const handleImageUpload = async (uri, fileName, type) => {
    if (!accessToken || !profileDetails?.user_id) {
      ToastAndroid.show('Authorization error.', ToastAndroid.SHORT);
      showMessage({ message: 'Authorization error.', type: 'danger' });
      return;
    }
    setLoading(true); // Start loading
    const formData = new FormData();
    formData.append("user_image", {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: fileName,
      type,
    });

    const requestOptions = {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": accessToken,
        "user_id": profileDetails.user_id,
        "type": "user"
      },
      redirect: "follow"
    };

    try {
      const response = await fetch("https://bringesse.com:3003/api/fileupload", requestOptions);
      const resultText = await response.text();
      console.log(resultText);

      const resultJson = JSON.parse(resultText);
      if (resultJson?.status === 'true') {
        await fnUpdateProfilePic(resultJson?.file_url);
      } else {
        ToastAndroid.show(resultJson?.message, ToastAndroid.SHORT);
        showMessage({ message: resultJson?.message || 'Upload failed.', type: 'danger' });
      }
    } catch (jsonErr) {
      console.error('JSON Parse Error:', jsonErr);
      showMessage({ message: 'Invalid server response.', type: 'danger' });
    } finally {
      setLoading(false); // End loading in any case
    }
  };

  const fnUpdateProfilePic = async (dImage) => {
    const payLoad = {
      user_id: profileDetails?.user_id,
      user_image: dImage,
    };
    try {
      const data = await fetchData('updateprofile', 'POST', payLoad, {
        Authorization: `${accessToken}`,
        user_id: profileDetails?.user_id,
        type: "user"
      });
      if (data?.status === 'true') {
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
        showMessage({ message: data?.message, type: 'success' });
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: data,
        });

        setTimeout(() => {
          navigation?.goBack();
        }, 2000);
      } else {
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
        showMessage({ message: data?.message, type: 'danger' });
      }
    } catch (error) {
      console.error('updateprofile API Error:', error);
      showMessage({ message: 'Failed to update profile.', type: 'danger' });
      ToastAndroid.show('Failed to update profile.', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <HeaderBar title={t('UpdateProfilePicture') || 'Update Profile Picture'} showBackArrow={true} />

      <TouchableOpacity>
        <Image
          source={{ uri: imageUri }}
          style={[styles.profileImage, { borderColor: COLORS[theme].accent }]}
        />
      </TouchableOpacity>
      {
        loading ?
          <ActivityIndicator size={wp(10)} style={{ margin: wp(5) }} color={COLORS[theme].accent} />
          :
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleOpenCamera}
              style={[styles.cameraButton, { borderColor: COLORS[theme].buttonBg }]}
              disabled={loading}
            >
              <Image
              tintColor={COLORS[theme].textPrimary}
                source={IMAGE_ASSETS?.camIco}
                style={{ width: wp(10), height: wp(10),  }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenGallery}
              style={[styles.cameraButton, { borderColor: COLORS[theme].buttonBg }]}
              disabled={loading}
            >
               <Image
              tintColor={COLORS[theme].textPrimary}
                source={IMAGE_ASSETS?.galeryIco}
                style={{ width: wp(10), height: wp(10),  }}
              />
            </TouchableOpacity>
          </View>
      }


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  profileImage: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    borderWidth: wp(0.8),
    marginTop: hp(4),
  },
  cameraButton: {
    borderRadius: wp(1),
    borderWidth: wp(0.4),
    width: wp(38),
    alignItems: "center",
    height: wp(14),
    marginVertical: hp(2),
    justifyContent: 'center',

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp(80),
    marginTop: hp(3),
  },
});
export default UpdateProfilePic;