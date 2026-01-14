import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RazorpayCheckout from 'react-native-razorpay';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, ScrollView, ToastAndroid, NativeModules, NativeEventEmitter,
  TouchableWithoutFeedback, RefreshControl,
  BackHandler, Pressable,
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
import HyperSDK from "hyper-sdk-react";
import ApplyCoupon from './ApplyCoupon';
import CouponModal from '../components/header/CouponModal';
import UserConfirmPayment from './UserConfirmPayment';
import CartItem from './CartItem';
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
  const [chargesSentPay, setchargesSentPay] = useState([]);
  const [selectedVariant, setselectedVariant] = useState(null);
  const [taxSummary, setTaxSummary] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [cdata, setcdata] = useState(null);
  const [showCouponArr, setshowCouponArr] = useState(false);
  const siteDetails = useSelector(state => state.Auth.siteDetails);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponList, setcouponList] = useState([]); // ✅ store list
  const [isAccepted, setIsAccepted] = useState(false); // ✅ user acceptance
  const [showConfirm, setshowConfirm] = useState(false); // ✅ user acceptance
  // ✅ Fetch Cart Data


  const fetchCart = async () => {
    fetchVehicleType();
    if (!profileDetails?.primary_address?.lat || !profileDetails?.primary_address?.lat) {
      setLoading(false);
      return
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://bringesse.com:3003/api/cart/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken ? `${accessToken}` : '',
          user_id: profile?.user_id || '',
          type: 'user',
        },
        body: JSON.stringify({
          user_id: profile?.user_id,
          lat: profileDetails?.primary_address?.lat,
          lon: profileDetails?.primary_address?.lon,
          vehcileTypes: selectedVehicle?.value || '',
          couponCode: appliedCoupon?.code || '',
        }),
      });
      const data = await response.json();
      if (data?.status && Array.isArray(data?.data?.items)) {
        setGrandTotal(data?.data?.grand_total)
        setcouponList(cdata?.availableCoupons)
        setcdata(data?.data)
        fetchVehicleType();
        const formatted = data.data.items.map(item => {
          const variant = item.selected_variant || {};
          const isOffer = variant.offer_available === 'true';
          return {
            selectedVariant: variant,
            id: item?.item_id,
            name: item.name || 'Unknown Item',
            price: isOffer ? variant.offer_price : variant.price,
            originalPrice: item.originalPrice,
            qty: item.qty || 1,
            image: item.image || 'https://via.placeholder.com/80x80.png?text=No+Image',
            unit: variant.unit || '',
            offer: isOffer,
            subTotal: item.sub_total || 0,
            variantIndex: item.variant_index || 0,
            storeId: item.store_id,
            grandTotal: data.data.grand_total || 0,
            totalAmount: item?.totalAmount,
            offer_available: item?.offer_available,
            offer_percentage: item?.offer_percentage,
          };
        });
        setItems(formatted);
        setStoreId(data.data.storeDetails?._id);
        setCartSummary(data?.data?.itemCharges);
        setchargesSentPay(data?.data?.charges)
        setTaxSummary(data?.data?.taxes);
        setLoading(false);
      } else {
        setItems([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
      setLoading(false);
    } finally {
      // fetchVehicleType();
    }
  };
  // ✅ Fetch Vehicle Types
  const fetchVehicleType = async () => {
    if (!accessToken || !profile?.user_id) return;
    try {
      const data = await fetchData(
        'getdeliveryvehicles/',
        'POST',
        { storeId: cdata?.storeDetails?._id },
        {
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: 'user',
        }
      );
      // Alert.alert("",JSON.stringify(data?.deliveryOptions,null,2))
      // Merge both sources
      const merged = [
        ...(data?.data?.result || []),
        ...(data?.deliveryOptions || []),
      ];
      // Map to {label, value}
      const vehicleTypes = merged.map(item => {
        // If item is object with _id, use it
        if (typeof item === 'object' && item !== null && item._id) {
          return { label: item.name, value: item._id };
        }
        // If item is object with name only
        if (typeof item === 'object' && item !== null && item.name) {
          return { label: item.name, value: item.name };
        }
        // If item is string
        return { label: item, value: item };
      });
      // Remove duplicates by value
      const uniqueVehicleTypes = [
        ...new Map(vehicleTypes.map(v => [v.value, v])).values(),
      ];
      setVehcileTypes(uniqueVehicleTypes);
    } catch (error) {
      console.error('getdeliveryvehicles API Error:', error);
    }
  };


  const [selProdtedData, setselProdtedData] = useState(null);
  useFocusEffect(
    useCallback(() => {
      fetchVehicleType();
      fetchCart();
      // }, [profileDetails?.primary_address?.lat, selectedVehicle])
    }, [profileDetails?.primary_address?.lat, selectedVehicle, appliedCoupon?._id, appliedCoupon, showVehicleModal])
  );
  useFocusEffect(
    useCallback(() => {
      fetchVehicleType();
    }, [cdata])
  );

  const orderCreatedRef = useRef(false);
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener("HyperEvent", (resp) => {
      const data = JSON.parse(resp);
      const event = data.event || "";
      // Alert.alert('JK', JSON.stringify(, null, 2))
      const charg = chargesSentPay || []
      const formattedItems = items.map(item => ({
        itemId: item.id,
        item_id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        qty: item.qty,
        image: item.image,
        unit: item.unit,
        offer: item.offer,
        subTotal: item.subTotal,
        variantIndex: item.variantIndex,
        selected_variant: item?.selectedVariant,
      }));
      const formattedTaxes = (taxSummary || []).map(tax => ({
        name: tax.name || "",
        percentage: tax.percentage || 0,
        amount: tax.amount || 0,
      }));
      switch (event) {
        case "process_result": {
          const error = data.error || false;
          const payload = data.payload || {};
          const status = payload.status || "";

          if (!error && status === "charged" && !orderCreatedRef.current) {
            orderCreatedRef.current = true;
            sendPayment(payload, "juspay", formattedItems, formattedTaxes, charg);
          }
          // if (!error && status === "charged") {
          //   ToastAndroid.show("Payment Success!", ToastAndroid.LONG);

          //   // ✅ CORRECT place to assign order
          //   sendPayment(payload, "juspay", formattedItems, formattedTaxes);
          // }
          else {
            handlePaymentFailure(status);
          }
          break;
        }

        default:
          break;
      }
    });

    return () => eventListener.remove();
  }, [items, taxSummary, sendPayment]);

  const handlePaymentFailure = (status) => {
    switch (status) {
      case "backpressed":
        ToastAndroid.show("Payment cancelled by user.", ToastAndroid.LONG);
        break;
      case "user_aborted":
        ToastAndroid.show("Payment Aborted.", ToastAndroid.LONG);
        break;
      case "pending_vbv":
      case "authorizing":
        ToastAndroid.show("Payment Pending...", ToastAndroid.LONG);
        break;
      default:
        ToastAndroid.show("Payment Failed!", ToastAndroid.LONG);
        break;
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      // Alert.alert("zcxxzc", JSON.stringify(cdata?.itemCharges, null, 2));
      if (showBackArrow) return;
      const onBackPress = () => {
        // block back ONLY on this screen
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );
  const formatCamelCase = (str) => {
    // Insert a space before each uppercase letter, then capitalize first letter
    const result = str.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };
  const handlePayment = async (payMethod) => {
    // Alert.alert("jh", JSON.stringify(chargesSentPay, null, 2))
    // return true
    if (!profileDetails?.primary_address?.lon) {
      navigation.navigate("SelectLocation");
      return;
    }
    const formattedItems = items.map(item => ({
      itemId: item.id,
      item_id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      qty: item.qty,
      image: item.image,
      unit: item.unit,
      offer: item.offer,
      subTotal: item.subTotal,
      variantIndex: item.variantIndex,
      selected_variant: item?.selectedVariant,
    }));
    // 2️⃣ Prepare formatted taxes
    const formattedTaxes = (taxSummary || []).map(tax => ({
      name: tax.name || "",
      percentage: tax.percentage || 0,
      amount: tax.amount || 0,
    }));
    setLoading(true);
    try {
      const user_id = profile?.user_id;
      const response = await fetch("https://bringesse.com:3003/api/createnonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
          user_id,
          type: "user",
        },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR",
          user_id,
          payMethod
        }),
      });
      const data = await response.json();
      const isRazorpay = data?.gateway === "razorpay";
      if (!isRazorpay) {
        const payload = data?.order?.sdk_payload;
        if (!payload) {
          Alert.alert("Error", "Invalid SDK payload from server.");
          return;
        }
        try {
          HyperSDK.process(JSON.stringify(payload));
        } catch (sdkErr) {
          console.log("JusPay Error:", sdkErr);
          Alert.alert("JusPay Error", sdkErr.message);
        }
        return;
      }
      const { amount: orderAmount, order_id } = data;
      const options = {
        description: "Bringesse Order Payment",
        currency: siteDetails?.currency_code ?? "INR",
        key: siteDetails?.razorKey,
        amount: orderAmount,
        name: "Bringesse",
        order_id,
        prefill: {
          contact: profile?.phone_no,
          name: profile?.name || "Customer",
        },
        theme: { color: "#00BFA6" },
      };
      RazorpayCheckout.open(options)
        .then((paymentResponse) => {
          sendPayment(paymentResponse, "razorpay", formattedItems, formattedTaxes, chargesSentPay);
        })
        .catch((error) => {
          console.log("Razorpay Error:", error);
          ToastAndroid.show("Payment Failed!", ToastAndroid.SHORT);
        });
    } catch (err) {
      console.log("Payment Error:", err);
      Alert.alert("Payment Error", err.message);
    } finally {
      setLoading(false);
    }
  };
  const sendPayment = async (paymentResponse, pg, formattedItems, formattedTaxes, chargesSentPayA) => {
    if (!accessToken || !profile?.user_id) return;
    // Alert.alert("test", JSON.stringify(cdata?.itemCharges, null, 2))
    // return true
    setLoading(true);
    try {
      const payload = {
        cdata: cdata?.charges,
        delivery_charge: cdata?.itemCharges,
        charges: cdata?.charges,
        cartSummary: cartSummary,
        items: formattedItems,
        taxes: formattedTaxes,
        categoryoffer_info: cdata?.categoryoffer_info || [],
        vehicle_cat: selectedVehicle?.value,
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
        tax_total:
          cdata?.tax_total || formattedTaxes.reduce((sum, t) => sum + Number(t.amount || 0), 0),
        sub_total: cdata?.sub_total || 0,
        wallet_amount: cdata?.wallet_amount || 0,
        wallet_used: cdata?.wallet_used || false,
        payment_type: pg,
        delivery_address: profileDetails?.primary_address,
        delivery_charge: cdata?.delivery_charge || 0,
        distance: cdata?.distance || 0,
        delivery_type: selectedVehicle?.label || "Delivery",
        ...(pg === "razorpay" && {
          razorpay_payment_id: paymentResponse?.razorpay_payment_id || "test_payment_id",
          razorpay_order_id: paymentResponse?.razorpay_order_id || "test_order_id",
          razorpay_signature: paymentResponse?.razorpay_signature || "test_signature",
        }),
        lat: profileDetails?.primary_address?.lat,
        lon: profileDetails?.primary_address?.lon,
        primaryAddress: profileDetails?.primary_address,
        order_id: paymentResponse?.orderId,
      };
      // 4️⃣ Log the payload for debugging
      console.log("📦 Sending PayOrder Payload:", JSON.stringify(payload, null, 2));
      // 5️⃣ Send payload to API
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
      // 6️⃣ Handle API response
      const data = await response.json();
      if (data?.status === "true" || data?.status === true) {
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
        navigation.navigate("OrdersHistory");
      } else {
        ToastAndroid.show(data?.message || "Something went wrong.", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("❌ payorder API Error:", error);
    } finally {
      setLoading(false);
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
      // Alert.alert('Error', 'Error updating cart!');
      console.error('❌ Error updating cart:', error);
    }
  };
  const changeQty = (item, delta) => {
    if (delta === 1) updateCart(item, 'add');
    else if (delta === -1) updateCart(item, 'remove');
  };
  const handleChooseCoupon = (c) => {
    setAppliedCoupon(c)
    setshowCouponArr(false);
  }
  // if (loading) {
  //   // Dummy skeleton items count
  //   return (
  //     <LoaderCart  showBackArrow={showBackArrow}/>
  //   );
  // }
  // ✅ Render each cart item
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => setselProdtedData(item)} style={styles.itemRow}>
      {item?.offer_percentage != '' && item?.offer && item?.originalPrice && item?.totalAmount && (
        <View
          style={{
            position: 'absolute',
            bottom: wp(2),
            left: wp(1.8),
            // alignSelf:"center",
            backgroundColor: '#90EE90', // light green
            paddingHorizontal: wp(1),
            paddingVertical: wp(0.5),
            zIndex: 999,
            borderRadius: wp(1),
          }}
        >
          <Text
            style={{
              color: COLORS[theme].black,
              fontSize: wp(2.2),
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {
              item?.offer_percentage ? `${item?.offer_percentage}Off` : ''
            }
          </Text>
        </View>
      )}
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1 }}>
        {/* <Text style={{color:'#000'}}>{JSON.stringify(item,null,2)}</Text> */}
        <Text numberOfLines={2} style={[poppins.regular.h8, styles.itemTitle, {
          color: COLORS[theme].black, maxWidth: wp(48), textTransform: "capitalize"
        }]}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item?.totalAmount}</Text>
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
    </Pressable>
  );
  return (
    <SafeAreaView style={[styles.container, {
      backgroundColor: COLORS[theme].background,
      opacity: loading ? 0.8 : 1
    }]}
      pointerEvents={loading ? "none" : "auto"} // ✅ disable touch when loading
    >
      <HeaderBar title={`${cdata?.storeDetails?.name ? cdata?.storeDetails?.name : ''}` || 'My Cart'} subMenu={cdata?.storeDetails?.address || ''} showBackArrow={showBackArrow}
        showRightArrow={"cart"}
        onRightArrowPress={() => navigation.navigate('OrdersHistory')}
      />
      {!loading && items.length === 0 ? (
        <View style={styles.centerScreen}>
          <Text style={[poppins.semi_bold.h4, { color: COLORS[theme].primary }]}>
            Your cart is empty!
          </Text>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}      // bind to your loading state
                onRefresh={fetchCart}     // function to reload cart
                colors={[COLORS[theme].primary]}  // spinner colors for Android
              />
            }
          >
            <FlatList
              data={items}
              keyExtractor={() => Math.random().toString()}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
            />
            <TouchableOpacity
              onPress={() => {
                setShowVehicleModal(true);
              }}
              style={[styles.vehicleSelector, {
                borderColor: theme == 'dark' ? '#555' : '#DDD'
              }]}
            >
              <Text style={[poppins.regular.h7, styles.vehicleText, { color: COLORS[theme].primary }]}>
                {vehcileTypes?.length == 0 ? "No Data" : selectedVehicle ? selectedVehicle.label : 'Choose Delivery Type'}
              </Text>
              <MaterialIcons onPress={() => setSelectedVehicle(null)} name={selectedVehicle ? 'close' : "edit"} size={wp(6)} color={COLORS[theme].primary} />
            </TouchableOpacity>
            {/* {
              !selectedVehicle?.value && (
                <Text style={[poppins.semi_bold.h9, { color: COLORS[theme].validation, margin: wp(2), marginLeft: wp(4), fontSize: wp(2.1) }]}>
                  Please select a Delivery type to see the charges details.
                </Text>
              )
            } */}
            <TouchableOpacity
              // onPress={() => navigation.navigate('SelectLocation')}
              style={[styles.vehicleSelctor, {
                paddingVertical: wp(2.5),
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', borderBottomWidth: 1,
                borderColor: '#DDD',
                borderRadius: wp(1), paddingHorizontal: wp(2), marginHorizontal: wp(2),
              }]}
            >
              <View>
                <Text style={[poppins.semi_bold.h9, { color: COLORS[theme].primary, maxWidth: wp(80), fontSize: wp(2.5) }]}>
                  {'Delivery Address'}
                </Text>
                <Text style={[poppins.regular.h9, { color: COLORS[theme].primary, maxWidth: wp(80), fontSize: wp(2.8) }]}>
                  {profileDetails.primary_address?.note+ ' , '+profileDetails.primary_address.address + ' , ' + profileDetails?.primary_address?.location}
                  {/* {JSON.stringify(profileDetails?.primary_address)} */}
                </Text>
              </View>
              <MaterialIcons name="home" size={wp(7)} color={COLORS[theme].primary} />
            </TouchableOpacity>
            {Boolean(selectedVehicle?.value) &&
              Array.isArray(couponList) &&
              couponList.length > 0 && (
                <ApplyCoupon
                  onApplyCoupon={() => setshowCouponArr(true)}
                  appliedCoupon={appliedCoupon || null}
                  successMsg={typeof cdata?.couponMessage === 'string' ? cdata.couponMessage : ''}
                  error={couponError || ''}
                  removeCoupon={() => setAppliedCoupon(null)}
                />
              )}
            <View style={styles.detailsContainer}>

              {
                // selectedVehicle?.value && 
                Array.isArray(cartSummary) && cartSummary.length > 0 && cartSummary.map((detail, index) => (
                  <View key={Math.random().toString()} style={styles.detailsRow}>
                    <Text style={[styles.detailLabel, { color: COLORS[theme].primary }]}>
                      {formatCamelCase(detail?.label)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.detailLabel, { color: COLORS[theme].primary, textDecorationLine: detail?.label == "Original Price" ? "line-through" : "none" }]}>
                        ₹{detail?.value}
                      </Text>
                    </View>
                  </View>
                ))}
              {
                // selectedVehicle?.value &&
                Array.isArray(cartSummary) && cartSummary.length > 0 && grandTotal !== undefined && grandTotal !== null && !isNaN(grandTotal) && (
                  <View style={styles.detailsRow}>
                    <Text style={[styles.detailLabel, { color: COLORS[theme].primary }]}>
                      {"Payable Amount"}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[poppins.semi_bold.h5, styles.detailLabel, { color: COLORS[theme].primary }]}>
                        ₹{grandTotal}
                      </Text>
                    </View>
                  </View>
                )}
            </View>
            <SingleSelectModal
              visible={showVehicleModal}
              data={vehcileTypes} // [{ label: 'Bike', value: '1' }, ...]
              title="Select Type of Delivery"
              selectedValue={selectedVehicle?.value}
              onSelect={setSelectedVehicle}
              onDismiss={() => setShowVehicleModal(false)}
            />
            <CouponModal
              visible={showCouponArr}
              data={couponList} // [{ label: 'Bike', value: '1' }, ...]
              title="Select Coupon Code"
              selectedValue={selectedVehicle?.value}
              onSelect={(coupon) => handleChooseCoupon(coupon)}
              onDismiss={() => setshowCouponArr(false)}
            />
          </ScrollView>
          {
            // selectedVehicle?.value &&
            (
              <TouchableWithoutFeedback
                onPress={() => setIsAccepted(!isAccepted)}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: wp(4),
                  marginVertical: wp(2),
                }}>
                  <MaterialIcons style={{
                    marginRight: wp(2),
                  }} name={isAccepted ? "check-box" : 'check-box-outline-blank'} size={wp(6)} color={COLORS[theme].primary} />
                  {/* </View> */}
                  <Text style={{
                    color: COLORS[theme].primary,
                    fontSize: wp(2.5),
                    maxWidth: wp(80),
                    lineHeight: hp(2)
                  }}>
                    {cdata?.acceptance || 'Terms & conditions accepted'}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          {
            loading ?
              <ActivityIndicator color={COLORS[theme].accent} />
              :
              <TouchableOpacity
                disabled={!isAccepted}
                onPress={() => {
                  isAccepted &&
                    // selectedVehicle?.value &&
                    setshowConfirm(true)
                }} style={[styles.payButton, {
                  backgroundColor: !isAccepted
                    //  || !selectedVehicle?.value 
                    ? COLORS[theme].cardBackground : COLORS[theme].accent
                }]}>
                <Text style={[poppins.regular.h6, styles.payButtonText, {
                  fontSize: !selectedVehicle?.value ? wp(4) : wp(4)
                }]}>
                  {
                    `Continue  `
                  }
                </Text>
                <View style={{ backgroundColor: "#FFF", width: wp(0.5), height: "100%", }} />
                <Text style={[poppins.semi_bold.h5, styles.payButtonText, {
                  fontSize: !selectedVehicle?.value ? wp(4) : wp(4)
                }]}>
                  {
                    // !selectedVehicle?.value ?
                    //  'Select Vehicle to Pay'                    :
                    `₹ ${grandTotal}`
                  }
                </Text>
              </TouchableOpacity>
          }
        </>
      )
      }
      {/* <UserConfirmPayment showModal={showConfirm}/> */}
      <UserConfirmPayment
        cdata={cdata}
        grandTotal={grandTotal}
        showModal={showConfirm}
        // showConfirm={false}
        onClose={() => setshowConfirm(false)}
        onPaymentConfirm={async (method) => {
          handlePayment(method);
        }}
      />
      <CartItem productData={selProdtedData} close={() => setselProdtedData(null)} />
    </SafeAreaView >
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: wp(1) },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: wp(1), borderRadius: wp(1), marginBottom: wp(0.5) },
  image: { width: wp(12), height: wp(12), borderRadius: wp(1), marginRight: wp(4), resizeMode: "contain" },
  itemTitle: { fontSize: wp(3.1), fontWeight: "100", color: '#000' },
  itemSub: { fontSize: wp(3.5), marginTop: 2, color: '#666' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  price: { fontSize: wp(3), fontWeight: '700', marginRight: 6, color: '#000' },
  strikePrice: { fontSize: wp(3), color: '#999', textDecorationLine: 'line-through' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: wp, overflow: 'hidden', backgroundColor: "#F1f1f1" },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#000' },
  qtyValue: { width: 25, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#000' },
  separator: { height: 1, backgroundColor: '#F2F2F2' },
  detailsContainer: { marginTop: wp(2), paddingVertical: wp(1), borderColor: '#EEE', padding: wp(4) },
  detailsTitle: { fontSize: wp(3.5), fontWeight: '700', marginBottom: wp(1) },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: wp(0.5) },
  detailLabel: { fontSize: wp(2.6), textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 8 },
  grandTotalLabel: { fontSize: 16, fontWeight: '700' },
  grandTotalValue: { fontSize: 16, fontWeight: '700' },
  payButton: {
    backgroundColor: '#00C2CB', paddingVertical: wp(2.5), borderRadius: wp(2),
    alignItems: 'center', marginTop: wp(1), marginBottom: wp(2), marginHorizontal: wp(4),
    width: wp(90), alignSelf: "center", flexDirection: "row", justifyContent: "space-around"
  }, payButtonText: { color: '#FFF', },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vehicleSelector: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1,
    borderRadius: wp(2), padding: wp(1), marginHorizontal: wp(2),
    marginTop: wp(3), paddingHorizontal: wp(3)
  },
  couponView: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1,
    borderColor: '#DDD', borderRadius: wp(1),
    marginTop: wp(3), height: hp(6), paddingHorizontal: wp(2)
  }, vehicleText: { textTransform: "capitalize", maxWidth: wp(70), lineHeight: hp(4) },
});