import React, { useEffect } from 'react';
import {
  Alert,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { PermissionsAndroid } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux';
import { store as configureStore } from 'react-boilerplate-redux-saga-hoc';
import FlashMessage from "react-native-flash-message";
import {
  PaperProvider,
  DefaultTheme,
  configureFonts,
  MD2LightTheme,
  MD2DarkTheme,
} from 'react-native-paper';

import InitialRouter from './app/navigation/initial_router';
import { fontConfig } from './app/resources/fonts';
import { COLORS } from './app/resources/colors';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';
import { LanguageProvider } from './app/context/LanguageContext';

import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './app/config/i18';
import HyperSdkReact from 'hyper-sdk-react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import {CopilotProvider} from 'react-native-copilot'
import { WishlistProvider } from './app/context/WishlistContext';

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

const initialState = {};
const store = configureStore(initialState);

const lightTheme = {
  ...MD2LightTheme,
  roundness: 3,
  colors: {
    ...DefaultTheme.colors,
    text: '#000',
    placeholder: '#919191',
    onPrimary: '#000000',
    primary: '#C4C4C2',
  },
  fonts: configureFonts({ config: fontConfig, isV3: false }),
};

const darkTheme = {
  ...MD2DarkTheme,
  roundness: 3,
  colors: {
    ...DefaultTheme.colors,
    text: '#000',
    placeholder: '#919191',
    onPrimary: '#000000',
    primary: '#C4C4C2',
  },
  fonts: configureFonts({ config: fontConfig, isV3: false }),
};

function App(): React.JSX.Element {
  const [network, setNetwork] = React.useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // block:start:create-hyper-services-instance

    HyperSdkReact.createHyperServices();

    // block:end:create-hyper-services-instance

    // Creating initiate payload JSON object
    // block:start:create-initiate-payload

    const initiate_payload = {
      requestId: 'test',
      service: 'in.juspay.hyperpay',
      payload: {
        action: 'initiate',
        merchantId: 'amigoways',
        clientId: 'amigoways',
        environment: 'production',
      },
    };

    // block:end:create-initiate-payload

    // Calling initiate on hyperService instance to boot up payment engine.
    // block:start:initiate-sdk

    HyperSdkReact.initiate(JSON.stringify(initiate_payload));

    // block:end:initiate-sdk
  }, []);

  // block:start:event-handling-initiate
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener('HyperEvent', resp => {
      const data = JSON.parse(resp);
      const event = data.event || '';
      switch (event) {
        case 'initiate_result':
          // logging the initiate result
          console.log('Initiate result', data);
          break;
        default:
          console.log(data);
      }
    });
    return () => {
      eventListener.remove();
    };
  }, []);
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setNetwork(false);
        openNetworkSettings();
      } else {
        setNetwork(true);
      }
    });

    return unsubscribeNetInfo;
  }, []);

  const openNetworkSettings = () => {
    const buttons = [
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.sendIntent('android.settings.SETTINGS');
          }
        },
      },
    ];
    // if (Platform.OS === 'android') {
    //   buttons.unshift({
    //     text: 'Close',
    //     onPress: () => BackHandler.exitApp(),
    //   });
    // }

    Alert.alert(
      'No Network Connection',
      'Please enable mobile data from the settings',
      buttons,
      { cancelable: false }
    );
  };
  useEffect(() => {
    checkPushNotificationPermission();
    // 🔁 Handle FCM foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const hasNotificationPayload = !!remoteMessage.notification;
      // console.log(remoteMessage.data);
      // 🛑 Prevent duplicate if notification payload exists (Firebase will auto-show it)
      if (!hasNotificationPayload) {
        const title = remoteMessage.data?.scope || 'Default Title';
        const body = remoteMessage.data?.message || 'Default Body';
        onDisplayNotification({ title, body });
      }
    });

    return unsubscribe;
  }, []);

  async function checkPushNotificationPermission() {
    if (Platform.OS === 'ios') {
      await messaging().requestPermission();
    } else {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      } catch (error) {
        console.warn('Notification permission error:', error);
      }
    }
  }

  async function onDisplayNotification({
    title,
    body,
  }: {
    title: string;
    body: string;
  }) {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Ensure this exists in res/drawable
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContainer />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const AppContainer = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  const bgColor = COLORS[theme].background;
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        translucent
        backgroundColor={bgColor}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <PaperProvider theme={currentTheme}>
        <LanguageProvider>
          <View
            style={{
              flex: 1,
              backgroundColor: bgColor,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            }}
          >
             <CopilotProvider overlay='svg'  animated  labels={{next:'Next' , finish:'Got it'}}
                 tooltipStyle={{borderRadius:12,padding:15}} stepNumberComponent={()=>null}>
            <WishlistProvider>
               <Provider store={store}>
              <I18nextProvider i18n={i18n}>
                <InitialRouter />
              </I18nextProvider>
            </Provider>
            </WishlistProvider>

            </CopilotProvider>
          </View>
        </LanguageProvider>
      </PaperProvider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
