import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ProductTab = ({ storeData, onViewCart }) => {
  const [expandTop, setExpandTop] = useState(true);
  const [expandBest, setExpandBest] = useState(false);
  const [cartItems, setCartItems] = useState([]); // 🛒 Cart items

  const topProducts = storeData?.top_products || [];

  const toggleExpand = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === "top") {
      setExpandTop(!expandTop);
      setExpandBest(false);
    } else {
      setExpandBest(!expandBest);
      setExpandTop(false);
    }
  };

  const handleAddToCart = (item) => {
    const alreadyInCart = cartItems.some((i) => i.item_id === item.item_id);
    if (!alreadyInCart) {
      setCartItems([...cartItems, item]);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Section: Top Products */}
      <TouchableOpacity onPress={() => toggleExpand("top")} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        <MaterialCommunityIcons
          name={expandTop ? "chevron-up" : "chevron-down"}
          size={24}
          color="#000"
        />
      </TouchableOpacity>

      {expandTop &&
        topProducts.map((item) => {
          const added = cartItems.some((i) => i.item_id === item.item_id);
          return (
            <View key={item.item_id} style={styles.productCard}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              {item.variant_list?.length > 0 && (
                <Text style={styles.unit}>
                  {item.variant_list[0].name} {item.variant_list[0].unit}
                </Text>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ₹{item.variant_list?.[0]?.offer_price ||
                    item.variant_list?.[0]?.price}
                </Text>
                {item.offer_available === "true" && (
                  <Text style={styles.oldPrice}>
                    ₹{item.variant_list?.[0]?.price}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.addBtn, added && { backgroundColor: "#00BFA6" }]}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={[styles.addText, added && { color: "#fff" }]}>
                  {added ? "Added" : "Add to cart"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

      {/* Section: Best Seller */}
      <TouchableOpacity onPress={() => toggleExpand("best")} style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Best Seller</Text>
        <MaterialCommunityIcons
          name={expandBest ? "chevron-up" : "chevron-down"}
          size={24}
          color="#000"
        />
      </TouchableOpacity>

      {expandBest && (
        <View style={styles.productCard}>
          <Text style={{ textAlign: "center", color: "#999" }}>
            No Best Sellers Yet
          </Text>
        </View>
      )}

      {/* 🛒 Bottom "View Cart" section */}
      {cartItems.length > 0 && (
        <View style={styles.cartFooter}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="cart-outline"
              size={22}
              color="#fff"
            />
            <Text style={styles.cartInfoText}>
              {cartItems.length} item{cartItems.length > 1 ? "s" : ""} in cart
            </Text>
          </View>
          <TouchableOpacity
            onPress={onViewCart}
            style={styles.viewCartBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProductTab;

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: "100%", height: 130, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  unit: { fontSize: 13, color: "#555", marginVertical: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontSize: 18, fontWeight: "bold" },
  oldPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addBtn: {
    backgroundColor: "#E6FAF8",
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 10,
  },
  addText: { color: "#00BFA6", textAlign: "center", fontWeight: "600" },

  // 🛒 Bottom View Cart Bar
  cartFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#00BFA6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
  },
  cartInfoText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  viewCartBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  viewCartText: { color: "#00BFA6", fontWeight: "700" },
});
