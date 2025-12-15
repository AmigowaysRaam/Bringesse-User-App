import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { COLORS } from "../resources/colors";
import { wp, hp } from "../resources/dimensions";
import { poppins } from "../resources/fonts";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
const OrderItemsCard = ({ items = [], title = "Ordered Items" }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleExpand}
      style={[styles.card, { backgroundColor: COLORS[theme].accent }]}
    >
      {/* LEFT SIDE HEADER */}
      <View style={styles.leftSection}>
        <Text
          style={[
            poppins.semi_bold.h6,
            { color: COLORS[theme].white, marginBottom: hp(0.5) },
          ]}
        >
          {title}
        </Text>

        {/* Collapsible List */}
        {expanded && (
          <View style={{ marginTop: hp(1) }}>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  resizeMode="contain"
                />

                <View style={{ flex: 1, marginLeft: wp(2) }}>
                  <Text
                    style={[
                      poppins.semi_bold.h8,
                      { color: COLORS[theme].white },
                    ]}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[
                      poppins.regular.h9,
                      { color: COLORS[theme].white, opacity: 0.8 },
                    ]}
                  >
                    Qty: {item.qty}
                  </Text>
                </View>

                <Text
                  style={[
                    poppins.semi_bold.h7,
                    { color: COLORS[theme].white },
                  ]}
                >
                  ₹{item.price}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* RIGHT ARROW */}
      <MaterialCommunityIcons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={wp(7)}
        color={COLORS[theme].white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: wp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    width: wp(95),
    alignSelf: "center",
    marginVertical: hp(1),
    elevation: 3,
  },

  leftSection: {
    width: wp(70),
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },

  itemImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export default OrderItemsCard;
