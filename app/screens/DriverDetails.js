import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { IMAGE_ASSETS } from '../resources/images';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const DriverDetails = ({ name = "Driver Name", phone = "+918110933318", photo }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: COLORS[theme].background }]}
    >
      <View style={styles.userInfo}>
        <Image
          // source={photo ? { uri: photo } : IMAGE_ASSETS?.search_filled}
          style={styles.profileImage}
          resizeMode="cover"
        />

        <View style={styles.userTextContainer}>
          <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].textPrimary }]}>
            {name}
          </Text>
          <Text style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}>
            {phone}
          </Text>
        </View>
      </View>
      {/* CALL BUTTON */}
      <TouchableOpacity onPress={handleCall}>
        <MaterialCommunityIcon
          name={'phone'}
          color={COLORS[theme].accent}
          size={wp(8)}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: wp(2),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: wp(0.3),
    borderColor: '#ccc',
    margin: hp(1),
    marginHorizontal:hp(1.5)
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    marginRight: wp(2),
    backgroundColor: '#eee',
  },
  userTextContainer: {
    justifyContent: 'center',
  },
});

export default DriverDetails;
