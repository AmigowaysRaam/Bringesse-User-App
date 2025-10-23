import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import UseProfileHook from './profile-hooks';
import { useAuthHoc } from '../config/config';


function usePushNotificationHooks() {

    const { profile } = UseProfileHook();

    const {
        actions: {
            UPDATE_FCM_TOKEN_CALL,
        },
    } = useAuthHoc();

    // Effect to handle token refresh
    useEffect(() => {
        updateToken();
        // Listen to whether the token changes
        return messaging().onTokenRefresh(token => {
            updateTokenInApi(token); // Update token in AI
        });
    }, []);


    // Check for Android permission
    async function checkForAndroidPermission() {

        try {
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
        } catch (error) {
        }
    }

    // Check for iOS permission
    async function checkForIosPermission() {
        await messaging().requestPermission();
    }

    // Update device token
    function updateToken() {

        if (Platform.OS === 'ios') {
            checkForIosPermission();
        } else {
            checkForAndroidPermission();
        }

        messaging()
            .getToken()
            .then(token => {
                updateTokenInApi(token); // Update token in AI
            });
    }

    // Function to update token in API
    function updateTokenInApi(token) {
        console.log('push_token', token);
        UPDATE_FCM_TOKEN_CALL({
            request: {
                payload: { userid: profile?.id, fcmtoken: token },
            }, callback: {
                successCallback({ message, data }) {
                    console.log('fcm_updated', token);
                },
                errorCallback(message) {
                    console.log('fcm_update_err', message);
                },
            },
        });
    }

    return {
        updateToken,
    };
}

export default usePushNotificationHooks;
