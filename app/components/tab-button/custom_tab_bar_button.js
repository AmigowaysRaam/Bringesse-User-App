import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {hp} from '../../resources/dimensions';
import HapticFeedback from 'react-native-haptic-feedback';
import Ripple from 'react-native-material-ripple';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CustomTabBarButton({children, onPress}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: withSpring(scale.value, {damping: 1, stiffness: 5})},
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.8;
    HapticFeedback.trigger('impactMedium'); // Trigger haptic feedback
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  return (
    <Ripple
      style={styles.tabButton}
      rippleColor={'rgb(255,255,255)'}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      rippleCentered
      rippleSize={100}>
      <AnimatedPressable
        style={[styles.tabButton, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        {children}
      </AnimatedPressable>
    </Ripple>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomTabBarButton;
