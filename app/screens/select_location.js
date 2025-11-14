import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    Modal,
    ToastAndroid,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import UseProfileHook from '../hooks/profile-hooks';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchData } from '../api/api';
import HeaderBar from '../components/header';
import { COLORS } from '../resources/colors';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import FlashMessage, { showMessage } from 'react-native-flash-message';

export default function SelectLocationScreen() {
    const navigation = useNavigation();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { profile } = UseProfileHook();
    const accessToken = useSelector(state => state.Auth.accessToken);
    // Bottom Sheet state
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showOptions, setShowOptions] = useState(false);

    // Fetch Address List
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const formBody = { user_id: profile?.user_id };
            const response = await fetch('https://bringesse.com:3003/api/getaddress', {
                method: 'POST',
                headers: {
                    Authorization: accessToken,
                    user_id: profile?.user_id,
                    type: 'user',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formBody),
            });
            const result = await response.json();
            if (result?.status === 'true') {
                setAddresses(result.address_list);
            } else {
                setAddresses([]);
                // Alert.alert('No addresses found.');
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [])
    );

    // ✅ Confirm before setting default address
    const confirmSetDefaultAddress = (item) => {
        Alert.alert(
            'Set Default Address',
            'Are you sure you want to set this as your default address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => handleSetDefaultAddress(item),
                },
            ]
        );
    };
    const dispatch = useDispatch();
    // ✅ Check Cart Items — returns number of items
    const checkCartItems = async () => {
        if (!accessToken || !profile?.user_id) return 0;
        try {
            const data = await fetchData(
                'cart/get',
                'POST',
                {
                    user_id: profile?.user_id,
                    lat: profile?.primary_address?.lat,
                    lon: profile?.primary_address?.lon,
                },
                {
                    Authorization: `${accessToken}`,
                    user_id: profile?.user_id,
                    type: 'user',
                }
            );

            if (data?.status === true) {
                const cartLength = data.data?.items?.length || 0;
                return cartLength;
            } else {
                ToastAndroid.show(
                    data.message || 'Unable to fetch cart.',
                    ToastAndroid.SHORT
                );
                return 0;
            }
        } catch (error) {
            console.error('Error fetching cart data:', error);
            return 0;
        }
    };
    // ✅ Set Default Address (only if cart is empty)
    const handleSetDefaultAddress = async (item) => {
        const cartLength = await checkCartItems();
        // 🚫 Prevent changing default if cart has items
        if (cartLength > 0) {
          
            ToastAndroid.show('Please empty your cart before changing your default address.', ToastAndroid.LONG);
            return;
        }
        try {
            const formBody = new URLSearchParams();
            formBody.append('user_id', profile?.user_id);
            formBody.append('address_id', item.id);

            const response = await fetch('https://bringesse.com:3003/api/setdefaultaddress', {
                method: 'POST',
                headers: {
                    Authorization: accessToken,
                    user_id: profile?.user_id,
                    type: 'user',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody.toString(),
            });

            const result = await response.json();
            console.log('Set Default Response:', result);
            if (result.status === 'true') {
                navigation.goBack();
                fetchProfileData();
                fetchAddresses(); // Refresh list
                ToastAndroid.show('Default address updated successfully.', ToastAndroid.SHORT);
            } else {
                Alert.alert('Failed', result.message || 'Could not set default address.');
            }
        } catch (error) {
            console.error('Error setting default address:', error);
            Alert.alert('Error', 'Something went wrong while setting default address.');
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


    // Edit Address
    const handleEdit = (item) => {
        setShowOptions(false);
        navigation.navigate('AddAddress', {
            addressData: item,
            isEdit: true,
        });
    };

    // Delete Address
    const handleDelete = async (item) => {
        setShowOptions(false);
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const url = `https://bringesse.com:3003/api/deleteaddress/${item._id}/${profile?.user_id}`;
                            const formBody = new URLSearchParams();
                            formBody.append('user_id', profile?.user_id);
                            formBody.append('address_id', item._id);

                            const response = await fetch(url, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: accessToken,
                                    user_id: profile?.user_id,
                                    type: 'user',
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: formBody.toString(),
                            });

                            const result = await response.json();
                            console.log('Delete Response:', result);
                            if (result.status === 'true') {
                                ToastAndroid.show('Address deleted successfully.', ToastAndroid.SHORT);
                                // Alert.alert('Success', 'Address deleted successfully.');
                                fetchAddresses();
                            } else {
                                Alert.alert('Failed', result.message || 'Could not delete address.');
                            }
                        } catch (error) {
                            console.error('Error deleting address:', error);
                            Alert.alert('Error', 'Something went wrong while deleting address.');
                        }
                        finally {
                            fetchProfileData()
                        }
                    },

                },
            ]
        );
    };


    // Render Each Address Item
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.addressCard,
                {
                    backgroundColor: item.is_default ==
                        'true' ? '#ccc' : "#fff"
                }
            ]}
            onPress={() => handleSetDefaultAddress(item)} // ✅ Confirm before setting default
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name={item.is_default ==
                    'true' ? "check-circle" : "home-outline"} size={22} color="#000" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.addressTitle}>{item.address_type || 'Address'}</Text>
                    <Text style={styles.addressText} numberOfLines={3}>
                        {item.location || 'No address text'}
                    </Text>
                    {item.phone_number ? (
                        <Text style={styles.addressTitle}>Phone: {item.phone_number}</Text>
                    ) : null}
                </View>
            </View>
            <View style={styles.addressActions}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                        setSelectedAddress(item);
                        setShowOptions(true);
                    }}
                >
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="#333" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );


    return (
        <View style={[styles.container, {
            backgroundColor: COLORS[useTheme().theme].background
        }]}>
            <HeaderBar title="Select Location" showBackArrow={true} />
            <TouchableOpacity
                style={styles.optionCard}
                onPress={() => navigation.navigate('AddAddress')}
            >

                <MaterialCommunityIcons name="plus" size={20} color="#e74c3c" />
                <Text style={[styles.optionTitle, { marginLeft: 10 }]}>Add Address</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#e74c3c" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item._id || index.toString()}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    ListEmptyComponent={() => (
                        <><Text style={[poppins.regular.h4, {
                            color: COLORS[useTheme().theme].primary, textAlign: 'center', marginTop: wp(10)
                        }]}>No Address Found</Text></>
                    )}
                />
            )}

            {/* Bottom Sheet Modal */}
            <Modal
                transparent
                animationType="slide"
                visible={showOptions}
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setShowOptions(false)}
                >
                    <View style={styles.bottomSheet}>
                        <TouchableOpacity
                            style={styles.sheetButton}
                            onPress={() => handleEdit(selectedAddress)}
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={22} color="#000" />
                            <Text style={styles.sheetText}>Edit Address</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.sheetButton, { borderTopWidth: 0.5, borderColor: '#ddd' }]}
                            onPress={() => handleDelete(selectedAddress)}
                        >
                            <MaterialCommunityIcons name="delete-outline" size={22} color="red" />
                            <Text style={[styles.sheetText, { color: 'red' }]}>Delete Address</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 6 },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: { flex: 1, marginLeft: 6, color: '#333' },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: wp(2),
        paddingHorizontal: 12,
        borderRadius: wp(2),
        marginBottom: 10,
        width: wp(40), alignSelf: "flex-end", borderWidth: wp(0.5), borderColor: "#e74c3c"
    },
    optionTitle: { fontSize: 15, fontWeight: '500', color: '#e74c3c' },
    addressCard: {
        // backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    defaultAddress: {
        borderColor: '#e74c3c',
        borderWidth: 1,
    },
    addressTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
    addressText: { color: '#000', fontSize: 13 },
    phoneText: { color: '#000', fontSize: 12, marginTop: 2 },
    addressActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    iconButton: {
        backgroundColor: '#f1f1f1',
        borderRadius: 20,
        padding: 6,
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingVertical: 10,
    },
    sheetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    sheetText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#000',
    },
});
