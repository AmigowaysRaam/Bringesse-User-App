import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, PermissionsAndroid,
  Platform, Alert, ActivityIndicator, ScrollView, RefreshControl
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../resources/colors';
import { hp, wp } from '../../../resources/dimensions';
import FlashMessage from 'react-native-flash-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import UserToggleStatus from '../../UserToggleStatus';
import SearchContainer from '../../SearchContainer';
import CategoryList from '../../CategoryList';
import CarouselData from '../../CarouselData';
import { fetchData } from '../../../api/api';
import StoreListData from '../../StoreListData';
import LoaderContainer from '../../LoaderContainer';
import VersionUpgradeModal from '../../VersionUpgradeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const [refreshing, setRefreshing] = useState(false); // Refresh control state
  const profile = useSelector(state => state?.Auth?.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const [homePageData, setHomePageData] = useState(null);
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const navigation = useNavigation();

  console.log(profileDetails, 'profileDetails');
  // Request permission for location (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    try {

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // ✅ Get Address using Google Maps API
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      console.log('Fetching address for coords:', latitude, longitude);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${9.898533},${78.165138}&key=AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc`
      );
      const data = await response.json();
      console.log('Geocoding API response:', data);
      if (data.status === 'OK' && data.results.length > 0) {
        const formattedAddress = data.results[0]?.formatted_address;
        setAddress(formattedAddress);
      } else {
        console.warn('No address found for coordinates');
        setAddress('Unknown location');
      }
    } catch (error) {
      console.error('Geocoding Error:', error);
      setAddress('Failed to fetch address');
    }
  };

  // ✅ Get user's current location
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return null;
    }
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude, 'latitude', 'longitude');
          setLocation({ latitude, longitude });
          const primaryAdress = profileDetails?.primary_address;
          if (primaryAdress && Object.keys(primaryAdress).length > 0) {
            getAddressFromCoords(primaryAdress.lat, primaryAdress.lon);
          } else {
            getAddressFromCoords(latitude, longitude);  // Get the address
          }
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          Alert.alert('Location Error', error.message || 'Failed to get location.');
          reject(error); // Rejecting the promise on error
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });
  };



  const fetchProfileData = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData('userprofile/' + profile?.user_id, 'GET', null, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      dispatch({
        type: 'PROFILE_DETAILS',
        payload: data,
      });
    } catch (error) {
      console.error('Profile API Error:', error);
    }
  };

  // Fetch data for the home screen after location is fetched
  const getHomePageData = async (latitude, longitude) => {
    // Alert.alert('Profile Data', JSON.stringify(profileDetails?.primary_address?.lat));
    // fetchProfileData();
    if (!accessToken || !profile?.user_id) return;
    try {
      setLoading(true);  // Start loading
      const data = await fetchData('homeapi', 'POST', {
        lat: profileDetails?.primary_address?.lat ? profileDetails?.primary_address?.lat : latitude,
        lon: profileDetails?.primary_address?.lon ? profileDetails?.primary_address?.lon : longitude
      }, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      // console?.log(data, "HomeDATA");
      if (data?.status === 'true') {setHomePageData(data)}
      else{
        AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'GetStartedScreen' }],
            });
      };
    } catch (error) {
      console.error('Error fetching home page data:', error);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  // Fetch location and home page data on screen focus
  useFocusEffect(
    useCallback(() => {
      const fetchLocationAndData = async () => {
        setLoading(true);  // Start loading
        const locationData = await getLocation();
        if (locationData) {
          await getHomePageData(locationData.latitude, locationData.longitude);
        }
        setLoading(false);  // Stop loading
      };
      fetchLocationAndData();  // Ensure we get location first
    }, [profileDetails?.primary_address?.lat,navigation])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const locationData = await getLocation();
    if (locationData) {
      await getHomePageData(locationData.latitude, locationData.longitude);
    }
    setRefreshing(false);
  }, []);
  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <UserToggleStatus address={address} loading={loading} />
      <VersionUpgradeModal />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            colors={[COLORS[theme].accent]} // Customize the refresh control color
          />
        }
      >
        {loading ? (
          <LoaderContainer />
        ) : (
          <>
            <SearchContainer banner={homePageData} />
            <CarouselData banner={homePageData} />
            <CategoryList banner={homePageData} />
            <StoreListData banner={homePageData} />
          </>
        )}
      </ScrollView>
      <FlashMessage position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  locationCard: {
    margin: hp(2), padding: hp(2),
    borderRadius: wp(2), backgroundColor: '#000',
    elevation: 2,
  },
  label: {
    fontSize: wp(4), fontWeight: '600',
    marginBottom: hp(0.5),
  },
  addressText: {
    fontSize: wp(3.8),
  },
});

export default HomeScreen;
