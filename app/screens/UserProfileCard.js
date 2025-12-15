import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const UserProfileCard = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profile = useSelector(state => state.Auth.profile);
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const navigation = useNavigation();
  const userName = `${profile?.full_name || profile?.phone_no}`;

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideYAnim = useRef(new Animated.Value(-50)).current; // slide from top

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 2,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideYAnim, {
        toValue: 0,
        friction: 2,
        tension: 82,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideYAnim]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: COLORS[theme].background,
          borderColor: COLORS[theme].border,
          opacity: fadeAnim,
          transform: [{ translateY: slideYAnim }],
        },
      ]}
    >
      {/* Profile Image */}
      <TouchableOpacity
        onPress={() => navigation?.navigate('UpdateProfilePic')}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: profileDetails?.user_image }}
          style={[styles.profileImage, { borderColor: COLORS[theme].accent }]}
        />
        <MaterialCommunityIcon
          name="pencil-circle"
          size={wp(8)}
          style={styles.editIcon}
          color={COLORS[theme].textPrimary}
        />
      </TouchableOpacity>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={[poppins.semi_bold.h7, styles.userName, { color: COLORS[theme].primary }]}>
          {userName}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={[styles.editButton, { backgroundColor: COLORS[theme].buttonBg }]}
        >
          <MaterialCommunityIcon
            name="pencil"
            size={wp(3.5)}
            color={COLORS[theme].background}
          />
          <Text style={[poppins.regular.h9, { color: COLORS[theme].background, marginLeft: wp(1) }]}>
            {t('Edit Profile')}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: wp(4),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    borderWidth: 1,
    margin: wp(4),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    borderWidth: wp(0.5),
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -wp(1),
    backgroundColor: 'transparent',
  },
  infoContainer: {
    marginLeft: hp(4),
  },
  userName: {
    fontSize: wp(4.5),
    textTransform: 'capitalize',
    marginBottom: wp(2),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(10),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
export default UserProfileCard;
