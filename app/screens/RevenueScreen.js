import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  Image, TouchableOpacity, ToastAndroid, Pressable, ScrollView,
  Alert,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HeaderBar from '../components/header';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import CommonSearchContainer from './CommonSearchContainer';
import ProductVariantSelector from './ProductVariantSelector';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Storeloader from './Storeloader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RevenueScreen = () => {
  const { theme } = useTheme();
  const profile = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [productData, setProductData] = useState([]);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recentSearches,setRecentSearches] = useState([]);
  // Handle search input
  const handleSearch = (text) => {
    setSearchText(text);
    if(text.length === 0){
      fetchStores(0,'');
    }
    if ( text.length >= 2) {
      fetchStores(0, text);
    }
  };
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchStores(); // call your fetch API or function
    } catch (error) {
      console.log('Refresh error:', error);
    }
    setRefreshing(false);
  }, []);

  // Fetch stores and flatten products
  const fetchStores = useCallback(
  async (pageNumber = 0, searchValue = '') => {
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

    try {
      setLoading(true);
      const data = await fetchData('homesearch', 'POST', payload, {
        Authorization:` ${accessToken}`,
        user_id: profile.user_id,
        type: 'user',
      });

      if (data?.status === 'true') {
        const allProducts = data.product_list?.reduce((acc, store) => {
          const productsWithStore =
            store.item_list?.map(product => ({
              ...product,
              store_id: store.store_id,
              store_name: store.name,
            })) || [];
          return [...acc, ...productsWithStore];
        }, []);

        setProductData(allProducts || []);


      } else {
        setProductData([]);

      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  },
  [accessToken, profile?.user_id, searchText]
);
  // Fetch cart data
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

  // Check if product is in cart
  const isProductInCart = (product) => {
    if (!cartData?.items) return false;
    return cartData.items.some(
      (item) => item.item_id === product.item_id && item.store_id === product.store_id
    );
  };

  // Open variant selector
  const openVariantSelector = (product) => {
    setSelectedProduct(product);
    setVariantModalVisible(true);
  };

  // Add product to cart
  const addToCart = async (item) => {
    if (!profile?.primary_address || Object.keys(profile?.primary_address).length === 0) {
      navigation.navigate('SelectLocation');
      return;
    }
    try {
      const selected = item.selectedVariant || item.variant_list?.[0];
      const payload = {
        user_id: profile?.user_id,
        variant_index: item.variant_list?.findIndex(v => v.name === selected.name) || 0,
        item_id: item.item_id,
        store_id: item.store_id,
        type: 'add',
      };
      const response = await fetch('https://bringesse.com:3003/api/cart/update', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
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
        ToastAndroid.show(data.message || 'Failed to add item', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      ToastAndroid.show('Error adding item to cart', ToastAndroid.SHORT);
    }
  };
  const handleVariantSelect = (productWithVariant) => {
    setVariantModalVisible(false);
    addToCart(productWithVariant);
  };
  if (!loading) {
    <Storeloader />
  }

// recent search

useEffect(()=>{
  loadRecentSearch();
},[]);

const loadRecentSearch = async() =>{
  const save = await AsyncStorage.getItem('recentSearches');
  if(save){
    setRecentSearches(JSON.parse(save));
  }
};

const saveRecentSearch = async (text) => {
    const keyword = text.toLowerCase().trim();
    if(keyword.length < 3) return;

    let updated = [
      keyword,
      ...recentSearches.filter((item) => item !== keyword),
    ];

    updated = updated.slice(0, 5); // max 5

    setRecentSearches(updated);
    await AsyncStorage.setItem(
      "recentSearches",
      JSON.stringify(updated)
    );
  };

  const clearRecent = async () => {
    await AsyncStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };



  // Product Card for grid
  const ProductCard = ({ product }) => {
    const inCart = isProductInCart(product);
    const firstVariant = product.variant_list?.[0];
    const isOutOfStock = firstVariant?.['itemOutofStock '] == "1";
    const hasVariants = product.variant_list?.length > 1;
    // Alert.alert("vc",
    //   firstVariant?.['itemOutofStock'] 
    // )
    return (
      <Pressable
        disabled={isOutOfStock}
        style={[styles.productCard, { backgroundColor: COLORS[theme].background }]}
        onPress={() => {
          if(searchText.length >= 3){
            saveRecentSearch(product.name)
          }
          if (inCart) {
            ToastAndroid.show('Product already in cart', ToastAndroid.SHORT);
          } else if (product.variant_available === 'true') {
            openVariantSelector(product);
          } else {
            addToCart(product);
          }
        }}
      >
        {/* Out of Stock Overlay */}

        {isOutOfStock && (
          <View
            style={{
              position: 'absolute',
              top: hp(2),
              left: wp(2),
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: wp(2),
              paddingVertical: hp(0.5),
              borderRadius: wp(1),
              width: wp(28),
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            <Text
              style={{
                fontFamily: poppins.semi_bold.fontFamily,
                color: '#ff0000',
                textShadowColor: 'rgba(0,0,0,0.85)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
                fontSize: wp(3.2),
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              Out of Stock
            </Text>
          </View>
        )}
        {/* Product Image */}
        <Image
          source={{ uri: product.image_url || product.image }}
          style={[styles.productImage, { opacity: isOutOfStock ? 0.5 : 1 }]}
          resizeMode="contain"
        />
        {/* <Text style={{ color: "#000" }}>{JSON.stringify(product?.variant_list?.length, null, 2)}</Text> */}
        <View style={styles.productInfo}>
          <Text
            style={[poppins.semi_bold.h9, { color: COLORS[theme].textPrimary, textTransform: 'capitalize' }]}
            numberOfLines={1}
          >
            {product.name}
            {/* {JSON.stringify(product,null,2)} */}
          </Text>
          <Text style={[poppins.regular.h9, { color: COLORS[theme].textPrimary, marginTop: wp(0.5) }]}>
            {product.store_name}
          </Text>
          {inCart && <Text style={{ color: COLORS[theme].accent, marginTop: wp(1) }}>Already in Cart</Text>}
        </View>
        {/* Variant or Arrow */}
        {product?.variant_available === 'true' && !inCart && (
          <View style={{ flexDirection: "row", alignItems: 'center', marginTop: wp(1), opacity: isOutOfStock ? 0.2 : 1 }}>
            <Text style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}>View</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={wp(5)}
              color={COLORS[theme].textPrimary}
            />
          </View>
        )}
      
      </Pressable>
    );
  };
 const getSortedProducts = () => {
  if (searchText.length < 0 || recentSearches.length === 0) {
    return productData;
  }

  const recentProducts = [];
  const otherProducts = [];

  productData.forEach(product => {
    const name = product.name?.toLowerCase() || '';

    const matchedKeyword = recentSearches.find(keyword =>
      name.startsWith(keyword) || name.includes(keyword)
    );

    if (matchedKeyword) {
      recentProducts.push(product);
    } else {
      otherProducts.push(product);
    }
  });

  return [...recentProducts, ...otherProducts ];
};
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar title="Explore Products" showBackArrow />
      <View style={{ marginBottom: hp(1) }}>
        <CommonSearchContainer
          placeholder="Search Products..."
          onSearch={handleSearch}
          onSubmit={(text)=>{
            setSearchText(text)
            if ( text.length >= 3) {
              saveRecentSearch(text)
            fetchStores(0, text);
    }
          }}
        />
        {searchText.length === 0 && recentSearches.length > 0 && (
  <View style={styles.recentContainer}>
    <View style={styles.recentHeader}>
      <Text style={[poppins.semi_bold.h7, { color: COLORS[theme].textPrimary }]}>
        Recent Searches
      </Text>
      <Pressable onPress={clearRecent}>
        <Text style={{ color: COLORS[theme].accent }}>Clear</Text>
      </Pressable>
    </View>


      {recentSearches.map((item, index) => (
        <Pressable
          key={index}
          style={styles.recentItem}
          onPress={() => {
            setSearchText(item);
            fetchStores(0, item);
          }}
        >
          <MaterialCommunityIcons
            name="history"
            size={wp(6)}
            color={COLORS[theme].textPrimary}
          />
          <Text
            style={[poppins.regular.h8, { marginLeft: wp(2),marginRight:wp(0), color: COLORS[theme].textPrimary }]}
          >
            {item}
          </Text>
          {/* <MaterialCommunityIcons name='chevron-right' size={wp(6)} color={COLORS[theme].textPrimary}/> */}
        </Pressable>
      ))}
  </View>
)}
      </View>
      {
        !profile?.primary_address || Object.keys(profile?.primary_address).length == 0 && 
        (
          <View
            style={{
              paddingVertical: hp(1.5), paddingHorizontal: wp(5), borderRadius: wp(10), alignItems: 'center', justifyContent: 'center',
              elevation: 10,
            }}
          >
            <Text
              style={{
                color: '#FF0000',
                fontFamily: poppins.medium.fontFamily,
                fontSize: 16,
              }}
            >
              Add Address Before Shopping !
            </Text>
          </View>
        )}
      {loading ? (
        <Storeloader />
      ) : (
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={getSortedProducts()}
          keyExtractor={(item, index) => item.item_id || index.toString()}
          renderItem={({ item }) => <ProductCard  product={item} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: wp(3) }}
          contentContainerStyle={{ paddingBottom: hp(12), paddingTop: wp(2) }}
          ListEmptyComponent={
            !loading &&
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
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => navigation.navigate('Mycart', { showBackArrow: true })}
          >
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
  productCard: {
    flex: 1, marginBottom: wp(1), borderRadius: wp(2),
    padding: wp(2), shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    alignItems: 'center', margin: wp(1), borderWidth: wp(0.1), borderColor: "#CCC",
  },
  productImage: {
    width: "100%", height: wp(28), borderRadius: wp(2),
    backgroundColor: '#eee', marginBottom: wp(2),
  }, productInfo: {
    flex: 1,
  }, loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cartBar: {
    position: 'absolute', bottom: hp(2), left: wp(3), right: wp(3),
    paddingVertical: hp(1.5), paddingHorizontal: wp(4),
    borderRadius: wp(3), flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5,
  },
  viewCartButton: {
    backgroundColor: '#fff', paddingVertical: hp(0.5),
    paddingHorizontal: wp(3), borderRadius: wp(2),
  },
 recentContainer: {
  paddingHorizontal: wp(4),
  paddingBottom: hp(1),
  marginTop:hp(2),
},

recentHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: hp(2),
},

// recentList: {
//   flexDirection: 'row',
//   flexWrap: 'wrap',
// },

recentItem: {
  flexDirection: 'row',
  alignItems: 'center',
  // paddingHorizontal: wp(3),
  paddingVertical: hp(1),
  // borderRadius: wp(5),
  // borderWidth: 1,
  // borderColor: '#ccc',
  // marginRight: wp(2),
  // marginBottom: wp(2),
},
});

export default RevenueScreen;