import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';

const ConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'Do you want to proceed with this action?',
    confirmText = 'Yes',
    cancelText = 'No',
    containerStyle,
    titleStyle,
    messageStyle,
    confirmButtonStyle,
    cancelButtonStyle,
    confirmTextStyle,
    cancelTextStyle,
}) => {
    const { theme } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: COLORS[theme].viewBackground }, containerStyle]}>
                    <Text style={[poppins.semi_bold.h5, { color: COLORS[theme].textPrimary, marginBottom: wp(2) }, titleStyle]}>
                        {title}
                    </Text>
                    <Text style={[poppins.regular.h6, { color: COLORS[theme].textPrimary, marginBottom: wp(4) }, messageStyle]}>
                        {message}
                    </Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: COLORS[theme].border }, cancelButtonStyle]}
                            onPress={onClose}
                        >
                            <Text style={[poppins.semi_bold.h6, { color: COLORS[theme].textPrimary }, cancelTextStyle]}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: COLORS[theme].accent }, confirmButtonStyle]}
                            onPress={onConfirm}
                        >
                            <Text style={[poppins.semi_bold.h6, { color: '#fff' }, confirmTextStyle]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',

    },
    modalContainer: {
        width: '95%',
        borderRadius: wp(3),
        padding: wp(4), borderWidth: 1, borderColor: "#CCC"
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        paddingVertical: wp(2),
        paddingHorizontal: wp(5),
        borderRadius: wp(2),
        marginRight: wp(2),
    },
    confirmButton: {
        paddingVertical: wp(2),
        paddingHorizontal: wp(5),
        borderRadius: wp(2),
    },
});
export default ConfirmationModal;
