import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert,
  ScrollView, ToastAndroid,
  TextInput,
} from 'react-native';
import UseProfileHook from '../hooks/profile-hooks';
import { useSelector } from 'react-redux';
import { hp, wp } from '../resources/dimensions';
import HeaderBar from '../components/header';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { poppins } from '../resources/fonts';
import { fetchData } from '../api/api';
import SingleSelectModal from '../components/header/SingleSelect';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
export default function CartList({ route }) {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const { showBackArrow } = route.params || {};
  const { profile } = UseProfileHook();
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  const { theme } = useTheme();

  const [vehcileTypes, setVehcileTypes] = useState([]); // ✅ store list
  const [selectedVehicle, setSelectedVehicle] = useState(null); // ✅ store selected one
  const [showVehicleModal, setShowVehicleModal] = useState(false); // ✅ control modal

  const [cartSummary, setCartSummary] = useState([]);
  const [taxSummary, setTaxSummary] = useState([]);
  const [showtaxSummary, setShowTaxSummary] = useState(false);

  const [grandTotal, setGrandTotal] = useState(0);
  const [cdata, setcdata] = useState(null);





  // ✅ Fetch Cart Data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchVehicleType();

      const response = await fetch('https://bringesse.com:3003/api/cart/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile?.user_id,
          lat: profileDetails?.primary_address?.lat,
          lon: profileDetails?.primary_address?.lon,
          vehcileTypes: selectedVehicle?.value || '',
        }),
      });
      const data = await response.json();
      // console.log(JSON.stringify(data.data.grand_total));
      if (data?.status && Array.isArray(data?.data?.items)) {
        setcdata(data?.data)
        console.log('cart data', JSON.stringify(cdata));
        const formatted = data.data.items.map(item => {
          const variant = item.selected_variant || {};
          const isOffer = variant.offer_available === 'true';
          return {
            id: item.item_id || Math.random().toString(),
            name: item.name || 'Unknown Item',
            price: isOffer ? variant.offer_price : variant.price,
            originalPrice: variant.price,
            qty: item.qty || 1,
            image: item.image || 'https://via.placeholder.com/80x80.png?text=No+Image',
            unit: variant.unit || '',
            offer: isOffer,
            subTotal: item.sub_total || 0,
            variantIndex: item.variant_index || 0,
            storeId: item.store_id,
            // grandTotal: data.data.grand_total || 0,
          };
        });
        console.log('✅ Fetched Cart Items:', data?.data);
        setItems(formatted);
        setGrandTotal(data.data.grand_total)
        setStoreId(data.data.storeDetails?._id);
        setCartSummary(data?.data?.charges);
        // Alert.alert(JSON.stringify(profileDetails?.primary_address));
        setTaxSummary(data?.data?.taxes);
      } else {
        setItems([]);
        ToastAndroid.show(data?.message || 'Cart is empty', ToastAndroid.SHORT);
        setError('No items found in your cart.');
      }
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Vehicle Types
  const fetchVehicleType = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData('getdeliveryvehicles/', 'GET', null, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      setVehcileTypes(
        data?.data?.result?.map(item => ({
          label: item.name,
          value: item._id,
        })) || []
      );
    } catch (error) {
      console.error('getdeliveryvehicles API Error:', error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [profileDetails?.primary_address?.lat, selectedVehicle])
  );

  // ✅ Handle Razorpay Payment
  const handlePayment = async () => {
    if (!selectedVehicle) {
      Alert.alert('Please select a vehicle type before proceeding.');
      return;
    }
    if (!profileDetails?.primary_address?.lon) {
      navigation.navigate('SelectLocation');
      return;
    }
    try {
      const amount = grandTotal;
      const currency = 'INR';
      const user_id = profile?.user_id;

      const response = await fetch('https://bringesse.com:3003/api/createnonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
          user_id: user_id,
          type: 'user',
        },
        body: JSON.stringify({ amount, currency, user_id }),
      });
      const data = await response.json();
      // Alert.alert('Payment Data', JSON.stringify(data));
      if (data?.status !== "true") {
        throw new Error('Failed to create payment order');
      }
      const { amount: orderAmount, order_id } = data;
      const options = {
        description: 'Bringesse Order Payment',
        currency: 'INR',
        key: 'rzp_test_RTea60R3z2WHEn',
        amount: orderAmount,
        name: 'Bringesse',
        order_id,
        prefill: {
          contact: profile?.phone_no,
          name: 'Customer',
        },
        theme: { color: '#00BFA6' },
      };
      RazorpayCheckout.open(options)
        .then(paymentResponse => {
          // Alert.alert('Payment Successful', `Payment ID: ${JSON.stringify(data)}`);
          sendPayment(paymentResponse)
          // Alert.alert('Payment Successful', `Payment ID: ${data.razorpay_payment_id}`);
          // ToastAndroid.show('Payment Successful!', ToastAndroid.SHORT);

        })
        .catch(error => {
          // Alert.alert('Payment Failed', error.description || 'Transaction cancelled.');
          ToastAndroid.show('Payment Failed!', ToastAndroid.SHORT);

        });
    } catch (error) {
      // Alert.alert('Error', 'Something went wrong while initiating payment.');
    }
  };


  const sendPayment = async (paymentResponse) => {
    if (!accessToken || !profile?.user_id) return;

    try {
      // 🧾 Format cart items dynamically
      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        qty: item.qty,
        image: item.image,
        unit: item.unit,
        offer: item.offer,
        subTotal: item.subTotal,
        variantIndex: item.variantIndex,
      }));

      // 🧾 Format tax summary dynamically
      const formattedTaxes = taxSummary?.map(tax => ({
        name: tax.name || "",
        percentage: tax.percentage || 0,
        amount: tax.amount || 0,
      })) || [];

      const payload = {
        // Stringified arrays
        items: JSON.stringify(formattedItems),
        taxes: JSON.stringify(formattedTaxes),
        categoryoffer_info: JSON.stringify(cdata?.categoryoffer_info || []),
        // Direct values
        admin_offer: cdata?.admin_offer || 0,
        category_offer: cdata?.category_offer || 0,
        store_id: storeId,
        user_id: profile?.user_id,
        currency_code: "INR",
        currency_symbol: "₹",
        grand_total: cdata?.grand_total || grandTotal || 0,
        cash_price: cdata?.grand_total || grandTotal || 0,
        packing_charge: cdata?.packing_charge || 0,
        item_count: items?.length || 0,
        tax_total: cdata?.tax_total || formattedTaxes.reduce((sum, t) => sum + Number(t.amount || 0), 0),
        sub_total: cdata?.sub_total || 0,
        wallet_amount: cdata?.wallet_amount || 0,
        wallet_used: cdata?.wallet_used || false,
        payment_type: "razorpay",
        delivery_address: profileDetails?.primary_address?.location || "",
        delivery_charge: cdata?.delivery_charge || 0,
        distance: cdata?.distance || 0,
        delivery_type: selectedVehicle?.label || "Delivery",
        razorpay_payment_id: paymentResponse?.razorpay_payment_id || "test_payment_id",
        razorpay_order_id: paymentResponse?.razorpay_order_id || "test_order_id",
        razorpay_signature: paymentResponse?.razorpay_signature || "test_signature",
      };
      console.log("📦 Sending PayOrder Payload:", JSON.stringify(payload, null, 2));
      const response = await fetch("https://bringesse.com:3003/api/payorder/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: "user",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("✅ payorder response:", data);
      if (data?.status === "true") {
        // Alert.alert("✅ Order Successful", "Your payment and order have been confirmed!");
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
        navigation.replace("OrdersHistory");
      } else {
        Alert.alert("⚠️ Order Failed", data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("❌ payorder API Error:", error);
      Alert.alert("Error", "Something went wrong while sending payment data.");
    }
  };

  // ✅ Update Cart Quantity
  const updateCart = async (item, type) => {
    try {
      const payload = {
        user_id: profile?.user_id,
        variant_index: item.variantIndex || 0,
        item_id: item.id,
        store_id: storeId,
        type,
      };

      const response = await fetch('https://bringesse.com:3003/api/cart/update', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data?.data?.items.length === 0) navigation.replace('home-screen');
      if (data?.status) fetchCart();
      else Alert.alert('Failed', data?.message || 'Unable to update cart.');
    } catch (error) {
      Alert.alert('Error', 'Error updating cart!');
    }
  };
  const changeQty = (item, delta) => {
    if (delta === 1) updateCart(item, 'add');
    else if (delta === -1) updateCart(item, 'remove');
  };
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <HeaderBar title="My Cart" showBackArrow={showBackArrow} />
        <ActivityIndicator size={wp(4)} color={COLORS[theme].primary} style={{ marginVertical: wp(1) }} />
      </View>
    );
  }
  // ✅ Render each cart item
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, {
          color: COLORS[theme].black, maxWidth: wp(48), textTransform: "capitalize"
        }]}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          {item.offer && (
            <Text style={styles.strikePrice}>₹{item.originalPrice}</Text>
          )}
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
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <HeaderBar title={`${cdata?.storeDetails?.name ? cdata?.storeDetails?.name : ''}` || 'My Cart'} subMenu={cdata?.storeDetails?.address || ''} showBackArrow={showBackArrow}
        showRightArrow={"cart"}
        onRightArrowPress={() => navigation.navigate('OrdersHistory')}
      />
      {/* <HeaderBar
        showBackArrow={true}
        title="Orders History"
        // subMenu="Your past purchases"
        // showRightArrow={"cart"}
        // onRightArrowPress={() => navigation.navigate('Settings')}
      /> */}
      {/* {loading && (<ActivityIndicator size={wp(4)} color={COLORS[theme].primary} style={{ marginVertical: wp(1) }} />)} */}
      {!loading && items.length === 0 ? (
        <View style={styles.centerScreen}>
          <Text style={[poppins.semi_bold.h4, { color: COLORS[theme].primary }]}>
            Your cart is empty!
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
          {/* ✅ Vehicle Type Selector */}
          <TouchableOpacity
            onPress={() => {
              // Alert.alert('🚗 Opening vehicle modal...');
              setShowVehicleModal(true);
            }}
            style={styles.vehicleSelector}
          >
            <Text style={[poppins.regular.h5, styles.vehicleText, { color: COLORS[theme].primary }]}>
              {vehcileTypes?.length == 0 ? "No Vehicles" : selectedVehicle ? selectedVehicle.label : 'Choose Vehicle Type'}
            </Text>
            <MaterialIcons name="edit" size={wp(7)} color={COLORS[theme].primary} />
          </TouchableOpacity>

          <View style={styles.detailsContainer}>
            {
              !selectedVehicle?.value && (
                <Text style={[poppins.semi_bold.h9, { color: COLORS[theme].validation, marginBottom: wp(2) }]}>
                  Please select a vehicle type to see the charges details.
                </Text>
              )
            }
            {
              selectedVehicle?.value && cartSummary?.length != 0 &&
              <Text style={[styles.detailsTitle, { color: COLORS[theme].primary }]}>
                Item Details
              </Text>
            }
            {selectedVehicle?.value && cartSummary?.length != 0 && cartSummary?.map((detail, index) => (
              <>
                <TouchableOpacity
                  key={index}
                  style={styles.detailsRow}
                  onPress={() =>
                    detail.key === 'totalTaxAmount' && setShowTaxSummary(!showtaxSummary)
                  }
                >
                  <Text style={[styles.detailLabel, { color: COLORS[theme].primary }]}>
                    {detail.label}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {detail.key === 'totalTaxAmount' && (
                      <MaterialCommunityIcon
                        name={showtaxSummary ? 'chevron-up' : 'chevron-down'}
                        size={wp(6)}
                        color={COLORS[theme].primary}
                        style={{ marginLeft: 5 }}
                      />
                    )}
                    <Text style={[styles.detailLabel, { color: COLORS[theme].primary }]}>
                      ₹ {detail.value}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ))}
          </View>
          {/* Tax Details Section */}
          {showtaxSummary && (
            <View style={styles.detailsContainer}>
              <Text style={[styles.detailsTitle, { color: COLORS[theme].primary }]}>
                Tax Details
              </Text>
              {taxSummary?.map((detail, index) => (
                <View key={index} style={styles.detailsRow}>
                  <Text style={[styles.detailLabel, { color: COLORS[theme].primary }]}>
                    {detail?.name}
                    {detail?.percentage ? ` (${detail?.percentage}%)` : ''}
                  </Text>
                  <Text style={[styles.detailLabel, { color: COLORS[theme].primary }]}>
                    ₹ {detail?.amount}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ✅ Address Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp(4) }}>
            <Text
              style={[
                poppins.regular.h8,
                { color: COLORS[theme].primary, maxWidth: wp(74) },
              ]}
            >
              {profileDetails?.primary_address?.location}
            </Text>
            <MaterialIcons
              onPress={() => navigation.navigate('SelectLocation')}
              name="edit"
              size={wp(7)}
              color={COLORS[theme].primary}
            />
          </View>
          {/* <SelectionModal visible={true} data={vehcileTypes} /> */}

          <SingleSelectModal
            visible={showVehicleModal}
            data={vehcileTypes} // [{ label: 'Bike', value: '1' }, ...]
            title="Select Vehicle Type"
            selectedValue={selectedVehicle?.value}
            onSelect={setSelectedVehicle}
            onDismiss={() => setShowVehicleModal(false)}
          />
          {/* ✅ Pay Button */}
          <TouchableOpacity onPress={() => { selectedVehicle?.value && handlePayment() }} style={styles.payButton}>
            <Text style={[styles.payButtonText, {
              fontSize: !selectedVehicle?.value ? wp(4) : wp(5)
            }]}>
              {!selectedVehicle?.value ? 'Select Vehicle to Pay' : `Pay ₹ ${grandTotal}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: wp(1) },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: wp(1), borderRadius: wp(1), marginBottom: wp(0.5) },
  image: { width: wp(15), height: wp(15), borderRadius: wp(7), marginRight: wp(4) },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  itemSub: { fontSize: 13, marginTop: 2, color: '#666' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', marginRight: 6, color: '#000' },
  strikePrice: { fontSize: 13, color: '#999', textDecorationLine: 'line-through' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#000' },
  qtyValue: { width: 25, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#000' },
  separator: { height: 1, backgroundColor: '#F2F2F2' },
  detailsContainer: { marginTop: 16, paddingVertical: 10, borderColor: '#EEE', padding: wp(4) },
  detailsTitle: { fontSize: wp(3.5), fontWeight: '700', marginBottom: wp(2) },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: wp(1) },
  detailLabel: { fontSize: wp(3), },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 8 },
  grandTotalLabel: { fontSize: 16, fontWeight: '700' },
  grandTotalValue: { fontSize: 16, fontWeight: '700' },
  payButton: {
    backgroundColor: '#00C2CB',
    paddingVertical: 14,
    borderRadius: wp(2),
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: wp(4),
  },
  payButtonText: { color: '#FFF', fontWeight: '700' },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vehicleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: wp(1),
    padding: wp(2),
    marginHorizontal: wp(2),
    marginTop: wp(3),
  },
  couponView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: wp(1),
    // padding: wp(2),
    marginHorizontal: wp(2),
    marginTop: wp(3),
    height: hp(6),
    paddingHorizontal: wp(2)
  },
  vehicleText: { fontSize: wp(4.5), textTransform: "capitalize", maxWidth: wp(70), lineHeight: hp(4) },
});