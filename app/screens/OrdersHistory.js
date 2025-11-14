import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';

const OrdersHistory = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation(); // ✅ Move useNavigation to top-level
  const profile = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const limit = 10;

  const fetchOrders = useCallback(
    async (pageNumber = 1) => {
      if (!accessToken || !profile?.user_id) return;
      const deviceId = await DeviceInfo.getUniqueId();

      const payload = {
        user_id: profile.user_id,
        page: pageNumber,
        limit: limit,
      };
      const headers = {
        Authorization: `${accessToken}`,
        user_id: profile.user_id,
        type: 'user',
      };

      try {
        if (pageNumber === 1) {
          setLoading(true);
        } else {
          setFetchingMore(true);
        }

        const data = await fetchData('orderhistory', 'POST', payload, headers);

        if (data?.status === 'true' && Array.isArray(data.orders)) {
          if (pageNumber === 1) {
            setOrders(data.orders);
          } else {
            setOrders(prev => [...prev, ...data.orders]);
          }
          setHasMore(data.orders.length >= limit);
        } else {
          if (pageNumber === 1) setOrders([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
        setFetchingMore(false);
        setRefreshing(false);
      }
    },
    [accessToken, profile?.user_id]
  );

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [fetchOrders]);

  const handleLoadMore = () => {
    if (!fetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchOrders(1);
  };


  useFocusEffect(
    useCallback(() => {
      onRefresh();
    // Ensure we get location first
    }, [navigation])
  );

  const formatDate = dateStr => {
    if (!dateStr) return '';
    return moment(dateStr).fromNow();
  };

  const renderFooter = () =>
    fetchingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={COLORS[theme].accent} />
      </View>
    ) : null;

  // ✅ FIXED renderItem (hooks moved out)
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('OrderDetail', { orderId: item.order_id })
      }
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: item.image_url || 'https://via.placeholder.com/80x80.png?text=No+Image',
          }}
          style={styles.logo}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            poppins.semi_bold.h8,
            { color: COLORS[theme].textPrimary, textTransform: 'capitalize' },
          ]}
        >
          {item.store_name}
        </Text>

        <Text
          style={[
            poppins.regular.h8,
            { color: COLORS[theme].textPrimary, marginTop: wp(1) },
          ]}
        >
          Order ID: {item.order_id?.slice(-6) || '-'}
        </Text>

        <Text
          style={[
            poppins.regular.h8,
            { color: COLORS[theme].textPrimary, marginTop: wp(1) },
          ]}
        >
          {formatDate(item.ordered_time)}
        </Text>

        <View style={styles.rowBetween}>
          <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].accent }]}>
            {item.currency_symbol}
            {item.grand_total}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.order_status === 'pending'
                    ? 'orange'
                    : 'green',
              },
            ]}
          >
            <Text
              style={[
                poppins.medium.h9,
                { color: '#fff', textTransform: 'capitalize' },
              ]}
            >
              {item.order_status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeaderBar title={t('Orders History')} showBackArrow={true} />

      <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS[theme].accent} />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item, index) =>
              item.order_id?.toString() || index.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={[styles.scrollContent,{
              backgroundColor: COLORS[theme].background
            }]}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS[theme].accent]}
                tintColor={COLORS[theme].accent}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
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
                  {t('No orders found') || 'No orders found.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: hp(0),
    paddingBottom: hp(5),
    marginHorizontal: wp(3),
  },
  card: {
    flexDirection: 'row',
    borderRadius: wp(3),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    padding: wp(3),
    marginBottom: wp(3),
  },
  logoContainer: {
    marginRight: wp(3),
    justifyContent: 'center',
  },
  logo: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(2),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: wp(2),
  },
  statusBadge: {
    paddingVertical: wp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  emptyContainer: {
    padding: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OrdersHistory;
