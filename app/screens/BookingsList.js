import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PanResponder,
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Image, RefreshControl, Modal, Pressable, ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const BookingsList = ({ onModalToggle }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profile = useSelector(state => state.Auth.profileDetails);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const siteDetails = useSelector(state => state.Auth?.siteDetails);
  const navigation = useNavigation();
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchBookings = async (isRefresh = false) => {
    if (!accessToken || !profile?.user_id) return;
    const payload = {
      user_id: profile?.user_id,
    };
    const headers = {
      Authorization: `${accessToken}`,
      user_id: profile.user_id,
      type: 'user',
    };
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await fetchData('transport/bookinghistory', 'POST', payload, headers);
      console.log(data, "bookinghistorybookinghistory")
      if (data?.status === true && Array.isArray(data?.data)) {
        setBookingData(data.data);
      } else {
        setBookingData([]);
      }
    } catch (err) {
      console.error('Booking fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 80) {
          // Alert.alert("Hi")
        }
        else {

        }
      },
    })
  ).current;


  useFocusEffect(
    useCallback(() => {
      fetchBookings();

    }, [])
  );


  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return moment(dateStr).format('MMM D, YYYY • hh:mm A');
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
    onModalToggle?.(true); // Notify parent: modal is open
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalVisible(false);
    onModalToggle?.(false); // Notify parent: modal is open
  };

  const handleCancelOrder = async () => {
    let payload = {
      user_id: profile?.user_id,
      booking_id: selectedItem?._id
    }
    setLoading(true)
    try {
      const data = await fetchData('transport/cancelbooking', 'POST', payload);
      console.log(data, "datadatadata")
      if (data?.status === true) {
        fetchBookings();
      } else {

      }
    } catch (err) {
      console.error('cancelbooking fetch error:', err);
    } finally {
      setLoading(false)
      setSelectedItem(null);
      setModalVisible(false);
      onModalToggle?.(false);
    }
  };
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => openModal(item)}
      style={[styles.card, { backgroundColor: COLORS[theme].viewBackground }]}
    >
      <View style={styles.iconContainer}>
        {item.vehicle?.image ? (
          <Image
            source={{ uri: `${siteDetails?.image_url}${item.vehicle.image}` }}
            style={styles.vehicleImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.vehicleImage, { backgroundColor: '#ccc' }]} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary }]}>
          #{item.uniqueId || 'N/A'}
        </Text>
        <Text style={[poppins.regular.h8, { marginTop: hp(0.5), color: COLORS[theme].textPrimary }]}>
          Vehicle: {item.vehicle?.name || 'N/A'} ({item.categoryName})
        </Text>

        <Text style={[poppins.regular.h8, { marginTop: hp(0.5), color: COLORS[theme].textPrimary }]}>
          Status: {item.status}
        </Text>

        <Text style={[poppins.regular.h8, { marginTop: hp(0.5), color: COLORS[theme].textPrimary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
        {loading && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS[theme].accent} />
          </View>
        ) : (
          <FlatList
            data={bookingData}
            keyExtractor={(item, index) => item._id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchBookings(true)}
                colors={[COLORS[theme].accent]}
                tintColor={COLORS[theme].accent}
              />
            }
            ListEmptyComponent={
              <View style={{ padding: wp(5), alignItems: 'center' }}>
                <Text style={[poppins.regular.h7, { color: COLORS[theme].textPrimary }]}>
                  {'No bookings found.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}  {...panResponder.panHandlers} >
            <View style={[styles.modalContent, { backgroundColor: COLORS[theme].viewBackground, borderColor: COLORS[theme].accent }]}>
              <ScrollView>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={[poppins.semi_bold.h5, { color: COLORS[theme].textPrimary }]}>
                    Booking Details
                  </Text>
                  {
                    selectedItem?.userReview?.ratings &&
                    <Text style={[poppins.semi_bold.h5, { color: COLORS[theme].textPrimary, backgroundColor: COLORS[theme].cardBackground, paddingHorizontal: wp(1), borderRadius: wp(2) }]}>
                      {selectedItem?.userReview?.ratings} ★
                    </Text>
                  }
                </View>
                <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Booking ID:</Text>
                <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>#{selectedItem?.uniqueId}</Text>
                <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Vehicle:</Text>
                <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>
                  {selectedItem?.vehicle?.name} ({selectedItem?.categoryName})
                </Text>

                <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Status:</Text>
                <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>{selectedItem?.status}</Text>
                <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Pickup Address:</Text>
                <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>{selectedItem?.pickupAddress}</Text>

                {
                  selectedItem?.drop &&
                  <>
                    <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Drop Address:</Text>
                    <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>{selectedItem?.dropAddress}</Text>
                  </>
                }


                <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>OTP:</Text>
                <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>{selectedItem?.otp}</Text>

                <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Created At:</Text>
                <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>{formatDate(selectedItem?.createdAt)}</Text>
                {
                  selectedItem?.userReview.comment &&
                  <>
                    <Text style={[styles.modalLabel, { color: COLORS[theme].primary }]}>Review:</Text>
                    <Text style={[styles.modalValue, { color: COLORS[theme].primary }]}>{selectedItem?.userReview.comment}</Text>
                  </>
                }
              </ScrollView>
              <View style={styles.modalActions}>
                {selectedItem?.status !== 'completed' &&
                  selectedItem?.status != 'cancelled'
                  &&
                  <Pressable onPress={() => {
                    navigation?.navigate('TrackBookings', {
                      selectedItem
                    }), closeModal()
                  }} style={[styles.trackButton, {
                    backgroundColor: COLORS[theme].accent
                  }]}>
                    <Text style={styles.trackButtonText}>Track</Text>
                  </Pressable>
                }
                <Pressable onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
              {/* {selectedItem?.status === 'pending' || selectedItem?.status == 'accepted' ?
                <Pressable onPress={handleCancelOrder} style={{ height: hp(6), alignItems: "center", backgroundColor: "red", borderRadius: wp(2), marginVertical: wp(2), justifyContent: "center" }}>
                  <Text style={[poppins.semi_bold.h5, {
                    color: "#FFF"
                  }]}>Cancel</Text>
                </Pressable>
                : null
              } */}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: hp(2),
     paddingBottom: hp(5), gap: wp(3),
    marginHorizontal: wp(3),
  },
  card: {
    flexDirection: 'row', padding: wp(2),
    borderRadius: wp(2), elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4, marginBottom: wp(3),
  },
  iconContainer: {
    marginRight: wp(4),
    justifyContent: 'center',
  },
  vehicleImage: {
    width: wp(12),
    height: wp(12), borderRadius: wp(2),
  },
  textContainer: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center', alignItems: 'center',
  }, modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099', justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: wp(3), borderTopRightRadius: wp(3), padding: wp(5), maxHeight: hp(80),
    borderTopWidth: wp(0.8), marginHorizontal: wp(0.8)
  },
  modalLabel: {
    marginTop: hp(1.5),
    fontSize: wp(3.5), fontFamily: poppins.medium.h8.fontFamily,
  },
  modalValue: {
    fontSize: wp(4), fontFamily: poppins.semi_bold.h7.fontFamily,
  },
  modalActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: hp(3),
  },
  trackButton: {
    flex: 1, paddingVertical: hp(1.5),
    borderRadius: wp(2), marginRight: wp(2),
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff', fontFamily: poppins.semi_bold.h7.fontFamily,
    fontSize: wp(4),
  },
  closeButton: {
    flex: 1, backgroundColor: '#ccc',
    paddingVertical: hp(1.5), borderRadius: wp(2),
    marginLeft: wp(2), alignItems: 'center',
  },
  closeButtonText: {
    color: '#333', fontFamily: poppins.semi_bold.h7.fontFamily,
    fontSize: wp(4),
  },
});

export default BookingsList;
