import React from 'react';
import {
  View, StyleSheet, FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import HeaderBar from '../components/header';
const Storeloader = () => {
  const { theme } = useTheme();
  const skeletonItems = Array.from({ length: 8 });
  const renderItem = () => (
    <View style={styles.card}>
      <View style={styles.imageSkeleton} />
      <View style={styles.textSkeleton} />
      <View style={styles.textSkeletonSmall} />
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      {/* <HeaderBar title="Explore Products" showBackArrow={true} /> */}
      <FlatList
        data={skeletonItems}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: wp(2) }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    width: '48%', backgroundColor: '#fff',
    borderRadius: wp(2), padding: wp(2), marginBottom: wp(3), elevation: 2,
  }, imageSkeleton: {
    width: '100%', height: wp(30), borderRadius: wp(2), backgroundColor: '#e0e0e0',
    marginBottom: hp(1),
  }, textSkeleton: {
    height: hp(2), backgroundColor: '#e0e0e0', borderRadius: wp(1),
    marginBottom: hp(0.8),
  }, textSkeletonSmall: {
    height: hp(1.5), width: '60%', backgroundColor: '#e0e0e0',
    borderRadius: wp(1),
  },
});
export default Storeloader;