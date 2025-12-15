import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { poppins } from '../resources/fonts';

const ApplyCoupon = ({
  onApplyCoupon,
  appliedCoupon,
  successMsg,
  removeCoupon
}) => {
  const { theme } = useTheme();
  const [coupon, setCoupon] = useState(appliedCoupon);

  useEffect(() => {
    setCoupon(appliedCoupon);
  }, [appliedCoupon]);

  return (
    <View style={[styles.card,]}>
      <TouchableOpacity
        onPress={() => onApplyCoupon(coupon)}
        activeOpacity={0.8}
      >
        {/* Input container with optional gradient */}
        <LinearGradient
          colors={appliedCoupon ? ['#ff3333', '#FD3A69'] : [COLORS[theme].background, COLORS[theme].background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.inputContainer, {
            borderColor: appliedCoupon ? COLORS[theme].background : '#ccc'
          }]}
        >
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.input, { color: appliedCoupon ? '#fff' : COLORS[theme].textPrimary }]}>
              {appliedCoupon ? (
                <>
                  <Text style={{ fontWeight: '900' }}>{appliedCoupon.code}</Text>
                  <Text style={[poppins.semi_bold.h7, { color: '#fff' }]}>  •  {appliedCoupon.discountType === "percentage"
                    ? `${appliedCoupon.discountValue}% OFF`
                    : `₹${appliedCoupon.discountValue} OFF`}
                  </Text>
                </>
              ) : (
                "Apply coupon"
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => appliedCoupon ? removeCoupon() : onApplyCoupon(coupon)}
          >
            <MaterialCommunityIcon
              name={appliedCoupon ? 'close' : 'chevron-right'}
              size={wp(6)}
              color={appliedCoupon ? '#fff' : COLORS[theme].textPrimary}
            />
          </TouchableOpacity>
        </LinearGradient>
        {successMsg != '' &&
          <Text style={[poppins.semi_bold.h9, { color: COLORS[theme].accent, margin: wp(1) }]}>{successMsg ? successMsg : ""}</Text>
        }
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    height: hp(5.5),
    borderWidth: wp(0.3),
    borderRadius: wp(2)
  },
  input: {
    fontSize: wp(3),
    justifyContent: 'center',
    paddingVertical: 0,
    alignItems: "center",
  },
  applyButton: {
    paddingHorizontal: wp(1),
    paddingVertical: hp(1),
    // borderRadius: wp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ApplyCoupon;
