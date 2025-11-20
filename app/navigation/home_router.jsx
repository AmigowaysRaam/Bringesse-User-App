import React, {  } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from './bottom-tab/BottomTabBar';
import MoreScreen from '../screens/tabs/menuScreen';
import HomeScreen from '../screens/tabs/home-screen';
import { useTranslation } from 'react-i18next';
import Notification from '../screens/Notification';
import OrdersScreen from '../screens/OrdersScreen';
import CartList from '../screens/mycart';
const Tab = createBottomTabNavigator();
function HomeTabRouter() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Tab.Screen name={t('Home')} component={HomeScreen} />
        <>
          <Tab.Screen
            name={t('T-Social')}
            component={OrdersScreen}
            // initialParams={{ currentUserId: profile?.id }}
          />
          <Tab.Screen name={t('Booking')} component={CartList} />
        </>
      <Tab.Screen name={t('Notification')} component={Notification} />
      <Tab.Screen name={t('More')} component={MoreScreen} />
    </Tab.Navigator>
  );
}
export default HomeTabRouter;
// RevenueScreen