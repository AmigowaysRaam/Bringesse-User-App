import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  TextInput, Platform, UIManager,
  FlatList, KeyboardAvoidingView, ActivityIndicator, ToastAndroid,
  Alert,
} from "react-native";
import HeaderBar from "../../components/header";
import UseProfileHook from "../../hooks/profile-hooks";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { hp, wp } from "../../resources/dimensions";
import { COLORS } from "../../resources/colors";
import { useTheme } from "../../context/ThemeContext";
import { useSelector } from "react-redux";
import { fetchData } from "../../api/api";
import { poppins } from "../../resources/fonts";
import ProductDetailModal from "../ProductDetailModal";
import StoreDetailCard from "../StoreDetailCard";
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const ProductListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { storeId } = route.params;
  const [expandTop, setExpandTop] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [cartSummary, setCartSummary] = useState({ totalItems: 0, totalPrice: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTopProducts, setFilteredTopProducts] = useState([]);
  const [selProdtedData, setselProdtedData] = useState(null);
  const { profile } = UseProfileHook();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const { theme } = useTheme();
  useEffect(() => {
    getStoreDetails();
  }, []);
  useEffect(() => {
    if (storeData?.top_products) setFilteredTopProducts(storeData.top_products);
    // Alert.alert(storeData.top_products.length.toString());
  }, [storeData]);

  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
    }, [navigation])
  );

  const fetchCartCount = async () => {
    if (!accessToken || !profileDetails?.primary_address?.lat) return;
    try {
      const data = await fetchData(
        'cart/get',
        'POST',
        {
          user_id: profile?.user_id,
          lat: profileDetails?.primary_address?.lat,
          lon: profileDetails?.primary_address?.lon,
        },
        { Authorization: `${accessToken}`, user_id: profile?.user_id, type: 'user' }
      );
      if (data?.status && data.data?.items?.length) {
        const items = {};
        data.data.items.forEach(item => {
          const key = `${item.item_id}_${item.variantIndex}`;
          items[key] = item;
        });
        setCartItems(items);
        updateCartSummary(items);
      } else {
        setCartItems({});
        setCartSummary({ totalItems: 0, totalPrice: 0 });
      }
    } catch {
      setCartItems({});
    }
  };

  const updateCartSummary = (cart = cartItems) => {
    let totalItems = 0, totalPrice = 0;
    Object.values(cart).forEach(item => {
      totalItems += item.qty;
      totalPrice += item.qty * (item.variant?.offer_price || item.variant?.price);
    });
    setCartSummary({ totalItems, totalPrice });
  };

  const addToCart = async (item, variant, variantIndex) => {
    if (!profileDetails?.primary_address) {
      navigation.navigate('SelectLocation');
      return;
    }
    try {
      const payload = {
        user_id: profile?.user_id,
        variant_index: variantIndex,
        item_id: item.item_id,
        store_id: storeId,
        type: "add",
      };
      const response = await fetch("https://bringesse.com:3003/api/cart/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.status) {
        const cartKey = `${item.item_id}_${variantIndex}`;
        setCartItems(prev => {
          const updated = {
            ...prev,
            [cartKey]: {
              ...item,
              qty: 1,
              price: variant.offer_price || variant.price,
              variant,
              variantIndex
            },
          };
          updateCartSummary(updated);
          return updated;
        });
      } else ToastAndroid.show(data.message, ToastAndroid.SHORT);
    } catch { }
  };

  const increaseQty = async (cartKey) => {
    if (!cartItems[cartKey]) return;

    const item = cartItems[cartKey];
    try {
      await fetch("https://bringesse.com:3003/api/cart/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        },
        body: JSON.stringify({
          user_id: profile?.user_id,
          variant_index: item.variantIndex,
          item_id: item.item_id,
          store_id: storeId,
          type: "add"
        }),
      });

      setCartItems(prev => {
        const updated = { ...prev };
        updated[cartKey].qty += 1;
        updateCartSummary(updated);
        return updated;
      });

    } catch { }
  };

  const decreaseQty = async (cartKey) => {
    if (!cartItems[cartKey]) return;
    const item = cartItems[cartKey];

    try {
      await fetch("https://bringesse.com:3003/api/cart/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        },
        body: JSON.stringify({
          user_id: profile?.user_id,
          variant_index: item.variantIndex,
          item_id: item.item_id,
          store_id: storeId,
          type: "remove"
        }),
      });
      setCartItems(prev => {
        const updated = { ...prev };
        if (updated[cartKey].qty > 1) updated[cartKey].qty -= 1;
        else delete updated[cartKey];
        updateCartSummary(updated);
        return updated;
      });
    } catch { }
  };
  const getStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://bringesse.com:3003/api/storedetails", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        },
        body: JSON.stringify({ store_id: storeId, lon: 78.1616, lat: 9.9, type: "top", store_search: "false", search: "" }),
      });
      const data = await response.json();
      if (data?.status === "true") setStoreData(data);

    } finally { setLoading(false); }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredTopProducts(storeData?.top_products || []);
      return;
    }
    const filtered = storeData?.top_products?.filter(item =>
      item.name?.toLowerCase().includes(text.toLowerCase())
    ) || [];
    setFilteredTopProducts(filtered);
  };

  const store = storeData?.store_information;
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <HeaderBar showBackArrow title="Product Details" />
      {/* SEARCH BOX */}
      <TextInput
        style={[poppins.semi_bold.h7, styles.searchBox]}
        placeholder="Search"
        placeholderTextColor="#000"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <ActivityIndicator color={COLORS[theme].textPrimary} />
      ) : (
        <View style={{ flex: 1, marginBottom: Object.keys(cartItems).length > 0 ? hp(10) : hp(1) }}>
          <ScrollView showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp(5) }}
          >
            <FlatList
              ListHeaderComponent={
                <>
                  {/* STORE INFORMATION */}
                  {store && (
                    <StoreDetailCard store={store} />
                  )}
                </>
              }
              data={filteredTopProducts}
              keyExtractor={(item) => item.item_id.toString()}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  {/* Product Image + Name */}
                  <TouchableOpacity onPress={() => setselProdtedData(item)} style={{ flexDirection: "row" }}>
                    <Image source={{ uri: item.image_url[0] }} style={styles.productImage} />
                    <View style={{ flex: 1, marginLeft: wp(3) }}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text numberOfLines={3} style={[poppins.regular.h8, {
                      }]}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* HORIZONTAL VARIANT LIST */}
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={item.variant_list}
                    keyExtractor={(i, idx) => idx.toString()}
                    contentContainerStyle={{ marginTop: wp(2) }}
                    renderItem={({ item: variant, index }) => {
                      const cartKey = `${item.item_id}_${index}`;
                      const inCart = cartItems[cartKey];
                      return (
                        <View style={styles.variantCard}>
                          <Text style={styles.variantText}>
                            {variant.name} {variant.unit}
                          </Text>
                          {variant.offer_available === "true" ? (
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Text
                                style={[poppins.regular.h9, {
                                  textDecorationLine: "line-through",
                                  color: "gray",
                                  marginRight: 6,
                                }]}
                              >
                                ₹{variant?.price}
                              </Text>
                              {/* Offer Price */}
                              <Text style={[styles.variantPrice, { color: "green", fontWeight: "bold" }]}>
                                ₹{variant.totalAmount}
                              </Text>

                            </View>
                          ) : (
                            <Text style={styles.variantPrice}>₹{variant.totalAmount}</Text>
                          )}

                          {inCart ? (
                            <View style={styles.qtyRow}>
                              <TouchableOpacity
                                onPress={() => decreaseQty(cartKey)}
                                style={styles.qtyButton}
                              ><Text style={styles.qtyButtonText}>-</Text></TouchableOpacity>

                              <Text style={styles.qtyText}>{inCart.qty}</Text>

                              <TouchableOpacity
                                onPress={() => increaseQty(cartKey)}
                                style={styles.qtyButton}
                              ><Text style={styles.qtyButtonText}>+</Text></TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => addToCart(item, variant, index)}
                              style={styles.addButton}
                            >
                              <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    }}
                  />
                </View>
              )}
            />
          </ScrollView>
        </View>
      )}

      {/* PRODUCT MODAL */}
      <ProductDetailModal
        productData={selProdtedData}
        addCart={(productData, variant, index) => addToCart(productData, variant, index)}
        close={() => setselProdtedData(null)}
      />
      {/* CART BOTTOM BAR */}
      {Object.keys(cartItems).length > 0 && (
        <View style={styles.bottomBar}>
          <Text style={styles.bottomBarText}>{Object.keys(cartItems).length} items in cart</Text>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate("Mycart", { showBackArrow: true })}
          >
            <Text style={styles.viewCartText}>View</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default ProductListScreen;

/* --------------------------- STYLES ---------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: "#F0F0F0",
    borderRadius: wp(2),
    padding: wp(2),
    margin: wp(2),
  },
  storeName: { fontSize: wp(4), fontWeight: "bold", marginTop: wp(2), color: "#000" },
  address: { fontSize: wp(3), color: "#555" },
  badge: {
    backgroundColor: "#E5F9F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start"
  },
  badgeText: { fontSize: wp(2.5), color: "#009a44", fontWeight: "600" },
  storeImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: 10
  },

  searchBox: {
    backgroundColor: "#F6F6F6",
    padding: wp(3),
    borderRadius: 10,
    margin: wp(1),
    color: "#000", marginHorizontal: wp(4)
  },

  sectionTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    marginLeft: wp(2),
    marginTop: wp(2),
  },

  productCard: {
    backgroundColor: "#fff",
    elevation: 2,
    borderRadius: 8,
    marginHorizontal: wp(2),
    marginVertical: wp(1.5),
    padding: wp(3),
  },
  productImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 10,
    resizeMode: "cover",
  },

  productName: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#000",
    textTransform: "capitalize"
  },

  /* ---- Variant Horizontal Card ---- */
  variantCard: {
    backgroundColor: "#F7F7F7",
    padding: wp(3),
    marginRight: wp(3),
    borderRadius: wp(2),
    width: wp(35),
    alignItems: "center",
  },

  variantText: {
    fontSize: wp(3.2),
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },

  variantPrice: {
    fontSize: wp(3.5),
    fontWeight: "bold",
    color: "#009a44",
    marginVertical: wp(1.5),
  },

  addButton: {
    backgroundColor: "#009a4433",
    paddingHorizontal: wp(5),
    paddingVertical: wp(1),
    borderRadius: wp(2),
  },

  addButtonText: {
    color: "#009a44",
    fontWeight: "600",
    textAlign: "center",
  },

  qtyRow: { flexDirection: "row", alignItems: "center" },

  qtyButton: {
    backgroundColor: "#E6FAF8",
    paddingHorizontal: wp(3),
    paddingVertical: wp(1),
    borderRadius: wp(1.5),
  },

  qtyButtonText: {
    color: "#009a44",
    fontSize: wp(5),
    fontWeight: "bold",
  },

  qtyText: {
    marginHorizontal: wp(2),
    fontSize: wp(4),
    fontWeight: "700",
    color: "#000"
  },

  bottomBar: {
    position: "absolute",
    bottom: hp(1),
    left: wp(2),
    right: wp(2),
    backgroundColor: "#009a44",
    borderRadius: 10,
    padding: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomBarText: { color: "#fff", fontSize: wp(4), fontWeight: "600" },
  viewCartBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: wp(4),
    paddingVertical: wp(1),
  },
  viewCartText: {
    color: "#009a44",
    fontWeight: "700",
  },
});