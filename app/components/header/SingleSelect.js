import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TouchableWithoutFeedback,
    StyleSheet,
} from 'react-native';
import { wp, hp } from '../../resources/dimensions';
import { COLORS } from '../../resources/colors';
import { useTheme } from '../../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SingleSelectModal = ({
    visible = false,
    data = [],
    title = 'Select an Option',
    onSelect = () => { },
    onDismiss = () => { },
    selectedValue = null,
}) => {
    const { theme } = useTheme();

    const renderItem = ({ item }) => {
        const isSelected = selectedValue === item.value;
        return (
            <TouchableOpacity
                style={[
                    styles.optionRow,
                    { backgroundColor: isSelected ? COLORS[theme].accent + '22' : 'transparent' },
                ]}
                onPress={() => {
                    onSelect(item);
                    onDismiss();
                }}
            >
                <Text style={[styles.optionText, { color: COLORS[theme].textPrimary,textTransform:"capitalize" }]}>
                    {item.label}
                </Text>

                {isSelected && (
                    <MaterialIcons
                        name="check"
                        size={wp(6)}
                        color={COLORS[theme].accent}
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <View style={styles.wrapper}>
                {/* Dimmed background */}
                <TouchableWithoutFeedback onPress={onDismiss}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet Container */}
                <View
                    style={[
                        styles.container,
                        { backgroundColor: COLORS[theme].background },
                    ]}
                >
                    <Text style={[styles.title, { color: COLORS[theme].textPrimary }]}>
                        {title}
                    </Text>

                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => `${item.value}-${index}`}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: hp(2) }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    wrapper: { flex: 1, justifyContent: 'flex-end' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    container: {
        borderTopLeftRadius: wp(4),
        borderTopRightRadius: wp(4),
        paddingVertical: hp(2),
        paddingHorizontal: wp(4),
        maxHeight: hp(60),
        borderWidth: wp(0.5), borderColor: "#ccc"

    },
    title: {
        fontSize: wp(5),
        fontWeight: '600',
        marginBottom: hp(2),
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(1.8),
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    optionText: {
        fontSize: wp(4),
    },
});

export default SingleSelectModal;
