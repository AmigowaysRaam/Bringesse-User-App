import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import HeaderBar from '../components/header';
import { IMAGE_ASSETS } from '../resources/images';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { fetchData } from '../api/api';
import { wp } from '../resources/dimensions';
import polyline from '@mapbox/polyline';


const FoodDeliveryTrack = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const { data } = route.params;
  const profile = useSelector((state) => state.Auth.profileDetails);

  // Restaurant location
  const [restaurantLocation] = useState({
    latitude: data?.store_location?.latitude,
    longitude: data?.store_location?.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  // Driver location as AnimatedRegion
  const [driverLocation] = useState(
    new AnimatedRegion({
      latitude: data?.store_location?.latitude,
      longitude: data?.store_location?.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  );

  // Function to animate driver marker
  const animateDriver = (lat, lon) => {
    const newCoordinate = { latitude: lat, longitude: lon };
    if (driverLocation.timing) {
      driverLocation.timing(newCoordinate, { duration: 1000 }).start();
    } else {
      driverLocation.setValue(newCoordinate);
    }
  };
  const getDriverData = async () => {
    try {
      const payload = { orderId: data?.order_id, driverId: profile.driver_id };
      const rdata = await fetchData('order/tracking', 'POST', payload, {});
      const driver = rdata?.data?.driver;
      if (driver && driver.lat != null && driver.lon != null) {
        const lat = Number(driver.lat);
        const lon = Number(driver.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          animateDriver(lat, lon);
          mapRef.current?.fitToCoordinates([restaurantLocation, { latitude: lat, longitude: lon }], {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          });
        }
      }
    } catch (err) {
      // console.error('Tracking error:', err);
    }
  };
  useEffect(() => {
    // Initial fetch
    getDriverData();
    // Poll every 15 seconds
    const interval = setInterval(() => {
      getDriverData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t('Track Food Delivery')} showBackArrow={true} />
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={restaurantLocation}
        >
          {/* Restaurant Marker */}
          <Marker coordinate={restaurantLocation}>
            <Image
              source={IMAGE_ASSETS.food_marker || IMAGE_ASSETS.ic_pickup_marker}
              resizeMode="contain"
              style={{ width: wp(10), height: wp(10) }}
            />
          </Marker>

          {/* Animated Driver Marker */}
          <Marker.Animated
            ref={driverMarkerRef}
            coordinate={driverLocation}
          >
            <Image
              source={IMAGE_ASSETS.delivery_boy_image}
              resizeMode="contain"
              style={{ width: wp(10), height: wp(10) }}
            />
          </Marker.Animated>
          <Polyline
            coordinates={[restaurantLocation, driverLocation.__getValue()]}
            strokeWidth={4}
            strokeColor="#FF0000"
          />
        </MapView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});

export default FoodDeliveryTrack;
