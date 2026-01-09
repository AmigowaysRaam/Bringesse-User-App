/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { fetchData } from '../api/api';
import { useNavigation } from '@react-navigation/native';

const CheckCartItems = () => {
    const { theme } = useTheme();
    const profileDetails = useSelector(state => state.Auth.profileDetails);
    const accessToken = useSelector(state => state.Auth.accessToken);
    const navigation = useNavigation();
    const [cartCount, setCartCount] = useState(0);
    const slideAnim = useState(new Animated.Value(100))[0]; // starts off-screen
    useEffect(() => {
        // Copy text
        // const text = await ;
        let interval;
        const fetchCart = async () => {
            if (
                !accessToken ||
                !profileDetails?.user_id ||
                !profileDetails?.primary_address?.lat
            )
                return;
            try {
                const data = await fetchData(
                    'cart/get',
                    'POST',
                    {
                        user_id: profileDetails.user_id,
                        lat: profileDetails.primary_address.lat,
                        lon: profileDetails.primary_address.lon,
                    },
                    {
                        Authorization: accessToken,
                        user_id: profileDetails.user_id,
                        type: 'user',
                    }
                );
                if (data?.status === true) {
                    const count = data?.data?.items?.length || 0;
                    if (count !== cartCount) {
                        setCartCount(count);
                        Animated.timing(slideAnim, {
                            toValue: count > 0 ? 0 : 120, // slide up when items exist, slide down when 0
                            duration: 300,
                            useNativeDriver: true,
                        }).start();
                    }
                }
            } catch (error) {
                console.log('Cart error:', error);
            }
        };

        // Initial fetch
        fetchCart();
        // Poll every 3 seconds
        interval = setInterval(fetchCart, 3000);
        return () => clearInterval(interval);
    }, [profileDetails, accessToken, cartCount]);

    // Don't render if cart is empty
    if (cartCount === 0) return null;

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    transform: [{ translateY: slideAnim }],
                    backgroundColor: COLORS[theme].accent,
                },
            ]}
        >
            <View style={styles.left}>
                <Text style={[poppins.medium.h7, { color: COLORS[theme].white }]}>
                    {cartCount} item{cartCount > 1 ? 's' : ''} in cart
                </Text>
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.right}
                onPress={() => navigation?.navigate('Booking')}
            >
                <Text style={[poppins.medium.h7, { color: COLORS[theme].white }]}>
                    View Cart →
                </Text>

               
            </TouchableOpacity>
        </Animated.View>
    );
};
const styles = StyleSheet.create({
    toastContainer: {
        zIndex: 99, position: 'absolute', bottom: hp(1), left: wp(4), right: wp(4),
        paddingVertical: hp(1), paddingHorizontal: wp(5),
        borderRadius: wp(1), flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
        elevation: 10,
    }, left: {
        flex: 1,
    }, right: {
        paddingLeft: wp(3),
    },
});

export default CheckCartItems;
