/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderBar from '../../../components/header';
import { poppins } from '../../../resources/fonts';
import { hp, wp } from '../../../resources/dimensions';
import { useAuthHoc } from '../../../config/config';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import UseProfileHook from '../../../hooks/profile-hooks';
import { useTranslation } from 'react-i18next';

const RenderTripListItem = ({ item, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.NotificationItemContainer,
        { backgroundColor: COLORS[theme].cardBackground },
      ]}>
      <View style={{ flex: 1, marginLeft: wp(2) }}>
        <View style={[styles.row]}>
          <Text
            numberOfLines={1}
            style={[
              poppins.medium.h6,
              {
                fontWeight: '700',
                maxWidth: wp(45),
                color: COLORS[theme].textPrimary,
              },
            ]}>
            {item?.name}
          </Text>
          {/* <Text
            style={[
              poppins.bold.h9,
              {
                fontWeight: '400',
                fontSize: wp(2.5),
                color: COLORS[theme].textPrimary,
              },
            ]}>
            {item.date}
          </Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyTripsScreen = () => {

  const { profile } = UseProfileHook();
  const [tripData, setMyTripsData] = useState([]);
  const [loading, setIsLoading] = useState(false);

  const {
    reducerConstants: { },
    reducerName,
    actions: { GET_MY_TRIPS_API_CALL },
  } = useAuthHoc();

  
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fnGetCoachList();
  }, [profile.id]);

  function fnGetCoachList() {
    setIsLoading(true)
    GET_MY_TRIPS_API_CALL({
      request: {
        payload: {
          userid: profile?.id,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          setMyTripsData(data.data || [])
          setIsLoading(false)
        },
        errorCallback(message) {
          console.log('Error claiming reward:', message);
        },
      },
    });
  }


  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar showTitleOnly title={t('my_trips')} showBackArrow={true} />
      {loading ? (
        <ActivityIndicator style={{ marginVertical: hp(10) }} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
          data={tripData}
          contentContainerStyle={{ paddingTop: hp(1), paddingBottom: hp(5) }}
          renderItem={({ item }) => (
            <RenderTripListItem
              item={item}
              theme={theme}
            />
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: wp(10),
              }}>
              <Text style={[
                poppins.bold.h6,
                { color: COLORS[theme].textPrimary }]}>{t('no_trips')}</Text>
            </View>
          }
        />
      )}

    </View>
  );
};

export default MyTripsScreen;

const styles = StyleSheet.create({
  listStyle: {
    marginHorizontal: wp(4),
  },
  NotificationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: hp(0.5),
    borderRadius: wp(1),
    padding: wp(2),
    height: hp(6)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paragraph: {
    fontSize: 10,
    textAlign: 'left',
    color: 'black',
  },
  lastSeen: {
    fontSize: 8,
    margin: 3,
    marginLeft: 12,
    color: '#7D7D7D',
  },
  NotificationImage: {
    width: wp(20),
    height: wp(18),
    borderRadius: wp(1.5),
  },
});
