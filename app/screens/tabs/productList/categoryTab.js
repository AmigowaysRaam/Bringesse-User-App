import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CategoryTab = ({ storeData }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Category List Coming Soon</Text>
    </View>
  );
};

export default CategoryTab;

const styles = StyleSheet.create({
  container: { padding: 20 },
  text: { color: "#555", textAlign: "center" },
});
