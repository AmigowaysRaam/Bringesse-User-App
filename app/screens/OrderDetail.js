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
import messaging from '@react-native-firebase/messaging';
import ReviewCard from './ReviewCard';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';


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
  const [showDownloadModal, setshowDownloadModal] = useState(false);
  const LabelValue = ({ label, value, valueColor }) => (
    <View style={styles.rowBetween}>
      <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary, textTransform: "capitalize" }]}>
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
      console.log(data, "orderdetail")
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
    const fetchOrderDetail = async () => {
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
      const data = await fetchData('orderdetail', 'POST', payload, headers);
      if (data?.status === 'true') {
        setOrderDetail(data);
      }
      else {
        ToastAndroid.show(data?.message || '', ToastAndroid.SHORT);
      }
    }
    const interval = setInterval(() => {
      fetchOrderDetail();
    }, 5000);
    // Clear interval on unmount
    return () => clearInterval(interval);
  }, []); // empty dependency array ensures this effect runs only once

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
  const handleDownload = async () => {
    setshowDownloadModal(false)
    const { fs } = ReactNativeBlobUtil;
    try {
      setLoading(true);
      const { fs } = ReactNativeBlobUtil;
      const path =
        `${fs.dirs.DocumentDir}/invoice_${orderDetail?.unique_id}.pdf`;
      await ReactNativeBlobUtil.fetch(
        'POST',
        `https://www.bringesse.com:3003/api/order/invoice`,
        {
          Authorization: accessToken,
          user_id: profile.user_id,
          type: 'user',
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        JSON.stringify({
          user_id: profile.user_id,
          orderId: orderId,
        })
      ).then(res => res.base64())
        .then(base64 => fs.writeFile(path, base64, 'base64'));
      ToastAndroid.show('Invoice downloaded', ToastAndroid.SHORT);
      await FileViewer.open(path, { showOpenWithDialog: true });
    } catch (err) {
      console.error('PDF download/open error:', err);
    } finally {
      setLoading(false);
    }
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
    setReviewType(null);
  }
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return moment(dateStr).format('MMM DD, YYYY • hh:mm A');
  };

  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s === 'complete' || s === 'completed') {
      return 'delivered';
    }
    return s;
  };
  const renderStatusProgress = (status) => {
    const normalizedStatus = normalizeStatus(status);

    const currentIndex =
      normalizedStatus === 'delivered'
        ? ORDER_STEPS.length - 1
        : ORDER_STEPS.indexOf(normalizedStatus);

    const statusTimes = {};
    if (orderDetail?.status_history) {
      orderDetail.status_history.forEach((item) => {
        statusTimes[item.status.toLowerCase()] = item.time;
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
                  {
                    color: COLORS[theme].textPrimary,
                    marginTop: wp(1),
                    textTransform: 'capitalize',
                  },
                ]}
              >
                {step}
              </Text>

              {statusTimes[step] && (
                <Text
                  style={[
                    poppins.regular.h10,
                    {
                      color: COLORS[theme].textPrimary,
                      marginTop: wp(0.5),
                    },
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
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        <HeaderBar showBackArrow title="Order Details" />
        <ActivityIndicator size="large" color={COLORS[theme].accent} />
      </GestureHandlerRootView>
    );
  }
  if (!orderDetail) {
    return (
      <GestureHandlerRootView style={[styles.centerScreen, {
        backgroundColor: COLORS[theme].background
      }]}>
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
      <HeaderBar showBackArrow title={orderDetail?.store_name || "Order Details"}
        subMenu={formatDate(orderDetail?.ordered_time) || ""}
        showRightArrow={orderDetail.order_status == 'delivered' || orderDetail.order_status === 'complete' && "download-outline"}
        onRightArrowPress={() => setshowDownloadModal(true)}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: wp(4),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS[theme].accent]}
          />
        }
      >
        <View
          style={[{ backgroundColor: COLORS[theme].viewBackground, marginBottom: wp(2) }]}
        >
          {renderStatusProgress(orderDetail.order_status)}
        </View>
        <View
          style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
        >
          <LabelValue label="Order ID" value={orderDetail?.unique_id || orderDetail.order_id?.slice(-6)} />
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
        </>
        {
          orderDetail.order_status == 'delivered' || orderDetail.order_status === 'complete' &&
          (
            <View style={styles.reviewButtonsWrapper}>
              {
                orderDetail?.order_review?.review == '' &&
                <TouchableOpacity
                  style={[styles.reviewButton, { backgroundColor: COLORS[theme].accent }]}
                  onPress={() => {
                    setReviewType('product');
                    setShowReviewModal(true);
                  }}
                >
                  <Text style={[poppins.semi_bold.h7, styles.reviewButtonText]}>
                    {'Review Order'}
                  </Text>
                </TouchableOpacity>
              }
              {!orderDetail?.driver_review?.review && (
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
        {orderDetail?.items?.length > 0 && (
          <View
            style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
          >
            {orderDetail?.items.map((item, index) => (
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
                      { color: COLORS[theme].textPrimary, textTransform: "capitalize" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {
                    <View style={{
                      flexDirection: "row", justifyContent: "space-between",
                    }}>
                      {item.item_variant?.name && (
                        <Text
                          style={[poppins.regular.h9, { color: COLORS[theme].textPrimary }]}
                        >
                          Variant: {item.item_variant.name}
                        </Text>
                      )}
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
                  }
                </View>
              </View>
            ))}
          </View>
        )}
        {orderDetail?.order_status === 'pending' ? (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: COLORS?.[theme]?.validation },
            ]}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        ) : (
          !ORDER_STEPS?.includes(orderDetail?.order_status) && (
            <Text
              style={[
                poppins.semi_bold.h4,
                {
                  color:
                    orderDetail?.order_status === 'cancelled'
                      ? '#FF0000'
                      : COLORS?.[theme]?.accent,
                  textAlign: 'center',
                  marginTop: wp(4),
                  textTransform: 'capitalize',
                },
              ]}
            >
              {orderDetail?.order_status ?? ''}
            </Text>
          )
        )}

        {
          orderDetail?.isFood == 'true' &&
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
      <ReviewCard orderDetail={orderDetail?.driver_review} title={'Driver Review'} />
      <ReviewCard orderDetail={orderDetail?.order_review} title={'Order Review'} />
      <ConfirmationModal
        visible={showCancelModal}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        onClose={() => setShowCancelModal(false)}
        onConfirm={fnCancelOrder}
      />
      <ConfirmationModal
        visible={showDownloadModal}
        title="Cancel Order"
        message="Are you sure you want to Download reciept of this order?"
        onClose={() => setshowDownloadModal(false)}
        onConfirm={() =>
          handleDownload()}
      />
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
    borderRadius: wp(3), paddingVertical: wp(2),
    paddingHorizontal: wp(2), elevation: 3, marginBottom: wp(1)
  }, storeRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: wp(16), height: wp(16), borderRadius: wp(3) },
  rowBetween: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: wp(1),
  }, itemCard: {
    flexDirection: 'row', paddingVertical: wp(2),
  },
  itemImage: {
    width: wp(14), height: wp(14), borderRadius: wp(2),
  },
  statusContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: wp(2),
  }, statusStepContainer: { flex: 1, alignItems: 'center' },
  statusCircle: {
    width: wp(7), height: wp(7),
    borderRadius: wp(3.5), justifyContent: 'center',
    alignItems: 'center',
  }, statusLine: {
    position: 'absolute', top: wp(3.2), left: '66%', width: '90%', height: wp(1),
  },
  reviewButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between', marginHorizontal: wp(2),
    marginBottom: wp(3),
  }, reviewButton: {
    flex: 1, paddingVertical: wp(3), marginHorizontal: wp(1), borderRadius: wp(2),
    alignItems: 'center',
  },
  reviewButtonText: { color: '#fff' },
  cancelButton: {
    borderRadius: wp(2), paddingVertical: wp(3),
    marginHorizontal: wp(2), marginTop: wp(4),
  }, cancelButtonText: {
    color: '#fff', textAlign: 'center', fontWeight: '900'
  },
});

export default OrderDetail;
