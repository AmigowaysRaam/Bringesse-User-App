import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Image,
  ScrollView, RefreshControl, TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../components/header';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import ConfirmationModal from './ConfirmModal';

// Order Status Steps
const ORDER_STEPS = ['pending', 'accepted', 'out_for_delivery', 'delivered'];

const OrderDetail = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profile = useSelector((state) => state.Auth.profileDetails);
  const accessToken = useSelector((state) => state.Auth.accessToken);
  const { orderId } = route.params;
  const [showCancelModal, setShowCancelModal] = useState(false);


  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!accessToken || !profile?.user_id) return;
    const deviceId = await DeviceInfo.getUniqueId();

    const payload = {
      user_id: profile.user_id,
      order_id: orderId,
    };
    const headers = {
      Authorization: `${accessToken}`,
      user_id: profile.user_id,
      type: 'user',
    };

    try {
      setLoading(true);
      const data = await fetchData('orderdetail', 'POST', payload, headers);
      if (data?.status === 'true') {
        setOrderDetail(data);
      } else {
        setOrderDetail(null);
      }
    } catch (err) {
      console.error('Order detail fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, profile?.user_id, orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetail();
  };

  const fnCancelOrder = async () => {
    if (!accessToken || !profile?.user_id) return;
    const deviceId = await DeviceInfo.getUniqueId();
    const payload = {
      user_id: profile.user_id,
      order_id: orderId,
    };
    const headers = {
      Authorization: `${accessToken}`,
      user_id: profile.user_id,
      type: 'user',
    };
    try {
      setLoading(true);
      const data = await fetchData('cancelorder', 'POST', payload, headers);
      if (data?.status === 'true') {
        ToastAndroid.show(t('Order cancelled successfully') || 'Order cancelled successfully', ToastAndroid.SHORT);
      } else {
      }
    } catch (err) {
      console.error('Order detail fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setShowCancelModal(false);
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return moment(dateStr).format('MMM DD, YYYY • hh:mm A');
  };

  const renderStatusProgress = (status) => {
    const currentIndex = ORDER_STEPS.indexOf(status);

    // Create a map for status timestamps
    const statusTimes = {};
    if (orderDetail?.status_history) {
      orderDetail.status_history.forEach((item) => {
        statusTimes[item.status] = item.time;
      });
    }
    return (
      <View style={styles.statusContainer}>
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <View key={step} style={styles.statusStepContainer}>
              <View
                style={[
                  styles.statusCircle,
                  {
                    backgroundColor: isCompleted
                      ? COLORS[theme].accent
                      : COLORS[theme].border,
                  },
                ]}
              >
                {isCompleted && (
                  <MaterialCommunityIcon name="check" size={wp(4)} color="#fff" />
                )}
              </View>
              {index < ORDER_STEPS.length - 1 && (
                <View
                  style={[
                    styles.statusLine,
                    {
                      backgroundColor:
                        index < currentIndex ? COLORS[theme].accent : COLORS[theme].border,
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  poppins.regular.h9,
                  {
                    color: COLORS[theme].textPrimary,
                    marginTop: wp(1),
                    textTransform: 'capitalize',
                  },
                ]}
              >
                {step.replace(/_/g, ' ')}
              </Text>
              {statusTimes[step] && (
                <Text
                  style={[
                    poppins.regular.h10,
                    { color: COLORS[theme].textPrimary, marginTop: wp(0.5) },
                  ]}
                >
                  {formatDate(statusTimes[step])}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };
  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeaderBar showBackArrow={true} title="Order Details" />
        <ActivityIndicator size="large" color={COLORS[theme].accent} />
      </GestureHandlerRootView>
    );
  }
  if (!orderDetail) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MaterialCommunityIcon
          name="cart-off"
          size={wp(15)}
          color={COLORS[theme].textPrimary}
        />
        <Text
          style={[
            poppins.regular.h7,
            { color: COLORS[theme].textPrimary, marginTop: wp(3) },
          ]}
        >
          {t('No order details found') || 'No order details found.'}
        </Text>
      </GestureHandlerRootView>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar showBackArrow={true} title="Order Details" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: wp(4),paddingVertical: wp(2) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS[theme].accent]}
          />
        }
      >
        {/* Store Information */}
        <View style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}>
          <View style={styles.storeRow}>
            <Image
              source={{
                uri: orderDetail.image_url || 'https://via.placeholder.com/100x100.png?text=No+Image',
              }}
              style={styles.logo}
            />
            <View style={{ flex: 1, marginLeft: wp(3) }}>
              <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary ,textTransform:"capitalize"}]}>
                {orderDetail.store_name}
              </Text>
              <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>
                {formatDate(orderDetail.ordered_time)}
              </Text>
            </View>
          </View>
        </View>
        {/* Order Status Progress */}
        <View style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}>
          <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary, marginBottom: wp(2) }]}>
            Order Status
          </Text>
          {renderStatusProgress(orderDetail.order_status)}
        </View>
        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}>
          <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary, marginBottom: wp(2) }]}>
            Order Summary
          </Text>
          <View style={styles.rowBetween}>
            <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>Order ID</Text>
            <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].textPrimary }]}>
              {orderDetail.unique_id}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>Delivery Type</Text>
            <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].textPrimary }]}>
              {orderDetail.delivery_type}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>OTP</Text>
            <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].accent }]}>
              {orderDetail.otp}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>Total Amount</Text>
            <Text style={[poppins.semi_bold.h7, { color: COLORS[theme].accent }]}>
              {orderDetail.currency_symbol}
              {orderDetail.grand_total}
            </Text>
          </View>
        </View>

        {/* Ordered Items */}
        {orderDetail.items && orderDetail.items.length > 0 && (
          <View style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}>
            <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary, marginBottom: wp(3) }]}>
              Ordered Items
            </Text>
            {orderDetail.items.map((item, index) => (
              <View
                key={item.item_id || index}
                style={[
                  styles.itemCard,
                  index < orderDetail.items.length - 1 && { borderBottomWidth: 1, borderColor: COLORS[theme].border },
                ]}
              >
                <Image
                  source={{
                    uri: item.image_url || 'https://via.placeholder.com/100x100.png?text=No+Image',
                  }}
                  style={styles.itemImage}
                />

                <View style={{ flex: 1, marginLeft: wp(3) }}>
                  <Text
                    style={[poppins.semi_bold.h8, { color: COLORS[theme].textPrimary, textTransform: 'capitalize' }]}
                  >
                    {item.name}
                  </Text>
                  {item.item_variant?.name ? (
                    <Text style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}>
                      Variant: {item.item_variant.name}
                    </Text>
                  ) : null}
                  <Text style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}>
                    Qty: {item.product_count}
                  </Text>
                  <Text
                    style={[poppins.semi_bold.h8, { color: COLORS[theme].accent, marginTop: wp(0.5) }]}
                  >
                    {orderDetail.currency_symbol}
                    {item.price} × {item.product_count} = {orderDetail.currency_symbol}
                    {item.item_total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {/* Payment Info */}
        <View style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}>
          <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary, marginBottom: wp(2) }]}>
            Payment Information
          </Text>
          <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>
            Currency: {orderDetail.currency_code}
          </Text>
          <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary, marginTop: wp(1) }]}>
            Payment Status: {orderDetail.payment_status || 'Pending'}
          </Text>
        </View>

        {orderDetail.order_status === 'pending' ? (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: COLORS[theme].accent, marginTop: wp(4) },
            ]}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={[poppins.semi_bold.h7, { color: '#fff', textAlign: 'center' }]}>
              Cancel Order
            </Text>
          </TouchableOpacity>
        )
          :
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: 'transpaerent', marginTop: wp(4) },
            ]}
          >
            <Text style={[poppins.semi_bold.h4, { color: '#FF0000', textAlign: 'center', textTransform: "capitalize" }]}>
              {orderDetail?.order_status}
            </Text>
          </TouchableOpacity>
        }
      </ScrollView>
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          fnCancelOrder();
          // Call your cancel API here
          // console.log('Order cancelled');
          // setShowCancelModal(false);
          // fetchOrderDetail(); // Refresh order details
        }}
      />

    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  centerScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  card: {
    borderRadius: wp(3), padding: wp(2),
    marginBottom: wp(1), elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  }, cancelButton: {
    borderRadius: wp(2), paddingVertical: wp(3),
    marginHorizontal: wp(2),
  },
  storeRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  logo: {
    width: wp(16), height: wp(16),
    borderRadius: wp(2),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between', marginBottom: wp(2),
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: wp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
  },
  itemCard: {
    flexDirection: 'row',
    paddingVertical: wp(2),
  },
  itemImage: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(2),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: wp(2),
  },
  statusStepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statusCircle: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(1),
  },
  statusLine: {
    position: 'absolute',
    top: wp(3),
    left: hp(5),
    width: '100%',
    height: 2,
    zIndex: -1,
  },
});
export default OrderDetail;
