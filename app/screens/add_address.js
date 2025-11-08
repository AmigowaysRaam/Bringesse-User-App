import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    PermissionsAndroid,
    Platform,
    Alert,
    ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import UseProfileHook from '../hooks/profile-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../api/api';

export default function AddAddressScreen() {

    const route = useRoute();
    const navigation = useNavigation();
    const { addressData, isEdit } = route.params || {};
    const accessToken = useSelector(state => state.Auth.accessToken);
    const [addressType, setAddressType] = useState('Home');
    const [region, setRegion] = useState({
        latitude: 9.9252,
        longitude: 78.1198,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const { profile } = UseProfileHook();
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [addressDetails, setAddressDetails] = useState('');
    const [landmark, setLandmark] = useState('');
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const isManualMove = useRef(false);
    console.log('datta', addressData);
    // Request location permission
    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'We need your location to select address',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    // Get current location
    const getCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Please allow location access.');
            return;
        }

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                isManualMove.current = true;
                setRegion(newRegion);
                getAddressFromCoords(latitude, longitude);
            },
            (error) => {
                Alert.alert('Error getting location', error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // Reverse geocode (get address from lat/lng)
    const getAddressFromCoords = async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc`
            );
            if (response.data.results.length > 0) {
                const result = response.data.results[0];
                const formattedAddress = result.formatted_address;
                const addressComponents = result.address_components;
                const cityComponent = addressComponents.find((c) =>
                    c.types.includes('locality')
                );

                setAddress(formattedAddress);
                setCity(cityComponent ? cityComponent.long_name : '');
            }
        } catch (error) {
            console.log('Geocoding Error:', error.message);
        }
    };

    // Fetch Google Place suggestions
    const fetchSuggestions = async (text) => {
        setSearch(text);
        if (text.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text
                )}&key=AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc&components=country:in`
            );

            if (response.data.predictions.length > 0) {
                setSuggestions(response.data.predictions);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.log('Autocomplete Error:', error.message);
        }
    };

    // Select from suggestions
    const handleSelectSuggestion = async (placeId, description) => {
        setShowSuggestions(false);
        setSearch(description);

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc`
            );

            const location = response.data.result.geometry.location;
            const newRegion = {
                latitude: location.lat,
                longitude: location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            isManualMove.current = true;
            setRegion(newRegion);
            getAddressFromCoords(location.lat, location.lng);
        } catch (error) {
            console.log('Place Details Error:', error.message);
        }
    };

    useEffect(() => {
        if (addressData) {
            setAddress(addressData.location || '');
            setAddressDetails(addressData.address || '');
            setLandmark(addressData.note || '');
            setCity(addressData.city || '');
            setAddressType(addressData.address_type || 'Home');
            setRegion({
                latitude: parseFloat(addressData.lat) || 9.9252,
                longitude: parseFloat(addressData.lon) || 78.1198,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
        getCurrentLocation();
    }, [addressData]);
    const dispatch = useDispatch();
    // ✅ Save Address API Integration
    const handleSaveAddress = async () => {
        if (!address || !city || !addressDetails) {
            Alert.alert('Incomplete', 'Please fill in required address details.');
            return;
        }

        if (!accessToken || !profile?.user_id) {
            Alert.alert('Error', 'User not logged in.');
            return;
        }

        try {
            const API_URL = isEdit
                ? 'https://bringesse.com:3003/api/updateaddress'
                : 'https://bringesse.com:3003/api/addaddress';

            const payload = {
                user_id: profile?.user_id,
                location: address,
                address: addressDetails,
                address_type: addressType,
                lat: region.latitude,
                lon: region.longitude,
                ...(isEdit && { address_id: addressData?.id }),
            };

            console.log('Payload:', payload);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: accessToken,
                    user_id: profile?.user_id,
                    type: 'user',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Response:', data);
            fetchProfileData();
            if (!response.ok) throw new Error(data.message || 'Failed to save address');

            ToastAndroid.show(isEdit ? 'Address updated successfully!' : 'Address saved successfully!', ToastAndroid.SHORT)
            navigation.goBack();
            navigation.goBack();
        } catch (error) {
            console.error('❌ Save Address Error:', error.message);
            Alert.alert('Error', error.message);
        }
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
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add new address</Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search location..."
                        placeholderTextColor="#888"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={fetchSuggestions}
                    />
                    <MaterialCommunityIcons name="magnify" size={26} color="#e74c3c" />
                </View>

                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionBox}>
                        {suggestions.map((item) => (
                            <TouchableOpacity
                                key={item.place_id}
                                style={styles.suggestionItem}
                                onPress={() =>
                                    handleSelectSuggestion(item.place_id, item.description)
                                }
                            >
                                <MaterialCommunityIcons
                                    name="map-marker-outline"
                                    size={18}
                                    color="#555"
                                />
                                <Text style={styles.suggestionText}>{item.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Map Section */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        region={region}
                        onRegionChangeComplete={(r) => {
                            if (isManualMove.current) {
                                isManualMove.current = false;
                                return;
                            }
                            getAddressFromCoords(r.latitude, r.longitude);
                        }}
                        showsUserLocation={true}
                    >
                        <Marker coordinate={region} />
                    </MapView>

                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={getCurrentLocation}
                    >
                        <MaterialCommunityIcons
                            name="crosshairs-gps"
                            size={18}
                            color="#e74c3c"
                        />
                        <Text style={styles.locationText}>Use current location</Text>
                    </TouchableOpacity>
                </View>

                {/* Address Form */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Delivery details</Text>
                    <TouchableOpacity style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={18} color="#e74c3c" />
                        <Text style={styles.locationCity}>
                            {address ? address : 'Fetching location...'}
                        </Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Address details (e.g., Flat, House No., Floor)"
                        value={addressDetails}
                        onChangeText={setAddressDetails}
                        placeholderTextColor="#888"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Landmark (optional)"
                        value={landmark}
                        onChangeText={setLandmark}
                        placeholderTextColor="#888"
                    />

                    <Text style={[styles.sectionLabel, { marginTop: 10 }]}>
                        Save address as
                    </Text>

                    <View style={styles.addressTypeRow}>
                        {['Home', 'Work', 'Other'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setAddressType(type)}
                                style={[
                                    styles.addressTypeBtn,
                                    addressType === type && styles.activeTypeBtn,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.addressTypeText,
                                        addressType === type && styles.activeTypeText,
                                    ]}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
                        <Text style={styles.saveBtnText}>Save address</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
    searchWrapper: {
        marginHorizontal: 16,
        marginBottom: 10,
        position: 'relative',
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchInput: { flex: 1, height: 45, color: '#000' },
    suggestionBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        marginTop: 4,
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 0.5,
        borderColor: '#eee',
    },
    suggestionText: { marginLeft: 8, color: '#333', fontSize: 14 },
    mapContainer: {
        height: 250,
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        marginHorizontal: 16,
    },
    map: { flex: 1 },
    locationButton: {
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 30,
        elevation: 3,
    },
    locationText: { marginLeft: 6, color: '#e74c3c', fontWeight: '500' },
    formSection: { paddingHorizontal: 16, marginTop: 15 },
    sectionLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    locationCity: { marginLeft: 8, fontSize: 15, color: '#000' },
    input: {
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 8,
        color: '#000',
    },
    addressTypeRow: { flexDirection: 'row', marginTop: 8 },
    addressTypeBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 10,
        marginRight: 8,
        alignItems: 'center',
    },
    activeTypeBtn: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
    addressTypeText: { color: '#555', fontWeight: '500' },
    activeTypeText: { color: '#fff' },
    saveBtn: {
        backgroundColor: '#e74c3c',
        marginTop: 20,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
