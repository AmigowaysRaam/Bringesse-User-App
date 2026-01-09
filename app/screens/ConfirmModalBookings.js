import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const ConfirmModalBookings = ({ formValues, confirmModal, onEdit, onBookNow, driverInfo }) => {
    const [isOnline, setIsOnline] = useState(null);
    const { theme } = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const profileDetails = useSelector(state => state.Auth.profileDetails);
    useEffect(() => {
        console?.log(formValues, "formValues");
    }, [formValues]);

    // Function to display location (Lat, Long) or the actual address
    const renderLocation = (location) => {
        return location?.location || `Lat: ${location?.lat}, Lon: ${location?.lon}`;
    };
    // Early return if modal is not visible
    if (!confirmModal) {
        return null;
    }
    return (
        <View style={[styles.card, { backgroundColor: COLORS[theme].background, borderColor: COLORS[theme].accent }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: wp(4), borderBottomWidth: wp(0.5), borderColor: "#ccc", paddingVertical: wp(1) }}>
                <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].primary, textTransform: "capitalize", }]}>
                    {t('Booking Summary')}
                </Text>
                <TouchableOpacity onPress={() => onEdit('vehicleCategory')} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="pencil" size={wp(7)} color={COLORS[theme].primary} />
                </TouchableOpacity>
            </View>
            {/* User Info Section */}
            <View style={styles.userInfo}>
                <View style={styles.userTextContainer}>
                    <Text style={[poppins.semi_bold.h7, { color: COLORS[theme].textPrimary, textTransform: "capitalize" }]}>
                        {profileDetails?.full_name || 'User Name'}
                    </Text>
                </View>
            </View>
            <ScrollView style={styles.bookingDetails}>
                {/* Vehicle Category */}
                <View style={styles.detailRow}>
                    <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
                        {t('Vehicle Category')}
                    </Text>
                    <View style={styles.valueContainer}>
                        <Text style={[styles.value, { color: COLORS[theme].textPrimary }]}>
                            {formValues.vehicleCategory || 'Not selected'}
                        </Text>

                    </View>
                </View>
                {/* Vehicle Type */}
                <View style={styles.detailRow}>
                    <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
                        {t('Vehicle Type')}
                    </Text>
                    <View style={styles.valueContainer}>
                        <Text style={[styles.value, { color: COLORS[theme].textPrimary }]}>
                            {formValues.vehicleType || 'Not selected'}
                        </Text>

                    </View>
                </View>

                {/* Pickup Location */}
                <View style={styles.lcoadetailRow}>
                    <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
                        {t('Pickup Location')}
                    </Text>
                    <View style={[styles.valueContainer, {
                        marginTop: wp(2)
                    }]}>
                        <Text style={[styles.value, { color: COLORS[theme].textPrimary, lineHeight: wp(6) }]}>
                            {renderLocation(formValues.pickupLocation)}
                        </Text>
                    </View>
                </View>
                {/* Drop Location */}
                <View style={styles.lcoadetailRow}>
                    <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
                        {t('Drop Location')}
                    </Text>
                    <View style={[styles.valueContainer, {
                        marginTop: wp(2)
                    }]}>
                        <Text style={[styles.value, { color: COLORS[theme].textPrimary, lineHeight: wp(6) }]}>
                            {renderLocation(formValues.dropLocation)}
                        </Text>
                    </View>
                </View>
                {/* <View style={styles.detailRow}>
                    <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
                        {t('Price')}
                    </Text>
                    <View style={styles.valueContainer}>
                        <Text style={[styles.value, { color: COLORS[theme].textPrimary }]}>
                            {driverInfo?.deliveryCharge}
                        </Text>

                    </View>
                </View> */}
                <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].accent, textTransform: "capitalize", alignSelf: "center", lineHeight: wp(6) }]}>
                    {driverInfo?.message}
                </Text>

            </ScrollView>
            {/* Book Now Button */}
            <TouchableOpacity onPress={() => onEdit('vehicleCategory')} style={[styles.bookNowButton, { borderColor: COLORS[theme].textPrimary, borderWidth: wp(0.5) }]} activeOpacity={0.7}>
                <Text style={[styles.bookNowText, { color: COLORS[theme].textPrimary }]}>
                    {t('Close')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onBookNow}
                style={{
                    backgroundColor: COLORS[theme].accent,
                    paddingVertical: wp(3),
                    paddingHorizontal: 25,
                    borderRadius: wp(2),
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    elevation: 5, // shadow for Android
                    shadowColor: '#000', // shadow for iOS
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    marginVertical: 10,
                }}
            >
                <Text
                    style={[poppins.semi_bold.h6, {
                        color: COLORS[theme].white,
                        // fontSize: 16,
                        // fontFamily: poppins.medium,
                    }]}
                >
                    {t('Book Now')}
                </Text>
                {driverInfo?.deliveryCharge && (
                    <Text
                        style={[poppins.semi_bold.h6, {
                            color: COLORS[theme].accent,
                            // fontSize: 16,
                            // fontFamily: poppins.medium,
                            fontWeight: '600', lineHeight: hp(4),
                            backgroundColor: COLORS[theme].white, paddingHorizontal: wp(5), borderRadius: wp(2)
                        }]}
                    >
                        {driverInfo?.deliveryCharge}
                    </Text>
                )}
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        paddingVertical: wp(4),
        paddingHorizontal: wp(4),
        marginVertical: hp(2),
        borderWidth: wp(0.5),
        borderRadius: 5,
        width: wp(98), height: hp(68), 
        // position: "relative", top: hp(5), zIndex: 9999
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center', marginBottom: hp(2),
    }, profileImage: {
        width: wp(14), height: wp(14), borderRadius: wp(7),
        marginRight: wp(3),
    }, userTextContainer: {
        justifyContent: 'center',
    }, bookingDetails: {
        marginTop: hp(1),
    },
    detailRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: hp(2),
    }, lcoadetailRow: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    }, label: {
        fontSize: wp(3.5), fontWeight: '500'
    },
    valueContainer: {
        flexDirection: 'row', alignItems: 'center',
    }, value: {
        fontSize: wp(3.5), fontWeight: '800',
    }, infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', marginTop: hp(2),
    }, bookNowButton: {
        paddingVertical: wp(3),
        marginVertical: hp(1), borderRadius: wp(1),
        alignItems: 'center',
    }, bookNowText: {
        fontSize: wp(4.5),
        fontWeight: '600',
    },
});

export default ConfirmModalBookings;
