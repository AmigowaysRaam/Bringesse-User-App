import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { AppRegistry, Platform } from 'react-native';
// import { name as appName } from './app.json';
import App from './App';
if (__DEV__) {
  require('./app/debugger/ReactotronConfig');
}
const appName = Platform.OS === 'ios' ? 'bringesse' : 'bringesseUser';

// 👇 Background message handler must be declared outside the component
messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    const data = remoteMessage?.data || {};
    const title = data.scope || 'Notification';
    const body = data.message || 'You have a new message.';

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
        smallIcon: 'ic_launcher', // ensure this exists
        sound: 'default', // default sound
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
      ios: {
        sound: 'default', // default iOS notification sound
      },
    });
  } catch (error) {
    console.error('Error handling background message:', error);
  }
});
AppRegistry.registerComponent(appName, () => App);
