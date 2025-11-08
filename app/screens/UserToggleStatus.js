import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchData } from '../api/api';
import { useNavigation } from '@react-navigation/native';

const UserToggleStatus = ({address}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const profile = useSelector(state => state.Auth.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);

  useEffect(() => {
    fetchProfileData();
    // Alert.alert('Profile Data', JSON.stringify(profileDetails?.primary_address));
  }, []);

  const fetchProfileData = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData('userprofile/' + profile?.user_id, 'GET', null, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      dispatch({
        type: 'PROFILE_DETAILS',
        payload: data,
      });
    } catch (error) {
      console.error('Profile API Error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: COLORS[theme].accent }]}
      onPress={() => navigation.navigate('SelectLocation')}
      activeOpacity={0.8}
    >
      <View style={styles.userInfo}>
        <View style={styles.userTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: "center" }}>
            <MaterialCommunityIcons
              name="map-marker"
              size={wp(5)}
              color={COLORS[theme].white}
            />
            <Text
              style={[
                poppins.semi_bold.h5,
                { color: COLORS[theme].white, textTransform: 'capitalize', marginTop: hp(0.5), marginLeft: wp(1) },
              ]}
            >
              {profileDetails?.primary_address?.address_type ? profileDetails?.primary_address?.address_type : t('Current Location')}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[poppins.regular.h9, { color: COLORS[theme].white }]}
          >
            {profileDetails?.primary_address?.address  ? profileDetails?.primary_address?.address + "," + profileDetails?.primary_address?.location?.replace(/^[A-Za-z0-9\+]+,?\s*/, '').trim() : address.replace(/^[A-Za-z0-9\+]+,?\s*/, '').trim() }
          </Text>
        </View>
      </View>

      {/* Right side dropdown arrow */}
      <MaterialCommunityIcons
        name="chevron-down"
        size={wp(7)}
        color={COLORS[theme].white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: wp(1),
    paddingHorizontal: wp(4),
    marginVertical: hp(1),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    justifyContent: 'center',
    marginLeft: wp(3),
    maxWidth: wp(70),
  },
});

export default UserToggleStatus;
