import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {wp} from '../../resources/dimensions';

const LoaderView = () => {
  return <ActivityIndicator color="white" size={wp(10)} />;
};

export default LoaderView;

const styles = StyleSheet.create({});
