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
import { Avatar } from 'react-native-paper';
import FlashMessage, { showMessage } from 'react-native-flash-message';

const RenderTripListItem = ({ item, theme, t, handleUnBlock }) => {
  return (
    <View
      style={[
        styles.NotificationItemContainer,
        { backgroundColor: COLORS[theme].cardBackground },
      ]}>
      <View style={{ flex: 1, marginLeft: wp(2), flexDirection: "row", }}>
        <Avatar.Image size={wp(8)} source={{ uri: item?.user_image }} style={{ marginRight: wp(5) }} />
        <View style={[styles.row]}>
          <Text
            numberOfLines={1}
            style={[
              poppins.medium.h6,
              {
                fontWeight: '700',
                maxWidth: wp(45),
                color: COLORS[theme].textPrimary,
                // textTransform: "capitalize",
                marginHorizontal: wp(1)

              },
            ]}>
            {item?.user_name}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleUnBlock(item)}
        style={{
          backgroundColor: COLORS[theme].buttonBg,
          borderRadius: wp(1),
          justifyContent: 'center',
          alignItems: 'center',
          width: wp(20),
          height: wp(8),
        }}
      >
        <Text
          numberOfLines={1}
          style={[
            poppins.regular.h7,
            , {
              color: COLORS[theme].buttonText,
            }]}
        >
          {t('unblock')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const MyblockedUsers = () => {

  const { profile } = UseProfileHook();
  const [blockedusersData, setMyTripsData] = useState([]);
  const [loading, setIsLoading] = useState(false);

  const {
    reducerConstants: { },
    reducerName,
    actions: { UNBLOCK_USER_API_CALL, GET_BLOCKED_USERS_API_CALL },
  } = useAuthHoc();

  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    // showMessage({
    //   message: "JKHJKHJKH",
    //   description: "data.data.message",
    //   type: 'success',
    // });
    fnGetBLockedListView();
  }, [profile.id]);

  function fnGetBLockedListView() {
    setIsLoading(true)
    GET_BLOCKED_USERS_API_CALL({
      request: {
        payload: {
          userid: profile?.id,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          setMyTripsData(data.data?.data || [])
          setIsLoading(false)
        },
        errorCallback(message) {
          console.log('Error ', message);
        },
      },
    });
  }
  function handleUnBlock(item) {
    setIsLoading(true)
    UNBLOCK_USER_API_CALL({
      request: {
        payload: {
          userid: profile?.id,
          blockeduserid: item.user_id,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
               showMessage({
                message:  data.data.message,
                // description: data.data.message,
                type: 'success',
              });
          fnGetBLockedListView();
          setIsLoading(false)
        },
        errorCallback(message) {
          console.log('Error', message);
        },
      },
    });



    // alert(JSON.stringify(item))
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar showTitleOnly title={t('blocked_users')} showBackArrow={true} />
      {loading ? (
        <ActivityIndicator style={{ marginVertical: hp(10) }} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
          data={blockedusersData}
          contentContainerStyle={{ paddingTop: hp(1), paddingBottom: hp(5) }}
          renderItem={({ item }) => (
            <RenderTripListItem
              item={item}
              theme={theme}
              t={t}
              handleUnBlock={handleUnBlock}
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
                { color: COLORS[theme].textPrimary }]}>{t('no_blocked_users')}</Text>
            </View>
          }
        />
      )}
      <FlashMessage position="top" />

    </View>
  );
};

export default MyblockedUsers;

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
