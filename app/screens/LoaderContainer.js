import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';

const screenWidth = Dimensions.get('window').width;

const SkeletonBlock = ({ width, height, borderRadius = 4, style = {}, pulseAnim, color }) => (
  <Animated.View
    style={[
      {
        width,
        height,
        borderRadius,
        backgroundColor: color,
        opacity: pulseAnim,
      },
      style,
    ]}
  />
);

const FullScreenLoader = () => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // const skeletonColor = ;
  const skeletonColor = theme === 'dark' ? '#ddd' : "#e9e9e9";


  return (
    <ScrollView
      style={[styles.container, { backgroundColor: COLORS[theme].background }]}
      contentContainerStyle={{ padding: wp(5) }}
    >
      {/* Header */}
      <View style={styles.row}>
        {/* <SkeletonBlock
          width={wp(14)}
          height={wp(14)}
          borderRadius={wp(7)}
          pulseAnim={pulseAnim}
          color={skeletonColor}
        />
        <View style={{ marginLeft: wp(4) }}>
          <SkeletonBlock
            width={wp(50)}
            height={hp(2.5)}
            pulseAnim={pulseAnim}
            color={skeletonColor}
          />
          <SkeletonBlock
            width={wp(30)}
            height={hp(2)}
            style={{ marginTop: hp(1) }}
            pulseAnim={pulseAnim}
            color={skeletonColor}
          />
        </View> */}
        <SkeletonBlock
          width={wp(90)}
          height={hp(5)}
          style={{ marginTop: hp(0), borderRadius: wp(8), }}
          pulseAnim={pulseAnim}
          color={skeletonColor}
        />
      </View>
      {/* Section Title */}

      <SkeletonBlock
        width={wp(95)}
        height={hp(15)}
        borderRadius={wp(3)}
        style={{ marginTop: hp(0), alignSelf: 'center' }}
        pulseAnim={pulseAnim}
        color={skeletonColor}
      />
      <SkeletonBlock
        width={wp(60)}
        height={hp(2.5)}
        style={{ marginTop: hp(4) }}
        pulseAnim={pulseAnim}
        color={skeletonColor}
      />
      {/* Paragraph Lines */}
      {/* {[1].map((_, i) => (
        <SkeletonBlock
          key={i}
          width={screenWidth * 0.85}
          height={hp(2)}
          style={{ marginTop: hp(1.5) }}
          pulseAnim={pulseAnim}
          color={skeletonColor}
        />
      ))} */}
      {/* Cards or Boxes */}
      <View style={styles.cardRow}>
        {[1, 2,].map((_, i) => (
          <SkeletonBlock
            key={i}
            width={wp(30)}
            height={hp(10)}
            borderRadius={10}
            style={{ marginRight: wp(4), marginTop: hp(3) }}
            pulseAnim={pulseAnim}
            color={skeletonColor}
          />
        ))}
      </View>
      <SkeletonBlock
        width={wp(20)}
        height={hp(2.5)}
        style={{ marginTop: hp(4) }}
        pulseAnim={pulseAnim}
        color={skeletonColor}
      />
      <View style={styles.cardRow}>
        {[1, 2,].map((_, i) => (
          <SkeletonBlock
            key={i}
            width={wp(40)}
            height={hp(10)}
            borderRadius={10}
            style={{ marginRight: wp(4), marginTop: hp(3) }}
            pulseAnim={pulseAnim}
            color={skeletonColor}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default FullScreenLoader;
