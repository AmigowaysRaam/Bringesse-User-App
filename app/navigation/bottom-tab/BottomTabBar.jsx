/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { hp, wp } from '../../resources/dimensions'; // Assuming this is a utility for width percentage
import { COLORS } from '../../resources/colors'; // Static color scheme
import { commonStyles } from '../../resources/styles'; // Assuming common styles
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext'; // Assuming theme context
import { useSelector } from 'react-redux';
import { fetchData } from '../../api/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5; // Each tab has equal width

// Static tab labels and icons
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
          {/* Display cart count only if the tab is focused */}
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
  const { theme } = useTheme(); // Get the current theme
  const profile = useSelector(state => state?.Auth?.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const translateX = useSharedValue(0);
  const [cartCount, setcartCount] = useState(0); // Example cart count
  const [activeRoute, setActiveRoute] = useState(state.index); // Track active route in state
  // Animate tab indicator on tab change
  const [allowRemove, setallowRemove] = useState(false); // Example cart count

  useFocusEffect(
    useCallback(() => {
      translateX.value = withTiming(activeRoute * TAB_WIDTH, { duration: 300 });
      fetchCartCount(); // Fetch cart count on tab focus
    }, [activeRoute, navigation])
  );
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  // Fetch Cart Count from API
  const fetchCartCount = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData('cart/get', 'POST', {
        user_id: profile?.user_id,
      }, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      if (data?.status === true) setcartCount(data.data?.items?.length);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };
  // Handle "View Cart" Button Click
  const handleViewCartClick = () => {
    setActiveRoute(2); // Set the active route dynamically
    navigation.navigate('Booking'); // Navigate to the Cart screen
  };
  // Handle Tab Selection
  const handleTabPress = (routeName, index) => {
    setActiveRoute(index); // Set the active route dynamically
    navigation.navigate(routeName); // Navigate to the selected route
  };

  const handleRemoveCartClick = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData('cart/clear', 'POST', {
        user_id: profile?.user_id,
      }, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      if (data?.status === true) fetchCartCount();
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  return (
    <>
      {/* Conditionally render the "View Cart" button */}
      {activeRoute !== 2 && cartCount > 0 && ( // Assuming 'Cart' is the 5th tab in this case
        <View style={{ flexDirection: "row", justifyContent: "center", }}>
          <TouchableOpacity
            onPress={handleViewCartClick}
            style={{
              backgroundColor: '#ff4d4f', // Red background to grab attention
              width: wp(allowRemove ? 70 : 90),
              height: wp(12),  // Slightly larger button for better touch target
              alignSelf: 'center',
              borderRadius: wp(2),
              justifyContent: 'center',
              marginBottom: wp(3),
              paddingHorizontal: wp(4),  // Added more padding for spacing
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                {cartCount > 0 && (
                  <Text style={{
                    color: '#fff',
                    fontSize: wp(3.5),
                    marginTop: wp(1),
                  }}>
                    {cartCount} item{cartCount > 1 ? 's' : ''} in your cart
                  </Text>
                )}
              </View>
              {/* Right side: Cart Count Badge */}
              <TouchableOpacity
                // ONPRESS SHOW REMOVE BUTTON ON CLICK ALERT
                onPress={() => setallowRemove(!allowRemove)}
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: wp(3),
                  height: wp(6),
                  lineHeight: wp(6), // Center the text vertically
                  borderRadius: wp(1), // Circular pill-shaped badge
                  justifyContent: 'center',
                  alignItems: 'center',
                  minWidth: wp(6), // Ensure the badge has a minimum width
                }}
              >
                <Text
                  style={{
                    color: '#ff4d4f', // Red text to highlight the count
                    fontSize: wp(4),
                    fontWeight: '600', // Bold count number
                    textAlign: 'center',
                  }}
                >
                  {'X'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          {
            allowRemove &&
            <TouchableOpacity
              onPress={() => {
                handleRemoveCartClick()
              }}

              style={{ backgroundColor: "red", width: wp(20), height: wp(12), alignItems: "center", justifyContent: "center", borderRadius: wp(2) }}>
              <Text
                style={{
                  color: '#FFF', // Red text to highlight the count
                  fontSize: wp(4),
                  fontWeight: '600', // Bold count number
                  textAlign: 'center',
                }}
              >
                {'Remove'}
              </Text>
            </TouchableOpacity>
          }

        </View>
      )}

      <View
        style={[
          styles.tabContainer,
          { backgroundColor: COLORS[theme].viewBackground },
          commonStyles[theme].shadow, // Assuming shadow is defined in commonStyles
        ]}
      >
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel || route.name; // Get label

            const isFocused = activeRoute === index; // Use activeRoute to determine focus

            const onPress = () => {
              handleTabPress(route.name, index); // Update the active route when a tab is pressed
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const activeColor = isFocused
              ? COLORS[theme].tabActive
              : COLORS[theme].tabInActive;

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.tabButton,
                  {
                    borderColor: COLORS[theme].accent,
                    padding: wp(2),
                    backgroundColor: isFocused ? COLORS[theme].accent : COLORS[theme].background,
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
    position: 'absolute', top: 0, width: TAB_WIDTH - wp(4), marginHorizontal: wp(2),
    height: wp(0.5),
    borderBottomLeftRadius: wp(1),
    borderBottomRightRadius: wp(1),
  },
  iconContainer: {
    position: 'relative', justifyContent: 'center', alignItems: 'center',
  },
  cartCountBadge: {
    position: 'absolute', top: -wp(2),
    right: -wp(4), backgroundColor: '#ff0000',
    borderRadius: wp(2.5), width: wp(5),
    height: wp(5), alignItems: 'center', alignSelf: 'center',
  },
  cartCountText: {
    color: '#fff',
    fontSize: wp(3),
  },
});

export default BottomTabBar;