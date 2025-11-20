import React, { useState } from "react";
import { View, TextInput, StyleSheet, Image } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../resources/colors";
import { hp, wp } from "../resources/dimensions";
import { poppins } from "../resources/fonts";
import { IMAGE_ASSETS } from "../resources/images";
const CommonSearchContainer = ({ placeholder = "Search...", onSearch }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const handleChange = (text) => {
    setQuery(text);
    if (onSearch) {
      onSearch(text); // send search text to parent
    }
  };
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: COLORS[theme].background }
      ]}
    >
      <Image
        source={IMAGE_ASSETS.search_filled}
        style={styles.icon}
        resizeMode="contain"
      />
      <TextInput
      numberOfLines={1}
        value={query}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS[theme].textPrimary}
        style={[
          poppins.regular.h7,
          styles.input,
          { color: COLORS[theme].textPrimary },
        ]}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    borderRadius: wp(8),
    borderWidth: wp(0.2),
    borderColor: "#ccc",
    marginHorizontal: wp(3),
    height: hp(6),
  },
  input: {
    marginLeft: wp(1),
    width:wp(80)
  },
  icon: {
    width: wp(8),
    height: wp(8),
  },
});
export default CommonSearchContainer;
