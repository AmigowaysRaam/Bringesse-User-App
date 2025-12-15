import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TouchableWithoutFeedback,
    StyleSheet
} from 'react-native';
import { wp, hp } from '../../resources/dimensions';
import { COLORS } from '../../resources/colors';
import { useTheme } from '../../context/ThemeContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CouponModal = ({
    visible = false,
    data = [],
    title = 'Available Coupons',
    onSelect = () => {},
    onDismiss = () => {},
    selectedValue = null,
}) => {
    const { theme } = useTheme();

    useEffect(() => {
        console.log("COUPON DATA → ", JSON.stringify(data));
    }, []);

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedValue === item._id;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        borderColor: isSelected ? COLORS[theme].accent : "#ddd",
                        backgroundColor: COLORS[theme].cardBackground
                    }
                ]}
                onPress={() => {
                    onSelect(item);
                    onDismiss();
                }}
            >
                {/* Discount Badge */}
                <View style={[styles.discountBadge, { backgroundColor: COLORS[theme].accent }]}>
                    <Text style={styles.discountText}>
                        {item.discountType === "percentage"
                            ? `${item.discountValue}% OFF`
                            : `₹${item.discountValue} OFF`}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.name, { color: COLORS[theme].textPrimary }]}>
                            {item.name}
                        </Text>

                        <Text style={[styles.code, { color: COLORS[theme].textPrimary }]}>
                            Code: {item.code}
                        </Text>

                        <Text style={[styles.validity, { color: COLORS[theme].textPrimary }]}>
                            Valid: {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </Text>
                    </View>

                    {isSelected && (
                        <MaterialIcons
                            name="check-circle"
                            size={wp(7)}
                            color={COLORS[theme].accent}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
            <View style={styles.wrapper}>

                {/* Background overlay */}
                <TouchableWithoutFeedback onPress={onDismiss}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet Container */}
                <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>

                    {/* Header with Back Button */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={onDismiss} style={styles.backBtn}>
                            <MaterialIcons
                                name="arrow-back-ios"
                                size={wp(6)}
                                color={COLORS[theme].textPrimary}
                            />
                        </TouchableOpacity>

                        <Text style={[styles.title, { color: COLORS[theme].textPrimary }]}>
                            {title}
                        </Text>

                        {/* Placeholder for alignment */}
                        <View style={{ width: wp(6) }} />
                    </View>

                    {/* Coupon List */}
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => `${item._id}-${index}`}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: hp(2) }}
                        showsVerticalScrollIndicator={false}
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
        backgroundColor: 'rgba(0,0,0,1)',
        // backgroundColor:"red"
    },

    container: {
        paddingVertical: hp(2),
        paddingHorizontal: wp(4),
        height: hp(93),
        elevation: 15,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -5 },
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: hp(1.5),
    },

    backBtn: {
        padding: wp(1),
        paddingRight: wp(1),
        justifyContent: "center",
    },

    title: {
        fontSize: wp(5.2),
        fontWeight: '700',
        textAlign: "center",
        flex: 1,
    },

    card: {
        borderWidth: 1,
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 6,
        backgroundColor: "#fff",
    },

    discountBadge: {
        position: "absolute",
        top: wp(2),
        right: wp(2),
        paddingVertical: wp(1),
        paddingHorizontal: wp(3),
        borderRadius: wp(2),
    },

    discountText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: wp(3.5),
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    name: {
        fontSize: wp(4.4),
        fontWeight: "600",
        marginBottom: wp(1),
    },

    code: {
        fontSize: wp(3.5),
        marginBottom: wp(0.6),
    },

    validity: {
        fontSize: wp(3.1),
    },
});

export default CouponModal;
