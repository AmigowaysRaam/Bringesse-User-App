import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import {  wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
const CategoryList = ({ banner }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation(); // ✅ for navigation
  const handleCategoryPress = (item) => {
    navigation.navigate('CategoryDetails', {
      categoryId: item.category_id,
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={banner?.category}
        horizontal
        keyExtractor={(item, index) => `${item.category_name}_${index}`}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleCategoryPress(item)} // ✅ navigate on press
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.profileImage}
              resizeMode="contain"
            />
            <Text
              style={[
                poppins.regular.h9,
                styles.categoryText,
                { color: COLORS[theme].textPrimary, maxWidth: wp(30) },
              ]}
              numberOfLines={1}
            >
              {item?.category_name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: wp(0.1),
  },
  listContainer: {
    paddingHorizontal: wp(3),
  },
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(1),
    borderRadius: wp(2),
    width: wp(30),
    height: wp(35),
    backgroundColor: 'transparent',
  },
  profileImage: {
    width: wp(26),
    height: wp(26),
  },
  categoryText: {
    textAlign: 'center',
  },
});
export default CategoryList;
