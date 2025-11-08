import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';
import {
  View, Text,
  StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView,
  Image, StatusBar, ActivityIndicator,
  Alert, ScrollView,
  BackHandler,
} from 'react-native';
import UseProfileHook from '../hooks/profile-hooks';
import { useSelector } from 'react-redux';
import { wp } from '../resources/dimensions';
import HeaderBar from '../components/header';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { poppins } from '../resources/fonts';

export default function CartList({route}) {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const {showBackArrow} = route.params || false;
  const { profile } = UseProfileHook();
  // console.log('userId', profile);
  const { theme } = useTheme();
  const [cartSummary, setCartSummary] = useState({
    subTotal: 0,
    packingCharge: 0,
    taxes: [],
    grandTotal: 0,
  });

  // useEffect(() => {
  //   const backAction = () => {
  //     return true;  // Prevent the default back action
  //   };
  //   // Add the back press listener
  //   BackHandler.addEventListener('hardwareBackPress', backAction);

  //   // Cleanup listener on component unmount
  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', backAction);
  //   };
  // }, []);

  // ✅ Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://bringesse.com:3003/api/cart/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: profile?.user_id }),
      });
      const data = await response.json();
      console.log('🛒 Cart API Response:', data);
      if (data?.status && Array.isArray(data?.data?.items)) {
        const formatted = data.data.items.map(item => {
          const variant = item.selected_variant || {};
          const isOffer = variant.offer_available === 'true';
          return {
            id: item.item_id || Math.random().toString(),
            name: item.name || 'Unknown Item',
            price: isOffer ? variant.offer_price : variant.price,
            originalPrice: variant.price,
            qty: item.qty || 1,
            editable: true,
            image:
              item.image ||
              'https://via.placeholder.com/80x80.png?text=No+Image',
            unit: variant.unit || '',
            offer: isOffer,
            subTotal: item.sub_total || 0,
            variantIndex: item.variant_index || 0,
            storeId: item.store_id,
          };
        });

        setItems(formatted);
        setStoreId(data.data.storeDetails?._id);

        // ✅ Set summary details
        setCartSummary({
          subTotal: data.data.item_total || 0,
          packingCharge:
            data.data.storeDetails?.packingCharge || data.data.packing_charge || 0,
          taxes: data.data.taxes || [],
          grandTotal: data.data.grand_total || 0,
        });
      } else {
        setItems([]);
        setError('No items found in your cart.');
      }
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);
  const handlePayment = async () => {
    try {
      // Assuming you already have grandTotal and user_id
      const amount = cartSummary.grandTotal; // e.g., 6299.5
      const currency = 'INR';
      const user_id = profile?.user_id; // from context or your state

      // 1️⃣ Create order/nonce from backend
      const response = await fetch('https://bringesse.com:3003/api/createnonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken,
          'user_id': user_id,
          'type': 'user'
        },
        body: JSON.stringify({
          amount,
          currency,
          user_id,
        }),
      });

      const data = await response.json();
      console.log('🧾 Nonce API Response:', data);

      if (!data?.status === 'true') {
        throw new Error('Failed to create payment order');
      }
      console.log('number', data);
      const { amount: orderAmount, currency: orderCurrency, order_id, key_id } = data;
      console.log(data);
      // 2️⃣ Open Razorpay checkout
      const options = {
        description: 'Bringesse Order Payment',
        currency: 'INR',
        key: 'rzp_test_RTea60R3z2WHEn',
        amount: orderAmount,
        name: 'Bringesse Store',
        order_id: order_id,
        prefill: {

          contact: profile?.phone_no,
          name: "customerName",
        },
        theme: { color: '#00BFA6' },
      };
      console.log('razorPay', options);
      // Open Razorpay Checkout
      RazorpayCheckout.open(options)
        .then(data => {
          // ✅ Payment Success
          Alert.alert('Payment Successful', `Payment ID: ${data.razorpay_payment_id}`);
          console.log('✅ Razorpay Success:', data);
        })
        .catch(error => {
          // ❌ Payment Failed or Cancelled
          console.error('❌ Razorpay Error:', error);
          Alert.alert('Payment Failed', error.description || 'Transaction cancelled.');
        });

    } catch (error) {
      console.error('❌ Payment Init Error:', error);
      Alert.alert('Error', 'Something went wrong while initiating payment.');
    }
  };
  // ✅ Update cart
  const updateCart = async (item, type) => {
    try {
      const payload = {
        user_id: profile?.user_id,
        variant_index: item.variantIndex || 0,
        item_id: item.id,
        store_id: storeId,
        type, // "add" or "remove"
      };
      console.log('🛒 Cart Update Payload:', payload);
      const response = await fetch('https://bringesse.com:3003/api/cart/update', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('🛒 Cart Update Response:', data);
      if (data?.data?.items.length == 0) {
        // navigation.goBack();
        navigation.replace('home-screen');
      }
      if (data?.status) {
        fetchCart();
      } else {
        Alert.alert('Failed', data?.message || 'Unable to update cart.');
      }
    } catch (error) {
      console.error('❌ Cart Update Error:', error);
      Alert.alert('Error', 'Error updating cart!');
    }
  };
  const changeQty = (item, delta) => {
    if (delta === 1) updateCart(item, 'add');
    else if (delta === -1) updateCart(item, 'remove');
  };

  // ✅ Render each cart item
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.unit}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.strikePrice}>₹{item.originalPrice}</Text>
        </View>
      </View>
      <View style={styles.qtyBox}>
        <TouchableOpacity onPress={() => changeQty(item, -1)} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.qty}</Text>
        <TouchableOpacity onPress={() => changeQty(item, 1)} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
 
  return (
    <SafeAreaView style={[styles.container, {
      backgroundColor: COLORS[theme].background
    }]}>
      <HeaderBar title="My Cart" showBackArrow={showBackArrow} />
      {items.length == 0 ?
        <View style={styles.centerScreen}>
          <Text style={[poppins.semi_bold.h4, { color: COLORS[theme].primary }]}>Your cart is empty!</Text>
        </View>
        :
        <ScrollView showsVerticalScrollIndicator={false}>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
          {/* ✅ Item Details Section */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Item Details</Text>
            {/* Subtotal */}
            <View style={styles.detailsRow}>
              <Text style={[styles.detailLabel, {
                color: COLORS[theme].text
              }]}>Sub Total</Text>
              <Text style={[styles.detailLabel, {
                color: COLORS[theme].text
              }]}>₹{cartSummary.subTotal.toFixed(2)}</Text>
            </View>

            {/* Packing Charge */}
            <View style={styles.detailsRow}>
              <Text style={[styles.detailLabel, {
                color: COLORS[theme].text
              }]}>Packing Charge</Text>
              <Text style={[styles.detailLabel, {
                color: COLORS[theme].text
              }]}>₹{cartSummary.packingCharge.toFixed(2)}</Text>
            </View>

            {/* Taxes */}
            {/* {cartSummary.taxes.map((tax, index) => (
            <View key={index} style={styles.detailsRow}>
              <Text style={[styles.detailLabel, {
                color: COLORS[theme].text
              }]}>
                {tax.name} ({tax.percentage}%)
              </Text>
              <Text style={[styles.detailLabel, {
                color: COLORS[theme].text
              }]}>₹{tax.amount.toFixed(2)}</Text>
            </View>
          ))} */}

            <View style={styles.divider} />

            {/* Grand Total */}
            <View style={styles.detailsRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{cartSummary.grandTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Proceed to Pay */}
          <TouchableOpacity
            handlePayment
            onPress={handlePayment}
            style={styles.payButton}>
            <Text style={styles.payButtonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </ScrollView>
      }


    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: wp(1) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF',
  },
  backButton: { marginRight: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: wp(3), borderRadius: wp(1)
  },
  image: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  itemSub: { fontSize: 13, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, color: '#000' },
  price: { fontSize: 15, fontWeight: '700', marginRight: 6, color: '#000' },
  strikePrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#000' },
  qtyValue: { width: 25, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#000' },
  separator: { height: 1, backgroundColor: '#F2F2F2', color: '#000' },

  detailsContainer: {
    marginTop: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: { fontSize: 14, color: '#444' },
  detailValue: { fontSize: 14, color: '#000' },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 8,
  },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  grandTotalValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  payButton: {
    backgroundColor: '#00C2CB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
  },
});
