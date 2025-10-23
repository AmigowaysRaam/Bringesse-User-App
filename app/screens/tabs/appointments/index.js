/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
//import CheckBox from '@react-native-community/checkbox';
import React, { useState, useEffect } from 'react';
import { hp, wp } from '../../../resources/dimensions';
import { Button, DefaultTheme, Text, TextInput, Checkbox, ActivityIndicator } from 'react-native-paper';
import { poppins } from '../../../resources/fonts';
import { useAuthHoc, useQuery } from '../../../config/config';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import HeaderBar from '../../../components/header';
import { Dropdown } from 'react-native-paper-dropdown';
import moment from 'moment';
import LoaderView from '../../../components/loader';
import { useTheme } from '../../../context/ThemeContext';
import UseProfileHook from '../../../hooks/profile-hooks';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../resources/colors';
import { useTranslation } from 'react-i18next';
import IonicIcon from 'react-native-vector-icons/Ionicons';

const AppointmentScreen = () => {
  const [appointmentPrice, setAppointmentPrice] = useState(0);
  const [errors, setErrors] = useState({
    appointmentType: false,
    coachId: false,
    appointmentDate: false,
    appointmentTime: false,
  });

  const {
    reducerConstants: { SUBMIT_BOOK_APPOINMENT, GET_APPOINTMENT_DATA_ARRAY, BOOKING_APPOINTMENT_SUMMARY },
    reducerName,
    actions: {
      GET_APPOINTMENT_SLOT_ARRAY_CALL,
      GET_APPOINTMENT_DATA_ARRAY_CALL,
      SUMMARY_BOOK_APPOINMENT_CALL,
      SUBMIT_BOOK_APPOINMENT_CALL,
      BOOKING_APPOINTMENT_SUMMARY_CALL
    },
  } = useAuthHoc();

  const [getBookingData, appointmentBook] = useQuery(reducerName, [
    {
      key: GET_APPOINTMENT_DATA_ARRAY,
      requiredKey: ['loader', 'data'],
      default: {},
      initialLoaderState: true,
    },
    {
      key: SUBMIT_BOOK_APPOINMENT,
      requiredKey: ['loader', 'data'],
      default: {},
      initialLoaderState: false,
    },
  ]);

  useEffect(() => {
    GET_APPOINTMENT_DATA_ARRAY_CALL({
      request: {
        payload: {
          locale: 'en',
          userid: profile?.id
        },
      },
    });
  }, []);

  useEffect(() => {
    const appointmentItems = getBookingData.data.data?.appointmenttypes.map(
      item => ({
        label: `${item.name}`,
        value: item.id.toString(),
      }),
    );
    setAppointmentArr(appointmentItems);

    const coachItems = getBookingData?.data?.data?.coaches.map(item => ({
      label: `${item.name}`,
      value: item.id.toString(),
    }));
    setCoachArr(coachItems);
  }, [getBookingData]);

  const [dateOfAppointment, setdateOfAppointment] = useState(null);

  const [timeSlotListArr, setTimeSlotList] = useState([]);
  const [appointmentArr, setAppointmentArr] = useState([]);
  const [coachArr, setCoachArr] = useState([]);
  const [sortedDatesArr, setSortedDatesArr] = useState([]);

  const [appointmentId, setAppointmentId] = useState(null);
  const [coachId, setCoachId] = useState(null);
  const [timeSlotSelected, setTimeSlotSelected] = useState('');

  const [extraPerson, setExtraPerson] = useState(false);

  const navigation = useNavigation();


  const handleCheck = () => {

    if (appointmentId != '' && coachId != '' && appointmentId != null && coachId != null) {

      const payload = {
        userid: profile.id,
        locale: 'en',
        appointment_date: dateOfAppointment,
        coach_id: coachId,
        appointment_type_id: appointmentId,
        appointment_time: timeSlotSelected,
        extra_person: extraPerson ? 1 : 0
      };

      SUMMARY_BOOK_APPOINMENT_CALL({
        request: {
          payload,
        },
        callback: {
          successCallback({ message, data }) {
            console.log('book_appoinment', data);
            if (data && data.data) {
              console.log('summary data', data.data.data.summarydata.total);
              var total = data.data.data.summarydata.total;
              var tot = parseInt(total.split(' ', 1))
              console.log('split', total.split(' ', 1), tot);
              setAppointmentPrice(tot);
            }
          },
          errorCallback(message) {
            console.log('err', message);
          },
        },
      });
    }
  };

  useEffect(() => {
    handleCheck();
  }, [extraPerson, coachId, appointmentId])

  const handleSubmit = () => {

    const newErrors = {
      appointmentType: !appointmentId,
      coachId: !coachId,
      appointmentDate: !dateOfAppointment,
      appointmentTime: !timeSlotSelected,
    };

    setErrors(newErrors);


    if (appointmentId != '' && timeSlotSelected != '' && dateOfAppointment != '' && coachId != '' && appointmentId != null && coachId != null && timeSlotSelected != null && dateOfAppointment != null) {
      const payload = {
        userid: profile.id,
        locale: 'en',
        appointment_date: dateOfAppointment,
        coach_id: coachId,
        appointment_type_id: appointmentId,
        appointment_time: timeSlotSelected,
        extra_person: extraPerson ? 1 : 0,
        appointmentPrice: appointmentPrice

      };

      BOOKING_APPOINTMENT_SUMMARY_CALL({
        request: {
          payload,
        },
        callback: {
          successCallback({ message, data }) {
            if (data && data.data) {
              console.log('book_appoinment', data);
              navigation.navigate('AppointmentConfirmation', { data: data.data.summarydata, payload })
            }
          },
          errorCallback(message) {
            console.log('err', message);
          },
        },
      });

      // SUBMIT_BOOK_APPOINMENT_CALL({
      //   request: {
      //     payload,
      //   },
      //   callback: {
      //     successCallback({message, data}) {
      //       console.log('book_appoinment', data);

      //       if (data && data.data) {
      //         navigation.replace('PaymentScreen', {
      //           type: 'appointment',
      //           total: data.data.data.total,
      //           paymentreferenceid: data.data.data.paymentreferenceid,
      //         });
      //       }
      //     },
      //     errorCallback(message) {
      //       console.log('err', message);
      //     },
      //   },
      // });
    }

  };

  function handleChangeSetDropdown(selectedValue, type) {
    setExtraPerson(0);

    if (type === 'appointmentType') {
      setAppointmentId(selectedValue);
      setErrors(prevErrors => ({ ...prevErrors, appointmentType: false }));
      GET_APPOINTMENT_SLOT_ARRAY_CALL({
        request: {
          payload: {
            locale: 'en',
            userid: profile?.id,
            coach_id: coachId ? coachId : null,
            appointment_type_id: selectedValue,
          },
        },
        callback: {
          successCallback({ message, data }) {
            if (data.data) {
              if (data.data.data.appointmentPrice) {
                // setAppointmentPrice(data.data.data.appointmentPrice);
              }
              const sortedDates = data.data.data.dates.sort(
                (a, b) => new Date(b) - new Date(a),
              );
              setSortedDatesArr(
                sortedDates.map(item => ({
                  label: `${item}`,
                  value: item,
                })),
              );
            }
          },
          errorCallback(message) {
            console.log('err', message);
          },
        },
      });
    } else if (type === 'coachType') {

      setCoachId(selectedValue);
      setdateOfAppointment(null);
      setTimeSlotSelected(null);
      setErrors(prevErrors => ({ ...prevErrors, coachId: false }));


      GET_APPOINTMENT_SLOT_ARRAY_CALL({
        request: {
          payload: {
            locale: 'en',
            coach_id: selectedValue,
            appointment_type_id: appointmentId,
            userid: profile?.id,

          },
        },
        callback: {
          successCallback({ message, data }) {
            if (data.data) {
              if (data.data.data.appointmentPrice) {
                handleCheck();
              }

              const sortedDates = data.data.data.dates.sort(
                (a, b) => new Date(b) - new Date(a),
              );
              setSortedDatesArr(
                sortedDates.map(item => ({
                  label: `${item}`,
                  value: item,
                })),
              );
            }
          },
          errorCallback(message) {
            console.log('err', message);
          },
        },
      });
    } else if (type === 'chooseTime') {


      setTimeSlotSelected(selectedValue);
      setErrors(prevErrors => ({ ...prevErrors, appointmentTime: false }));

    } else if (type === 'chooseDate') {
      setErrors(prevErrors => ({ ...prevErrors, appointmentDate: false }));

      setdateOfAppointment(selectedValue);
      if (coachId && appointmentId) {
        GET_APPOINTMENT_SLOT_ARRAY_CALL({
          request: {
            payload: {
              locale: 'en',
            userid: profile?.id,
              appointment_date: selectedValue,
              coach_id: coachId,
              appointment_type_id: appointmentId,
            },
          },
          callback: {
            successCallback({ message, data }) {
              if (data.data) {
                if (data.data.data.appointmentPrice) {
                  // setAppointmentPrice(data.data.data.appointmentPrice);
                }

                const timeSlotArrList = data?.data?.data.slots.map(item => ({
                  label: moment(item.time, 'HH:mm:ss').format('hh:mm A'),
                  value: item.time,
                }));
                console.log('appointmentdatess', timeSlotArrList);
                setTimeSlotList(timeSlotArrList);
                console.log(data.data.data.slots);
              }
            },
            errorCallback(message) {
              console.log('err', message);
            },
          },
        });
      }
    }
  }

  const [date, setDate] = React.useState(undefined);
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const CustomDropdownInput = ({ placeholder, selectedLabel, rightIcon }) => {
    return (
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        value={selectedLabel}
        style={[poppins.regular.h6, { height: hp(5) }]}
        right={rightIcon}
      />
    );
  };

  // const onConfirmSingle = React.useCallback(params => {
  //   setOpen(false);
  //   const formattedDate = moment(params.date).format('YYYY-MM-DD');
  //   setdateOfAppointment(formattedDate);
  //   setDate(params.date);
  //   if (coachId && appointmentId) {
  //     GET_APPOINTMENT_SLOT_ARRAY_CALL({
  //       request: {
  //         payload: {
  //           locale: 'en',
  //           appointment_date: formattedDate,
  //           coach_id: coachId,
  //           appointment_type_id: appointmentId,
  //         },
  //       },
  //       callback: {
  //         successCallback({message, data}) {
  //           if (data.data) {
  //             const timeSlotArrList = data?.data?.data.slots.map(item => ({
  //               label: moment(item.time, 'HH:mm:ss').format('hh:mm A'),
  //               value: item.time,
  //             }));
  //             setTimeSlotList(timeSlotArrList);
  //             console.log(
  //               sortedDatesArr.map(item => {
  //                 moment(item, 'YYYY-MM-DD').toDate();
  //               }),
  //             );
  //           }
  //         },
  //         errorCallback(message) {
  //           console.log('err', message);
  //         },
  //       },
  //     });
  //   }
  // }, []);

  const openDatePicker = () => {
    setOpen(true);
  };

  const dtheme = {
    ...DefaultTheme,
    // Specify custom property
    myOwnProperty: true,
    // Specify custom property in nested object
    colors: {
      ...DefaultTheme.colors,
    },
  };

  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';

  const { profile } = UseProfileHook();
  const { t } = useTranslation();

  return (
    <View
      style={([styles.container], { backgroundColor: COLORS[theme].background })}>
      <ScrollView
        showsVerticalScrollIndicator
        horizontal={false}
        style={styles.container}>
        <HeaderBar showTitleOnly title={t('book_an_appointment')} />
        <FlashMessage position="top" />
        <View style={[{ height: hp(100), marginHorizontal: wp(4) }]}>
          <Text
            style={[
              poppins.semi_bold.h6,
              styles.signInTitle,
              { color: isDarkMode ? 'white' : 'black' },
            ]}
            variant="titleLarge">
            {t('appointment')}
          </Text>

          <View style={styles.yellowBorder} />

          <View style={{ width: wp(94), marginTop: wp(2) }}>
            <Text
              style={[
                poppins.regular.h9,
                { textAlign: 'left' },
                { color: isDarkMode ? 'white' : 'black' },
              ]}>
              {t('appointment_timing_saturday_to_thursday')}
            </Text>
          </View>

          <View style={{ marginTop: wp(4), gap: hp(2) }}>
            <View>
              <Text
                style={[
                  poppins.regular.h8,
                  { textAlign: 'left' },
                  { color: isDarkMode ? 'white' : 'black' },
                ]}>
                {t('appointment_type')}

              </Text>
              {getBookingData.loader ? (
                <ActivityIndicator />
              ) : (
                <View>
                  <Dropdown
                    theme={dtheme}
                    placeholder={t('appointment_type')}
                    mode="outlined"
                    hideMenuHeader
                    options={appointmentArr || []}
                    value={appointmentId}
                    onSelect={value =>
                      handleChangeSetDropdown(value, 'appointmentType')
                    }
                    CustomDropdownInput={CustomDropdownInput}
                  />
                  {errors.appointmentType && <Text style={styles.errorText}>{t('appointment_type_required')}</Text>}
                </View>
              )}
            </View>
            <View>
              <Text
                style={[
                  poppins.regular.h8,
                  { textAlign: 'left' },
                  { color: isDarkMode ? 'white' : 'black' },
                ]}>
                {t('select_coach')}

              </Text>
              <View>
                {getBookingData.loader ? (
                  <ActivityIndicator />

                ) : (
                  <View>
                    <Dropdown
                      theme={dtheme}
                      placeholder={t('select_coach')}
                      mode="outlined"
                      options={coachArr || []}
                      value={coachId}
                      onSelect={value =>
                        handleChangeSetDropdown(value, 'coachType')
                      }
                      CustomDropdownInput={CustomDropdownInput}
                    />
                    {errors.coachId && <Text style={styles.errorText}>{t('coach_required')}</Text>}
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text
                style={[
                  poppins.regular.h8,
                  { color: isDarkMode ? 'white' : 'black', textAlign: 'left' },
                ]}>
                {t('choose_the_date')}

              </Text>
              <Dropdown
                menuContentStyle={{ backgroundColor: '#fff' }}
                placeholder={t('choose_the_date')}
                mode="outlined"
                options={sortedDatesArr || []}
                value={dateOfAppointment}
                onSelect={value => handleChangeSetDropdown(value, 'chooseDate')}
                CustomDropdownInput={CustomDropdownInput}
              />
              {errors.appointmentDate && <Text style={styles.errorText}>{t('appointment_date_required')}</Text>}

            </View>
            <View>
              <Text
                style={[
                  poppins.regular.h8,
                  { color: isDarkMode ? 'white' : 'black', textAlign: 'left' },
                ]}>
                {t('choose_time')}
              </Text>
              <Dropdown
                menuContentStyle={{ backgroundColor: '#fff' }}
                placeholder={t('choose_time')}
                mode="outlined"
                options={timeSlotListArr || []}
                value={timeSlotSelected}
                onSelect={value => handleChangeSetDropdown(value, 'chooseTime')}
                CustomDropdownInput={CustomDropdownInput}
              />
              {errors.appointmentTime && <Text style={styles.errorText}>{t('appointment_time_required')}</Text>}
            </View>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => {
              setExtraPerson(!extraPerson);
            }}>

              <IonicIcon
                name={extraPerson ? "checkbox" : "square-outline"}
                style={{
                  marginHorizontal: wp(2),
                }}
                color={COLORS[theme].textPrimary}
                size={22}
              />


              <Text style={{ color: isDarkMode ? 'white' : 'black' }}>
                {t('extra_person')}
              </Text>
            </TouchableOpacity>

            {appointmentPrice > 0 && (
              <Text
                style={[poppins.medium.h8, { color: COLORS[theme].textPrimary }]}>
                {t('appointment_price')} {appointmentPrice} KWD
              </Text>
            )}

            <Button
              style={[{ backgroundColor: COLORS[theme].buttonBg, marginTop: hp(20) }]}
              loading={appointmentBook.loader}
              labelStyle={[poppins.bold.h6, { color: COLORS[theme].buttonText }]}
              mode="contained"
              onPress={handleSubmit}
              rippleColor="white">
              {appointmentBook.loader ? '' : t('book_now')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AppointmentScreen;

const styles = StyleSheet.create({
  container: {},
  dropdown: {
    height: 50,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 8,
  },


  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  checkboxContainer: {

    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: wp(5),
    backgroundColor: '#fff',
  },

  signInTitle: {
    marginTop: hp(2),
    fontWeight: '600',
    color: 'white',
  },
  appointmentTitle: {
    width: wp(94),
    padding: hp(1),
  },
  yellowBorder: {
    marginTop: wp(2),
    width: wp(21),
    borderColor: '#FFDC12',
    borderBottomWidth: 3,
  },

  menuContent: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemTitle: {
    color: '#000000',
  },
});
