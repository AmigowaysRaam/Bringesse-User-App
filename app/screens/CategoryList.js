import React from 'react';
import {
  View, Text, StyleSheet, ImageBackground, FlatList, Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { wp, hp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';

const CategoryCard = ({ item, onPress, theme }) => {
  return (
    <Pressable
      onPress={() => onPress(item)}
      android_ripple={{ color: COLORS[theme].ripple }}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <ImageBackground
        source={{ uri: item.image_url }}

        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        {/* Improved Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.85)',]}
          locations={[0, 0.45, 1]}
          style={styles.gradient}
        >
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              poppins.semi_bold.h7,
              styles.text,
              { color: COLORS[theme].white },
            ]}
          >
            {item.category_name}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
};

const CategoryList = ({ banner }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleCategoryPress = (item) => {
    navigation.navigate('CategoryDetails', {
      categoryId: item.category_id,
    });
  };
  if (!Array.isArray(banner?.category) || banner.category.length === 0) {
    return null;
  }
  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <Text
        style={[
          poppins.semi_bold.h7,
          {
            color: COLORS[theme].textPrimary,
            marginHorizontal: wp(4),
            marginBottom: wp(2),
          },
        ]}
      >
        Shop by Category
      </Text>

      <FlatList
        data={banner.category}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.category_id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <CategoryCard
            item={item}
            onPress={handleCategoryPress}
            theme={theme}
          />
        )}
      />
    </View>
  );
};
export default CategoryList;
const styles = StyleSheet.create({
  container: {
    paddingVertical: wp(2),
  },
  listContainer: {
    paddingHorizontal: wp(4),
  },
  card: {
    width: wp(37), height: hp(32),
    marginRight: wp(3), borderRadius: wp(3),
    elevation: 6, backgroundColor: '#000',
  }, image: {
    flex: 1, justifyContent: 'flex-end',
  }, imageRadius: {
    borderRadius: wp(3),
  }, gradient: {
    minHeight: hp(7),             // 🔥 KEY FIX
    justifyContent: 'center',     // Center text vertically
    paddingHorizontal: wp(3), paddingVertical: hp(1.2),
    borderBottomLeftRadius: wp(3), borderBottomRightRadius: wp(3),
  }, text: {
    textAlign: 'center', letterSpacing: 0.5,
    fontSize: wp(3.5),              // 🔥 Bigger text
    textShadowColor: 'rgba(0, 0, 0, 0.90)', textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
});