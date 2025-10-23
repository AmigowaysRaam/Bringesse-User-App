import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../resources/colors';
import { wp, hp } from '../../resources/dimensions';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const SelectionModal = ({
  visible,
  data = [],
  onSelect,
  onDismiss,
  title = 'Select an option',
  multiSelect = false,
  selectedValues = [],
  maxSelection = 3,
}) => {
  const { theme } = useTheme();
  const [localSelected, setLocalSelected] = useState([]);

  useEffect(() => {
    setLocalSelected(selectedValues || []);
  }, [selectedValues, visible]);

  const toggleItem = (item) => {
    const exists = localSelected.find(val => val === item.value);
    if (exists) {
      setLocalSelected(prev => prev.filter(val => val !== item.value));
    } else {
      if (localSelected.length >= maxSelection) return;
      setLocalSelected(prev => [...prev, item.value]);
    }
  };

  const handleConfirm = () => {
    const selectedItems = data.filter(item => localSelected.includes(item.value));
    onSelect(selectedItems);
    onDismiss();
  };

  const renderItem = ({ item }) => {
    const isSelected = localSelected.includes(item.value);
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            borderBottomColor: COLORS[theme].border,
            backgroundColor: isSelected ? COLORS[theme].accent + '22' : 'transparent',
          },
        ]}
        onPress={() =>
          multiSelect ? toggleItem(item) : (onSelect(item), onDismiss())
        }
      >
          {multiSelect  && (
          // <Text style={{ color: COLORS[theme].accent }}>✓</Text>
          <MaterialCommunityIcon
          name= {isSelected? "check-circle" :'circle-outline'}
          size={wp(6)}
          color={COLORS[theme].white} style={{ marginRight: wp(3) }}
        />
)}
        <Text style={[styles.itemText, { color: COLORS[theme].textPrimary }]}>
          {item?.label}
        </Text>
      
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.modalContainer, { backgroundColor: COLORS[theme].background }]}>
        <Text style={[styles.title, { color: COLORS[theme].textPrimary }]}>{title}</Text>

        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.value}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: hp(2) }}
        />

        {multiSelect && (
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: COLORS[theme].accent }]}
            onPress={handleConfirm}
          >
            <Text style={{ color: COLORS[theme].white, textAlign: 'center' }}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(95),
    maxHeight: hp(60),
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    paddingHorizontal: wp(5),
    paddingVertical: wp(4),
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: wp(5),
    marginBottom: wp(3),
  },
  itemContainer: {
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  itemText: {
    // fontSize: wp(4.3),
  },
  doneButton: {
    marginTop: hp(2),
    paddingVertical: hp(1.3),
    borderRadius: 5,
  },
});

export default SelectionModal;
