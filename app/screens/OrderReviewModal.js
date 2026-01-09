import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, TextInput, ToastAndroid,
  Alert,
} from 'react-native';
import { COLORS } from '../resources/colors';
import { wp, hp } from '../resources/dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { poppins } from '../resources/fonts';
import { useTheme } from '../context/ThemeContext';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
const OrderReviewModal = ({ visible, onClose, bookingId, driver, reviewType, storeId }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const accessToken = useSelector((state) => state.Auth.accessToken);
  const profile = useSelector((state) => state.Auth.profile);
  // Alert.alert(reviewType)
  const titleText =
    reviewType === 'driver'
      ? 'Rate Your Driver'
      : 'Rate Your Order';

  const subtitleText =
    reviewType === 'driver'
      ? `How was your ride with ${driver?.driver_name || 'Driver'}?`
      : 'How was your product quality & delivery?';

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (!rating) return Alert.alert('Please select a rating!');
    // Alert.alert(JSON.stringify(bookingId))
    // return
    setLoading(true);
    try {
      const payload = {
        order_id: bookingId,
        rating,
        review,
        user_id: profile?.user_id,
        type: reviewType === 'driver' ? reviewType : 'store', // driver OR product
        source_id: reviewType === 'driver' ? driver?.driverid : storeId,
      };
      console.log(JSON.stringify(payload, null, 2), "payload")
      const response = await fetchData('updatereview', 'POST', payload, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      console.log(JSON.stringify(response, null, 2), "updatereview")

      // Alert.alert("response",JSON.stringify(response, null, 2))
      if (response?.status === true || response?.status === 'true') {
        ToastAndroid.show(response?.message, ToastAndroid.SHORT);
        onClose();
      } else {
        // alert(response?.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Review Submit Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Star Rendering
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const diff = rating - star;
      let icon = 'star-border';
      if (diff >= 0) icon = 'star';
      else if (diff >= -0.5) icon = 'star-half';

      return (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={{ marginHorizontal: wp(1) }}
        >
          <MaterialIcons
            name={icon}
            size={wp(10)}
            color={COLORS[theme].accent}
          />
        </TouchableOpacity>
      );
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: COLORS[theme].viewBackground },
          ]}
        >
          {/* ❌ CLOSE BUTTON */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons
              name="close"
              size={wp(7)}
              color={COLORS[theme].textPrimary}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={[
              poppins.medium.h5,
              { color: COLORS[theme].textPrimary, marginBottom: hp(1) },
            ]}
          >
            {titleText}
          </Text>

          {/* Subtitle */}
          <Text
            style={[
              poppins.regular.h7,
              { color: COLORS[theme].textPrimary, textAlign: 'center' },
            ]}
          >
            {subtitleText}
          </Text>

          {/* ⭐ Stars */}
          <View style={styles.starsRow}>{renderStars()}</View>

          {/* Input */}
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Write your feedback..."
            placeholderTextColor={COLORS[theme].placeholder}
            style={[
              styles.input,
              {
                borderColor: COLORS[theme].textPrimary,
                color: COLORS[theme].textPrimary,
              },
            ]}
            multiline
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              styles.button,
              { backgroundColor: COLORS[theme].accent },
            ]}
          >
            <Text style={[poppins.medium.h7, { color: COLORS[theme].white }]}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OrderReviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: wp(90),
    borderRadius: wp(3),
    padding: wp(6),
    position: 'relative',
  },

  closeBtn: {
    position: 'absolute',
    right: wp(3),
    top: wp(3),
    padding: wp(1.5),
    zIndex: 99,
  },

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: hp(2),
  },

  input: {
    borderWidth: 1,
    borderRadius: wp(2),
    padding: wp(3),
    minHeight: hp(12),
    marginBottom: hp(2),
  },

  button: {
    width: '100%',
    paddingVertical: hp(1.8),
    alignItems: 'center',
    borderRadius: wp(2),
  },
});
