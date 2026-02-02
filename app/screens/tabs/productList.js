import React, { useCallback, useEffect, useState ,useContext } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput,
  FlatList, KeyboardAvoidingView, ActivityIndicator, ToastAndroid,Pressable,Alert,RefreshControl,} from "react-native";
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
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
import ProductImageCarousel from "../ProductImageCarousel";
import LinearGradient from "react-native-linear-gradient";
import LoaderView from "../../components/loader";
import LoaderCart from "../LoaderCart";
import { WishlistContext } from "../../context/WishlistContext";

const ProductListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { storeId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
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
  const { isWishlisted, removeFromWishlist, addToWishlist } = useContext(WishlistContext);
  useEffect(() => {
    getStoreDetails();
  }, []);
  useEffect(() => {
    if (storeData?.top_products) setFilteredTopProducts(storeData.top_products);
  }, [storeData]);
  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
    }, [navigation])
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getStoreDetails(); // call your fetch API or function
    } catch (error) {
      console.log('Refresh error:', error);
    }
    setRefreshing(false);
  }, []);

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
    } catch {
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
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        },
        body: JSON.stringify({
          store_id: storeId,
          lon: 78.1616, lat: 9.9,
          type: "top",
          store_search: "false",
          search: ""
        }),
      });
      const data = await response.json();
      // Alert.alert("tes", JSON.stringify(data))
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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: wp(2) }}>
        <MaterialCommunityIcon style={{
          marginLeft: wp(1),
          position: "absolute", left: wp(1), zIndex: 10
        }} onPress={() => navigation?.goBack()} name="chevron-left" size={wp(8)} color={COLORS[theme].textPrimary} />
        <TextInput
          style={[poppins.semi_bold.h7, styles.searchBox]}
          placeholder="Search"
          placeholderTextColor="#000"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      {loading ? (
        // <ActivityIndicator color={COLORS[theme].textPrimary} />
        // <LoaderContainer/>
        <LoaderCart/>
      ) : (
        <View style={{ flex: 1, marginBottom: Object.keys(cartItems).length > 0 ? hp(10) : hp(1) }}>
            <FlatList
              data={filteredTopProducts}
              keyExtractor={(item) => item.item_id.toString()}
              numColumns={2}
              columnWrapperStyle={{justifyContent:"space-between"}}
               refreshing={refreshing}
              onRefresh={onRefresh}
              contentContainerStyle={{ paddingBottom: hp(5) }}
               showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <>
                  <Text style={[poppins.regular.h6, { color: COLORS[theme].primary, alignSelf: 'center', margin: hp(2) }]}>
                    {searchQuery ? 'No Products Found' : 'No Top Products Available'}
                  </Text>
                </>
              )}
              ListHeaderComponent={
                <>
                  {store && (
                    <StoreDetailCard store={store} />
                  )}
                </>
              }
              renderItem={({ item }) => (
                <Pressable style={[styles.productCard, {width:'49%'
                }]}
                  onPress={() => setselProdtedData(item)}
                >
                  <LinearGradient
                    colors={
                      theme === 'dark'
                        ? ['#555', '#444', '#333', '#222', '#111']
                        : ['#e5f4ec', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#ffffff']
                    }
                    start={{ x: 1, y: 1 }}   // top
                    end={{ x: 1, y: 0 }}     // bottom
                    style={[{
                      padding: wp(3),
                      borderRadius: wp(2),
                    }]}
                  >
     <TouchableOpacity style={styles.icon}
    onPress={() =>
    isWishlisted(item.item_id)
      ? removeFromWishlist(item.item_id)
      : addToWishlist({
  ...item,
  store_id: storeId,
  image:item.image_url || item.image})

  }
 >
                  <MaterialCommunityIcon
    name={isWishlisted(item.item_id) ? "heart" : "heart-outline"}
    size={wp(5)}
    color={isWishlisted(item.item_id) ? "red" : "#333"}
                              />
                    </TouchableOpacity>
                    <View
                      style={{ flexDirection: "row" }}>
                      <View style={{ flex: 1, marginLeft: wp(2), flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ marginVertical: wp(2) }}>
                          <Text style={[styles.productName, {
                            color: COLORS[theme].textPrimary
                          }]} numberOfLines={1}>{item.name.length > 15 ? item.name.substring(0, 8) + '...' : item.name}</Text>
                          {/* <Text>{JSON.stringify(item,null,2)}</Text> */}
                        </View>
                        <View style={{position:"absolute", marginLeft:wp(34),zIndex:10}}>
                          <MaterialCommunityIcon name="chevron-right" size={wp(8)} color={COLORS[theme].textPrimary} />
                        </View>
                      </View>
                    </View>
                    <FlatList
                      data={item.variant_list}
                      keyExtractor={(i, idx) => idx.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ marginTop: wp(2) }}
                      renderItem={({ item: variant, index }) => {
                        const cartKey = `${item.item_id}_${index}`;
                        const inCart = cartItems[cartKey];
                        return (
                          <>
                            <View style={[styles.variantCard,{flex: 1}]}>
                               {variant.offer_available === "true" && (
                                    <Text
                                      style={[styles.off ,{color:'green',fontWeight:900}]}
                                    >
                                      {variant?.offer_percentage} OFF
                                    </Text>
                                )} 
                              <ProductImageCarousel variant={variant} video={item.videoUrl} images={item.image_url} theme={theme} />
                              <View style={{ flexDirection: "row", justifyContent: "space-between", width: wp(80), marginVertical: wp(2) }}>
                                <View>
                                  <Text style={[styles.variantText, {
                                    color: COLORS[theme].textPrimary
                                  }]}>
                                    {variant.name} {variant.unit}
                                  </Text>
                                  {variant.offer_available === "true" ? (
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                      <Text
                                        style={{
                                          textDecorationLine: "line-through",
                                          color: COLORS[theme].textPrimary,
                                          marginRight: 6,
                                          fontSize: 12,
                                        }}
                                      >
                                        ₹{variant.price}
                                      </Text>
                                      <Text
                                        style={{
                                          color: COLORS[theme].textPrimary,
                                          fontWeight: "bold",
                                          fontSize: 14,
                                          marginRight: 6,
                                        }}
                                      >
                                        ₹{variant.totalAmount}
                                      </Text>
                                    </View>
                                  ) : (
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontWeight: "bold",
                                        color: COLORS[theme].textPrimary }}
                                    >
                                      ₹{variant.totalAmount}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              <View>
                                {
                                  variant["itemOutofStock "] == '1'
                                    ?
                                    null
                                    :
                                    inCart ? (
                                      <View style={styles.qtyRow}>
                                        <TouchableOpacity
                                          onPress={() => decreaseQty(cartKey)}
                                          style={styles.qtyButton}
                                        >
                                          <Text style={styles.qtyButtonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={[styles.qtyText, {
                                          color: COLORS[theme].textPrimary
                                        }]}>{inCart.qty}</Text>
                                        <TouchableOpacity
                                          onPress={() => increaseQty(cartKey)}
                                          style={styles.qtyButton}
                                        >
                                          <Text style={styles.qtyButtonText}>+</Text>
                                        </TouchableOpacity>
                                      </View>
                                    ) : (
                                      <TouchableOpacity
                                        onPress={() => addToCart(item, variant, index)}
                                        style={[styles.addButton, {
                                          borderColor: COLORS[theme].textPrimary,
                                          backgroundColor: COLORS[theme].background,
                                          flexDirection: "row",justifyContent:"center", alignItems: "center" }]}
                                      >
                                        <Text style={[poppins.semi_bold.h7, styles.addButtonText, {
                                          color: COLORS[theme].primary, lineHeight: wp(9)
                                        }]}>Add to Cart
                                        </Text>
                                        <MaterialCommunityIcon size={wp(5)} name={'cart'} color={COLORS[theme].primary} />
                                      </TouchableOpacity>
                                    )}
                              </View>
                            </View>
                          </>
                        );
                      }}
                    />
                  </LinearGradient>
                </Pressable>
              )}
            />
       
        </View>
      )
      }
      <ProductDetailModal
        productData={selProdtedData}
        addCart={(productData, variant, index) => addToCart(productData, variant, index)}
        close={() => setselProdtedData(null)}
      />
      {
        Object.keys(cartItems).length > 0 && (
          <View style={styles.bottomBar}>
            <Text style={styles.bottomBarText}>{Object.keys(cartItems).length} items in cart</Text>
            <TouchableOpacity
              style={styles.viewCartBtn}
              onPress={() => navigation.navigate("Mycart", { showBackArrow: true })}
            >
              <Text style={styles.viewCartText}>View</Text>
            </TouchableOpacity>
          </View>
        )
      }
    </KeyboardAvoidingView >
  );
};
export default ProductListScreen;
/* --------------------------- STYLES ---------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 }, card: {
    backgroundColor: "#F0F0F0", borderRadius: wp(2), padding: wp(2), margin: wp(2),
  },
  address: { fontSize: wp(3), color: "#555" },
  badge: {
    backgroundColor: "#E5F9F5", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start"
  }, badgeText: { fontSize: wp(2.5), color: "#009a44", fontWeight: "600" },
  storeImage: { width: wp(15), height: wp(15), borderRadius: 10 },
  searchBox: {
    backgroundColor: "#F6F6F6", padding: wp(1.5), borderRadius: 10,
    marginVertical: wp(2), color: "#000", marginHorizontal: hp(6), width: wp(80), borderWidth: wp(0.2), borderColor: "#ccc"
  }, sectionTitle: {
    fontSize: wp(5), fontWeight: "700",
    marginLeft: wp(2), marginTop: wp(2),
  }, productCard: {
    borderRadius: wp(2),
    marginBottom:hp(2),
    // maxHeight:hp(100),
    // overflow: 'hidden',
    // margin: hp(1),
    // borderRadius: wp(5), marginHorizontal: wp(1), padding: wp(3),
    borderWidth: wp(0.6), borderColor: "#ccc",
    // marginBottom: wp(2),
  }, productImage: {
    position: "relative", bottom: hp(0.5),
    marginBottom: wp(2),
    width: wp(10), height: wp(40), borderRadius: wp(1), resizeMode: "contain",
  }, productName: {
    fontSize: wp(3.5), fontWeight: "bold", color: "#000",
    textTransform: "capitalize",
  }, variantCard: {
    padding: wp(2), borderRadius: wp(2), width: "100%",
    borderWidth: wp(0.1), borderColor: "#ccc",
  }, variantText: {
    fontSize: wp(3.2),
    fontWeight: "600",
  }, variantPrice: {
    fontSize: wp(3.5), fontWeight: "bold", color: "#009a44",
  },
  addButton: {
    paddingHorizontal: hp(0.6), paddingVertical: wp(0.1), borderRadius: wp(2), marginVertical: wp(1), 
    width: wp(36), borderWidth: wp(0.3),
    textAlign: "center",
  }, 
  addButtonText:{
      alignItems:"center"
  },qtyRow: { flexDirection: "row", alignItems: "center", marginVertical: wp(2) },
  qtyButton: {
    backgroundColor: "#E6FAF8", paddingHorizontal: wp(3),
    paddingVertical: wp(1), borderRadius: wp(1.5),
  }, qtyButtonText: {
    color: "#009a44", fontSize: wp(5), fontWeight: "bold",
  },
  qtyText: {
    marginHorizontal: wp(2), fontSize: wp(4), fontWeight: "700",
    color: "#000"
  }, bottomBar: {
    position: "absolute",
    bottom: hp(1), left: wp(2),
    right: wp(2), backgroundColor: "#009a44",
    borderRadius: 10, padding: wp(4), flexDirection: "row",
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
  icon:{
    position: "absolute",
    top:wp(12),
    right: wp(2),
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: wp(1),
    zIndex: 10,
  },
  off:{
        position: "absolute",
    top:wp(14),
    right: wp(1),
    zIndex: 10,
    backgroundColor: "#E5F9F5",
  paddingHorizontal: 6,
     paddingVertical: 2,
       borderRadius: wp(2),
           alignSelf: "flex-start",
         justifyContent: "center",
        alignItems: "center",
     borderWidth: 1,
      borderColor: "green"                                  

  }
});