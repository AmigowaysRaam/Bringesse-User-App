import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
const StoreListData = ({ banner, useCurrentLocation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  // Merge all store lists & add store_type field
  const storeList = [
    ...(banner?.store_small?.map(item => ({ ...item, store_type: 'small' })) || []),
    ...(banner?.store_medium?.map(item => ({ ...item, store_type: 'medium' })) || []),
    ...(banner?.store_large?.map(item => ({ ...item, store_type: 'large' })) || []),
    ...(banner?.store_mini?.map(item => ({ ...item, store_type: 'mini' })) || []),
  ];
  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <FlatList
        data={storeList}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.store_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text
            style={[
              poppins.regular.h6,
              { color: COLORS[theme].primary, alignSelf: 'center', margin: hp(2) },
            ]}
          >
            {t('No Stores Available at this Location')}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={
              item.isActive != 'true'
            }
            style={[styles.card, { backgroundColor: COLORS[theme].cardBackground }]}
            onPress={() => item?.isActive == 'true' && navigation.navigate('ProductList', { storeId: item.store_id, useCurrentLocation })}
          >
            <Text>
              {/* {item?.static_image_url} */}
            </Text>
            {/* Image */}
            <Image
              source={{ uri: item.image_url }}
              style={[styles.profileImage, {
                opacity: item.isActive !== 'true' ? 0.2 : 1
                // backgroundColor: 'rgba(0,0,0,0.45)', // reduce saturation
              }]}
              resizeMode='contain'
            />
            {item.isActive !== 'true' && item?.static_image_url &&
              <Image
                // source={IMAGE_ASSETS.shopclosed}
                source={{ uri: item?.static_image_url || "https://via.placeholder.com/150" }}
                style={[{
                  width: wp(50),
                  height: hp(15),
                  position: "absolute",
                  left:hp(0),top:1,
                }]}
                resizeMode="contain"
              />
            }

            {/* Store Name */}
            <Text
              style={[
                poppins.semi_bold.h6,
                styles.categoryText,
                { color: COLORS[theme].primary, paddingHorizontal: wp(3) },
              ]}
              numberOfLines={1}
            >
              {item?.store_name}
            </Text>
            <Text
              style={[
                poppins.regular.h9,
                // styles.categoryText,
                { color: COLORS[theme].primary, paddingHorizontal: wp(3) },
              ]}
              numberOfLines={1}
            >
              {item?.store_status}
            </Text>
            {/* Store Information Row */}
            <View style={styles.infoRow}>
              <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>
                🕒 {item.packing_time} min
              </Text>
              {/* Store Type Badge */}
              <View style={[styles.badge, { backgroundColor: COLORS[theme].primary }]}>
                <Text style={[poppins.regular.h9, { color: COLORS[theme].background, lineHeight: wp(4) }]}>
                  {item.store_type.toUpperCase()} STORE
                </Text>
              </View>
              <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>
                📦 ₹{item.packing_charge} Charge
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
  },
  listContainer: {
    paddingHorizontal: wp(3),
  },
  card: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: wp(3),
    marginBottom: hp(2),
    paddingBottom: hp(1),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6, borderBottomWidth: 1, borderColor: '#ccc',
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: wp(38),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
  },
  categoryText: {
    marginTop: hp(1),
    // paddingHorizontal: wp(3),
    textTransform: 'capitalize',
  },
  badge: {
    paddingHorizontal: wp(2.5),
    borderRadius: wp(5),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: hp(1),
    marginLeft: hp(2)

  },
});
export default StoreListData;
