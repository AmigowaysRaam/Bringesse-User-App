import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, TouchableWithoutFeedback, Animated, Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const UserConfirmPayment = ({ showModal, onClose, grandTotal, onPaymentConfirm, cdata }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [visible, setVisible] = useState(showModal);
  const [error, setError] = useState(false);
  const slideAnim = useRef(new Animated.Value(hp(10))).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  // Extract payment options from cdata
  const paymentOptions = cdata?.storeDetails?.paymentOptions || [];
  useEffect(() => {
    if (showModal) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: hp(50),
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    }
  }, [showModal]);

  const handlePaymentSelection = (method) => {
    // Disable Cash on Delivery
    if (method.toLowerCase().includes('cash')) {
      setError(true);
      alert('Cash on Delivery is currently unavailable. Please choose an online payment method.');
      return;
    }
    setSelectedPaymentMethod(method);
    setError(false);
  };
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      setError(true);
      return;
    }
    try {
      if (onPaymentConfirm) await onPaymentConfirm(selectedPaymentMethod);
      setSelectedPaymentMethod(null);
      handleCloseModal();
    } catch (error) {
      console.error('Payment API error:', error);
    }
  };
  const handleCloseModal = () => {
    setSelectedPaymentMethod(null);
    setError(false);
    onClose();
  };
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: COLORS[theme].background,
            transform: [{ translateY: slideAnim }],
            borderColor: error && selectedPaymentMethod === null ? 'red' : '#CCC',
            borderWidth: wp(0.5),
          },
        ]}
      >
        {/* <Text>{JSON.stringify(paymentOptions)}</Text> */}
        <Text style={[poppins.regular.h7, { color: COLORS[theme].textPrimary, marginBottom: wp(4) }]}>
          {t("Choose Payment Method")}
        </Text>
        {paymentOptions.map((option, index) => {
          const isCOD = option.toLowerCase().includes('cash'); // check for Cash on Delivery
          let iconName = isCOD ? 'cash' : 'credit-card';
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.paymentOption,
                {
                  borderColor: selectedPaymentMethod === option ? COLORS[theme].accent : 'transparent',
                  backgroundColor: selectedPaymentMethod === option ? COLORS[theme].accent + '20' : 'transparent',
                  opacity: isCOD ? 0.5 : 1, // visually dim COD
                },
              ]}
              onPress={() => handlePaymentSelection(option)}
              disabled={isCOD} // disable COD
            >
              <MaterialCommunityIcons
                name={iconName}
                size={wp(7)}
                color={COLORS[theme].accent}
              />
              <View>
                <Text style={[poppins.regular.h8, styles.paymentText, { color: COLORS[theme].textPrimary }]}>
                  {t(option)}
                </Text>
                {isCOD &&
                  <Text style={[poppins.regular.h9, { color: 'red', marginLeft: wp(2) }]}>
                    {"(Currently Unavailable)"}
                  </Text>
                }
              </View>
            </TouchableOpacity>
          );
        })}
        {error && selectedPaymentMethod == null && (
          <Text style={[poppins.regular.h9, { alignSelf: "center", color: "red" }]}>
            {"Choose any One Payment"}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <View style={styles.amountContainer}>
            <Text
              style={[
                poppins.semi_bold.h8,
                { color: COLORS[theme].textPrimary },
              ]}
            >
              Payable Amount
            </Text>
            <Text
              style={[
                poppins.semi_bold.h6,
                { color: COLORS[theme].textPrimary, marginTop: hp(0.5) },
              ]}
            >
              Rs. {grandTotal}
            </Text>
          </View>
          <View
            style={[
              styles.verticalDivider,
              { backgroundColor: COLORS[theme].accent },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: COLORS[theme].buttonBg },
            ]}
            onPress={handleConfirmPayment}
          >
            <Text
              style={[
                poppins.semi_bold.h6,
                { color: COLORS[theme].buttonText },
              ]}
            >
              {t('Confirm')}
            </Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2.5),
  },

  amountContainer: {
    width: wp(40),
  },

  verticalDivider: {
    width: wp(0.6),
    height: hp(6),
    borderRadius: wp(1),
  },

  confirmButton: {
    width: wp(40),
    paddingVertical: wp(3),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContainer: {
    position: 'absolute',
    bottom: 0, width: '99%', padding: wp(6),
    borderTopLeftRadius: wp(6), borderTopRightRadius: wp(6),
    elevation: 15, alignSelf: "center",borderTopWidth:wp(2),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center', paddingVertical: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2), borderWidth: 2, marginBottom: hp(1.5),
  },
  paymentText: {
    fontSize: wp(5), marginLeft: wp(3),
  },
  cancelButton: {
    width: wp(42),
  },
  confirmButton: {
    paddingVertical: wp(3),
    borderRadius: wp(2), width: wp(42), alignItems: 'center',
  },
  buttonText: { lineHeight: wp(6.5) },
});

export default UserConfirmPayment;
