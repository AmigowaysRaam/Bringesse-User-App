import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  TextInput, LayoutAnimation, Platform, UIManager,
  Modal, FlatList, KeyboardAvoidingView, ActivityIndicator, Alert,
  ToastAndroid,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HeaderBar from "../../components/header";
import FlashMessage from "react-native-flash-message";
import UseProfileHook from "../../hooks/profile-hooks";
import Toast from "react-native-toast-message";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { hp, wp } from "../../resources/dimensions";
import { COLORS } from "../../resources/colors";
import { useTheme } from "../../context/ThemeContext";
import { useSelector } from "react-redux";
import { fetchData } from "../../api/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProductListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { storeId } = route.params;
  const [expandTop, setExpandTop] = useState(true);
  const [expandBest, setExpandBest] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variantModal, setVariantModal] = useState({ visible: false, item: null });
  const { profile } = UseProfileHook();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [cartSummary, setCartSummary] = useState({ totalItems: 0, totalPrice: 0 });
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTopProducts, setFilteredTopProducts] = useState([]);

  const formatTo12Hour = (utcTime) => {
    const date = new Date(utcTime);
    const localDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return localDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  useEffect(() => {
    getStoreDetails();
  }, []);

  useEffect(() => {
    if (storeData?.top_products) {
      setFilteredTopProducts(storeData.top_products);
    }
  }, [storeData]);


  // 🔁 Re-fetch cart count every time tab bar gains focus or user returns to it
  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
    }, [navigation])
  );
  // ✅ Fetch Cart Count from API
  const fetchCartCount = async () => {
    // if (!accessToken || !profileDetails?.user_id) return;
    try {
      const data = await fetchData(
        'cart/get',
        'POST',
        {
          user_id: profile?.user_id,
          lat: profileDetails?.primary_address?.lat,
          lon: profileDetails?.primary_address?.lon,
        },
        {
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        }
      );

      if (data?.status === true) {
        // setCartCount(data.data?.items?.length || 0);
        // Alert.alert("Cart Data", JSON.stringify(data.data?.items || {}))
        setCartSummary(data.data?.items || {});
        // Alert.alert("Cart Data", JSON.stringify(cartSummary,null,2 || {}))

      } else {
        ToastAndroid.show(data.message || 'Unable to fetch cart.', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const updateCartSummary = (cart = cartItems) => {
    fetchCartCount();
    // Alert.alert("Cart Data", JSON.stringify(cartSummary, null, 2))
    // let totalItems = 0;
    // let totalPrice = 0;
    // Object.values(cart).forEach((item) => {
    //   totalItems += item.qty;
    //   totalPrice += item.qty * item.price;
    // });
    // setCartSummary({ totalItems, totalPrice });
  };

  const addToCart = async (item) => {
    if (Object.keys(profileDetails?.primary_address || {}).length == 0) {
      navigation?.navigate('SelectLocation');
      return;
    }
    try {
      const selected = selectedVariants[item.item_id] || { variant: item.variant_list[0], index: 0 };
      const payload = {
        user_id: profile?.user_id,
        variant_index: selected.index,
        item_id: item.item_id,
        store_id: storeId,
        type: "add",
      };
      const response = await fetch("https://bringesse.com:3003/api/cart/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.status) {
        const variant = selected.variant;
        setCartItems((prev) => {
          const updated = {
            ...prev,
            [item.item_id]: {
              ...item,
              qty: 1,
              price: variant.offer_price || variant.price,
            },
          };
          updateCartSummary(updated);
          return updated;
        });
      } else {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        // alert("Failed to add item. Try again!");
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      // alert("Error adding item to cart!");
    }
  };
  const increaseQty = async (itemId) => {
    try {
      const item = cartItems[itemId];
      const selected = selectedVariants[itemId] || { variant: item.variant_list?.[0], index: 0 };
      const payload = {
        user_id: profile?.user_id,
        variant_index: selected.index,
        item_id: itemId,
        store_id: storeId,
        type: "add",
      };
      const response = await fetch("https://bringesse.com:3003/api/cart/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.status) {
        setCartItems((prev) => {
          const updated = { ...prev };
          updated[itemId].qty += 1;
          updateCartSummary(updated);
          return updated;
        });
      } else {
        alert("Failed to update quantity!");
      }
    } catch (error) {
      console.error("Increase Qty Error:", error);
    }
  };
  const decreaseQty = async (itemId) => {
    try {
      const item = cartItems[itemId];
      const selected = selectedVariants[itemId] || { variant: item.variant_list?.[0], index: 0 };

      const payload = {
        user_id: profile?.user_id,
        variant_index: selected.index,
        item_id: itemId,
        store_id: storeId,
        type: "remove",
      };

      const response = await fetch("https://bringesse.com:3003/api/cart/update", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.status) {
        setCartItems((prev) => {
          const updated = { ...prev };
          if (updated[itemId].qty > 1) {
            updated[itemId].qty -= 1;
          } else {
            delete updated[itemId];
          }
          updateCartSummary(updated);
          return updated;
        });
      } else {
        alert("Failed to update quantity!");
      }
    } catch (error) {
      console.error("Decrease Qty Error:", error);
    }
  };
  const getStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://bringesse.com:3003/api/storedetails", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: storeId,
          lon: 78.1616,
          lat: 9.9,
          type: "top",
          store_search: "false",
          search: "",
        }),
      });

      const data = await response.json();
      if (data?.status === "true") {
        console.log("allproduct", data);
        setStoreData(data);
      } else {
        console.log("No data found");
      }
    } catch (error) {
      console.error("Error fetching store details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      // show all products when search is empty
      setFilteredTopProducts(storeData?.top_products || []);
      return;
    }

    const filtered = storeData?.top_products?.filter((item) =>
      item.name?.toLowerCase().includes(text.toLowerCase())
    ) || [];
    setFilteredTopProducts(filtered);
  };

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

  const handleVariantSelect = (itemId, variant, index) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: { variant, index },
    }));
    setVariantModal({ visible: false, item: null });
  };
  const { theme } = useTheme();
  const selectedVariantData = (item) => {
    return selectedVariants[item.item_id]?.variant || item.variant_list?.[0];
  };
  const selectedIndexData = (item) => {
    return selectedVariants[item.item_id]?.index ?? 0;
  };
  // if (loading) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color="#00BFA6" />
  //     </View>
  //   );
  // }
  const store = storeData?.store_information;
  const topProducts = storeData?.top_products || [];
  return (
    <KeyboardAvoidingView
      style={[styles.container, {
        backgroundColor: COLORS[theme].background
      }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HeaderBar showBackArrow title="Product Details" />
      <FlashMessage position="top" />
      {
        loading ?
          <ActivityIndicator color={COLORS[theme].textPrimary} />
          :
          <View style={{ flex: 1, marginBottom: cartSummary?.length > 0 ? hp(8) : 0 }}>

            <ScrollView style={[styles.container, {
              backgroundColor: COLORS[theme].backgroundcolor
            }]} showsVerticalScrollIndicator={false}>
              {store && (
                <View style={styles.card}>
                  {store.top_store === "true" && (
                    <TouchableOpacity style={styles.badge}>
                      <Text style={[styles.badgeText, {
                      }]}>Top Store</Text>
                    </TouchableOpacity>
                  )}
                  <Image source={{ uri: store.image_url }} style={[styles.storeImage, {
                    resizeMode: 'contain'
                  }]} />
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.address}>{store.address}</Text>
                  <View style={styles.row}>
                    <View style={styles.iconRow}>
                      <MaterialCommunityIcons name="star" color="#00BFA6" size={18} />
                      <Text style={styles.iconText}>{store.rating}</Text>
                    </View>
                    <View style={styles.iconRow}>
                      <MaterialCommunityIcons name="map-marker" color="#00BFA6" size={18} />
                      <Text style={styles.iconText}>{store.distance}</Text>
                    </View>
                    <View style={styles.iconRow}>
                      <MaterialCommunityIcons name="clock-outline" color="#00BFA6" size={18} />
                      <Text style={styles.iconText}>{store.packing_time} mins</Text>
                    </View>
                  </View>

                  <View style={styles.timeRow}>
                    <Text style={styles.timeText}>
                      Open: {formatTo12Hour(store.opening_time)}
                    </Text>
                    <Text style={styles.timeText}>
                      Close: {formatTo12Hour(store.closing_time)}
                    </Text>
                  </View>
                </View>
              )}
              {/* <View style={styles.tabRow}>
              <Text style={[styles.tab, styles.activeTab]}>Product</Text>
              <Text style={styles.tab}>Category’s</Text>
              <Text style={styles.tab}>Reviews</Text>
            </View> */}
              <TextInput
                style={styles.searchBox}
                placeholder="Search"
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <TouchableOpacity onPress={() => toggleExpand("top")} style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {
                  color: COLORS[theme].textPrimary
                }]}>Top Products</Text>
                <MaterialCommunityIcons
                  name={expandTop ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={COLORS[theme].textPrimary}
                />
              </TouchableOpacity>
              {expandTop &&
                filteredTopProducts.map((item) => {
                  const variant = selectedVariantData(item);
                  const index = selectedIndexData(item);
                  return (
                    <View key={item.item_id} style={styles.productCard}>
                      <Image source={{ uri: item.image_url }} style={styles.productImage} />
                      <Text style={[styles.productName, {
                        color: COLORS[theme].black, textTransform: "capitalize"
                      }]}>{item.name}</Text>
                      {/* {item.variant_list?.length > 0 && (
                        <TouchableOpacity
                          style={styles.variantSelector}
                          onPress={() => setVariantModal({ visible: true, item })}
                        >
                          <Text style={[styles.variantText,]}>
                            {variant?.name} {variant?.unit}
                          </Text>
                          <MaterialCommunityIcons name="chevron-down" size={22} color="#333" />
                        </TouchableOpacity>
                      )} */}
                      <View style={styles.priceRow}>
                        <Text style={[styles.price, {
                          color: COLORS[theme].black
                        }]}>
                          ₹{variant?.offer_price || variant?.price}
                        </Text>
                        {item.offer_available === "true" && (
                          <Text style={[styles.oldPrice, {
                            color: COLORS[theme].black
                          }]}>₹{variant?.price}</Text>
                        )}
                      </View>
                      {cartItems[item.item_id] ? (
                        <View style={styles.qtyRow}>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => decreaseQty(item.item_id)}
                          >
                            <Text style={styles.qtyButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{cartItems[item.item_id].qty}</Text>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => increaseQty(item.item_id)}
                          >
                            <Text style={styles.qtyButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => addToCart(item)}
                          style={styles.addButton}
                        >
                          <Text style={styles.addButtonText}>Add to cart</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              {/* <TouchableOpacity onPress={() => toggleExpand("best")} style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {
                  color: COLORS[theme].textPrimary
                }]}>Best Seller</Text>
                <MaterialCommunityIcons
                  name={expandBest ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity> */}
              {expandBest && (
                <View style={styles.productCard}>
                  <Text style={{ textAlign: "center", color: "#888" }}>
                    No Best Sellers Yet
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
      }
      <Modal
        visible={variantModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVariantModal({ visible: false, item: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Variant</Text>
            <FlatList
              data={variantModal.item?.variant_list || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() =>
                    handleVariantSelect(variantModal.item.item_id, item, index)
                  }
                >
                  <Text style={styles.modalItemText}>
                    {item.name} {item.unit} - ₹{item.offer_price || item.price}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setVariantModal({ visible: false, item: null })}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {cartSummary.length > 0 && (
        <View style={styles.bottomBar}>
          <Text style={styles.bottomBarText}>
            {cartSummary?.length + " items in cart"}
          </Text>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate("Mycart", { showBackArrow: true })}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default ProductListScreen;
const styles = StyleSheet.create({
  container: { flex: 1, padding: wp(1) },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#c9c9c9", borderRadius: wp(2),
    padding: wp(3), marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5, elevation: 3,
  },
  // storeImage: { width: "100%", height: hp(10), borderRadius: 12, marginBottom: wp(0.3) },
  storeName: { fontSize: wp(4), fontWeight: "bold", marginBottom: wp(2), color: "#000", textTransform: "capitalize" },
  address: { fontSize: 13, color: "#777", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconRow: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  iconText: { marginLeft: 4, color: "#333", fontSize: 13 },
  badge: {
    backgroundColor: "#E5F9F5", alignSelf: "flex-start", borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  badgeText: { color: "#00BFA6", fontWeight: "600", fontSize: 13 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  timeText: { color: "#444", fontSize: 13 },
  tabRow: {
    flexDirection: "row", justifyContent: "space-around",
    marginVertical: 10, borderBottomWidth: 1,
    borderColor: "#eee", paddingBottom: 5,
  },
  tab: { fontSize: 15, color: "#777" },
  activeTab: { color: "#00BFA6", fontWeight: "600" },
  searchBox: {
    backgroundColor: "#F6F6F6",
    borderRadius: 10, padding: 10, marginBottom: wp(1),
    color: "#000",
  },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16, padding: 10, marginTop: 8,
    shadowColor: "#000", shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, elevation: 2,
  },
  productImage: { width: "100%", height: 130, borderRadius: 12 },
  productName: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontSize: 18, fontWeight: "bold" },
  oldPrice: { fontSize: 16, color: "#999", textDecorationLine: "line-through" },
  addButton: {
    backgroundColor: "#E6FAF8",
    borderRadius: 8, marginTop: 8,
    paddingVertical: 10,
  },
  addButtonText: { color: "#00BFA6", textAlign: "center", fontWeight: "600" },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "center", alignItems: "center", marginTop: 8,
  },
  qtyButton: {
    backgroundColor: "#E6FAF8",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6,
  },
  qtyButtonText: { color: "#00BFA6", fontSize: 18, fontWeight: "bold" },
  qtyText: { fontSize: 16, fontWeight: "bold", marginHorizontal: 12, color: "#000" },
  variantSelector: {
    borderWidth: 1, borderColor: "#ccc",
    borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 6, flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  variantText: { color: "#333", fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#222", borderTopLeftRadius: 16,
    borderTopRightRadius: 16, maxHeight: "60%",
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  modalItemText: { fontSize: 15 },
  modalCloseButton: {
    backgroundColor: "#00BFA6", marginTop: 12, borderRadius: 8, paddingVertical: 12,
  },

  modalCloseText: { textAlign: "center", color: "#000", fontWeight: "600" },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", backgroundColor: "#00BFA6",
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopLeftRadius: 12, borderTopRightRadius: 12,

  },
  bottomBarText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  viewCartBtn: {
    backgroundColor: "#fff", paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 8,
  },
  viewCartText: { color: "#00BFA6", fontWeight: "600" },
});