/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ToastAndroid,
  Alert,
} from 'react-native';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { hp, wp } from '../../resources/dimensions';
import { COLORS } from '../../resources/colors';
import { commonStyles } from '../../resources/styles';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { fetchData } from '../../api/api';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { poppins } from '../../resources/fonts';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

// Helper to render tab icons
const getTabIcon = (routeName, isFocused, colorScheme, cartCount, activeRoute) => {
  const iconColor = isFocused
    ? COLORS[colorScheme].white
    : COLORS[colorScheme].tabInActive;

  switch (routeName) {
    case 'Home':
      return <IonicIcon name="home" color={iconColor} size={wp(6)} />;
    case 'Booking':
      return (
        <View style={styles.iconContainer}>
          <IonicIcon name="cart" color={iconColor} size={wp(6)} />
          {cartCount > 0 && activeRoute !== 2 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
          )}
        </View>
      );
    case 'Notification':
      return <MaterialIcon name="notifications-active" color={iconColor} size={wp(6)} />;
    case 'T-Social':
      return <MaterialIcon name="location-pin" color={iconColor} size={wp(6)} />;
    case 'More':
      return <MaterialIcon name="person" color={iconColor} size={wp(6)} />;
    default:
      return <IonicIcon name="home" color={iconColor} size={wp(5)} />;
  }
};
const BottomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const profile = useSelector(state => state?.Auth?.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const profileDetails = useSelector(state => state.Auth.profileDetails);

  const translateX = useSharedValue(0);
  const [cartCount, setCartCount] = useState(0);
  const [activeRoute, setActiveRoute] = useState(state.index);
  const [allowRemove, setAllowRemove] = useState(false);

  // 🔁 Animate active tab indicator
  useEffect(() => {
    fetchCartCount();
    // translateX.value = withTiming(activeRoute * TAB_WIDTH, { duration: 300 });
  }, [activeRoute]);

  // 🔁 Re-fetch cart count every time tab bar gains focus or user returns to it
  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
      // console.log(activeRoute, 'Active Route in Tab Bar');
    }, [activeRoute, navigation])
  );
  // ✅ Fetch Cart Count from API
  const fetchCartCount = async () => {
    if (!accessToken || !profileDetails?.user_id || !profileDetails?.primary_address?.lat) return;
    try {
      const data = await fetchData(
        'cart/get',
        'POST',
        {
          user_id: profile?.user_id,
          lat: profileDetails?.primary_address?.lat,
          lon: profileDetails?.primary_address?.lon,
        },
        {
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        }
      );
      // console.log(data, 'Cart Data Botottom');
      // Alert.alert('Cart Data', JSON.stringify(data?.status_code));
      if (data?.error == 'Unauthorized Access API') {
        AsyncStorage.clear();
        navigation.reset({
          index: 0,
          routes: [{ name: 'GetStartedScreen' }],
        });
      }
      if (data?.status === true) {
        setCartCount(data.data?.items?.length || 0);
      } else {
        // ToastAndroid.show(data.message || 'Unable to fetch cart.', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };
  // ✅ Handle removing cart items
  const handleRemoveCartClick = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData(
        'cart/clear',
        'POST',
        { user_id: profile?.user_id },
        {
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        }
      );
      if (data?.status === true) {
        ToastAndroid.show('Cart cleared.', ToastAndroid.SHORT);
        fetchCartCount();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setAllowRemove(false);
    }
  };

  // ✅ Handle navigation tab press
  const handleTabPress = (routeName, index) => {
    setActiveRoute(index);
    navigation.navigate(routeName);
  };

  // ✅ Handle view cart
  const handleViewCartClick = () => {
    setActiveRoute(2);
    navigation.navigate('Booking');
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      {/* Floating Cart Summary Button */}
      {activeRoute !== 2 && cartCount > 0 && (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            onPress={handleViewCartClick}
            style={{
              backgroundColor: COLORS[theme].accent,
              width: wp(allowRemove ? 70 : 90),
              height: hp(6),
              alignSelf: 'center',
              borderRadius: wp(2),
              justifyContent: 'center',
              marginBottom: wp(3),
              paddingHorizontal: wp(4),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text
                  style={[poppins.semi_bold.h6, {
                    color: '#fff',
                    fontSize: wp(3.5),
                    marginTop: wp(1),
                  }]}
                >
                  {cartCount} item{cartCount > 1 ? 's' : ''} in your cart
                </Text>
              </View>

              {/* Toggle Remove Button */}
              <TouchableOpacity
                onPress={() => setAllowRemove(!allowRemove)}
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: wp(3),
                  height: wp(6),
                  borderRadius: wp(1),
                  justifyContent: 'center',
                  alignItems: 'center',
                  minWidth: wp(6),
                }}
              >
                <Text
                  style={{
                    color: 'red',
                    fontSize: wp(4),
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  X
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          {allowRemove && (
            <TouchableOpacity
              onPress={handleRemoveCartClick}
              style={{
                backgroundColor: 'red',
                width: wp(20),
                height: wp(12),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: wp(2),
                position: 'relative',top: hp(0.5)
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: wp(4),
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Remove
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Bottom Tab Bar */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: COLORS[theme].viewBackground },
          commonStyles[theme].shadow,
        ]}
      >
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel || route.name;
            const isFocused = activeRoute === index;

            const onPress = () => handleTabPress(route.name, index);

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: 'tabLongPress', target: route.key })
                }
                style={[
                  styles.tabButton,
                  {
                    borderColor: COLORS[theme].accent,
                    padding: wp(2),
                    backgroundColor: isFocused
                      ? COLORS[theme].accent
                      : COLORS[theme].background,
                    borderRadius: wp(20),
                    height: wp(10),
                    alignSelf: 'center',
                    width: wp(10),
                  },
                ]}
              >
                {getTabIcon(route.name, isFocused, theme, cartCount, activeRoute)}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: wp(16),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    width: wp(100),
  },
  tabButton: {
    marginHorizontal: hp(2.2),
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: TAB_WIDTH - wp(4),
    marginHorizontal: wp(2),
    height: wp(0.5),
    borderBottomLeftRadius: wp(1),
    borderBottomRightRadius: wp(1),
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -wp(2),
    right: -wp(4),
    backgroundColor: '#ff0000',
    borderRadius: wp(2.5),
    width: wp(5),
    height: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: '#fff',
    fontSize: wp(3),
  },
});

export default BottomTabBar;
