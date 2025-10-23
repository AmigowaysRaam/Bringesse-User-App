// /* eslint-disable react-native/no-inline-styles */
// /* eslint-disable react/no-unstable-nested-components */
// import * as React from 'react';
// import { View, Text, TouchableOpacity, Alert } from 'react-native';
// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
// } from '@react-navigation/drawer';
// import HomeScreen from '../screens/tabs/home-screen';
// import { hp, wp } from '../resources/dimensions';
// import { Avatar, DefaultTheme, Divider, Icon, List } from 'react-native-paper';
// import IonicIcon from 'react-native-vector-icons/Ionicons';
// import { poppins } from '../resources/fonts';
// import { ICON_ASSETS } from '../resources/images';
// import { DrawerActions, useNavigation } from '@react-navigation/native';
// import EditProfileScreen from '../screens/tabs/Edit-profile';
// import TripsListScreen from '../screens/trips';
// import EventsListScreen from '../screens/events';
// import MyEventsListScreen from '../screens/events/Myevents';
// import AppointmentScreen from '../screens/tabs/appointments';
// import CoachList from '../screens/coach-list/coach-list';
// import CoachDetails from '../screens/coach-list/coach-details';
// import ContactUsScreen from '../screens/contact-us/ContactUsScreen';
// import AboutUsScreen from '../screens/about-us/AboutUs';
// import TermsAndConditions from '../screens/terms-and-conditions/TermsAndConditions';
// import PrivacyPolicyScreen from '../screens/privacypolicy/privacyPolicyScreen';
// import Accountdeletion from '../screens/AccountDeletion/Accountdeletion';
// import PrivacyCenter from '../screens/privacycenter/privacyCenterScreen';
// import RefundPolicyScreen from '../screens/refund-policy/RefundPolicyScreen';
// import FaqScreen from '../screens/faq/FaqScreen';
// import MyOrdersScreen from '../screens/my-orders/MyOrdersScreen';
// import MySubscriptions from '../screens/my-subscriptions/MySubscriptions';
// import MyAppointmentsScreen from '../screens/my-appoinments/MyAppointments';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getUserData } from '../utils/utils';
// import ShopListScreen from '../screens/shopList/shop-list';
// import ProductDetailsScreen from '../screens/product-details/ProductDetails';
// import EventDetails from '../screens/eventdetails';
// import ChangePasswordScreen from '../screens/change-password/ChangePasswordScreen';
// import CartScreen from '../screens/cartScreen';
// import MyAddresses from '../screens/my-addressess/My-addresses';
// import OurClasses from '../screens/our-classes/OurClasses';
// import CreateStoryScreen from '../screens/create_story';
// import { useAuthHoc } from '../config/config';
// import BookingConfirmation from '../screens/Bookig-Confirmation/BookingConfirmation';
// import { COLORS } from '../resources/colors';
// import ToggleTheme from '../components/ToggleTheme';
// import { useTheme } from '../context/ThemeContext';
// import TripsViewImages from '../screens/Trips-ViewImages/TripsViewImages';

// function Article() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Article Screen</Text>
//     </View>
//   );
// }

// const MENUITEMS = {
//   MY_ACCOUNT: [
//     {
//       icon: <ICON_ASSETS.ShoppingCartIcon height={wp(7)} width={wp(7)} />,
//       label: 'My Orders',
//       navigation: 'MyOrdersScreen',
//     },
//     {
//       icon: <ICON_ASSETS.MySubScriptionIcon height={wp(7)} width={wp(7)} />,
//       label: 'My Subscriptions',
//       navigation: 'MySubscriptions',
//     },
//     {
//       icon: <ICON_ASSETS.MyAppointmentsIcon height={wp(7)} width={wp(7)} />,
//       label: 'My Appointments',
//       navigation: 'MyAppointments',
//     },
//     {
//       icon: <ICON_ASSETS.MyEventsIcon height={wp(7)} width={wp(7)} />,
//       label: 'My Events',
//       navigation: 'MyEventsListScreen',
//     },
//     {
//       icon: <ICON_ASSETS.MyAddressIcon height={wp(7)} width={wp(7)} />,
//       label: 'My Addresses',
//       navigation: 'MyAddresses',
//     },
//     {
//       icon: <ICON_ASSETS.MyTripsIcon height={wp(7)} width={wp(7)} />,
//       label: 'My Trips',
//       navigation: 'TripsList',
//     },
//     {
//       icon: <ICON_ASSETS.EditProfileIcon height={wp(7)} width={wp(7)} />,
//       label: 'Edit Profile',
//       navigation: 'Edit-Profile',
//     },
//     {
//       icon: <ICON_ASSETS.ChangePasswordIcon height={wp(7)} width={wp(7)} />,
//       label: 'Change Password',
//       navigation: 'ChangePasswordScreen',
//     },
//   ],
//   OTHERS: [
//     {
//       icon: <ICON_ASSETS.OurClassIcon height={wp(7)} width={wp(7)} />,
//       label: 'Our Classes',
//       navigation: 'OurClasses',
//     },
//     {
//       icon: <ICON_ASSETS.MyAppointmentsIcon height={wp(7)} width={wp(7)} />,
//       label: 'Book Appointment',
//       navigation: 'My-Appointments',
//     },
//     {
//       icon: <ICON_ASSETS.ShoppingCartIcon height={wp(7)} width={wp(7)} />,
//       label: 'Shop',
//       navigation: 'ShoppingList',
//     },
//     {
//       icon: <ICON_ASSETS.TripsIcon height={wp(7)} width={wp(7)} />,
//       label: 'Trips',
//       navigation: 'TripsList',
//     },
//     {
//       icon: <ICON_ASSETS.MyEventsIcon height={wp(7)} width={wp(7)} />,
//       label: 'Events',
//       navigation: 'EventsList',
//     },
//     {
//       icon: <ICON_ASSETS.CoachIcon height={wp(7)} width={wp(7)} />,
//       label: 'Coachs',
//       navigation: 'CoachList',
//     },
//     {
//       icon: <ICON_ASSETS.ContactUsIcon height={wp(7)} width={wp(7)} />,
//       label: 'Contact Us',
//       navigation: 'ContactUs',
//     },
//     {
//       icon: <ICON_ASSETS.AboutUsIcon height={wp(7)} width={wp(7)} />,
//       label: 'About Us',
//       navigation: 'AboutUsScreen',
//     },
//     {
//       icon: <ICON_ASSETS.TermsAndConditionsIcon height={wp(7)} width={wp(7)} />,
//       label: 'Terms & Condition',
//       navigation: 'TermsAndConditions',
//     },
//     {
//       icon: <ICON_ASSETS.PrivacyPolicyIcon height={wp(7)} width={wp(7)} />,
//       label: 'Privacy Policy',
//       navigation: 'PrivacyPolicyScreen',
//     },
//     {
//       icon: <ICON_ASSETS.RefundPolicyIcon height={wp(7)} width={wp(7)} />,
//       label: 'Refund Policy',
//       navigation: 'RefundPolicyScreen',
//     },
//     {
//       icon: <ICON_ASSETS.FaqIcon height={wp(7)} width={wp(7)} />,
//       label: 'FAQ',
//       navigation: 'FaqScreen',
//     },
//     {
//       icon: <ICON_ASSETS.Logout_icon height={wp(5)} width={wp(5)} />,
//       label: 'Logout',
//       navigation: 'logout',
//     },
//   ],
// };

// const ProfileHeader = ({ colorScheme }) => {

//   const navigation = useNavigation();

//   const [expanded, setExpanded] = React.useState(true);
//   const [userData, setUserData] = React.useState({});
//   const [subscriptionsData, setSubscriptionsData] = React.useState({});
//   const { t } = useTranslation();

//   const {
//     reducerConstants: { GET_USER_SUBSCRIPTION_API },
//     reducerName,
//     actions: { GET_USER_SUBSCRIPTION_API_CALL },
//   } = useAuthHoc();

//   React.useEffect(() => {
//     loadUserData();
//     getUserSubscriptionData();
//   }, []);

//   function getUserSubscriptionData() {
//     GET_USER_SUBSCRIPTION_API_CALL({
//       task: {
//         clearData: true,
//       },
//       request: {
//         payload: {
//           userid: userData.id,
//           locale: 'en',
//         },
//       },
//       callback: {
//         successCallback({ message, data }) {
//           if (data && data?.data) {
//             setSubscriptionsData(data.data.data[0]);
//           }
//         },
//         errorCallback(message) { },
//       },
//     });
//   }

//   async function loadUserData() {

//     const userDataString = await getUserData();
//     const obj = JSON.parse(userDataString);
//     setUserData(obj.data.user_data);

//   }

//   const theme = {
//     ...DefaultTheme,
//     // Specify custom property
//     myOwnProperty: true,
//     // Specify custom property in nested object
//     colors: {
//       ...DefaultTheme.colors,
//     },
//   };

//   return (
//     <View>
//       <List.Accordion
//         theme={theme}
//         expanded
//         title={userData?.user_name}
//         titleStyle={[
//           poppins.medium.h6,
//           { color: COLORS[colorScheme].textPrimary },
//         ]}
//         style={{
//           backgroundColor: COLORS[colorScheme].background,
//           paddingStart: wp(2),
//         }}
//         id="3"
//         right={() => <></>}
//         left={props => (
//           <Avatar.Image size={wp(10)} source={{ uri: userData?.image_profile }} />
//         )}>
//         <View style={{ gap: wp(1), marginStart: wp(5), paddingBottom: wp(4) }}>
//           <View style={{ flexDirection: 'row' }}>
//             <Icon
//               source="account-box-outline"
//               color={COLORS[colorScheme].textPrimary}
//               size={wp(5)}
//             />
//             <Text
//               style={[
//                 poppins.regular.h9,
//                 {
//                   color: COLORS[colorScheme].textPrimary,
//                   textAlign: 'center',
//                   marginHorizontal: wp(2),
//                 },
//               ]}>
//               {t('member_id')}: #{userData?.id}
//             </Text>
//           </View>

//           <View style={{ flexDirection: 'row' }}>
//             <Icon
//               source="email-outline"
//               color={COLORS[colorScheme].textPrimary}
//               size={wp(5)}
//             />
//             <Text
//               style={[
//                 poppins.regular.h9,
//                 {
//                   color: COLORS[colorScheme].textPrimary,
//                   textAlign: 'center',
//                   marginHorizontal: wp(2),
//                 },
//               ]}>
//               {userData?.email}
//             </Text>
//           </View>

//           <View style={{ flexDirection: 'row' }}>
//             <Icon
//               source="star-outline"
//               color={COLORS[colorScheme].textPrimary}
//               size={wp(5)}
//             />
//             <Text
//               style={[
//                 poppins.regular.h9,
//                 {
//                   color: COLORS[colorScheme].textPrimary,
//                   textAlign: 'center',
//                   marginHorizontal: wp(2),
//                   marginTop: wp(0.5),
//                 },
//               ]}>
//               points: 5 xc
//             </Text>
//           </View>
//           <View style={{ flexDirection: 'row' }}>
//             <Icon
//               source="crown-outline"
//               color={COLORS[colorScheme].textPrimary}
//               size={wp(5)}
//             />
//             {subscriptionsData?.['Plan name'] ? (
//               <Text
//                 style={[
//                   poppins.regular.h9,
//                   {
//                     color: COLORS[colorScheme].textPrimary,
//                     textAlign: 'center',
//                     marginTop: wp(0.5),
//                     marginHorizontal: wp(1),
//                   },
//                 ]}>
//                 Subscription Name :{subscriptionsData?.['Plan name']}
//               </Text>
//             ) : (
//               <Text
//                 style={[
//                   poppins.regular.h9,
//                   {
//                     color: COLORS[colorScheme].textPrimary,
//                     textAlign: 'center',
//                     marginHorizontal: wp(1),
//                     marginTop: wp(0.5),
//                   },
//                 ]}>
//                 No Subscription
//               </Text>
//             )}
//           </View>
//         </View>
//       </List.Accordion>

//       <View
//         style={{
//           position: 'absolute',
//           top: hp(-5),
//           left: wp(3),
//           flexDirection: 'row',
//           alignItems: 'center',
//           width: wp(95),
//           justifyContent: 'space-between',
//         }}>
//         <TouchableOpacity
//           onPress={() => {
//             navigation.dispatch(DrawerActions.toggleDrawer());
//           }}>
//           <IonicIcon
//             name="arrow-back-circle-outline"
//             size={30}
//             color={COLORS[colorScheme].textPrimary}
//           />
//         </TouchableOpacity>

//         <ToggleTheme />
//       </View>
//     </View>
//   );
// };

// const MyAccount = ({ colorScheme }) => {
//   const navigation = useNavigation();
//   const theme = {
//     ...DefaultTheme,
//     // Specify custom property
//     myOwnProperty: true,
//     // Specify custom property in nested object
//     colors: {
//       ...DefaultTheme.colors,
//     },
//   };

//   function handleNavigate(params) {
//     navigation.navigate(params);
//   }

//   return (
//     <View>
//       <List.Accordion
//         theme={theme}
//         title="My Account"
//         titleStyle={[
//           poppins.medium.h6,
//           { color: COLORS[colorScheme].textPrimary },
//         ]}
//         style={{ backgroundColor: COLORS[colorScheme].background }}
//         id="3"
//         left={props => (
//           <View style={{ marginTop: wp(1) }}>
//             <Icon
//               color={COLORS[colorScheme].textPrimary}
//               source="account-box-outline"
//               size={wp(6)}
//             />
//           </View>
//         )}>
//         <View style={{ marginBottom: wp(1) }}>
//           {MENUITEMS.MY_ACCOUNT.map(menu => (
//             <TouchableOpacity
//               onPress={() => handleNavigate(menu.navigation)}
//               style={{
//                 flexDirection: 'row',
//                 paddingVertical: wp(2),
//                 alignItems: 'center',
//                 gap: wp(4),
//               }}>
//               {menu.icon}
//               <Text
//                 style={[
//                   poppins.medium.h7,
//                   {
//                     color: COLORS[colorScheme].textPrimary,
//                   },
//                 ]}>
//                 {menu.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </List.Accordion>
//     </View>
//   );
// };

// const OtherMenuItems = ({ colorScheme }) => {
//   const navigation = useNavigation();

//   function handleNavigate(params) {
//     if (params === 'logout') {
//       // Show confirmation alert for logout
//       Alert.alert(
//         'Confirm Logout',
//         'Are you sure you want to log out?',
//         [
//           {
//             text: 'Cancel',
//             onPress: () => console.log('Logout cancelled'),
//             style: 'cancel',
//           },
//           {
//             text: 'Yes, Logout',
//             onPress: () => {
//               AsyncStorage.clear();
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'login-screen' }],
//               });
//             },
//           },
//         ],
//         { cancelable: true },
//       );
//     } else {
//       navigation.navigate(params);
//     }
//   }

//   return (

//     <View style={{ marginBottom: wp(2), marginStart: wp(11) }}>
//       {MENUITEMS.OTHERS.map(menu => (
//         <TouchableOpacity
//           onPress={() => handleNavigate(menu.navigation)}
//           style={{
//             flexDirection: 'row',
//             paddingVertical: wp(2),
//             alignItems: 'center',
//             gap: wp(4),
//           }}>
//           {menu.icon}
//           <Text
//             style={[
//               poppins.medium.h7,
//               {
//                 color: COLORS[colorScheme].textPrimary,
//               },
//             ]}>
//             {menu.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// function CustomDrawerContent(props) {
//   return (
//     <DrawerContentScrollView
//       style={{
//         backgroundColor: COLORS[props.colorScheme].background,
//       }}
//       {...props}>
//       <ProfileHeader colorScheme={props.colorScheme} />
//       <Divider
//         style={{
//           backgroundColor: COLORS[props.colorScheme].tabInActive,
//           marginHorizontal: wp(2),
//         }}
//         horizontalInset
//       />
//       <MyAccount colorScheme={props.colorScheme} />
//       <Divider
//         style={{
//           backgroundColor: COLORS[props.colorScheme].tabInActive,
//           marginHorizontal: wp(2),
//         }}
//         horizontalInset
//       />
//       <OtherMenuItems colorScheme={props.colorScheme} />
//     </DrawerContentScrollView>
//   );
// }
// const Drawer = createDrawerNavigator();

// function HomeDrawerNavigation() {
//   const { theme } = useTheme();
//   const colorScheme = theme;

//   return (
//     <Drawer.Navigator
//       screenOptions={{
//         headerShown: false,
//         drawerPosition: 'right',
//         drawerStyle: {
//           width: wp(100),

//           backgroundColor: COLORS[colorScheme].background,
//         },
//       }}
//       drawerContent={props => (
//         <CustomDrawerContent colorScheme={colorScheme} {...props} />
//       )}>
//       <Drawer.Screen name="Homepage" component={HomeScreen}
//        screenOptions={{
//         animationEnabled: false,  // Disable animations for all screens
//       }} />
//       <Drawer.Screen name="Article" component={Article} />
//       <Drawer.Screen name="Edit-Profile" component={EditProfileScreen} />
//       <Drawer.Screen
//         name="ChangePasswordScreen"
//         component={ChangePasswordScreen}
//       />
//       <Drawer.Screen name="TripsList" component={TripsListScreen} />
//       <Drawer.Screen name="EventsList" component={EventsListScreen} />
//       <Drawer.Screen name="MyEventsListScreen" component={MyEventsListScreen} />
//       <Drawer.Screen name="EventDetails" component={EventDetails} />
//       <Drawer.Screen name="My-Appointments" component={AppointmentScreen} />
//       <Drawer.Screen name="CoachList" component={CoachList} />
//       <Drawer.Screen name="CoachDetails" component={CoachDetails} />
//       <Drawer.Screen name="ContactUs" component={ContactUsScreen} />
//       <Drawer.Screen name="AboutUsScreen" component={AboutUsScreen} />
//       <Drawer.Screen name="CartScreen" component={CartScreen} />
//       <Drawer.Screen name="TermsAndConditions" component={TermsAndConditions} />
//       <Drawer.Screen
//         name="PrivacyPolicyScreen"
//         component={PrivacyPolicyScreen}
//       />
//       <Drawer.Screen name="PrivacyCenter" component={PrivacyCenter} />
//       <Drawer.Screen name="Accountdeletion" component={Accountdeletion} />

//       <Drawer.Screen name="RefundPolicyScreen" component={RefundPolicyScreen} />
//       <Drawer.Screen name="FaqScreen" component={FaqScreen} />
//       <Drawer.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
//       <Drawer.Screen name="MySubscriptions" component={MySubscriptions} />
//       <Drawer.Screen name="MyAppointments" component={MyAppointmentsScreen} />
//       <Drawer.Screen name="MyAddresses" component={MyAddresses} />
//       <Drawer.Screen name="ShoppingList" component={ShopListScreen} />
//       <Drawer.Screen
//         name="ProductDetailsScreen"
//         component={ProductDetailsScreen}
//       />55555555555555555
//       <Drawer.Screen name="OurClasses" component={OurClasses} />
//       <Drawer.Screen name="CreateStoryScreen" component={CreateStoryScreen} />
//       <Drawer.Screen
//         name="BookingClassConfirm"
//         component={BookingConfirmation}
//       />
//       <Drawer.Screen name="TripsViewImages" component={TripsViewImages} />
//     </Drawer.Navigator>
//   );
// }

// export default HomeDrawerNavigation;
