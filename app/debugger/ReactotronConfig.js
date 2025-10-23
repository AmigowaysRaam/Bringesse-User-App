import Reactotron from 'reactotron-react-native';

Reactotron.configure() // controls connection & communication settings
  .useReactNative({
    networking: {
      ignoreUrls: /(symbolicated|localhost:8081|generate_204)/,
    },
  }) // add all built-in react native plugins
  .connect(); // let's connect!

Reactotron.clear();

console.log('config_reactor');

Reactotron.log('This is a test log');
