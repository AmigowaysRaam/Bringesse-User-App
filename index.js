import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { name as appName } from './app.json';
import App from './App';

if (__DEV__) {
  require('./app/debugger/ReactotronConfig');
}

// 👇 Background message handler must be declared outside the component
messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    const data = remoteMessage?.data || {};
    const title = data.scope || 'Notification';
    const body = data.message || 'You have a new message.';

    // 🧠 Store order/notification data in AsyncStorage for later retrieval
    // if (data && Object.keys(data).length > 0) {
    //   await AsyncStorage.setItem('NOTIFICATION_DATA', JSON.stringify(data));
    // }

    // 🔔 Create a channel for Android
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // 📱 Display local notification
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // ensure this exists in your res/mipmap
      },
    });
  } catch (error) {
    console.error('Error handling background message:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
