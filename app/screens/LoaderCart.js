import React, { } from 'react';
import {
  View, StyleSheet,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import HeaderBar from '../components/header';

const LoaderCart = ({ showBackArrow }) => {
  const { theme } = useTheme();
  const skeletonItems = Array.from({ length: 5 });
  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      {/* <HeaderBar title="My Cart" showBackArrow={showBackArrow} /> */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: wp(2) }}>
        <>
          {/* {skeletonItems.map((_, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor:COLORS[theme].cardBackground,
              padding: wp(2),
              borderRadius: wp(1),
              marginBottom: wp(2),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 1,
              elevation: 2,
            }}>
              <View style={{
                width: wp(12),
                height: wp(12),
                borderRadius: wp(1),
                backgroundColor: '#e0e0e0',
                marginRight: wp(4),
              }} />
              <View style={{ flex: 1 }}>
                <View style={{
                  width: '60%',
                  height: wp(3.5),
                  borderRadius: wp(1),
                  backgroundColor: '#e0e0e0',
                  marginBottom: wp(1),
                }} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: wp(10),
                    height: wp(3),
                    borderRadius: wp(1),
                    backgroundColor: '#e0e0e0',
                    marginRight: wp(2),
                  }} />
                  <View style={{
                    width: wp(8),
                    height: wp(3),
                    borderRadius: wp(1),
                    backgroundColor: '#e0e0e0',
                  }} />
                </View>
              </View>
              <View style={{
                width: wp(20),
                height: wp(6),
                borderRadius: wp(1),
                backgroundColor: '#e0e0e0',
                marginLeft: wp(2),
              }} />
            </View>
          ))} */}
          {skeletonItems.map((_, index) => (
            <View style={{
              width: wp(92),
              height: hp(10),
              borderRadius: wp(1),
              backgroundColor:theme == 'dark' ? "#555":"#ddd",
              margin: wp(2),
            }} />
          ))}
        </>
      </ScrollView >
      {/* <View style={{
        width: wp(92),
        height: wp(15),
        borderRadius: wp(1),
        backgroundColor: '#e0e0e0',
        margin: wp(2), position: "relative", bottom: wp(0), left: 10
      }} /> */}
    </View >
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    height: hp(5.5),
    borderWidth: wp(0.3),
    borderRadius: wp(2)
  },
  input: {
    fontSize: wp(3),
    justifyContent: 'center',
    paddingVertical: 0,
    alignItems: "center",
  },
  applyButton: {
    paddingHorizontal: wp(1),
    paddingVertical: hp(1),
    // borderRadius: wp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoaderCart;
