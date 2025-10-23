/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderBar from '../../../components/header';
import { poppins } from '../../../resources/fonts';
import { hp, wp } from '../../../resources/dimensions';
import { IMAGE_ASSETS } from '../../../resources/images';
import BlastedImage from 'react-native-blasted-image';
import { useAuthHoc, useQuery } from '../../../config/config';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import UseProfileHook from '../../../hooks/profile-hooks';
import { IconButton } from 'react-native-paper';
import { commonStyles } from '../../../resources/styles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const RenderNotificationItem = ({ item, theme, onNotificationPress }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        item?.allow_popup == 1 &&
          onNotificationPress(item);
      }}
      style={[
        styles.NotificationItemContainer,
        { borderColor: COLORS[theme].textPrimary }
      ]}>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          {
            item?.from_user_id > 0 &&
              navigation.navigate('user-profile', {
                profileId: item?.from_user_id,
                isOtherUser: true,
              })
          }
        }}
      >
        {
          item?.from_user_image != 0 &&
          <View style={styles.row}>
            <BlastedImage
              fallbackSource={IMAGE_ASSETS.wolf_icon}
              source={item?.from_user_image != 0 ? { uri: item?.from_user_image } : null}
              style={styles.NotificationImage}
            />
          </View>
        }
      </TouchableOpacity>
      <View style={{ flex: 1, marginLeft: wp(2) }}>
        <View style={[styles.rw]}>
          <Text
            numberOfLines={2}
            style={[
              poppins.medium.h8,
              {
                fontWeight: '500',
                maxWidth: wp(45),
                color: COLORS[theme].textPrimary,
              },
            ]}>
            {item?.content}
          </Text>
          <Text
            style={[
              poppins.regular.h9,
              {
                fontWeight: '400',
                fontSize: wp(2),
                color: COLORS[theme].textPrimary,
              },
            ]}>
            {item?.date}
          </Text>
        </View>
    
      </View>
      <View style={styles.row}>
        <BlastedImage
          fallbackSource={IMAGE_ASSETS.wolf_icon}
          source={item.image != '' ? { uri: item.image } : ''}
          style={styles.NotifiImage}
        />
      </View>
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {

  const { profile } = UseProfileHook();

  const {
    reducerConstants: { GET_NOTIFICATION_API },
    reducerName,
    actions: { GET_NOTIFICATION_API_CALL },
  } = useAuthHoc();
  const { theme } = useTheme();

  const { t } = useTranslation();

  useEffect(() => {
    // console.log(getNotificarionsData.data.data, 'getCoachesData.loader');
    fnGetCoachList();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fnGetCoachList();
    }, [])
  );




  function fnGetCoachList() {
    GET_NOTIFICATION_API_CALL({
      request: {
        payload: {
          userid: profile?.id,
          locale: 'en',
        },
      },
    });
  }

  const [getNotificarionsData] = useQuery(reducerName, [
    {
      key: GET_NOTIFICATION_API,
      requiredKey: ['loader', 'data'],
      default: {},
      initialLoaderState: true,
    },
  ]);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});

  function handleClose() {
    // setNotificationData({});
    setShowNotification(false)
  }


  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background, opacity: showNotification ? 0.1 : 1 }}>
      <HeaderBar showTitleOnly title={t('Notifications')} showBackArrow={false} />
      {getNotificarionsData.loader ? (
        <ActivityIndicator style={{ marginTop: wp(10) }} color={COLORS[theme].textPrimary} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
          data={getNotificarionsData.data.data}
          contentContainerStyle={{ paddingTop: hp(1), paddingBottom: hp(5) }}
          renderItem={({ item }) => (
            <RenderNotificationItem
              item={item}
              theme={theme}
              onNotificationPress={notificationItem => {
                setNotificationData(notificationItem);
                setShowNotification(true);
              }}
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
              <Text style={{ color: COLORS[theme].textPrimary }}>{t('no_data')}</Text>
            </View>
          }
        />
      )}

      <Modal animationType="none" visible={showNotification} transparent
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View
            style={{
              height: hp(100),
              width: wp(100),
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}>
            <View
              style={[
                {
                  backgroundColor: COLORS[theme].background,
                  width: wp(81),
                  minHeight: hp(50),
                  maxHeight: hp(80),
                  marginTop: hp(10),
                  borderRadius: wp(2),
                  borderColor: COLORS[theme].border,
                  borderWidth: 1,
                },
                commonStyles[theme].shadow,
              ]}>
              <IconButton
                icon={'close'}
                iconColor={COLORS[theme].textPrimary}
                style={{ alignSelf: 'flex-end' }}
                onPress={() => {
                  setShowNotification(false);
                }}
              />
              <BlastedImage
                source={{ uri: notificationData?.image }}
                style={{ alignSelf: 'center' }}
                height={hp(30)}
                width={wp(80)}
              />
              <View
                style={{
                  marginHorizontal: wp(2),
                  gap: wp(1),
                  marginBottom: wp(2),
                }}>
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
                    {notificationData?.title}
                  </Text>
                  <Text
                    style={[
                      poppins.regular.h9,
                      {
                        fontWeight: '400',
                        fontSize: wp(2.5),
                        color: COLORS[theme].textPrimary,
                      },
                    ]}>
                    {notificationData?.date}
                  </Text>
                </View>
                <ScrollView>
                  <Text
                    style={[
                      poppins.regular.h9,
                      {
                        fontWeight: '400',
                        fontSize: wp(2.5),
                        marginRight: wp(10),
                        color: COLORS[theme].textPrimary,
                      },
                    ]}>
                    {notificationData?.content}
                  </Text>
                </ScrollView>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  listStyle: {
    marginHorizontal: wp(4),
  },
  NotificationItemContainer: {
    flexDirection: 'row',
    marginBottom: wp(3),
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
    width: wp(11),
    height: wp(11),
    borderRadius: wp(11 / 2),
    justifyContent: "center",
    alignItems: "center"
  },
  NotifiImage: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(1),
  }
});
