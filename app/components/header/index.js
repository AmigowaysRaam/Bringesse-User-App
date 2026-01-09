import {
  StyleSheet, Text, TouchableOpacity, View, Animated,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { hp, wp } from '../../resources/dimensions';
import { poppins } from '../../resources/fonts';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../resources/colors';
import Icons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from '../../resources/styles';
import { useTheme } from '../../context/ThemeContext';

const HeaderBar = ({
  showBackArrow = false, title = '', subMenu = '', showRightArrow = '',
  onRightArrowPress = () => { }, }) => {
    const navigation = useNavigation();
  const { theme } = useTheme();
  // 🔹 Animation value
  const slideAnim = useRef(new Animated.Value(-hp(10))).current;

  useEffect(() => {
    if (showRightArrow !== '') {
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, 800); // ⏱ 1 second delay

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(0); // No animation
    }
  }, [showRightArrow]);

  return (
    <Animated.View
      style={[
        { alignItems: 'center', transform: [{ translateY: slideAnim }] },
        commonStyles[theme].shadow,
      ]}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: COLORS[theme].background },
        ]}
      >
        {/* Left Back Arrow */}
        {showBackArrow && (
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Icons
              name="chevron-back"
              color={COLORS[theme].textPrimary}
              size={wp(6)}
            />
          </TouchableOpacity>
        )}

        {/* Title & Submenu */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            marginLeft: showBackArrow ? wp(2) : wp(4),
          }}
        >
          <Text
            numberOfLines={1}
            style={[
              poppins.semi_bold.h6,
              {
                color: COLORS[theme].textPrimary,
                textTransform: 'capitalize',
                lineHeight: hp(2.5),
                fontSize: wp(4.5)
              },
            ]}
          >
            {title}
          </Text>

          {subMenu !== '' && (
            <Text
              numberOfLines={1}
              style={[
                poppins.regular.h9,
                {
                  color: COLORS[theme].textPrimary,
                  textTransform: 'capitalize',
                  lineHeight: hp(2.2),
                },
              ]}
            >
              {subMenu}
            </Text>
          )}
        </View>

        {/* Right Arrow */}
        {showRightArrow !== '' && (
          <TouchableOpacity
            onPress={onRightArrowPress}
            style={styles.rightButton}
          >
            <Icons
              name={showRightArrow}
              color={COLORS[theme].textPrimary}
              size={wp(6)}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(7),
    width: wp(100),
    borderBottomWidth: wp(0.1),
    borderColor: '#CCC',
    marginBottom: wp(4),
    paddingHorizontal: wp(3),
  },
  backButton: {
    padding: wp(1),
    marginRight: wp(2),
    zIndex: 999,
  },
  rightButton: {
    padding: wp(1),
    marginLeft: wp(2),
  },
});
export default HeaderBar;
