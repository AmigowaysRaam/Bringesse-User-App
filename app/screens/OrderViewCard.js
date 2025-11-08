import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for the call icon
const OrderViewCard = ({
    driverImage, driverPhone, driverName,
    bookingStatus, vehicleNumber, otp, completeOtp
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    // Function to handle phone call
    const handleCall = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    if (!driverName || !driverPhone) {
        return null; // Don't render the card if driver info is not available
    }
    return (
        <View style={[styles.card, { backgroundColor: COLORS[theme].accent }]}>
            {/* Driver Info */}
            {driverName ? (
                <View style={styles.userInfo}>
                    <Image source={{ uri: driverImage }} style={[styles.profileImage, {
                        backgroundColor: "#ccc"
                    }]} />
                    <View style={styles.userTextContainer}>
                        <Text
                            style={[
                                poppins.semi_bold.h9,
                                { color: COLORS[theme].white, textTransform: 'capitalize' },
                            ]}
                        >
                            {driverName || 'N/A'}
                        </Text>
                        <View style={styles.phoneContainer}>
                            <Text
                                style={[
                                    poppins.regular.h7,
                                    { color: COLORS[theme].white, textTransform: 'capitalize' },
                                ]}
                            >
                                {driverPhone ? `Phone: ${driverPhone}` : 'Phone: N/A'}
                            </Text>
                            {driverPhone && (
                                <TouchableOpacity onPress={() => handleCall(driverPhone)} style={{ alignSelf: "flex-end", marginHorizontal: hp(8) }}>
                                    <Ionicons
                                        name="call"
                                        size={wp(10)}
                                        color={COLORS[theme].white}
                                        style={styles.callIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        {bookingStatus && (
                            <Text
                                style={[
                                    poppins.semi_bold.h7,
                                    { color: COLORS[theme].white, textTransform: 'capitalize' },
                                ]}
                            >
                                Status: {bookingStatus || 'N/A'}
                            </Text>
                        )}
                        {vehicleNumber && (
                            <Text
                                style={[
                                    poppins.regular.h8,
                                    { color: COLORS[theme].black, textTransform: 'capitalize', backgroundColor: "yellow", width: wp(23), textAlign: "center", lineHeight: wp(6), borderWidth: wp(0.2) },
                                ]}
                            >
                                {vehicleNumber || 'N/A'}
                            </Text>
                        )}
                        {otp && (
                            <Text
                                style={[
                                    poppins.semi_bold.h6,
                                    { color: COLORS[theme].white, textTransform: 'capitalize' },
                                ]}
                            >
                                OTP Number: {bookingStatus == 'accepted' ? otp : completeOtp}
                            </Text>
                        )}
                    </View>
                </View>
            ) : (
                <Text
                    style={[
                        poppins.semi_bold.h7,
                        { color: COLORS[theme].white, textTransform: 'capitalize' },
                    ]}
                >
                    {'Searching for Driver'}
                </Text>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: wp(4),
        paddingHorizontal: wp(4), marginVertical: hp(1), width: wp(95),
        alignSelf: 'center', borderRadius: wp(2),
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', },
    profileImage: {
        width: wp(14),
        height: wp(14), borderRadius: wp(7),
        marginRight: wp(3),
    },
    userTextContainer: {
        justifyContent: 'center',
    },
    phoneContainer: {
        flexDirection: 'row', alignItems: 'center',
    }, callIcon: {
        marginLeft: wp(2),
    },
});
export default OrderViewCard;
