import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
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
const GOOGLE_DIRECTIONS_API_KEY = "AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc"; // Replace with your key
const FoodDeliveryTrack = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const { data } = route.params;
  const profile = useSelector((state) => state.Auth.profileDetails);

  // Store location
  const storeLocation = {
    latitude: Number(data?.store_location?.coordinates?.[1]) || 0,
    longitude: Number(data?.store_location?.coordinates?.[0]) || 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // Delivery location
  const deliveryLocation = {
    latitude: Number(data?.delivery_address?.lat) || storeLocation.latitude,
    longitude: Number(data?.delivery_address?.lon) || storeLocation.longitude,
  };

  // Driver initial location
  const [driverLocation] = useState(
    new AnimatedRegion({
      latitude: storeLocation.latitude,
      longitude: storeLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  );

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Animate driver marker
  const animateDriver = (lat, lon) => {
    driverLocation.timing({
      latitude: lat,
      longitude: lon,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  };

  // Fetch route from Google Directions API
  const fetchRoute = async (originLat, originLon, destLat, destLon) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLon}&destination=${destLat},${destLon}&mode=driving&key=${GOOGLE_DIRECTIONS_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.routes?.length > 0) {
        const points = polyline.decode(json.routes[0].overview_polyline.points);
        const coords = points.map(p => ({ latitude: p[0], longitude: p[1] }));
        setRouteCoordinates(coords);
      }
    } catch (err) {
      console.log("Route Fetch Error:", err);
    }
  };

  // Get driver live location from API
  const getDriverData = async () => {
    try {
      const payload = {
        orderId: data?.order_id,
        driverId: profile?.driver_id || data?.driver_id || "",
      };

      const rdata = await fetchData('order/tracking', 'POST', payload, {});
      const driver = rdata?.data?.driver;

      if (!driver || !driver.lat || !driver.lon) {
        console.log("Driver not yet assigned");
        return;
      }

      const driverLat = parseFloat(driver.lat);
      const driverLon = parseFloat(driver.lon);

      if (isNaN(driverLat) || isNaN(driverLon)) {
        console.log("Invalid driver coordinates:", driver);
        return;
      }

      // Animate driver marker
      animateDriver(driverLat, driverLon);

      // Fetch route from driver → delivery
      fetchRoute(driverLat, driverLon, deliveryLocation.latitude, deliveryLocation.longitude);

      // Adjust map to fit driver, store, delivery
      mapRef.current?.fitToCoordinates(
        [
          { latitude: driverLat, longitude: driverLon },
          storeLocation,
          deliveryLocation,
        ],
        { edgePadding: { top: 100, right: 50, bottom: 100, left: 50 }, animated: true }
      );
    } catch (err) {
      console.log("Driver Tracking Error:", err);
    }
  };

  useEffect(() => {
    getDriverData();
    const interval = setInterval(getDriverData, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t('Track Food Delivery')} showBackArrow={true} />

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={storeLocation}
        >
          {/* Store Marker */}
          <Marker coordinate={storeLocation}>
            <Image
              source={IMAGE_ASSETS.food_marker || IMAGE_ASSETS.ic_pickup_marker}
              resizeMode="contain"
              style={{ width: wp(10), height: wp(10) }}
            />
          </Marker>

          {/* Delivery Marker */}
          <Marker coordinate={deliveryLocation}>
            <Image
              source={IMAGE_ASSETS.delivery_marker || IMAGE_ASSETS.ic_delivery_marker}
              resizeMode="contain"
              style={{ width: wp(10), height: wp(10) }}
            />
          </Marker>

          {/* Driver Marker */}
          <Marker.Animated ref={driverMarkerRef} coordinate={driverLocation}>
            <Image
              source={IMAGE_ASSETS.delivery_boy_image}
              resizeMode="contain"
              style={{ width: wp(12), height: wp(12) }}
            />
          </Marker.Animated>

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={5}
              strokeColor="#1E90FF"
            />
          )}
        </MapView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
});

export default FoodDeliveryTrack;
