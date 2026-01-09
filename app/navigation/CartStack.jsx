import React from "react";
import CartList from "../screens/mycart";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();

const CartStack = () => (
    <Stack.Navigator
    screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
        animationEnabled: false,
      }}>
        <Stack.Screen name="CartScreen" component={CartList} />
    </Stack.Navigator>
);
export default CartStack
