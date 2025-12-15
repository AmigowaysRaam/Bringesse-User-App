import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PanResponder,
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  ToastAndroid,
  BackHandler,
} from 'react-native';
import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import HeaderBar from '../components/header';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import SelectionModal from '../components/header/SelectModal';
import SelectLocation from '../components/header/SelectLocation';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchData } from '../api/api';
import { poppins } from '../resources/fonts';
import ConfirmModalBookings from './ConfirmModalBookings';
import BookingsList from './BookingsList';
import SelectVehicleModal from '../components/header/SelectVehicleModal';
const OrdersScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const profile = useSelector(state => state.Auth.profile);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const [errors, setErrors] = useState({});
  const siteDetails = useSelector(state => state.Auth?.siteDetails);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [locaTYpe, setLocType] = useState('');
  const [locationmodalVisible, setLocationModalVisible] = useState(false);
  const [otherModal, setotherModalVisible] = useState(false);
  const [enableDropLocation, setEnableDropLocation] = useState(true);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('book'); // Default to 'book' tab
  const [formValues, setFormValues] = useState({
    vehicleType: null,
    vehicleTypeId: null,  // Store the vehicleType ID
    pickupLocation: { location: '', lat: null, lon: null },
    dropLocation: { location: '', lat: null, lon: null },
    vehicleCategory: null,
    vehicleCategoryId: null, // Store the vehicleCategory ID
  });
  const [vehicleCategoryArr, setVehcileCatgory] = useState([]);
  const routes = [
    { key: 'book', title: 'Book' },
    { key: 'history', title: 'History' },
  ];
  useFocusEffect(
    React.useCallback(() => {
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
  const renderLabel = (label, isRequired = false) => (
    <Text style={[styles.label, { color: COLORS[theme].textPrimary }]}>
      {label}
      {isRequired && <Text style={{ color: 'red' }}> *</Text>}
    </Text>
  );
  const openModal = (type, title, data) => {
    setModalType(type);
    setModalTitle(title);
    setModalData(data);
    setModalVisible(true);
  };

  const handleModalSelect = (item) => {
    if (modalType === 'vehicleCategory') {
      setFormValues((prev) => ({
        ...prev,
        vehicleCategory: item.label,
        vehicleCategoryId: item.value,  // Store the vehicleCategory ID
        vehicleType: null,
        vehicleTypeId: null,  // Reset vehicleType ID when a new category is selected
      }));
      setEnableDropLocation(item?.enableDropLocation ?? true);

      setVehicleTypes(
        item?.vehicles?.map(service => ({
          label: service.name,
          value: service._id,
        })) || []
      );
    } else if (modalType === 'vehicleType') {
      setFormValues((prev) => ({
        ...prev,
        vehicleType: item.label,
        vehicleTypeId: item.value,  // Store the vehicleType ID
      }));
    }
    setModalVisible(false);
  };

  const openLocationModal = (type) => {
    setLocationModalVisible(true);
    setLocType(type);
    setModalData(type);
  };

  const handleLocationConfirm = (location, address, type) => {
    if (type === 'pickup') {
      setFormValues((prev) => ({
        ...prev,
        pickupLocation: { location: address, lat: location.latitude, lon: location.longitude },
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        dropLocation: { location: address, lat: location.latitude, lon: location.longitude },
      }));
    }
    setLocationModalVisible(false);
  };
  const getHomePageData = async () => {
    setLoading(true);
    try {
      const data = await fetchData('getvehiclecategories', 'GET', null, null);
      setVehcileCatgory(
        data?.data?.result?.map(category => ({
          label: category.name,
          value: category._id,
          image: category.image,
          vehicles: category?.vehicles,
          enableDropLocation: category?.enableDropLocation ?? true,
        })) || []
      );
      // console.log('Vehicle Categories', JSON.stringify(
      //   data?.data?.result?.map(category => ({
      //     label: category.name,
      //   }))
      // ));
    } catch (error) {
      console.error('Error fetching home page data:', error);
      // ToastAndroid.show(data?.data?.message, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };


  const getDriversData = async () => {
    // console.log('FormSubmit', formValues);

    setLoading(true);  // Show loader when fetching data
    if (!formValues?.vehicleCategoryId || !formValues?.vehicleTypeId || !formValues?.pickupLocation?.lat) {
      setLoading(false);  // Show loader when fetching data
      showMessage({
        message: 'All Fields Required',
        type: 'danger',
      });
      return
    }
    let payLoad = {
      user_id: profile?.user_id,
      vehicle_id: formValues?.vehicleTypeId,
      category_id: formValues?.vehicleCategoryId,
      category_name: formValues?.vehicleCategory,
      currentLoc: formValues?.pickupLocation?.location,
      current_lat: formValues?.pickupLocation?.lat,
      current_lon: formValues?.pickupLocation?.lon,
      drop_location: formValues?.dropLocation?.location ?? '',
      drop_lat: formValues?.dropLocation?.lat,
      drop_lon: formValues?.dropLocation?.lon ?? '',
    }
    try {
      const data = await fetchData('getdrivers', 'POST', payLoad, null);
      if (data?.available_drivers) {
        setDriverInfo(data);
        setConfirmModal(data?.available_drivers);
        showMessage({
          message: data.message,
          type: 'info',
        });
      } else {
        showMessage({
          message: data.message,
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);  // Hide loader after data is fetched
    }
  };

  useFocusEffect(
    useCallback(() => {
      getHomePageData();
    }, [])
  );

  const renderDropdownField = (label, value, onPress, error, isRequired = true) => (
    <View style={styles.fieldContainer}>
      {renderLabel(label, isRequired)}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={[
          styles.dropdown,
          { borderColor: error ? 'red' : COLORS[theme].textPrimary, flexDirection: "row", justifyContent: "space-between" },
        ]}>
          <Text style={[poppins.regular.h7,
          styles.dropdownText,
          { color: value ? COLORS[theme].textPrimary : COLORS[theme].textPrimary, lineHeight: hp(3) },
          ]}>
            {value || `Select ${label}`}
          </Text>
          <MaterialCommunityIcon
            style={{ marginHorizontal: hp(2) }}
            name={"chevron-right"}
            size={wp(7)}
            color={COLORS[theme].textPrimary}
          />
        </View>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const navigation = useNavigation();
  //enableDropLocation
  const handleBookNow = async () => {
    let payLoad = {
      user_id: profile?.user_id,
      vehicle_id: formValues?.vehicleTypeId,
      category_id: formValues?.vehicleCategoryId,
      category_name: formValues?.vehicleCategory,
      pickup_location: formValues?.pickupLocation?.location,
      pickup_lat: formValues?.pickupLocation?.lat,
      pickup_lon: formValues?.pickupLocation?.lon,

      // ✅ If drop location is missing, use pickup location instead
      drop_location: formValues?.dropLocation?.location || formValues?.pickupLocation?.location,
      drop_lat: formValues?.dropLocation?.lat || formValues?.pickupLocation?.lat,
      drop_lon: formValues?.dropLocation?.lon || formValues?.pickupLocation?.lon,
      enableDropLocation: enableDropLocation,
    };

    setLoading(true);  // Show loader when fetching data
    try {
      const data = await fetchData('booktransport', 'POST', payLoad,
        {
          Authorization: `${accessToken}`,
          user_id: profile?.user_id,
          type: "user"
        }
      );
      if (data?.status == true || data?.status == "true") {
        showMessage({
          message: data.message,
          type: 'success',
        });
        setActiveTab('history');
        navigation?.navigate('TrackBookings', {
          selectedItem: data
        })
        setFormValues(
          {
            vehicleType: null,
            vehicleTypeId: null,  // Store the vehicleType ID
            pickupLocation: { location: '', lat: null, lon: null },
            dropLocation: { location: '', lat: null, lon: null },
            vehicleCategory: null,
            vehicleCategoryId: null, // Store the vehicleCategory ID
          }
        )
      } else {
        showMessage({
          message: data.message,
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);  // Hide loader after data is fetched
      setConfirmModal(false)
    }
  }
  // State for managing tab selection
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20; // Only respond to horizontal swipes
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Prevent swipe action if modal is open
        if (locationmodalVisible) return;
        const swipeDistance = gestureState.dx;
        if (swipeDistance > 80) {
          setActiveTab('book');
        } else if (swipeDistance < -80) {
          // Swiped left
          setActiveTab('history');
        } else {

        }
      },
    })
  ).current;



  return (
    <GestureHandlerRootView style={{ flex: 1, padding: wp(1), opacity: modalVisible ? 0.1 : 1 }}
      {...(!locationmodalVisible && !otherModal ? panResponder.panHandlers : {})}
    >
      <FlashMessage />
      <HeaderBar title={t('Pickup/drop') || 'Orders'} showBackButton={false} />
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {routes.map(route => (
          <TouchableOpacity
            key={route.key}
            onPress={() => setActiveTab(route.key)}
            style={[
              styles.tabButton,
              activeTab === route.key && {
                borderColor: COLORS[theme].accent, borderBottomWidth: wp(1)
              }
            ]}
          >
            <Text
              style={[activeTab == route.key ? poppins.semi_bold.h5 : poppins.regular.h6,
              {
                color: COLORS[theme].textPrimary,
              }
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab == 'book' ?
        <>
          {
            confirmModal ?
              <View style={{ position: "absolute", alignSelf: "center", bottom: hp(0) }}>
                <ConfirmModalBookings onBookNow={() => handleBookNow()} driverInfo={driverInfo} formValues={formValues} confirmModal={confirmModal} onEdit={() => setConfirmModal(false)} />
              </View>
              :
              <>
                <View style={{ marginHorizontal: hp(1), }}>
                  <View style={styles.section}>
                    {loading ?
                      <ActivityIndicator />
                      :
                      renderDropdownField(
                        'Vehicle Category',
                        formValues.vehicleCategory,
                        () => openModal('vehicleCategory', 'Select Vehicle Category', vehicleCategoryArr),
                        errors?.vehicleCategory
                      )}
                    {renderDropdownField(
                      'Vehicle Type',
                      formValues.vehicleType,
                      () => openModal('vehicleType', 'Select Vehicle Type', vehicleTypes),
                      errors?.vehicleType
                    )}
                  </View>
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: COLORS[theme].textPrimary }]}>Pickup Location <Text style={{ color: 'red' }}>*</Text></Text>

                    <TouchableOpacity onPress={() => openLocationModal('pickup')}>
                      <View style={[styles.dropdown, { borderColor: COLORS[theme].textPrimary }]}>
                        <Text style={[styles.dropdownText, { color: COLORS[theme].textPrimary }]}>
                          {formValues?.pickupLocation?.location || "Select Service Location"}
                        </Text>

                        <MaterialCommunityIcon
                          style={{ marginHorizontal: hp(2) }}
                          name={"truck-delivery"}
                          size={wp(7)}
                          color={COLORS[theme].textPrimary}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  {enableDropLocation && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: COLORS[theme].textPrimary }]}>
                        Drop Location <Text style={{ color: 'red' }}>*</Text>
                      </Text>
                      <TouchableOpacity onPress={() => openLocationModal('drop')} style={styles.fieldContainer}>
                        <View style={[styles.dropdown, { borderColor: COLORS[theme].textPrimary }]}>
                          <Text style={[styles.dropdownText, { color: COLORS[theme].textPrimary }]}>
                            {formValues?.dropLocation?.location || 'Select Drop Location'}
                          </Text>
                          <MaterialCommunityIcon
                            style={{ marginHorizontal: hp(2), transform: [{ scaleX: -1 }] }}
                            name={"truck-delivery"}
                            size={wp(7)}
                            color={COLORS[theme].textPrimary}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => getDriversData()}
                  style={{
                    backgroundColor: COLORS[theme].accent,
                    width: wp(95),
                    height: wp(14),
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: wp(2),
                  }}
                  disabled={loading}  // Disable button while loading
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS[theme].white} />
                  ) : (
                    <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].white }]}>
                      {'Get Drivers'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
          }
        </>
        :
        <BookingsList
          onModalToggle={(visible) => setotherModalVisible(visible)}
        />
      }
      {modalTitle !== 'Select Vehicle Category' &&
        <SelectionModal
          visible={modalVisible}
          data={modalData}
          title={modalTitle}
          onSelect={handleModalSelect}
          onDismiss={() => setModalVisible(false)}
          multiSelect={modalType === 'serviceType'}
          selectedValues={modalType === 'serviceType' ? formValues.vehicleType : []}
        />
      }
      {modalTitle == 'Select Vehicle Category' &&
        <SelectVehicleModal
          visible={modalVisible}
          data={modalData}
          title={modalTitle}
          onSelect={handleModalSelect}
          onDismiss={() => setModalVisible(false)}
          multiSelect={modalType === 'serviceType'}
          selectedValues={modalType === 'serviceType' ? formValues.vehicleType : []}
        />}
      <SelectLocation
        type={locaTYpe}
        visible={locationmodalVisible}
        onDismiss={() => setLocationModalVisible(false)}
        onConfirm={handleLocationConfirm}
      />
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  section: {
    marginBottom: hp(1),
  }, sectionTitle: { fontSize: wp(4), fontWeight: '600', marginBottom: hp(1), },
  fieldContainer: { marginBottom: hp(2) },
  label: {
    marginBottom: hp(0.8), fontSize: wp(3.8), fontWeight: '500',
  }, dropdown: {
    borderWidth: 1, borderRadius: 8, paddingVertical: hp(1.5), paddingHorizontal: hp(1),
    flexDirection: "row",
    justifyContent: "space-between"
  }, dropdownText: {
    fontSize: wp(3.8),
    width: wp(75), textTransform: "capitalize"
  },
  errorText: {
    color: 'red', fontSize: wp(3), marginTop: hp(0.5),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp(2),
    alignItems: "center",
    width: wp(100),
  },
  tabButton: {
    paddingVertical: hp(0.5),
    width: wp(40),
    alignItems: "center", borderRadius: wp(1)
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabText: {
  },
  activeTabText: {
    fontWeight: 'bold',
  },
});
export default OrdersScreen;
