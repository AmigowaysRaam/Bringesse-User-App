/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { wp } from '../../resources/dimensions';
import { COLORS } from '../../resources/colors';
import { commonStyles } from '../../resources/styles';

const width = wp(10);

const ToggleTheme = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Shared value for animation, initialize based on current theme
  const toggleAnimation = useSharedValue(isDarkMode ? 1 : 0);

  // Animate the toggle circle position
  const toggleCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: toggleAnimation.value * width }],
    };
  });

  // Sync shared value whenever theme changes
  useEffect(() => {
    toggleAnimation.value = withTiming(isDarkMode ? 1 : 0, { duration: 300 });
    
  }, [isDarkMode, toggleAnimation]);

  // Toggle theme & animate toggle circle
  const toggleThemeBtn = () => {
    toggleTheme();
    // No need to set toggleAnimation.value here, it's handled in useEffect on theme change
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: COLORS[theme].viewBackground,
          borderWidth: 1,
          borderRadius: wp(10),
        },
        commonStyles[theme].shadow,
      ]}
    >
      <TouchableOpacity onPress={toggleThemeBtn} style={styles.toggleContainer}>
        <Animated.View
          style={[
            styles.toggleCircle,
            toggleCircleStyle,
            { backgroundColor: isDarkMode ? COLORS[theme].accent : '#fff' },
          ]}
        >
          <Icon
            name={isDarkMode ? 'weather-night' : 'white-balance-sunny'}
            size={20}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    width: wp(20),
    height: wp(10),
    borderRadius: wp(10),
    backgroundColor: '#ccc',
    padding: 5,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ToggleTheme;
