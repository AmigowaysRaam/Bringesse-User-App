import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { IMAGE_ASSETS } from '../resources/images';
import { useNavigation } from '@react-navigation/native';

const SearchContainer = ({ banner }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const cycleCategories = (index) => {
      const nextIndex = (index + 1) % (banner?.category?.length || 1); // Cycle through categories
      setCurrentIndex(nextIndex);
      // Set a new timeout for the next category
      setTimeout(() => cycleCategories(nextIndex), 2500);
    };

    if (Array.isArray(banner?.category) && banner?.category?.length > 0) {
      cycleCategories(currentIndex); // Start cycling categories
    }

    return () => clearTimeout(); // Cleanup any ongoing timeouts
  }, [banner?.category]);

  if (!Array.isArray(banner?.category) || banner?.category.length === 0) {
    return <Text style={[poppins.semi_bold.h7,{ alignSelf: "center", marginTop: hp(10),color:COLORS[theme].textPrimary }]}>No categories available</Text>;
  }

  return (
    <TouchableOpacity onPress={() => navigation.navigate('RevenueScreen')} style={[styles.card, { backgroundColor: COLORS[theme].background }]}>
      <View style={styles.userInfo}>
        <Image
          source={IMAGE_ASSETS?.search_filled}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <View style={styles.userTextContainer}>
          <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary, textTransform: "capitalize" }]}>
            {`Search for ${banner?.category[currentIndex]?.category_name}...`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: wp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(8),
    borderWidth: wp(0.3),
    borderColor: '#ccc',
    margin: hp(1),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(6),
    marginRight: wp(2),
    backgroundColor: '#eee',
  },
  userTextContainer: {
    justifyContent: 'center',
  },
});
export default SearchContainer;