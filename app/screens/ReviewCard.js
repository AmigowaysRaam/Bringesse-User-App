import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReviewCard = ({ orderDetail, title }) => {

  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(!expanded);
  };

  if (orderDetail?.review == null) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: COLORS[theme].accent }]}
      activeOpacity={0.8}
      onPress={toggleExpand}
    >
      {/* LEFT SECTION */}
      <View style={styles.leftSection}>
        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons
            name="star"
            size={wp(5)}
            color={COLORS[theme].yellow || '#FFD700'}
          />
          <Text
            style={[
              poppins.semi_bold.h5,
              styles.ratingText,
              { color: COLORS[theme].white },
            ]}
          >
            {orderDetail?.rating || 0}
          </Text>
          <Text
            style={[
              poppins.regular.h7,
              styles.ratingText,
              { color: COLORS[theme].white },
            ]}
          >
            {title}
          </Text>
        </View>

        {/* Review Text with Scroll */}
        {expanded && (
          <ScrollView
            style={styles.reviewScroll}
            showsVerticalScrollIndicator={true}
          >
            <Text
              style={[
                poppins.regular.h9,
                { color: COLORS[theme].white },
              ]}
            >
              {orderDetail?.review || 'No review provided.'}
            </Text>
          </ScrollView>
        )}
      </View>

      {/* Arrow Icon */}
      <MaterialCommunityIcons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={wp(7)}
        color={COLORS[theme].white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: wp(2),
    paddingHorizontal: wp(4),
    marginVertical: wp(1),
    width: wp(95),
    alignSelf: 'center',
    borderRadius: wp(1),
    elevation: 3,
  },
  leftSection: {
    width: wp(70),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: wp(2),
    textTransform: 'capitalize',
    marginTop: hp(0.3),
  },
  reviewScroll: {
    width: wp(80),
    marginTop: hp(1),
    maxHeight: hp(60), // 🔥 Scroll activates after this height
  },
});
export default ReviewCard;