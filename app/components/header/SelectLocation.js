import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Image,
  ActivityIndicator, TextInput, FlatList, Keyboard,
  KeyboardAvoidingView, TouchableWithoutFeedback, Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import { hp, wp } from '../../resources/dimensions';
import { COLORS } from '../../resources/colors';
import { useTheme } from '../../context/ThemeContext';
import { IMAGE_ASSETS } from '../../resources/images';

const GOOGLE_API_KEY = 'AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc'; // Replace with your key

const SelectLocation = ({ visible, onDismiss, onConfirm, type }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Search states
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Request permission for location
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // Get current location
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          getAddressFromCoords(latitude, longitude);
          setMapLoading(false);
        },
        (error) => {
          Alert.alert('Error', 'Failed to get current location');
          setMapLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert('Permission Denied', 'Location permission is required.');
      setMapLoading(false);
    }
  };

  const { theme } = useTheme();

  // Reverse geocode to get address from coords
  const getAddressFromCoords = async (latitude, longitude) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const formattedAddress = data.results[0]?.formatted_address || 'Unknown location';
        setAddress(formattedAddress);
      }
    } catch (error) {
      setAddress('Failed to fetch address');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch autocomplete suggestions from Google Places API
  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fetch place details (coordinates) on suggestion select
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const loc = data.result.geometry.location;
        const newLocation = {
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setLocation(newLocation);
        setAddress(data.result.formatted_address);
        setSuggestions([]);
        setSearchText(data.result.formatted_address);
        Keyboard.dismiss();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch place details');
    }
  };

  // Handle marker drag end
  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
    getAddressFromCoords(latitude, longitude);
  };

  // On search text change
  const handleSearchChange = (text) => {
    setSearchText(text);
    fetchSuggestions(text);
  };

  // On submit button pressed to get address of current marker
  const handleSubmit = () => {
    if (location) {
      getAddressFromCoords(location.latitude, location.longitude);
    }
  };

  // Confirm button pressed
  const handleConfirm = () => {
    if (location) {
      onConfirm(location, address, type);
      onDismiss();
      setLocation(null);
      setSearchText('');
      setSuggestions([]);
      setAddress('');
    }
  };

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    } else {
      setSearchText('');
      setSuggestions([]);
      setAddress('');
      setLocation(null);
      setMapLoading(true);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={[styles.modalContainer, { backgroundColor: COLORS[theme].background }]}>
              {/* Search Input on top */}
              <View
                style={{
                  position: 'relative',
                  top: wp(6),
                  width: '100%',
                  zIndex: 20,
                  paddingHorizontal: wp(2),
                }}
              >
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: wp(4),
                      height: hp(6),
                      paddingHorizontal: wp(4), // add padding right for clear button space
                      fontSize: wp(4),
                      color: '#5d5d5d',
                      borderWidth: wp(0.4),
                    }}
                    placeholder="Search location"
                    value={searchText}
                    onChangeText={handleSearchChange}
                    underlineColorAndroid="transparent"
                    placeholderTextColor={"#000"}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchText('');
                        // setSuggestions([]);
                        // setAddress('');
                        // setLocation(null);
                        Keyboard.dismiss();
                      }}
                      style={{
                        position: 'absolute',
                        right: wp(1),
                        top: '13%',
                        transform: [{ translateY: -12 }],
                        height: wp(11),
                        width: wp(11),
                        // borderRadius: 12,
                        // backgroundColor: '#ccc',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: "#000"
                      }}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Text style={{ color: '#000', fontSize: wp(11), fontWeight: 'bold' }}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {loadingSuggestions && (
                  <ActivityIndicator size="small" color={COLORS[theme].accent} style={{ marginVertical: 4 }} />
                )}
                {suggestions.length > 0 && (
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    style={{
                      maxHeight: hp(50),
                      backgroundColor: 'white',
                      borderRadius: 8,
                      marginTop: wp(1),
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => fetchPlaceDetails(item.place_id)}
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                      >
                        <Text style={{color:"#000"}}>{item.description}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>

              {mapLoading ? (
                <ActivityIndicator size="medium" color={COLORS[theme].accent} style={styles.loader} />
              ) : (
                <>
                  {location && (
                    <>
                      <MapView
                        style={styles.map}
                        region={location}
                        showsUserLocation
                        onRegionChangeComplete={(region) => setLocation(region)}
                      >
                        <Marker
                          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                          draggable
                          onDragEnd={handleMarkerDragEnd}
                        >
                          <Image
                            source={IMAGE_ASSETS?.ic_pickup_marker}
                            style={{ width: wp(12), height: wp(12), resizeMode: 'contain' }}
                          />
                        </Marker>
                      </MapView>

                      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Get Address</Text>
                      </TouchableOpacity>

                      {address !== '' && (
                        <View style={styles.addressContainer}>
                          <Text style={styles.addressText}>{isLoading ? 'Loading address...' : address}</Text>
                        </View>
                      )}

                      <View style={styles.footer}>
                        <TouchableOpacity
                          style={[styles.confirmButton, { backgroundColor: COLORS[theme].accent }]}
                          onPress={handleConfirm}
                        >
                          <Text style={styles.confirmText}>Confirm Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: wp(100),
    borderRadius: 10,
    padding: wp(2),
    alignItems: 'center',
    height: hp(100),
  },
  map: {
    width: '100%',
    height: hp(60),
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    width: '100%',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  confirmButton: {
    padding: wp(4),
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SelectLocation;
