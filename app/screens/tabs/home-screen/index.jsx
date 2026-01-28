// ----------------- FIXED FULL HOME SCREEN WITH TOGGLE --------------------
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, StyleSheet, PermissionsAndroid,
  Platform, Alert, RefreshControl, FlatList, Switch, ImageBackground,
  Text
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../resources/colors';
import FlashMessage from 'react-native-flash-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import UserToggleStatus from '../../UserToggleStatus';
import SearchContainer from '../../SearchContainer';
import CategoryList from '../../CategoryList';
import CarouselData from '../../CarouselData';
import { fetchData } from '../../../api/api';
import StoreListData from '../../StoreListData';
import LoaderContainer from '../../LoaderContainer';
import VersionUpgradeModal from '../../VersionUpgradeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { poppins } from '../../../resources/fonts';
import { hp, wp } from '../../../resources/dimensions';
import CheckUserName from '../../CheckUserName';
import CheckCartItems from '../../checkCartItems';
import {walkthroughable,CopilotStep,useCopilot} from 'react-native-copilot'

  const WalkthroughableView = walkthroughable(View);

const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [homePageData, setHomePageData] = useState(null);
  // 🔥 NEW: Toggle State
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const profile = useSelector(state => state.Auth.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const isInitialLoading = loading && !homePageData;

  //------------------ GET PERMISSION ------------------
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
        }
      );
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };
  //------------------ GET ADDRESS ------------------
  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc`
      );
      const data = await response.json();
      if (data.status === "OK") {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Unknown location");
      }
    } catch (err) {
      console.log("Address error:", err);
      setAddress("Failed to fetch address");
    }
  };
  //------------------ GET CURRENT LOCATION ------------------
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        err => {
          Alert.alert("Location Error", err.message);
          reject(err);
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      );
    });
  };
  //------------------ FETCH PROFILE ------------------
  const fetchProfileData = async () => {
    if (!accessToken || !profile?.user_id) return;

    try {
      const data = await fetchData(`userprofile/${profile.user_id}`, "GET", null, {
        Authorization: accessToken,
        user_id: profile.user_id,
        type: "user",
      });
      dispatch({ type: "PROFILE_DETAILS", payload: data });
    } catch (e) {
      console.log("Profile error:", e);
    }
  };
  //------------------ HOME API ------------------
  const getHomePageData = async (lat, lon) => {
    if (!accessToken || !profile?.user_id) return;
    try {
      setLoading(true);
      const data = await fetchData("homeapi", "POST", { lat, lon }, {
        Authorization: accessToken,
        user_id: profile.user_id,
        type: "user",
      });

      if (data?.status === "true") {
        setHomePageData(data);
      } else {
        await AsyncStorage.multiRemove([
  'access_token',
  'user_data',
  'refresh_token',
]);

        navigation.reset({ index: 0, routes: [{ name: "GetStartedScreen" }] });
      }
    } catch (err) {
      console.log("Home API error:", err);
    } finally {
      setLoading(false);
    }
  };
  //------------------ RUN WHEN SCREEN FOCUSES ------------------
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );
  //------------------ MAIN LOCATION LOADER ------------------
  useEffect(() => {
    const loadData = async () => {
      if (!profileDetails) return;
      setRefreshing(true);
      const primary = profileDetails?.primary_address;
      const hasPrimary = primary?.lat && primary?.lon;
      if (!useCurrentLocation && hasPrimary) {
        // 🔥 Use saved address
        await getAddressFromCoords(primary.lat, primary.lon);
        await getHomePageData(primary.lat, primary.lon);
      } else {
        // 🔥 Use real-time location
        const loc = await getLocation();
        if (loc) {
          await getAddressFromCoords(loc.latitude, loc.longitude);
          await getHomePageData(loc.latitude, loc.longitude);
        }
      }
      setRefreshing(false);
    };
    loadData();
  }, [profileDetails, useCurrentLocation]);

  // copilot start


const { start } = useCopilot();


const [copilotReady,setCopilotReady] = useState(false);
useFocusEffect(
  useCallback(() => {
    let active = true;

    const runCopilot = async () => {
      if (!profile?.user_id) return;
      if (!homePageData) return;
      if (!copilotReady) return;

      const key = `copilot_home_seen_${profile.user_id}`;
      const seen = await AsyncStorage.getItem(key);

      if (!seen && active) {
        setTimeout(() => {
          start(); // ✅ steps now exist
        }, 500);

        await AsyncStorage.setItem(key, 'true');
      }
    };

    runCopilot();

    return () => {
      active = false;
    };
  }, [profile?.user_id, homePageData, copilotReady])
);

useEffect(() => {
  console.log('Copilot ready:', copilotReady);
}, [copilotReady]);


  //------------------ ON REFRESH ------------------
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    const primary = profileDetails?.primary_address;
    const hasPrimary = primary?.lat && primary?.lon;
    if (!useCurrentLocation && hasPrimary) {
      await getAddressFromCoords(primary.lat, primary.lon);
      await getHomePageData(primary.lat, primary.lon);
    } else {
      const loc = await getLocation();
      if (loc) {
        await getAddressFromCoords(loc.latitude, loc.longitude);
        await getHomePageData(loc.latitude, loc.longitude);
      }
    }
    setRefreshing(false);
  };
  //------------------ TOGGLE UI COMPONENT ------------------
  const LocationToggle = () => (
    <View style={styles.toggleRow}>
      <Text style={[poppins.regular.h8, {
        color: COLORS[theme].primary
      }]}>Get Store from Current Location</Text>
      <View style={{ width: wp(15.5), height: wp(8.5), borderWidth: wp(0.4), borderColor: "#ccc", alignItems: "center", borderRadius: wp(4) }}>
         
        <Switch
          value={useCurrentLocation}
          onValueChange={setUseCurrentLocation}
          // Thumb (circle)
          thumbColor={useCurrentLocation ? COLORS[theme].accent : "#9e9e9e"}
          // Track colors
          trackColor={{
            false: "#ccc",
            true: COLORS[theme].accent + "90"
          }}
        />
      </View>
    </View>
  );
  return (
    <View
      style={[styles.background, { backgroundColor: COLORS[theme].background }]}
    >
      <UserToggleStatus address={address} loading={loading} />
      <VersionUpgradeModal />
      <CheckUserName />
      <CheckCartItems />
      {isInitialLoading ? (
        <LoaderContainer /> // Only full-page loader on first load
      ) : (
        <FlatList
          style={{ paddingBottom: wp(2) }}
          showsVerticalScrollIndicator={false}
          data={[1]}
          keyExtractor={() => "123456"}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={() => {
  // 🔥 mark UI ready ONLY once
  if (!copilotReady) {
    setTimeout(() => setCopilotReady(true), 0);
  }

  return (
    <>
      <CopilotStep
        text="Turn on location to get nearby stores"
        order={3}
        name="location">
        <WalkthroughableView>
          <LocationToggle />
        </WalkthroughableView>
      </CopilotStep>
              <SearchContainer banner={homePageData} />
      <CopilotStep
        text="Search nearby stores"
        order={1}
        name="search">
        <WalkthroughableView>
           <CategoryList  banner={homePageData}/>
        </WalkthroughableView>
      </CopilotStep>
         <CarouselData banner={homePageData}/>
      <CopilotStep
        text="Browse stores"
        order={2}
        name="stores">
        <WalkthroughableView>
          <StoreListData
            banner={homePageData}
            useCurrentLocation={useCurrentLocation}
          />
        </WalkthroughableView>
      </CopilotStep>
     
    </>
  );
}}

        />
      )}
      <FlashMessage position="top" />
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    width: '100%', height: '100%',
  }, toggleRow: {
    width: "95%", padding: wp(3),
    alignItems: "flex-end", flexDirection: "row", alignSelf: "center", alignItems: "center", justifyContent: "space-between"
  }
});
export default HomeScreen;