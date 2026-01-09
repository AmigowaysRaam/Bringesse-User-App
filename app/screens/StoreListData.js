import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Single store card component
const StoreCard = ({ item, index, useCurrentLocation }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
  }, []);
  return (
    <Animated.View style={{
      opacity: fadeAnim, transform: [{ scale: fadeAnim }],
    }}>
      <TouchableOpacity
        disabled={item.isActive !== 'true'}
        style={[styles.card, {
          backgroundColor: COLORS[theme].background,
          borderWidth: wp(0.1),
        }]}
        onPress={() =>
          item.isActive === 'true' &&
          navigation.navigate('ProductList', { storeId: item.store_id, useCurrentLocation })
        }
      >
      
        <Image
          source={{ uri: item.image_url }}
          style={[styles.image, { opacity: item.isActive !== 'true' ? 0.2 : 1 }]}
          resizeMode="cover"
        />
        {item?.isActive !== 'true' && item?.static_image_url && (
          <Image
            source={{ uri: item?.static_image_url || 'https://via.placeholder.com/150' }}
            style={styles.inactiveImage}
            resizeMode="contain"
          />
        )}
        {/* Right: Content */}
        <View style={styles.content}>
      
          <Text style={{
            position: "absolute", top: hp(4), right: wp(1), zIndex: 9999,
          }}>
            <MaterialCommunityIcon name={'chevron-right'} size={wp(7)} color={COLORS[theme].primary} />
          </Text>
          <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].primary, textTransform: "capitalize" }]} numberOfLines={1}>
            {item.store_name}
          </Text>
          <View style={{ alignItems: "center", alignSelf: "flex-start", marginBottom: hp(1), }}>
            <LinearGradient
              colors={['#007a33', '#007a33', '#009a44', '#009a44', 'rgba(0,154,68,0.6)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.badge, { paddingHorizontal: wp(2), paddingVertical: hp(0.3), paddingRight: wp(4) }]}
            >
              <Text
                style={[
                  poppins.semi_bold.h9,
                  {
                    color: COLORS[theme].white,
                    fontSize: wp(2.5),
                    lineHeight: wp(4),
                    textShadowColor: '#ccc', // stroke color
                    textShadowOffset: { width: 0.4, height: 0.2 },
                    textShadowRadius: 0.2,
                  },
                ]}
              >
                {item?.store_type.toUpperCase()} STORE
              </Text>
            </LinearGradient>

          </View>
          <View style={styles.infoRow}>
            <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>🕒 {item.packing_time} min</Text>

            <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>📦 ₹{item.packing_charge}</Text>
          </View>
        </View>
      </TouchableOpacity>
      {/* <Text style={[poppins.semi_bold.h9, { color: COLORS[theme].primary, }]} >
          {JSON.stringify(item,null,2)}
        </Text> */}
    </Animated.View>
  );
};

const StoreListData = ({ banner, useCurrentLocation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const storeList = [
    ...(banner?.store_small?.map(item => ({ ...item, store_type: 'small' })) || []),
    ...(banner?.store_medium?.map(item => ({ ...item, store_type: 'medium' })) || []),
    ...(banner?.store_large?.map(item => ({ ...item, store_type: 'large' })) || []),
    ...(banner?.store_mini?.map(item => ({ ...item, store_type: 'mini' })) || []),
  ];
  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>

      {Array.isArray(storeList) && storeList.length > 0 && (
        <Text style={[poppins.regular.h6, { color: COLORS[theme].primary, alignSelf: "flex-start", margin: hp(1) }]}>
          {`${storeList.length} Stores Available at your Location`}
        </Text>
      )}
      <FlatList
        data={storeList}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.store_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={[poppins.regular.h6, { color: COLORS[theme].primary, alignSelf: 'center', margin: hp(2) }]}>
            {t('No Stores Available at this Location')}
          </Text>
        )}
        renderItem={({ item, index }) => <StoreCard item={item} index={index} useCurrentLocation={useCurrentLocation} />}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: hp(1), marginHorizontal: wp(2), alignSelf: 'center', width: wp(96),
    paddingBottom: hp(4)
  },
  listContainer: { paddingHorizontal: wp(4), },
  card: {
    flexDirection: 'row', // horizontal layout
    borderRadius: wp(3),
    overflow: 'hidden',
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    height: hp(12), borderColor: "#CCC"
  },
  image: {
    width: wp(25),
    height: wp(25),
    borderTopLeftRadius: wp(3),
    borderBottomLeftRadius: wp(3),
    margin: wp(1)
  },
  inactiveImage: {
    position: 'absolute',
    width: wp(20),
    height: wp(30),
    bottom: 1, left: 0,
  },
  content: {
    flex: 1,
    padding: wp(3),
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp(2)
  },
  badge: { paddingHorizontal: wp(2), paddingVertical: hp(0.1), borderTopLeftRadius: wp(3), borderBottomLeftRadius: wp(3) },
});
export default StoreListData;
