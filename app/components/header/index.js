import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { hp, wp } from '../../resources/dimensions';
import { poppins } from '../../resources/fonts';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../resources/colors';
import Icons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from '../../resources/styles';
import { useTheme } from '../../context/ThemeContext';

/**
 * HeaderBar Component
 * @param {boolean} showBackArrow - Whether to show the left back arrow.
 * @param {string} title - The main title text.
 * @param {string} subMenu - Optional subtitle text.
 * @param {boolean} showRightArrow - Whether to show the right arrow icon.
 * @param {function} onRightArrowPress - Function triggered when right arrow is pressed.
 */
const HeaderBar = ({
  showBackArrow = false,
  title = '',
  subMenu = '',
  showRightArrow = '',
  onRightArrowPress = () => {},
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[{ alignItems: 'center' }, commonStyles[theme].shadow]}>
      <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
        
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
              poppins.semi_bold.h5,
              {
                color: COLORS[theme].textPrimary,
                textTransform: 'capitalize',
                lineHeight: hp(2.5),
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
                  color: COLORS[theme].textSecondary,
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
        {showRightArrow != '' && (
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
    </View>
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
