import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
const UserProfileCard = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const profile = useSelector(state => state.Auth.profile);
    const profileDetails = useSelector(state => state.Auth.profileDetails);
    const navigation = useNavigation();
    const userName = `${profile?.full_name || profile?.phone_no}`;

    useEffect(() => {
        console.log(profileDetails?.user_image, "test")
    }, [])

    return (
        <View style={[
            styles.card,
            { backgroundColor: COLORS[theme].background, borderColor: '#ccc' }
        ]}>
            <TouchableOpacity
                onPress={() => navigation?.navigate('UpdateProfilePic')}
            >
                <Image
                    source={{ uri: profileDetails?.user_image }}
                    style={{ width: wp(20), height: wp(20), borderRadius: wp(10), borderWidth: wp(0.5), borderColor: COLORS[theme].primary, borderColor: COLORS[theme].accent }}
                />
                <MaterialCommunityIcon
                    name="pencil-circle"
                    size={wp(10)}
                    style={{ position: "absolute", marginBottom: wp(2), left: hp(7) }}
                    color={COLORS[theme].textPrimary}
                />
            </TouchableOpacity>
            <Text style={[
                poppins.semi_bold.h6,
                styles.text,
                { color: COLORS[theme].primary, textTransform: "capitalize" }
            ]}>
                {userName}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={{ borderColor: COLORS[theme].buttonBg, padding: wp(2), borderRadius: wp(1), borderWidth: wp(0.4), width: wp(35), alignItems: "center", height: wp(9) }}>
                <Text style={[poppins.regular.h7, { color: COLORS[theme].buttonBg, lineHeight: wp(4) }]}>
                    {t('edit_profile')}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(6),
        paddingHorizontal: wp(4),
        borderRadius: wp(2),
        borderBottomWidth: wp(0.5),
        margin: wp(4),
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    text: {
        textAlign: 'center',
        marginVertical: wp(1),
    },
});

export default UserProfileCard;
