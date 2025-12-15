import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { Easing, withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { wp } from '../resources/dimensions';// Use your own dimensions utils
const AnimatedCartCount = ({ count }) => {
  const scale = useSharedValue(1); // Start scale

  // Trigger the animation whenever count changes
  useEffect(() => {
    if (count > 0) {
      scale.value = withSpring(1.2, { damping: 2, stiffness: 100 }); // Animate to 1.2 size
    } else {
      scale.value = 1;
    }

    // Reset scale after animation completes
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 3, stiffness: 100 });
    }, 200);
  }, [count]);

  // Animated style to scale the cart count
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity style={styles.cartButton}>
      <Animated.View style={[styles.cartIcon, animatedStyle]}>
        <Text style={styles.cartText}>{count}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
    borderRadius: wp(5),
    backgroundColor: '#FF912C',
    padding: wp(3),
    elevation: 5,
  },
  cartIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#FF912C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  cartText: {
    color: 'white',
    fontSize: wp(5),
    fontWeight: 'bold',
  },
});
export default AnimatedCartCount;