import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash-screen';
import LoginScreen from '../screens/login-screen';
import HomeTabRouter from './home_router';
import GetStartedScreen from '../screens/GetStartedScreen';
import PersonalInfoScreen from '../screens/tabs/Edit-profile';
import EditProfile from '../screens/tabs/Edit-profile/editProfile';
import RegisterScreen from '../screens/tabs/Edit-profile/RegisterScreen';
import WalletHistory from '../screens/WalletHistory';
import SubscriptionList from '../screens/SubscriptionList';
import UpdateProfilePic from '../screens/UpdateProfilePic';
import ChangePassword from '../screens/tabs/Edit-profile/ChangePassword';
import TermsandCondtions from '../screens/TermsandCondtions';
import PrivacyandPolicy from '../screens/PrivacyandPolicy';
import TrackBookings from '../screens/TrackBookings';
import ProductListScreen from '../screens/tabs/productList';
import CategoryStore from '../screens/tabs/category/categorydetails';
import CartList from '../screens/mycart';
import SelectLocationScreen from '../screens/select_location';
import AddAddressScreen from '../screens/add_address';
import RevenueScreen from '../screens/RevenueScreen';

const Stack = createNativeStackNavigator();
const MyTheme = {
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(255, 45, 85)',
    background: 'rgb(0,0,0,0)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(244, 244, 244)',
    border: 'rgb(199, 199, 204)',
    notification: 'rgb(255, 69, 58)',
  },
};

function InitialRouter() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="SplashScreen">
        <Stack.Screen name="splashscreen" component={SplashScreen} />
        <Stack.Screen name="login-screen" component={LoginScreen} />
        <Stack.Screen name="home-screen" component={HomeTabRouter} screenOptions={{
          animationEnabled: false,  // Disable animations for all screens
        }} />
        <Stack.Screen name="GetStartedScreen" component={GetStartedScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="WalletHistory" component={WalletHistory} />
        <Stack.Screen name="UpdateProfilePic" component={UpdateProfilePic} />
        <Stack.Screen name="SubscriptionList" component={SubscriptionList} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="TermsAndCondtions" component={TermsandCondtions} />
        <Stack.Screen name="PrivacyandPolicy" component={PrivacyandPolicy} />
        <Stack.Screen name="TrackBookings" component={TrackBookings} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen name="CategoryDetails" component={CategoryStore} />
        <Stack.Screen name="Mycart" component={CartList} />
        <Stack.Screen name="SelectLocation" component={SelectLocationScreen} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />
        <Stack.Screen name="RevenueScreen" component={RevenueScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default InitialRouter;
