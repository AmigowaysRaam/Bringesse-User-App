import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { IMAGE_ASSETS } from '../resources/images';
import { fetchData } from '../api/api';
import { ActivityIndicator } from 'react-native-paper';

const UserToggleStatus = ({ address, loading }) => {
    const [isOnline, setIsOnline] = useState(null);
    const { theme } = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const profileDetails = useSelector(state => state.Auth.profileDetails);
    const profile = useSelector(state => state.Auth.profile);
    const accessToken = useSelector(state => state.Auth.accessToken);

    useEffect(() => {
        console?.log(JSON.stringify(profileDetails, 2, null))
        // Alert.alert(accessToken)
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        if (!accessToken || !profile?.user_id) return;
        try {
            const data = await fetchData('userprofile/' + profile?.user_id, 'GET', null, {
                Authorization: `${accessToken}`,
                user_id: profile?.user_id,
                type: "user"
            });
            // setIsOnline(data?.live_status ? true : false);
            dispatch({
                type: 'PROFILE_DETAILS',
                payload: data,
            });
        } catch (error) {
            console.error('Profile API Error:', error);
        }
    };
    return (
        <View style={[styles.card, { backgroundColor: COLORS[theme].accent }]}>
            <View style={styles.userInfo}>
                <Image
                    source={{ uri: profileDetails?.user_image }} style={styles.profileImage}
                // resizeMode="cover"
                />
                <View style={styles.userTextContainer}>
                    <Text style={[poppins.semi_bold.h5, { color: COLORS[theme].white, textTransform: "capitalize" }]}>
                        {profileDetails?.full_name || profileDetails?.phone_no}
                    </Text>
                    <Text numberOfLines={1} style={[poppins.regular.h8, { color: COLORS[theme].white }]}>
                        {address?.replace(/^[A-Za-z0-9\+]+,?\s*/, '').trim() || ''}
                    </Text>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: wp(1),
        paddingHorizontal: wp(4),
        marginVertical: hp(1),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(5),
        marginRight: wp(3),
    },
    userTextContainer: {
        justifyContent: 'center',
    },
});

export default UserToggleStatus;
