import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Image, TouchableOpacity, ToastAndroid,
  Pressable,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import HeaderBar from '../components/header';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import CommonSearchContainer from './CommonSearchContainer';
import ProductVariantSelector from './ProductVariantSelector';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const RevenueScreen = () => {
  const { theme } = useTheme();
  const profile = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [storeData, setStoreData] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleSearch = (text) => {
    if (text.length < 3 && text.length > 0) {
      setSearchText(text);
      fetchStores(0, text);
    } else if (text.length === 0) {
      setSearchText("");
      fetchStores(0, "");
    }
  };
  const fetchStores = useCallback(
    async (pageNumber = 0, searchValue = searchText) => {
      if (!accessToken || !profile?.user_id) return;
      const payload = {
        user_id: profile.user_id,
        offset: pageNumber,
        limit: 10,
        search: searchValue,
        lat: profile?.primary_address?.lat,
        lon: profile?.primary_address?.lon,
        type: 'product',
      };
      const headers = {
        Authorization: `${accessToken}`,
        user_id: profile.user_id,
        type: 'user',
      };
      try {
        setLoading(true);
        const data = await fetchData('homesearch', 'POST', payload, headers);
        if (data?.status === 'true') setStoreData(data.product_list || []);
        else setStoreData([]);
      } catch (err) {
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, profile?.user_id, searchText]
  );
  const isProductInCart = (product, storeId) => {
    if (!cartData?.items) return false;
    return cartData.items.some(
      (item) => item.item_id === product.item_id && item.store_id === storeId
    );
  };

  const fetchCartCount = async () => {
    if (!accessToken || !profile?.user_id || !profile?.primary_address?.lat) return;
    try {
      const data = await fetchData(
        'cart/get',
        'POST',
        {
          user_id: profile?.user_id,
          lat: profile?.primary_address?.lat,
          lon: profile?.primary_address?.lon,
        },
        { Authorization: `${accessToken}`, user_id: profile?.user_id, type: 'user' }
      );
      console.log('Cart Data:', data.data?.items);

      if (data?.status === true) setCartData(data.data);
      else setCartData(null);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchStores(0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCartCount();
    }, [variantModalVisible, navigation])
  );
  const openVariantSelector = (product) => {
    setSelectedProduct(product);
    setVariantModalVisible(true);
  };
  const addToCart = async (item) => {
    if (!profile?.primary_address || Object.keys(profile.primary_address).length === 0) {
      navigation.navigate('SelectLocation');
      return;
    }
    try {
      const selected = item.selectedVariant || item.variant_list?.[0]; // pick default if no variant selected
      const payload = {
        user_id: profile?.user_id,
        variant_index: item.variant_list?.findIndex(v => v.name === selected.name) || 0,
        item_id: item.item_id,
        store_id: item.store_id, // now guaranteed
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
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
        fetchCartCount();
      } else {
        ToastAndroid.show(data.message || "Failed to add item", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      ToastAndroid.show("Error adding item to cart", ToastAndroid.SHORT);
    }
  };
  const handleVariantSelect = (productWithVariant) => {
    setVariantModalVisible(false);
    addToCart(productWithVariant);
  };
  
  const ProductCard = ({ product, storeId }) => {
    const productWithStore = { ...product, store_id: storeId };
    const inCart = isProductInCart(product, storeId);
    // console.log(product, 'product');
    return (
      <Pressable
        style={[
          styles.productCard,
          { backgroundColor: COLORS[theme].background }
        ]}
        onPress={() => {
          if (inCart) {
            ToastAndroid.show("Product already in cart", ToastAndroid.SHORT);
          } else if (product.variant_available === 'true') {
            openVariantSelector(productWithStore);
          } else {
            addToCart(productWithStore);
          }
        }}
      >
        <Image
          source={{ uri: product.image_url || product.image }}
          style={styles.productImage}
          resizeMode="contain"
        />
  
        <View style={styles.productInfo}>
  
          {/* PRODUCT NAME */}
          <Text
            style={[
              poppins.semi_bold.h7,
              { color: COLORS[theme].textPrimary, textTransform: "capitalize" }
            ]}
          >
            {product.name}
          </Text>
  
          {/* STOCK STATUS */}
          <Text
            style={[
              poppins.regular.h9,
              { color: COLORS[theme].textPrimary, marginTop: wp(1) }
            ]}
          >
            {product.stock_available === "true" ? "In Stock" : "Out Of Stock"}
          </Text>
          {/* HORIZONTAL VARIANT LIST */}
          {product.variant_available === "true" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 6 }}
              contentContainerStyle={{ flexDirection: "row", alignItems: "center" }}
            >
              {product.variant_list?.map((variant, index) => (
                <View
                  key={index}
                  style={{
                    paddingVertical: wp(1),
                    paddingHorizontal:  wp(4),
                    borderWidth: wp(0.3),
                    borderColor: "#ccc",
                    borderRadius: 6,
                    marginRight: 8,
                    backgroundColor: "#f4f4f4"
                  }}
                >
                  <Text style={ [poppins.regular.h9,{ color:"#000" }]}>
                    {variant.name} {variant.unit}
                  </Text>
                  <Text style={[poppins.semi_bold.h9,{ color:"#000" }]}>
                    ₹{variant.price}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
          {/* ALREADY IN CART */}
          {inCart && (
            <Text style={{ color: COLORS[theme].accent, marginTop: wp(1) }}>
              Already in Cart
            </Text>
          )}
        </View>
        {/* RIGHT CHEVRON ICON */}
        {product.variant_available === 'true' && !inCart && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={wp(6)}
            color={COLORS[theme].accent}
          />
        )}
      </Pressable>
    );
  };
  
  const renderStoreItem = ({ item: store }) => (
    <View style={[styles.cardContainer, { backgroundColor: COLORS[theme].cardBackground }]}>
      <Text style={[poppins.semi_bold.h7, { color: COLORS[theme].textPrimary, margin: wp(2), textTransform: "capitalize" }]}>
        {store.name}
      </Text>
      <FlatList
        data={store.item_list}
        renderItem={({ item: product }) => (
          <ProductCard product={product} storeId={store.store_id} />
        )}
        keyExtractor={(prod, idx) => prod.item_id || idx.toString()}
        scrollEnabled={false}
      />
    </View>
  );
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title={"Stores"} showBackArrow={true} />
      <View style={{ marginBottom: hp(1) }}>
        <CommonSearchContainer placeholder="Search stores or products..." onSearch={handleSearch} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS[theme].accent} />
        </View>
      ) : (
        <FlatList
          data={storeData}
          keyExtractor={(item, index) => item.store_id || index.toString()}
          renderItem={renderStoreItem}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: hp(12) }]}
          ListEmptyComponent={
            <View style={{ padding: wp(5), alignItems: 'center' }}>
              <Text style={[poppins.regular.h7, { color: COLORS[theme].textPrimary }]}>
                No items found
              </Text>
            </View>
          }
        />
      )}
      {cartData?.items?.length > 0 && (
        <View style={[styles.cartBar, { backgroundColor: COLORS[theme].accent }]}>
          <Text style={[poppins.semi_bold.h7, { color: '#fff' }]}>
            {cartData?.items?.length} item{cartData?.items?.length > 1 ? 's' : ''} in cart
          </Text>
          <TouchableOpacity style={styles.viewCartButton} onPress={() => navigation.navigate("Mycart", { showBackArrow: true })}>
            <Text style={[poppins.semi_bold.h7, { color: COLORS[theme].accent }]}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
      {selectedProduct && (
        <ProductVariantSelector
          theme={theme}
          visible={variantModalVisible}
          product={selectedProduct}
          onClose={() => setVariantModalVisible(false)}
          onSelect={handleVariantSelect}
        />
      )}
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: wp(3), paddingBottom: hp(8) },
  cardContainer: {
    padding: wp(2), marginBottom: wp(1), borderRadius: wp(1), shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
    elevation: 1,
  },
  productCard: {
    flexDirection: "row", marginBottom: wp(3),
    padding: wp(1), borderRadius: wp(2), shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, alignItems: "center"
  }, productImage: { width: wp(18), height: wp(18), borderRadius: wp(2), marginRight: wp(3), backgroundColor: "#eee" }, productInfo: { flex: 1, justifyContent: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  cartBar: {
    position: 'absolute', bottom: hp(2), left: wp(3),
    right: wp(3), paddingVertical: hp(1.5), paddingHorizontal: wp(4),
    borderRadius: wp(3), flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', elevation: 5, shadowColor: '#000',
    shadowOpacity: 0.2, shadowRadius: 5,
  },
  viewCartButton: {
    backgroundColor: '#fff', paddingVertical: hp(0.5),
    paddingHorizontal: wp(3), borderRadius: wp(2),
  },
});
export default RevenueScreen;
