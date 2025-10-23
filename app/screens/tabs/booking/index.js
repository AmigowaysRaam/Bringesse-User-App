/* eslint-disable react-native/no-inline-styles */
import { FlatList, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import HeaderBar from '../../../components/header';
import { poppins } from '../../../resources/fonts';
import { hp, wp } from '../../../resources/dimensions';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthHoc, useQuery } from '../../../config/config';
import { ActivityIndicator, Button } from 'react-native-paper';
import UseProfileHook from '../../../hooks/profile-hooks';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

const RenderOrderItem = ({ item, index, theme, t }) => (

  <View
    style={[
      styles.contactItemContainer,
      { backgroundColor: COLORS[theme].cardBackground },
    ]}>
    <RenderItem
      theme={theme}
      value1={t('appointment_type')}
      value2={t('booking_id')}
      value3={t('booking_status')}
      isTitle={true}
    />

    <RenderItem
      theme={theme}
      value1={item.appointment_type}
      value2={`#${item.id}`}
      value3={item.booking_status}
      isTitle={false}
    />

    <RenderItem
      theme={theme}
      value1={t('coach_name')}
      value2={t('time_slot')}
      value3={t('appointment_date')}
      isTitle={true}
    />

    <RenderItem
      theme={theme}
      value1={item.coach_name}
      value2={item.time_slot}
      value3={item.appointment_date}
      isTitle={false}
    />


  </View>
);

const RenderItem = ({ theme, value1, value2, value3, isTitle }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
      }}>
      <Text
        style={[
          isTitle ? poppins.medium.h8 : poppins.regular.h9,
          styles.contactUsTitle,
          {
            color: COLORS[theme].textPrimary,

            flex: 1,
            textAlign: 'center',
          },
        ]}
        variant="titleLarge">
        {value1}
      </Text>

      <Text
        style={[
          poppins.medium.h8,
          styles.contactUsTitle,
          {
            color: COLORS[theme].textPrimary,
            flex: 1,
            textAlign: 'center',
          },
        ]}
        variant="titleLarge">
        {value2}
      </Text>

      <Text
        style={[
          poppins.medium.h8,
          styles.contactUsTitle,
          {
            color: COLORS[theme].textPrimary,
            flex: 1,
            textAlign: 'center',
          },
        ]}
        variant="titleLarge">
        {value3}
      </Text>
    </View>
  );
};

const BookingScreen = () => {
  const { theme } = useTheme();
  const { profile } = UseProfileHook();
  const { t } = useTranslation();

  const {
    reducerName,
    actions: { GET_APPOINTMENT_DATA_API_CALL },
    reducerConstants: { GET_APPOINTMENT_DATA_API },
  } = useAuthHoc();

  useEffect(() => {
    if (profile) {
      getMyAppoinment();
    }
  }, [profile]);

  const [appointmentData] = useQuery(reducerName, [
    {
      key: GET_APPOINTMENT_DATA_API,
      default: {},
      requiredKey: ['data', 'loader'],
      initialLoaderState: true,
    },
  ]);

  // console.log('apoin', appointmentData);

  function getMyAppoinment() {
    const payload = {
      userid: profile.id,
      locale: 'en',
    };

    GET_APPOINTMENT_DATA_API_CALL({
      request: {
        payload,
      },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar showTitleOnly title={t('booking')} showBackArrow={false} />
      {appointmentData?.data?.loader &&
        <View style={{ marginVertical: wp(10) }}>
          <ActivityIndicator />
        </View>
      }
      <FlatList
        showsVerticalScrollIndicator={false}
        style={styles.listStyle}
        data={appointmentData?.data?.data}
        ListEmptyComponent={<View><Text style={[poppins.regular.h6, { color: COLORS[theme].textPrimary, textAlign: 'center', margin: wp(2) }]} >{t('no_bookings')}</Text></View>}
        //contentContainerStyle={{paddingTop: hp(1), paddingBottom: hp(5)}}
        renderItem={({ item, index }) => (
          <RenderOrderItem item={item} index={index} theme={theme} t={t} />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  listStyle: {
    marginHorizontal: wp(2),
  },
  bookingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: hp(1),
    borderRadius: wp(1),
    padding: wp(2),
    paddingEnd: wp(4),
  },
  bookingImage: {
    width: wp(30),
    height: wp(22),
    borderRadius: wp(1.5),
  },
  contactUsTitle: {
    fontWeight: '600',
  },
  yellowBorder: {
    marginTop: wp(2),
    width: wp(35),
    backgroundColor: '#FFDC12',
    height: hp(0.8),
  },
  contactItemContainer: {
    paddingHorizontal: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#231F20',
    paddingVertical: wp(3),
    marginVertical: wp(2),
    gap: wp(4),
  },
});
