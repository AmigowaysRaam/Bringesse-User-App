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
import moment from 'moment';
import ConfirmationModal from './ConfirmModal';
import { useNavigation } from '@react-navigation/native';
import OrderReviewModal from './OrderReviewModal';
import DriverDetails from './DriverDetails';
import messaging from '@react-native-firebase/messaging';
const ORDER_STEPS = ['pending', 'processing', 'ready', 'delivered'];
const OrderDetail = ({ route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const profile = useSelector((state) => state.Auth.profileDetails);
  const accessToken = useSelector((state) => state.Auth.accessToken);
  const { orderId } = route.params;

  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewType, setReviewType] = useState(null);
  // ⭐⭐ REUSABLE ROW COMPONENT ⭐⭐
  const LabelValue = ({ label, value, valueColor }) => (
    <View style={styles.rowBetween}>
      <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>
        {label}
      </Text>
      <Text
        style={[
          poppins.semi_bold.h7,
          { color: valueColor || COLORS[theme].textPrimary },
        ]}
      >
        {value}
      </Text>
    </View>
  );

  const fetchOrderDetail = useCallback(async () => {
    if (!accessToken || !profile?.user_id) return;
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
      console.log(data, "datadatadata")
      if (data?.status === 'true') setOrderDetail(data);
      else setOrderDetail(null);
    } catch (err) {
      console.error('Order detail fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, profile?.user_id, orderId]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async () => fetchOrderDetail());
    return unsubscribe;
  }, [fetchOrderDetail]);
  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetail();
  };

  const fnCancelOrder = async () => {
    if (!accessToken || !profile?.user_id) return;

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

      ToastAndroid.show(
        data?.status === 'true'
          ? t('Order cancelled successfully')
          : data?.message,
        ToastAndroid.SHORT
      );
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setLoading(false);
      setShowCancelModal(false);
      fetchOrderDetail();
    }
  };
  const handleCloseModal = () => {
    setShowReviewModal(false);
    fetchOrderDetail();
  }
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return moment(dateStr).format('MMM DD, YYYY • hh:mm A');
  };

  const renderStatusProgress = (status) => {
    const currentIndex = ORDER_STEPS.indexOf(status);
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
                  <MaterialCommunityIcon
                    name="check"
                    size={wp(4)}
                    color="#fff"
                  />
                )}
              </View>

              {index < ORDER_STEPS.length - 1 && (
                <View
                  style={[
                    styles.statusLine,
                    {
                      backgroundColor:
                        index < currentIndex
                          ? COLORS[theme].accent
                          : COLORS[theme].border,
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  poppins.regular.h9,
                  { color: COLORS[theme].textPrimary, marginTop: wp(1) },
                ]}
              >
                {step}
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
        <HeaderBar showBackArrow title="Order Details" />
        <ActivityIndicator size="large" color={COLORS[theme].accent} />
      </GestureHandlerRootView>
    );
  }

  if (!orderDetail) {
    return (
      <GestureHandlerRootView style={styles.centerScreen}>
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
          No order details found.
        </Text>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: COLORS[theme].background }}
    >
      <HeaderBar showBackArrow title="Order Details" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: wp(4),
          paddingVertical: wp(2),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS[theme].accent]}
          />
        }
      >
        {/* Store Info */}
        <View
          style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
        >
          <View style={styles.storeRow}>
            <Image
              source={{
                uri:
                  orderDetail.image_url ||
                  'https://via.placeholder.com/100x100.png?text=No+Image',
              }}
              style={styles.logo}
            />

            <View style={{ flex: 1, marginLeft: wp(3) }}>
              <Text
                style={[
                  poppins.semi_bold.h6,
                  { color: COLORS[theme].textPrimary, textTransform: 'capitalize' },
                ]}
              >
                {orderDetail.store_name}
                {/* {JSON.stringify(orderDetail?.order_review,null,2)} */}
              </Text>

              <Text
                style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}
              >
                {formatDate(orderDetail.ordered_time)}
              </Text>
            </View>
            {orderDetail?.order_review?.rating &&
              orderDetail?.order_review?.rating != 0 &&
              <View style={{ backgroundColor: "#555", width: wp(10), height: wp(6), alignItems: "center", justifyContent: "center", borderRadius: wp(1) }}>
                <Text
                  style={[
                    poppins.semi_bold.h7,
                    { color: COLORS[theme].white, textTransform: 'capitalize', lineHeight: wp(4) },
                  ]}
                >
                  {orderDetail?.order_review?.rating}
                  <MaterialCommunityIcon name={'star'} color={'white'} size={wp(4.2)} />
                </Text>
              </View>
            }
          </View>
        </View>
        {/* Status */}
        <View
          style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
        >
          <Text
            style={[
              poppins.semi_bold.h6,
              { color: COLORS[theme].textPrimary, marginBottom: wp(2) },
            ]}
          >
            Order Status
          </Text>
          {renderStatusProgress(orderDetail.order_status)}
        </View>
        {/* Summary USING REUSABLE COMPONENT */}
        <View
          style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
        >
          <Text
            style={[
              poppins.semi_bold.h6,
              { color: COLORS[theme].textPrimary, marginBottom: wp(2) },
            ]}
          >
            Order Summary
          </Text>
          <LabelValue label="Order ID" value={orderDetail.unique_id} />
          <LabelValue label="Delivery Type" value={orderDetail.delivery_type} />
          <LabelValue
            label="OTP"
            value={orderDetail?.userOtp}
            valueColor={COLORS[theme].accent}
          />
          <LabelValue
            label="Total Amount"
            value={`${orderDetail.currency_symbol}${orderDetail.grand_total}`}
            valueColor={COLORS[theme].accent}
          />
        </View>
        <>
          {/* <DriverDetails /> */}
        </>
        {orderDetail.order_status === 'delivered' && (
          <View style={styles.reviewButtonsWrapper}>
            {orderDetail?.order_review?.rating === 0 && <TouchableOpacity
              style={[styles.reviewButton, { backgroundColor: COLORS[theme].accent }]}
              onPress={() => {
                setReviewType('product');
                setShowReviewModal(true);
              }}
            >
              <Text style={[poppins.semi_bold.h7, styles.reviewButtonText]}>
                Review Products
              </Text>
            </TouchableOpacity>
            }
            {!orderDetail?.driver && (
              <TouchableOpacity
                style={[styles.reviewButton, { backgroundColor: COLORS[theme].accent }]}
                onPress={() => {
                  setReviewType('driver');
                  setShowReviewModal(true);
                }}
              >
                <Text style={[poppins.semi_bold.h7, styles.reviewButtonText]}>
                  Review Driver
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ordered Items */}
        {orderDetail.items?.length > 0 && (
          <View
            style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
          >
            <Text
              style={[
                poppins.semi_bold.h6,
                { color: COLORS[theme].textPrimary, marginBottom: wp(3) },
              ]}
            >
              Ordered Items
            </Text>

            {orderDetail.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.itemCard,
                  index < orderDetail.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderColor: COLORS[theme].border,
                  },
                ]}
              >
                <Image
                  source={{
                    uri:
                      item.image_url ||
                      'https://via.placeholder.com/100x100.png?text=No+Image',
                  }}
                  style={styles.itemImage}
                />

                <View style={{ flex: 1, marginLeft: wp(3) }}>
                  <Text
                    style={[
                      poppins.semi_bold.h8,
                      { color: COLORS[theme].textPrimary },
                    ]}
                  >
                    {item.name}
                    {/* {JSON.stringify(item)} */}
                  </Text>

                  {item.item_variant?.name && (
                    <Text
                      style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}
                    >
                      Variant: {item.item_variant.name}
                    </Text>
                  )}

                  <Text
                    style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}
                  >
                    Qty: {item.product_count}
                  </Text>

                  <Text
                    style={[
                      poppins.semi_bold.h8,
                      { color: COLORS[theme].accent, marginTop: wp(0.5) },
                    ]}
                  >
                    {orderDetail.currency_symbol}
                    {item.price} × {item.product_count} ={' '}
                    {orderDetail.currency_symbol}
                    {item.item_total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CANCEL BUTTON */}
        {orderDetail.order_status === 'pending' ? (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: COLORS[theme].validation }]}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              poppins.semi_bold.h4,
              {
                color:
                  orderDetail.order_status === 'cancelled'
                    ? '#FF0000'
                    : COLORS[theme].accent,
                textAlign: 'center',
                marginTop: wp(4),
                textTransform: 'capitalize',
              },
            ]}
          >
            {orderDetail.order_status}
          </Text>
        )}
        {/* TRACK ORDER */}
        {orderDetail?.tracking && 
          orderDetail.order_status === 'ready' || orderDetail.order_status === 'shipped' &&
           (
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: COLORS[theme].accent }]}
              onPress={() =>
                navigation.navigate('FoodDeliveryTrack', { data: orderDetail })
              }
            >
              <Text style={styles.cancelButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}
      </ScrollView>
      {/* Cancel Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        onClose={() => setShowCancelModal(false)}
        onConfirm={fnCancelOrder}
      />
      {/* Review Modal */}
      <OrderReviewModal
        visible={showReviewModal}
        onClose={() => handleCloseModal()}
        bookingId={orderDetail?.order_id}
        driver={orderDetail?.driver}
        reviewType={reviewType}
        storeId={orderDetail?.store_id}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: wp(3),
    elevation: 3,
  },

  storeRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: wp(16), height: wp(16), borderRadius: wp(3) },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(2),
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

  // Status UI
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: wp(2),
  },
  statusStepContainer: { flex: 1, alignItems: 'center' },
  statusCircle: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: wp(3.2),
    left: '66%',
    width: '90%',
    height: wp(1),

  },
  reviewButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(2),
    marginBottom: wp(3),
  },

  reviewButton: {
    flex: 1,
    paddingVertical: wp(3),
    marginHorizontal: wp(1),
    borderRadius: wp(2),
    alignItems: 'center',
  },

  reviewButtonText: { color: '#fff' },

  cancelButton: {
    borderRadius: wp(2),
    paddingVertical: wp(3),
    marginHorizontal: wp(2),
    marginTop: wp(4),
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '900'
  },
});

export default OrderDetail;
