import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { poppins } from '../resources/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ProductVariantSelector = ({
    visible,
    product,
    onClose,
    onSelect,
    theme,
}) => {
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        if (!visible) setSelectedVariant(null);
    }, [visible]);

    const handleConfirm = () => {
        if (!selectedVariant) {
            alert('Please select a variant');
            return;
        }
        onSelect({ ...product, selectedVariant, quantity: 1 });
        onClose();
    };
    const renderVariant = ({ item }) => {
        const isSelected = selectedVariant?.name === item.name;
        const isOut = item?.['itemOutofStock '] === '1';
        return (
            <TouchableOpacity
                disabled={isOut}
                onPress={() => setSelectedVariant(item)}
                style={[
                    styles.variantCard,
                    {
                        backgroundColor: isSelected
                            ? COLORS[theme].background
                            : COLORS[theme].background,
                        borderColor: isSelected
                            ? COLORS[theme].accent
                            : '#ccc',
                        opacity: isOut ? 0.5 : 1,
                    },
                ]}
            >
                {/* Variant Name */}
                <Text
                    style={[
                        poppins.semi_bold.h8,
                        { color: COLORS[theme].textPrimary },
                    ]}
                >
                    {item.name} {item.unit}
                </Text>

                {/* Price Row */}
                <View style={styles.priceRow}>
                    {item.offer_available === 'true' ? (
                        <>
                            <Text style={styles.strikePrice}>₹{item.price}</Text>
                            <Text style={styles.offerPrice}>
                                ₹{item.offer_price}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.offerPrice}>₹{item.price}</Text>
                    )}
                </View>

                {/* Warranty */}
                {item?.itemWarranty && (
                    <View style={styles.warrantyBadge}>
                        <MaterialCommunityIcons
                            name="shield-check"
                            size={wp(3.5)}
                            color={COLORS[theme].accent}
                        />
                        <Text style={styles.warrantyText}>
                            {item.itemWarranty}
                        </Text>
                    </View>
                )}

                {/* Out of stock */}
                {isOut && (
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        { backgroundColor: COLORS[theme].background },
                    ]}
                >
                    {/* Close */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <MaterialCommunityIcons
                            name="close"
                            size={wp(5)}
                            color={COLORS[theme].textPrimary}
                        />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text
                        style={[
                            poppins.semi_bold.h7,
                            styles.title,
                            { color: COLORS[theme].textPrimary },
                        ]}
                    >
                        {product?.name}
                    </Text>

                    {/* Image */}
                    {/* <Image
            source={{ uri: product?.image_url }}
            style={styles.image}
            resizeMode="contain"
          /> */}

                    {/* Variants */}
                    <Text
                        style={[
                            poppins.semi_bold.h8,
                            { color: COLORS[theme].textPrimary, marginVertical: hp(1) },
                        ]}
                    >
                        Select Variant
                    </Text>

                    <FlatList
                        data={product?.variant_list || []}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={renderVariant}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[
                                styles.btn,
                                { backgroundColor: COLORS[theme].background, borderWidth: wp(0.5), borderColor: "#CCC" },
                            ]}
                        >
                            <Text
                                style={[
                                    poppins.semi_bold.h8,
                                    { color: COLORS[theme].textPrimary },
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={[
                                styles.btn,
                                { backgroundColor: COLORS[theme].accent },
                            ]}
                        >
                            <Text
                                style={[
                                    poppins.semi_bold.h8,
                                    { color: '#fff' },
                                ]}
                            >
                                Add to Cart
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ProductVariantSelector;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        paddingHorizontal: wp(4),
    },
    container: {
        width: wp(95),
        borderRadius: wp(3),
        padding: wp(4),
        maxHeight: hp(82),
        position: "absolute", bottom: hp(1), left: hp(1), borderWidth: wp(0.5), borderColor: "#CCC"
    },
    closeBtn: {
        position: 'absolute',
        top: wp(3),
        right: wp(3),
        zIndex: 1,
    },
    title: {
        textAlign: 'center',
        textTransform: 'capitalize',
        marginBottom: hp(1),
    },
    image: {
        width: '100%',
        height: hp(20),
        borderRadius: wp(2),
        backgroundColor: '#f2f2f2',
        marginBottom: hp(2),
    },

    /* Variant Card */
    variantCard: {
        borderWidth: wp(0.6),
        borderRadius: wp(2),
        paddingVertical: wp(2),
        marginBottom: hp(1),
        elevation: 2, paddingHorizontal: wp(4)
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(0.1),
    },
    strikePrice: {
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: wp(2),
    },
    offerPrice: {
        fontSize: wp(4),
        fontWeight: '700',
        color: '#2e7d32',
    },
    warrantyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(0.5),
    },
    warrantyText: {
        marginLeft: wp(1),
        fontSize: wp(3),
        color: '#555',
    },
    outOfStockText: {
        marginTop: hp(0.5),
        color: '#ff3b30',
        fontWeight: '600',
    },

    /* Actions */
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp(2),
    },
    btn: {
        width: '48%',
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: 'center',
    },
});
