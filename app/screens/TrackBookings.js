import React, { useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, ActivityIndicator, PermissionsAndroid,
  Platform, Image, Text, TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/header';
import { useSelector } from 'react-redux';
import MapView, { Marker, Polyline } from 'react-native-maps';
// import Geolocation from 'react-native-geolocation-service';
import polyline from '@mapbox/polyline';
import OrderViewCard from './OrderViewCard';
import { fetchData } from '../api/api';
import { IMAGE_ASSETS } from '../resources/images';
import io from 'socket.io-client';  // Import socket.io-client
import { poppins } from '../resources/fonts';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import ReviewModal from './ReviewModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const SOCKET_URL = 'https://www.bringesse.com:3000/';

const TrackBookings = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const mapRef = useRef(null);
  const { selectedItem } = route.params;
  const [location, setLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [socket, setSocket] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const navigation = useNavigation();
  const [reviewModal, setreviewModal] = useState(false);
  const [bookingCreatedAt, setBookingCreatedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // seconds (10 minutes)
  const accessToken = useSelector(state => state.Auth.accessToken);
  const siteDetails = useSelector(state => state.Auth.siteDetails);
  const socketRef = useRef(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

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

  const getBookingsDetails = async () => {
    const payload = {
      booking_id: selectedItem?._id,
      user_id: profileDetails?.user_id,
    };
    // Alert.alert(JSON.stringify( profileDetails?.user_id,null,2));
    try {
      const responseData = await fetchData('/transport/bookingdetail', 'POST', payload, {
        Authorization: `${accessToken}`,
        user_id: profileDetails?.user_id,
        type: "user"
      });
      if (responseData?.status === true) {
        const booking = responseData?.data[0];

        const { driver, status, vehicle, otp, pickupLocation, completeOtp, createdAt } = booking;
        if (createdAt) {
          setBookingCreatedAt(createdAt);
        }
        const pickLocation = pickupLocation?.coordinates;
        if (pickLocation) {
          setLocation({
            latitude: pickLocation[1],
            longitude: pickLocation[0],
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
        const currentLocation = driver?.currentLocation?.coordinates;
        if (currentLocation) {
          setDestinationCoords({
            latitude: currentLocation[1],
            longitude: currentLocation[0],
          });
        }
        const extractedData = {
          driverImage: driver?.profileImage,
          driverPhone: driver?.phone,
          driverName: driver?.name,
          bookingStatus: status,
          vehicleNumber: driver?.vehicleNumber,
          otp: otp,
          completeOtp: completeOtp,
          driver: driver ? driver : null,
          vehicle: vehicle,
        };
        setBookingData(extractedData);
        setBookingStatus(status);
      } else {
        setBookingData(null);
      }
    } catch (err) {
      console.error('Booking fetch error:', err);
    }
  };
  useEffect(() => {
    // Connect socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],  // important for RN
      forceNew: true,
    });
  
    const socket = socketRef.current;
    const userType = profileDetails?.userType || 'user';
    socket.emit("joinBookingRoom", selectedItem?._id, userType);
    // ---- Location Update Event ----
    socket.on("locationUpdate", (newLocation) => {
      if (newLocation) {
        setDestinationCoords({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        });
      }
    });
    // ---- Booking Status Update ----
    socket.on("bookingStatusUpdate", (data) => {
      setBookingStatus(data?.status);
    });
    // Cleanup
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const status = await getBookingsDetails();
      console.log("Updated status:", status);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (bookingStatus === 'completed') {
      setreviewModal(true);
    }
    if (bookingStatus == 'cancelled') {
      navigation.goBack();
    }
  }, [bookingStatus]);
  useEffect(() => {
    if (location && destinationCoords) {
      fetchRoute();
    }
  }, [location, destinationCoords]);

  useEffect(() => {
    if (location && destinationCoords && mapRef.current) {
      mapRef.current.fitToCoordinates([location, destinationCoords], {
        edgePadding: { top: 2, right: 1, bottom: 1, left: 1 },
        animated: true,
      });
    }
  }, [location, destinationCoords]);

  const cancelBooking = async () => {
    let payload = {
      user_id: profileDetails?.user_id,
      booking_id: selectedItem?._id
    }
    setLoadingStatus(true)
    try {
      const data = await fetchData('transport/cancelbooking', 'POST', payload, {
        Authorization: `${accessToken}`,
        user_id: profileDetails?.user_id,
        type: "user"
      });
      if (data?.status === true) {
        if (socket && selectedItem?._id) {
          socket.emit('cancelBooking', selectedItem?._id);
          // Alert.alert(t('Booking canceled'));
          ToastAndroid.show(t('Booking has been canceled'), ToastAndroid.SHORT);
          navigation.goBack();  // Optionally, navigate back after cancellation
        }
      } else {
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error('cancelbooking fetch error:', err);
    } finally {
      setLoadingStatus(false)
    }
  };
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={t('Track Bookings') || 'Track Bookings'} showBackArrow={true} />
      <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        
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
                showsUserLocation={false}
              >
                <Marker coordinate={location}>
                  <Image
                    source={IMAGE_ASSETS?.ic_pickup_marker}

                    resizeMode='contain'
                    style={{
                      width: wp(10),
                      height: wp(10),
                      // borderRadius: wp(5),
                    }}
                  />
                </Marker>
                <Marker coordinate={destinationCoords}>
                  <Image
                    source={{ uri: siteDetails?.media_url + 'vehicles/' + bookingData?.vehicle?.image }}
                    style={{
                      width: wp(10),
                      height: wp(10),
                      borderRadius: wp(5),
                    }}
                  />
                </Marker>
                <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
              </MapView>
            ) : (
              <View style={styles.centerContainer}>
                <Text style={[poppins.regular.h5, { color: COLORS[theme].primary, marginTop: hp(1) }]}>
                  {t('Looking for nearby drivers...') || 'Looking for nearby drivers...'}
                </Text>
                <LottieView
                  source={IMAGE_ASSETS.delivery_search}
                  autoPlay
                  loop
                  style={{
                    width: wp(90),
                    height: wp(80),
                  }}
                />
              </View>
            )}
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
          completeOtp={bookingData?.completeOtp}
          vehicle={bookingData?.vehicle}
        />
      )}
      {/* Cancel button visible if the status is "pending" */}
      {bookingStatus !== 'cancelled' && (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelBooking}>
          <Text style={styles.cancelButtonText}>{t('Cancel Booking')}</Text>
        </TouchableOpacity>
      )}
      {/* )} */}
      <ReviewModal
        visible={reviewModal}
        onClose={() => {
          setreviewModal(false);
          navigation.goBack();
        }}
        bookingId={selectedItem?._id}
        driverName={bookingData?.driverName}
        driver={bookingData?.driver}
      />
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', }, map: { flex: 1, },
  cancelButton: {
    backgroundColor: '#FF0000', padding: wp(4), borderRadius: wp(2), alignItems: 'center',
    marginHorizontal: hp(2),
  },
  cancelButtonText: { color: '#FFF', fontSize: wp(4.5), fontWeight: 'bold', },
});

export default TrackBookings;
