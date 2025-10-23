import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { hp, wp } from '../../resources/dimensions';
import { poppins } from '../../resources/fonts';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../resources/colors';
import Icons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from '../../resources/styles';
import { useTheme } from '../../context/ThemeContext';

const HeaderBar = ({
  // data,
  // profileImg,
  // align,
  // showTitleOnly = false,
  showBackArrow,
  title = '',
  onBackIconPress,
  // messageCount, loggedType
}) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[{ alignItems: 'center' }, commonStyles[theme].shadow]}>
    
        <View style={[styles.container]}>
          {showBackArrow && (
            <TouchableOpacity onPress={()=>navigation?.goBack()} style={styles.backButton}>
              <Icons
                name="chevron-back"
                color={COLORS[theme].textPrimary}
                size={wp(6)}
              />
            </TouchableOpacity>
          )}
          <View
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'flex-start',
              justifyContent: 'center',
              position: 'absolute',
              marginLeft: showBackArrow ? wp(12) : wp(4),
            }}
          >
            <Text
              numberOfLines={1}
              style={[
                poppins.regular.h4,
                {
                  color: COLORS[theme].textPrimary,
                  maxWidth: wp(60),
                  textTransform: "capitalize",
                  lineHeight: hp(4),
                },
              ]}
            >
              {title}
            </Text>
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(7),
    width: wp(100),
    marginBottom:wp(1),borderBottomWidth:wp(0.1),borderColor:"#CCC",marginBottom:wp(4)
  },
  actionContainer: {
    flexDirection: 'row',
    marginEnd: wp(4),
    gap: wp(3),
    alignItems: 'center',
  },
  backButton: {
    padding: wp(2),
    zIndex: 999,
  },
});

export default HeaderBar;
