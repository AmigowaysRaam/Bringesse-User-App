/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
    View, StyleSheet, Modal, Text, TouchableOpacity,
    ActivityIndicator, Platform, KeyboardAvoidingView,
    Alert,
} from 'react-native'; import { TextInput } from 'react-native-paper';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from '../api/api';
import FlashMessage, { showMessage } from 'react-native-flash-message';
const CheckUserName = () => {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const profileDetails = useSelector(state => state.Auth.profileDetails);
    const accessToken = useSelector(state => state.Auth.accessToken);
    const [modalVisible, setModalVisible] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [loading, setLoading] = useState(false);
    /** Load name & open modal if empty */
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!accessToken || !profileDetails?.user_id) return;
            try {
                const data = await fetchData(`userprofile/${profileDetails.user_id}`, "GET", null, {
                    Authorization: accessToken,
                    user_id: profileDetails.user_id,
                    type: "user",
                });
                // Alert.alert(data?.status)
                if (data?.status == 'true') {
                    if (!profileDetails?.full_name || profileDetails?.full_name === '') {
                        setModalVisible(true);
                    } else {
                        setModalVisible(false);
                    }
                }
            } catch (e) {
                console.log("Profile error:", e);
            }
        };
        fetchProfileData();
    }, [profileDetails]);

    const updateFullName = async () => {
        if (!nameInput.trim()) {
            showMessage({ message: 'Name is required', type: 'danger' });
            return;
        }
        setLoading(true);
        try {
            const data = await fetchData(
                `updateprofile`, 'POST', {
                full_name: nameInput, user_id: profileDetails?.user_id,
            },
                {
                    Authorization: `${accessToken}`,
                    user_id: profileDetails?.user_id,
                    type: "user"
                }
            );
            if (data?.status === 'true') {
                dispatch({
                    type: 'UPDATE_PROFILE',
                    payload: data,
                });
                showMessage({ message: data?.message, type: 'success' });
                setModalVisible(false); // Auto close
            } else {
                showMessage({ message: data?.message || 'Failed to update', type: 'danger' });
            }
        } catch (err) {
            console.error('Error updating name:', err);
            showMessage({ message: 'Something went wrong', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <FlashMessage position="top" />
            <Modal visible={modalVisible} animationType="fade" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContainer, { backgroundColor: COLORS[theme].cardBackground }]}>
                        <Text
                            style={[
                                poppins.medium.h7,
                                { color: COLORS[theme].primary, marginBottom: hp(2) },
                            ]}
                        >
                            Enter Your Name
                        </Text>
                        <TextInput
                            mode="outlined"
                            value={nameInput}
                            onChangeText={setNameInput}
                            placeholder="Full Name"
                            style={styles.input}
                            textColor={COLORS[theme].primary}
                            placeholderTextColor={COLORS[theme].primary}
                            outlineColor={COLORS[theme].primary}
                            activeOutlineColor={COLORS[theme].primary}
                        />
                        <TouchableOpacity
                            onPress={updateFullName}
                            activeOpacity={0.8}
                            style={[styles.saveButton, { backgroundColor: COLORS[theme].accent }]}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={COLORS[theme].white} />
                            ) : (
                                <Text style={[poppins.regular.h4, { color: COLORS[theme].white }]}>
                                    Save
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    modalContainer: {
        width: wp(85), padding: wp(5),
        borderRadius: wp(3), borderWidth: wp(1), borderColor: "#CCC"
    },
    input: {
        backgroundColor: 'transparent',
        marginBottom: hp(2), height: hp(6)
    }, saveButton: {
        paddingVertical: hp(0.8),
        borderRadius: wp(2), alignItems: 'center',
    },
});
export default CheckUserName;