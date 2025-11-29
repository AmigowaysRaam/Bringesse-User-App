import React, { useEffect } from "react";
import { View, Button, Alert, Text } from "react-native";
import HyperSDK from "hyper-sdk-react";
import HeaderBar from "../../../components/header";

export default function PaymentCheck({ route }) {
    const { payload } = route.params
    useEffect(() => {
        console.log("Route params:", route.params);
        payNow();
    }, []);
    const payNow = () => {
        HyperSDK.process(JSON.stringify(payload));
    };
    return (
        <View style={{ flex: 1 }}>
            {/* <HeaderBar title={'test'} />
            <Button title="Pay Now" onPress={payNow} /> */}
        </View>
    );
}