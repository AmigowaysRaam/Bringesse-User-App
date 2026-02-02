import React, { useContext ,useState} from 'react';
import { View,Text,  FlatList,  TouchableOpacity,  StyleSheet,  Image,ToastAndroid} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WishlistContext } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { wp, hp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderBar from '../components/header';
import ProductDetailModal from './ProductDetailModal';
import { useSelector } from 'react-redux';
import UseProfileHook from "../hooks/profile-hooks";


const WishlistScreen = ({}) => {


  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { theme } = useTheme();
  const [selProductData, setselProductData] = useState(null);
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const navigation = useNavigation();
  const { profile } = UseProfileHook();
  // const route = useRoute()
  //   const { storeId } = route.params;
      const accessToken = useSelector(state => state.Auth.accessToken);
      const [cartItems,setCartItems] =useState({})

//  const addToCart = async (item) => {
//     if (!profile?.primary_address || Object.keys(profile?.primary_address).length === 0) {
//       navigation.navigate('SelectLocation');
//       return;
//     }
//     try {
//       const selected = item.selectedVariant || item.variant_list?.[0];
//       const payload = {
//         user_id: profile?.user_id,
//         variant_index: item.variant_list?.findIndex(v => v.name === selected.name) || 0,
//         item_id: item.item_id,
//         store_id: item.store_id,
//         type: 'add',
//       };
//       const response = await fetch('https://bringesse.com:3003/api/cart/update', {
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//           Authorization: `${accessToken}`,
//           user_id: profile?.user_id,
//           type: 'user',
//         },
//         body: JSON.stringify(payload),
//       });
//       const data = await response.json();
//       if (data?.status) {
//         ToastAndroid.show(data?.message, ToastAndroid.SHORT);
//         // fetchCartCount();
//       } else {
//         ToastAndroid.show(data.message || 'Failed to add item', ToastAndroid.SHORT);
//       }
//     } catch (error) {
//       console.error('Add to Cart Error:', error);
//       ToastAndroid.show('Error adding item to cart', ToastAndroid.SHORT);
//     }
//   };

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
        store_id:item.store_id,
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
          ToastAndroid.show('Product Added to Cart',ToastAndroid.SHORT)
          // updateCartSummary(updated);
          return updated;
        });
      } else ToastAndroid.show(data.message, ToastAndroid.SHORT);
    } catch { }
  };


  const renderItem = ({ item}) => {
    // const image =
    // //  now revenue addtowishlist image show ony in screencard not show in modal but in product
    //   item?.image_url?.[0] ||
    //   item?.variant_list?.[0]?.image ||
    //   'https://via.placeholder.com/150';
  //     const image =
  // item?.image ||                  // ✅ normalized image
  // item?.image_url ||              // ✅ backend image
  // item?.variant_list?.[0]?.image || // fallback
  // 'https://via.placeholder.com/150';

  const image =
  typeof item?.image === 'string'
    ? item.image
    : typeof item?.image_url === 'string'
    ? item.image_url
    : typeof item?.variant_list?.[0]?.image === 'string'
    ? item.variant_list[0].image
    : typeof  item?.image_url?.[0] === 'string'
    ?  item?.image_url?.[0]
    : 'https://via.placeholder.com/150';


    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() =>
          setselProductData(item)
        }
      >
        <LinearGradient
          colors={
            theme === 'dark'
              ? ['#2c2c2c', '#1f1f1f']
              : ['#ffffff', '#f3f4f6']
          }
          style={styles.card}
        >

          {/*  Remove Icon */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => removeFromWishlist(item.item_id)}
          >
            <MaterialCommunityIcon
              name="heart"
              size={wp(5)}
              color="red"
            />
          </TouchableOpacity>

          {/*  Image */}
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />

          {/*  Product Info */}
          <View style={{ marginTop: hp(1) }}>
            <Text
              numberOfLines={1}
              style={[
                poppins.semi_bold.h7,
                { color: COLORS[theme].textPrimary },
              ]}
            >
              {item.name}
            </Text>

             {item.variant_list?.length > 0 && (
                            <Text style={styles.unit}>
                              {item.variant_list[0].name} {item.variant_list[0].unit}
                            </Text>
                          )}
                          <View style={styles.priceRow}>
                            <Text style={[styles.price,{color: COLORS[theme].textPrimary}]}>
                              ₹{item.variant_list?.[0]?.offer_price ||
                                item.variant_list?.[0]?.price}
                            </Text>
                            {item.offer_available === "true" && (
                              <Text style={styles.oldPrice}>
                                ₹{item.variant_list?.[0]?.price}
                              </Text>
                            )}
                            </View>
                            {item.offer_available === "true" && (
                                                                <Text
                                                                  style={[styles.off ,{color:'green',fontWeight:900}]}
                                                                >
                                                                  {item.variant_list?.[0]?.offer_percentage}OFF
                                                                </Text>
                                                            )}
          </View>
        </LinearGradient>
              <ProductDetailModal
        productData={selProductData}
        storeId ={selProductData?.store_id}
        addCart={addToCart}
        close={() => setselProductData(null)}
      />
      </TouchableOpacity>
      
    );
  };
  

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: COLORS[theme].background },
      ]}
    >
      {/*  Header */}

       <HeaderBar showBackArrow title='Wishlist'/>

      {/* 📋 List */}
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcon
            name="heart-off-outline"
            size={wp(18)}
            color={COLORS[theme].tabInActive}
          />
          <Text
            style={[
              poppins.semi_bold.h6,
              { color: COLORS[theme].tabInActive, marginTop: hp(2) },
            ]}
          >
            No items in wishlist
          </Text>
          <Text
            style={[
              poppins.regular.h7,
              { color: COLORS[theme].tabInActive, marginTop: hp(1) },
            ]}
          >
            Add products you love ❤️
            </Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.item_id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: hp(4) }}
        />
      )}

    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2),
  },
  cardWrapper: {
    width: '49.5%',
    marginBottom: hp(2),
  },
  card: {
   
    padding: wp(3),
    elevation: 4,
  },
  image: {
    width: '100%',
    height: hp(14),
    borderRadius: wp(2),
  },
  heartBtn: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: wp(5),
    padding: wp(1),
    elevation: 5,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
    name: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  unit: { fontSize: 13, color: "#555", marginVertical: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { fontSize: 18, fontWeight: "bold" },
  oldPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  off:{
        position: "absolute",
    top:hp(3),
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