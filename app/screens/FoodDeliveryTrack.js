import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/header';
import MapView, { Marker } from 'react-native-maps';
import { IMAGE_ASSETS } from '../resources/images';

const FoodDeliveryTrack = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const { data } = route.params;
  useEffect(() => {
    getDriverData();
  }, [])
  // Only Restaurant Location
  const [restaurantLocation] = useState({
    latitude: data?.store_location?.latitude,
    longitude: data?.store_location?.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const getDriverData = () =>{
    console?.log(data, "data")
  }
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t("Track Food Delivery")} showBackArrow={true} />

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={restaurantLocation}
          showsUserLocation={false}
        >
          {/* RESTAURANT MARKER */}
          <Marker coordinate={restaurantLocation}>
            <Image
              source={IMAGE_ASSETS.food_marker || IMAGE_ASSETS.ic_pickup_marker}
              resizeMode="contain"
              style={{ width: wp(10), height: wp(10) }}
            />
          </Marker>
        </MapView>
      </View>

      {/* Cancel Button */}

    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  map: { flex: 1 },
  cancelButton: {
    backgroundColor: "#FF0000",
    padding: wp(4),
    borderRadius: wp(2),
    alignItems: "center",
    marginHorizontal: hp(2),
    marginBottom: hp(2),
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: wp(4.5),
    fontWeight: "bold",
  },
});

export default FoodDeliveryTrack;
