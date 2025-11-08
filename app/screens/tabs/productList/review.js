import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReviewTab = ({ storeId }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reviews for Store ID: {storeId}</Text>
    </View>
  );
};

export default ReviewTab;

const styles = StyleSheet.create({
  container: { padding: 20 },
  text: { color: "#555", textAlign: "center" },
});
