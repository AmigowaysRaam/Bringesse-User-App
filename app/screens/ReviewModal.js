import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  PanResponder,
  ToastAndroid,
} from 'react-native';
import { COLORS } from '../resources/colors';
import { wp, hp } from '../resources/dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { poppins } from '../resources/fonts';
import { useTheme } from '../context/ThemeContext';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const ReviewModal = ({ visible, onClose, bookingId, driverName, driver }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const accessToken = useSelector(state => state.Auth.accessToken);
  const profile = useSelector(state => state?.Auth?.profile);
  const navigation = useNavigation();

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (!rating) return alert('Please select a rating!');
    setLoading(true);
    try {
      const payload = {
        order_id: bookingId,
        rating,
        review,
        source_id: driver?.driverid,
        type: 'driver',
        user_id: profile?.user_id,
      };
      const response = await fetchData('updatereview', 'POST', payload, {
        Authorization: `${accessToken}`,
        user_id: profile?.user_id,
        type: 'user',
      });
      // console.log('Review Submit Response:', response);
      if (response?.status == true || response?.status == 'true') {
        // alert('Thanks for your feedback!');
        ToastAndroid.show('Thanks for your feedback!', ToastAndroid.SHORT);
        // navigation.goBack();
        onClose();
      } else {
        alert(response?.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Review Submit Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render stars (with half-star logic)
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const starValue = rating - star;
      let icon = 'star-border';
      if (starValue >= 0) icon = 'star';
      else if (starValue >= -0.5) icon = 'star-half';

      return (
        <View key={star} style={{ flexDirection: 'row' }}>
          {/* Half-left touch */}
          <TouchableOpacity
            onPress={() => setRating(star - 0.5)}
            style={{ width: wp(4), height: wp(8) }}
          />
          {/* Half-right touch */}
          <TouchableOpacity
            onPress={() => setRating(star)}
            style={{ width: wp(10), height: wp(10), alignItems: 'center' }}
          >
            <MaterialIcons
              name={icon}
              size={wp(10)}
              color={COLORS[theme].accent}
            />
          </TouchableOpacity>
        </View>
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
          <Text
            style={[
              poppins.medium.h5,
              { color: COLORS[theme].textPrimary, marginBottom: hp(1) },
            ]}
          >
            {'Rate Your Ride'}
          </Text>
          <Text
            style={[poppins.regular.h7, { color: COLORS[theme].textPrimary }]}
          >
            {driverName
              ? `How was your ride with ${driverName}?`
              : 'How was your ride?'}
          </Text>

          {/* ⭐ Star Rating Row */}
          <View style={styles.starsRow}>{renderStars()}</View>
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Write your feedback..."
            multiline
            style={[
              styles.input,
              {
                color: COLORS[theme].textPrimary,
                borderColor: COLORS[theme].textPrimary,
              },
            ]}
            placeholderTextColor={COLORS[theme].placeholder}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.button,
                { backgroundColor: COLORS[theme].accent },
              ]}
            >
              <Text
                style={[poppins.medium.h7, { color: COLORS[theme].white }]}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(95),
    borderRadius: wp(3),
    padding: wp(5),
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
    minHeight: hp(10),
    marginBottom: hp(2), borderColor: "#CCC"
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: hp(1.5),
    alignItems: 'center',
    borderRadius: wp(2),
  },
});
