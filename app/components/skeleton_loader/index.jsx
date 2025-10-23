/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import Skeleton from 'react-native-reanimated-skeleton';
import {hp, wp} from '../../resources/dimensions';
import {COLORS} from '../../resources/colors';
import {useTheme} from '../../context/ThemeContext';

const HOME_LAYOUT = [
  {
    width: wp(100),
    marginVertical: wp(1),
  },
  {
    alignItems: 'center',
    children: [
      {
        children: [
          {
            children: [
              {
                borderRadius: wp(10),
                height: wp(15),
                width: wp(15),
              },
              {
                borderRadius: wp(10),
                height: wp(15),
                width: wp(15),
              },

              {
                borderRadius: wp(10),
                height: wp(15),
                width: wp(15),
              },
              {
                borderRadius: wp(10),
                height: wp(15),
                width: wp(15),
              },
              {
                borderRadius: wp(10),
                height: wp(15),
                width: wp(15),
              },
            ],
            flexDirection: 'row',
            height: '100%',
            gap: wp(4),
            width: '100%',
            marginHorizontal: wp(4),
          },
        ],

        flexDirection: 'column',
        height: 19,
        width: '100%',
      },

      {
        marginTop: hp(7),
        height: hp(15),
        width: wp(96),
      },
      {
        children: [
          {height: wp(44), width: wp(44)},
          {height: wp(44), width: wp(44)},
        ],
        flexDirection: 'row',
        marginTop: hp(4),
        gap: wp(5),
      },

      {
        children: [
          {height: wp(20), width: wp(20)},
          {height: wp(20), width: wp(20)},
          {height: wp(20), width: wp(20)},
          {height: wp(20), width: wp(20)},
        ],
        flexDirection: 'row',
        marginTop: hp(5),
        gap: wp(5),
      },
    ],

    flexDirection: 'column',
    justifyContent: 'center',
  },
];

const SkeletonLoader = () => {
  const {theme} = useTheme();

  return (
    <Skeleton
      duration={2000}
      animationDirection="diagonalDownLeft"
      boneColor={COLORS[theme].cardBackground}
      containerStyle={{
        alignItems: 'center',
      }}
      isLoading
      layout={HOME_LAYOUT}
    />
  );
};

export default SkeletonLoader;

const styles = StyleSheet.create({});
