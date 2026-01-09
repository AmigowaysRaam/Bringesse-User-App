import React, {
  useEffect, useState, useCallback,
  useMemo,
} from 'react';
import {
  View,  Text,  FlatList,  StyleSheet,  ActivityIndicator,
  RefreshControl,  Image,  TouchableOpacity,  TextInput,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';

const OrdersHistory = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const profile = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async () => fetchOrders());
    return unsubscribe;
  }, [fetchOrders]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  /* ------------------------------------
     Fetch Orders
  ------------------------------------ */
  const fetchOrders = useCallback(async () => {
    if (!accessToken || !profile?.user_id) return;
    const payload = {
      user_id: profile.user_id,
      page: 1,
      limit: 10000,
    };
    const headers = {
      Authorization: `${accessToken}`,
      user_id: profile.user_id,
      type: 'user',
    };

    try {
      setLoading(true);
      const data = await fetchData('orderhistory', 'POST', payload, headers);
      if (data?.status === 'true' && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.log('Order fetch error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, profile?.user_id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  /* ------------------------------------
     Helpers
  ------------------------------------ */
  const formatExactDate = date =>
    date ? moment(date).format('DD MMM YYYY, hh:mm A') : '';

  /* ------------------------------------
     Search Filter
  ------------------------------------ */
  const filteredOrders = useMemo(() => {
    if (!searchText.trim()) return orders;

    const text = searchText.toLowerCase();

    return orders.filter(item =>
      item?.store_name?.toLowerCase().includes(text) ||
      item?.order_id?.toString().includes(text) ||
      item?.uniqueId?.toString().includes(text) || 
      item?.order_status?.toString().includes(text) 
    );
  }, [orders, searchText]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('OrderDetail', { orderId: item.order_id })
      }
      activeOpacity={0.8}
      style={[
        styles.card,
        { backgroundColor: COLORS[theme].viewBackground },
      ]}
    >
      <Image
        resizeMode="contain"
        source={{
          uri:
            item.image_url ||
            'https://via.placeholder.com/80x80.png?text=No+Image',
        }}
        style={styles.logo}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={[
            poppins.semi_bold.h8,
            { color: COLORS[theme].textPrimary },
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
          Order ID: {item?.uniqueId || item?.order_id?.slice(-6)}
        </Text>
        <Text
          style={[
            poppins.regular.h8,
            { color: COLORS[theme].textPrimary, marginTop: wp(1) },
          ]}
        >
          {formatExactDate(item.ordered_time)}
        </Text>

        <View style={styles.rowBetween}>
          <Text
            style={[
              poppins.semi_bold.h8,
              { color: COLORS[theme].accent },
            ]}
          >
            {item.currency_symbol}
            {item.grand_total}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.order_status === 'pending' ? 'orange' : 'green',
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

  /* ------------------------------------
     UI
  ------------------------------------ */
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: COLORS[theme].background }}
    >
      <HeaderBar title={t('Orders History')} showBackArrow />
      {/* Search Bar */}
      <View style={[styles.searchContainer, {
        backgroundColor: COLORS[theme].background
      }]}>
        <MaterialCommunityIcon
          name="magnify"
          size={wp(6)}
          color={COLORS[theme].textPrimary}
        />
        <TextInput
          placeholder={t('Search by store or order id')}
          placeholderTextColor={COLORS[theme].textPrimary}
          value={searchText}
          onChangeText={setSearchText}
          style={[
            styles.searchInput,
            { color: COLORS[theme].textPrimary },
          ]}
        />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={COLORS[theme].accent}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) =>
            item.order_id?.toString() || index.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS[theme].accent]}
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
                {t('No orders found')}
              </Text>
            </View>
          }
        />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: hp(5),
    marginHorizontal: wp(3),
  },
  card: {
    flexDirection: 'row',
    borderRadius: wp(3),
    elevation: 3,
    padding: wp(3),
    marginBottom: wp(3),
  },
  logo: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(2),
    marginRight: wp(3),
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
  emptyContainer: {
    padding: wp(5),
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(3),
    paddingHorizontal: wp(3),
    borderRadius: wp(3),
    marginBottom: wp(1), borderWidth: wp(0.3), borderColor: "#CCC"

  },
  searchInput: {
    flex: 1,
    height: hp(5),
    marginLeft: wp(2),
    fontSize: wp(3.5),
  },
});

export default OrdersHistory;
