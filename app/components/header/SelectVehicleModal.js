import React, { useState, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  FlatList, Animated, Image, Dimensions, UIManager, findNodeHandle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../resources/colors';
import { wp, hp } from '../../resources/dimensions';
import { poppins } from '../../resources/fonts';
import { IMAGE_ASSETS } from '../../resources/images';

const { width, height } = Dimensions.get('window');

const SelectVehicleModal = ({ visible, data = [], onSelect, onDismiss, title = 'Select Vehicle' }) => {
  const { theme } = useTheme();
  const [animatingItem, setAnimatingItem] = useState(null);
  const [selImage, setSelImag] = useState(null);

  // Animated values
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Ref to measure tapped image
  const itemRefs = useRef({});

  const runFloatingAnimation = (item) => {
    const handle = findNodeHandle(itemRefs.current[item.value]);
    if (!handle) return;

    UIManager.measure(handle, (x, y, w, h, px, py) => {
      setAnimatingItem({ item, layout: { pageX: px, pageY: py, width: w, height: h } });

      // Reset animation values
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);

      const centerX = width / 2 - px - w / 2;
      const centerY = height / 2 - py - h / 2;

      // Animate: scale to center + move to center, then slide to right outside
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 3, duration: 400, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: centerX, duration: 400, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: centerY, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(translateX, { toValue: width, duration: 900, useNativeDriver: true }),
      ]).start(() => {
        onSelect(item);
        setAnimatingItem(null);
        onDismiss();
      });
    });
  };
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        ref={(ref) => (itemRefs.current[item.value] = ref)}
        style={styles.itemWrapper}
        onPress={() => {
          runFloatingAnimation(item),
            setSelImag(item)
        }
        }
      >
        <Image
          resizeMode='contain'
          source={item.image ? { uri: item.image } : IMAGE_ASSETS.bringesUser}
          style={[styles.itemImage, {
            backgroundColor: theme == 'dark' ? '#333333' : '#f0f0f0'
          }]}
        />
        <Text style={[poppins.regular.h9, {
          color: COLORS[theme].textPrimary,
          marginTop: wp(1.5),
          textTransform: "capitalize",
          textAlign: "center"
        }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onDismiss}>
        {/* Background overlay */}
        {!animatingItem && <View style={styles.overlay} />}
        {/* Modal content */}
        {!animatingItem && (
          <View style={[styles.modalContainer, { backgroundColor: COLORS[theme].background }]}>
            <Text style={[styles.title, { color: COLORS[theme].textPrimary }]}>{title}</Text>
            <FlatList
              data={data}
              numColumns={2}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={renderItem}
              columnWrapperStyle={{ justifyContent: 'space-around' }}
              contentContainerStyle={{ paddingBottom: hp(6) }}
            />
          </View>
        )}
        {/* Floating animated image */}
        {animatingItem && (
          <Animated.View
            style={{
              position: 'absolute',
              top: animatingItem.layout.pageY,
              left: animatingItem.layout.pageX,
              width: animatingItem.layout.width,
              height: animatingItem.layout.height,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
              zIndex: 1000,
            }}
          >
            <Image
              source={{ uri: selImage?.image }}
              style={{ width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 0, }}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    position: 'absolute', bottom: 0,
    width: wp(95), alignSelf: "center",
    maxHeight: hp(80), borderTopLeftRadius: wp(4), borderTopRightRadius: wp(4),
    paddingHorizontal: wp(5), paddingVertical: wp(4),
    alignSelf: 'center', borderWidth: wp(0.5), borderColor: '#ccc',
  },
  title: {
    fontSize: wp(5), marginBottom: wp(3),
  },
  itemWrapper: {
    paddingVertical: hp(1), alignItems: "center",
  },
  itemImage: {
    width: wp(30),           // fixed width
    height: wp(30),          // fixed height
    resizeMode: "contain",     // fill container
    borderRadius: wp(1),     // optional rounded corners
  },
});
export default SelectVehicleModal;