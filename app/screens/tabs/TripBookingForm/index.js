import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { ActivityIndicator, Button, Text, TextInput } from 'react-native-paper';
import { hp, wp } from '../../../resources/dimensions';
import { useNavigation } from '@react-navigation/native';
import { useAuthHoc } from '../../../config/config';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import UseProfileHook from '../../../hooks/profile-hooks';
import { DatePickerModal } from 'react-native-paper-dates';
import moment from 'moment';
import { useTheme } from '../../../context/ThemeContext';
import { COLORS } from '../../../resources/colors';
import HeaderBar from '../../../components/header';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-paper-dropdown';
import BlastedImage from 'react-native-blasted-image';
import { IMAGE_ASSETS } from '../../../resources/images';
import { poppins } from '../../../resources/fonts';
import Toast from 'react-native-toast-message';

const TripBooking = ({ route }) => {
  
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { item } = route.params;

  const {
    reducerConstants: { },
    reducerName,
    actions: { GET_USER_PROFILE_DATA_API_CALL, GET_APP_TRIPS_API_CALL, BOOK_TRIP_API_CALL },
  } = useAuthHoc();

  const [loggedUserData, setUserLoggedData] = useState();
  const { profile } = UseProfileHook();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState();
  const [isEdit, setIsEdit] = useState(true);
  const [datesArray, setDatesArray] = useState([]);
  const [formValues, setFormValues] = useState({
    firstName: loggedUserData?.first_name,
    lastName: loggedUserData?.last_name,
    email: loggedUserData?.email,
    mobileNumber: loggedUserData?.mobile,
    dateOfBirth: moment(loggedUserData?.birth_date, 'YYYY-MM-DD')
      .format('DD/MM/YYYY')
      .toString(),
    tshirtSize: '', // New field for T-shirt size
    selectedTripDate: '', // Store selected trip date
  });

  const [date, setDate] = useState(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fnGetUserProData();
    });
    return unsubscribe;
  }, [navigation, profile.id]);

  useEffect(() => {
    // navigation.navigate('MyTripsScreen')
    setIsEdit(true);
    fnGetUserProData();
    fnGetTripDate();
  }, [profile.id]);

  function fnGetTripDate() {
    GET_APP_TRIPS_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          locale: 'en',
          id: item.id,
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data.data) {
            const transformedDates = data?.data.map((item) => ({
              label: item.date, // Format the date for display
              value: item.date, // Use the original date as the value
            }));
            setDatesArray(transformedDates);
          }
        },
        errorCallback(message) {
          console.log(message);
        },
      },
    });
  }

  function fnGetUserProData() {
    setIsLoading(true);
    GET_USER_PROFILE_DATA_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data.data) {
            setFormValues({
              firstName: data?.data?.first_name,
              lastName: data?.data?.last_name,
              email: data.data?.email,
              mobileNumber: data?.data?.mobile,
              dateOfBirth: moment(data?.data?.birth_date, 'YYYY-MM-DD')
                .format('DD/MM/YYYY')
                .toString(),
              tshirtSize: '', // Default empty
              selectedTripDate: '', // Default empty
            });
            setImageUri(data?.data?.image_profile);
            setUserLoggedData(data?.data);
            setIsLoading(false);
          }
        },
        errorCallback(message) {
          console.log(message);
        },
      },
    });
  }

  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = useCallback(
    (params) => {
      setOpen(false);
      const formattedDate = moment(params.date).format('DD/MM/YYYY');
      setDate(params.date);
      handleChange('dateOfBirth', formattedDate);
    },
    [handleChange]
  );

  const openDatePicker = () => {
    setOpen(true);
  };

  function onUpdateComplete() {
    setIsLoading(false);

    showMessage({
      message: 'Updated',
      description: 'Update Success',
      type: 'success',
    });
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  }


  const handleSubmit = () => {
    if (!formValues.selectedTripDate) {
      // Show alert message if no date is selected
      alert(t('pleaseSelectTripDate')); // Translation key for "Please select a trip date."
      return; // Prevent form submission if validation fails
    }

    if (!formValues.tshirtSize) {
      // Show alert message if no T-shirt size is selected
      alert(t('pleaseSelectTshirtSize')); // Translation key for "Please select a T-shirt Size."
      return; // Prevent form submission if validation fails
    }

    // Continue with the form submission or further processing if validation passes

    setIsLoading(true);

    BOOK_TRIP_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          id: item?.id,
          mobile: formValues?.mobileNumber,
          email: formValues?.email,
          first_name: formValues?.firstName,
          last_name: formValues?.lastName,
          size: formValues?.tshirtSize,
          birth_date: formValues?.dateOfBirth,
          locale: 'en',
          date: formValues.selectedTripDate,
        },
      },
      callback: {
        successCallback({ message, data }) {
          // showMessage({
          //   message: data?.data?.message,
          //   type: 'success',
          // });
          Toast.show({
            type: 'success',  // You can use 'success', 'error', 'info', etc.
            position: 'top',  // Positioning can be 'top', 'bottom', or 'center'
            text1: data.data.message,  // Main text
            visibilityTime: 3000,  // Duration for which the toast is visible
            autoHide: true,
          });
          setTimeout(() => {
            navigation.goBack()
          }, 2000);
        },
        errorCallback(message) {
          setIsLoading(false);
          console.log('Error booking trip:', message);
        },
      },
    });
  };

  const handleChange = (name, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const CustomDropdownInput = ({ placeholder, selectedLabel, rightIcon }) => {
    return (
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        value={selectedLabel}
        style={[poppins.regular.h6, {
          height: hp(6),
          marginBottom: wp(3),
        }]}
        right={rightIcon}
      />
    );
  };

  // Dropdown menu for T-shirt size
  const sizeOptions = [
    { label: 'XS', value: '1' },
    { label: 'S', value: '2' },
    { label: 'M', value: '3' },
    { label: 'L', value: '4' },
    { label: 'XL', value: '5' },
    { label: 'XXL', value: '6' },
    { label: 'XXXL', value: '7' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar showTitleOnly showBackArrow title={t('join_us_for_trip')} />
      <BlastedImage
        fallbackSource={IMAGE_ASSETS.wolf_icon}
        source={{ uri: item.image }}
        style={[
          styles.TripImag,
          {
            borderColor: COLORS[theme].cardBackground,
          },
        ]}
      />
      <ScrollView
        style={{
          marginHorizontal: wp(5),
          flex: 1,
          backgroundColor: COLORS[theme].backgroundColor,
        }}
        showsVerticalScrollIndicator={false}
      >

        <View style={{ width: wp(90), marginVertical: wp(5) }}>
          {/* First Name and Last Name */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp(90) }}>
            {/* First Name at the left end */}
            <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
              {t('first_name')}
            </Text>

            {/* Last Name at the center of the screen width */}
            <Text style={[styles.label, { color: COLORS[theme].textPrimary, position: 'absolute', left: '75%', transform: [{ translateX: -wp(20) }] }]}>
              {t('last_name')}
            </Text>
          </View>

          <View style={styles.nameRow}>
            <TextInput
              disabled={true}
              placeholder={t('enter_first_name')}
              style={styles.inputUserName}
              mode="outlined"
              value={formValues.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              left={<TextInput.Icon icon={'account'} />}
            />

            <TextInput
              disabled={true}
              placeholder={t('enter_last_name')}
              style={styles.inputUserName}
              mode="outlined"
              value={formValues.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              left={<TextInput.Icon icon={'account'} />}
            />
          </View>

          {/* Mobile Number */}
          <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
            {t('mobile_number')}
          </Text>
          <TextInput
            disabled={true}
            placeholder={t('enter_mobile_number')}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
            value={formValues.mobileNumber}
            onChangeText={(text) => handleChange('mobileNumber', text)}
            left={<TextInput.Icon icon={'phone'} />}
          />

          {/* Email */}
          <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
            {t('email')}
          </Text>
          <TextInput
            disabled={true}
            placeholder={t('enter_email')}
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            value={formValues.email}
            onChangeText={(text) => handleChange('email', text)}
            left={<TextInput.Icon icon={'email'} />}
          />

          {/* Date of Birth */}
          <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
            {t('date_of_birth')}
          </Text>
          <View
          //  onPress={openDatePicker}
           >
            <TextInput
              disabled={true}
              placeholder={t('enter_date_of_birth')}
              mode="outlined"
              value={formValues.dateOfBirth}
              left={<TextInput.Icon icon={'calendar'} />}
              style={styles.input}
            />
          </View>

          {/* T-shirt Size Dropdown */}
          <Text
            style={[
              poppins.regular.h8,
              { color: COLORS[theme].textPrimary, },
            ]}
          >
            {`${t('select_tshirt_size')} * `}
          </Text>
          <Dropdown
            menuContentStyle={{ backgroundColor: '#fff' }}
            placeholder={t('select_size')}
            mode="outlined"
            options={sizeOptions || []}
            value={formValues.tshirtSize}
            onSelect={(value) => handleChange('tshirtSize', value)}
            CustomDropdownInput={CustomDropdownInput}
          />

          {/* Date Dropdown */}
          <Text
            style={[
              poppins.regular.h8,
              { color: COLORS[theme].textPrimary, },
            ]}
          >
            {`${t('select_date')} * `}
          </Text>
          <Dropdown
            menuContentStyle={{ backgroundColor: '#fff' }}
            placeholder={t('select_date')}
            mode="outlined"
            options={datesArray || []}
            value={formValues.selectedTripDate}
            onSelect={(value) => handleChange('selectedTripDate', value)}
            CustomDropdownInput={CustomDropdownInput}
          />
        </View>
      </ScrollView>

      <Button
        mode="contained"
        loading={isLoading}
        style={{
          marginTop: hp(3),
          width: wp(94),
          height: hp(6),
          marginHorizontal: wp(3),
          marginVertical: wp(3),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS[theme].buttonBg,
        }}
        labelStyle={[poppins.bold.h6, { color: COLORS[theme].buttonText }]}
        onPress={handleSubmit}
      >
        {t('submit')}
      </Button>

      <FlashMessage position="top" />
      <DatePickerModal
        mode="single"
        visible={open}
        date={date}
        onDismiss={onDismissSingle}
        onConfirm={onConfirmSingle}
      />
      <Toast />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    width: wp(90),
    height: hp(6),
    // marginVertical: wp(2),
    marginBottom: wp(4),

  },
  inputUserName: {
    width: wp(44),
    height: hp(6),
    marginBottom: wp(4),

  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: wp(2),
  },
  TripImag: {
    width: wp(50),
    height: wp(50),
    marginBottom: hp(1),
    marginTop: hp(1),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: wp(4)
  },
});

export default TripBooking;
