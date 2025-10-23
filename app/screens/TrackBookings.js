import React, { useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, ActivityIndicator, PermissionsAndroid,
  Platform, Alert, Image, Text,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/header';
import { useSelector } from 'react-redux';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import polyline from '@mapbox/polyline';
import OrderViewCard from './OrderViewCard';
import { fetchData } from '../api/api';
import { IMAGE_ASSETS } from '../resources/images';
import io from 'socket.io-client';  // Import socket.io-client
import { poppins } from '../resources/fonts';
import { useNavigation } from '@react-navigation/native';

const SOCKET_URL = 'https://www.bringesse.com:3000/';
const TrackBookings = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const mapRef = useRef(null);
  const { selectedItem } = route.params;
  const [location, setLocation] = useState(null); // This will be set to the pickupLocation
  const [mapLoading, setMapLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [socket, setSocket] = useState(null); // State for socket
  const [bookingStatus, setBookingStatus] = useState(null); // Store booking status
  const [loadingStatus, setLoadingStatus] = useState(false); // Loading state for booking status
  const navigation = useNavigation();
  // Request permission for location (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // Fetch the route between current location and destination using polyline
  const fetchRoute = async () => {
    try {
      if (location && destinationCoords) {
        const origin = `${location.latitude},${location.longitude}`;
        const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc`
        );
        const data = await response.json();

        if (data.routes?.length > 0) {
          const points = polyline.decode(data.routes[0].overview_polyline.points);
          const coords = points.map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoordinates(coords);
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Fetch booking details
  const getBookingsDetails = async () => {
    // Alert.alert(selectedItem?._id)
    const payload = {
      booking_id: selectedItem?._id,
    };
    try {
      const responseData = await fetchData('/transport/bookingdetail', 'POST', payload, null);
      console?.log(responseData, "responseData")
      if (responseData?.status === true) {
        const booking = responseData?.data[0];
        console.log(booking, "bookingData")
        const { driver, status, vehicle, otp, pickupLocation } = booking;

        // Extracting the pickup location from the coordinates array
        const pickLocation = pickupLocation?.coordinates;
        if (pickLocation) {
          setLocation({
            latitude: pickLocation[1], // Latitude is the second item in the array
            longitude: pickLocation[0], // Longitude is the first item in the array
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }

        const currentLocation = driver?.currentLocation?.coordinates;

        if (currentLocation) {
          setDestinationCoords({
            latitude: currentLocation[1], // Latitude is the second item in the array
            longitude: currentLocation[0], // Longitude is the first item in the array
          });
        }

        const extractedData = {
          driverImage: driver.profileImage,
          driverPhone: driver.phone,
          driverName: driver.name,
          bookingStatus: status,
          vehicleNumber: driver.vehicleNumber,
          otp: otp
        };
        setBookingData(extractedData); // Store the extracted data
        setBookingStatus(status); // Store booking status
      } else {
        setBookingData(null); // If no data, set null
      }
    } catch (err) {
      console.error('Booking fetch error:', err);
    }
  };

  // Call location and booking details functions on component mount
  useEffect(() => {
    getBookingsDetails();
    const socketConnection = io(SOCKET_URL);
    setSocket(socketConnection);
    // Emit the joinBookingRoom event
    const userType = profileDetails?.userType || 'user'; // Assuming userType is available from profileDetails
    socketConnection.emit('joinBookingRoom', selectedItem?._id, userType);
    // Handle socket events for location update and booking status update
    socketConnection.on('locationUpdate', (newLocation) => {
      if (newLocation) {
        setDestinationCoords({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        });
      }
    });
    socketConnection.on('bookingStatusUpdate', (data) => {
      console.log('Booking status update received:', data);
      const { bookingId, status, driverInfo } = data;
      console.log(`Booking status update for booking ID ${bookingId}:`, status, driverInfo);
      if (status == 'accept') {
        getBookingsDetails();
      }
      setBookingStatus(status);
      // setLoadingStatus(false); // Stop the loader once the status is updated
    });
    // Cleanup on unmount
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (bookingStatus == 'completed') {
      navigation.goBack();
    }
  }, [bookingStatus]);

  // Fetch the route after location update
  useEffect(() => {
    if (location && destinationCoords) {
      fetchRoute(); // Fetch route whenever location and destination are both available
    }
  }, [location, destinationCoords]);

  // Zoom map to show both markers when both locations available
  useEffect(() => {
    if (location && destinationCoords && mapRef.current) {
      mapRef.current.fitToCoordinates([location, destinationCoords], {
        edgePadding: { top: 2, right: 1, bottom: 1, left: 1 },
        animated: true,
      });
    }
  }, [location, destinationCoords]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t('TrackBookings') || 'TrackBookings'} showBackArrow={true} />
      <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        {/* <Image
          source={IMAGE_ASSETS?.scooter}
          style={{
            width: wp(10),
            height: wp(10),
            borderRadius: wp(5),
          }}
        /> */}
        {mapLoading || loadingStatus ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS[theme].accent} />
          </View>
        ) : (
          <>
            {location && destinationCoords ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={location}
                showsUserLocation={false} // We use custom marker
              >
                {/* Marker for pickup location */}
                <Marker coordinate={location}>
                  <Image
                    source={{ uri: profileDetails?.user_image }}
                    style={{
                      width: wp(10),
                      height: wp(10),
                      borderRadius: wp(5),
                    }}
                  />
                </Marker>
                {/* Marker for destination */}
                <Marker coordinate={destinationCoords} >
                  <Image
                    source={IMAGE_ASSETS?.scooter}
                    style={{
                      width: wp(10),
                      height: wp(10),
                      borderRadius: wp(5),
                    }}
                  />
                  <Text style={[poppins.regular.h9, { color: "#000", backgroundColor: "yellow", borderWidth: wp(0.1), borderColor: 'black' }]}>
                    {bookingStatus}
                  </Text>
                </Marker>

                {/* Polyline for route */}
                <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
              </MapView>
            ) :
              <Image
                source={IMAGE_ASSETS.delivery_boy_image}
                style={{
                  width: wp(70),
                  height: wp(80),
                  alignSelf: "center"
                }}
              />
            }
          </>
        )}
      </View>
      {bookingData && (
        <OrderViewCard
          driverImage={bookingData.driverImage}
          driverPhone={bookingData.driverPhone}
          driverName={bookingData.driverName}
          bookingStatus={bookingStatus}
          vehicleNumber={bookingData.vehicleNumber}
          otp={bookingData?.otp}
        />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
});

export default TrackBookings;
