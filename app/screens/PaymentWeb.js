import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { wp } from '../resources/dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function PaymentWebView({ url, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(true);
    const [showBack, setShowBack] = useState(false);

    // 🔥 Universal Juspay Payment Page detection
    const isOnPaymentPage = (url) => {
        return (
            // url.includes("/payment-page/order/") &&
            url.includes("page=PaymentPage") ||
            url.includes('page=Accordion')&&
            !url.includes("NetBanking") &&
            !url.includes("Card") &&
            !url.includes("UPI") &&
            !url.includes("Wallet") && 
            !url.includes("page=NetBanking")
        );
    };
    

    const handleNavigationStateChange = (navState) => {
        const currentUrl = navState.url;
        console.log("Navigated:", currentUrl);

        // 🔥 Entered Juspay Payment Page → show exit icon
        if (isOnPaymentPage(currentUrl)) {
            setShowBack(true);
        }
        else{
            setShowBack(false);

        }

        // 🔥 Detect Exit URL
        if (currentUrl.toLowerCase().includes("exit")) {
            Alert.alert(
                "Cancel Payment",
                "Do you want to exit the payment?",
                [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: () => onCancel && onCancel() }
                ]
            );
        }
        // 🔥 Detect payment callback
        if (currentUrl.includes("callback")) {
            const status = (currentUrl.includes("SUCCESS") || currentUrl.includes("CHARGED"))
                ? "SUCCESS"
                : currentUrl.includes("FAILED")
                ? "FAILED"
                : null;
                console.log(currentUrl,"currentUrl")
            if (status === "SUCCESS") {
                onSuccess && onSuccess();
            } else {
                onCancel && onCancel();
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            
            {/* 🔵 Loading Spinner */}
            {loading && (
                <ActivityIndicator
                    size="large"
                    color="#00BFA6"
                    style={styles.loader}
                />
            )}

            {/* 🔥 BACK / CLOSE ICON */}
            {showBack && (
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => {
                        Alert.alert(
                            "Exit Payment",
                            "Are you sure you want to exit?",
                            [
                                { text: "No", style: "cancel" },
                                { text: "Yes", onPress: () => onCancel && onCancel() }
                            ]
                        );
                    }}
                >
                    {/* <Text style={styles.closeIcon}>×</Text> */}
            <MaterialIcons name="chevron-left" size={wp(7)} color={'#fff'} />
                </TouchableOpacity>
            )}

            {/* 🌐 WEBVIEW */}
            <WebView
                source={{ uri: url }}
                style={{ flex: 1 }}
                onLoadEnd={() => setLoading(false)}
                onNavigationStateChange={handleNavigationStateChange}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -25,
        marginTop: -25,
        zIndex: 100,
    },
    closeBtn: {
        position: "absolute",
        top: 6,
        left: 0,
        backgroundColor: "transparent",
        padding: 10,
        borderRadius: 30,
        zIndex: 999,  // stays above WebView
    },
    closeIcon: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
    }
});
