import React, { useState } from 'react';
import {
    View, Text, Modal, TouchableOpacity,
    FlatList, Image, StyleSheet,
} from 'react-native';
import { hp, wp } from '../resources/dimensions';
import { COLORS } from '../resources/colors';
import { poppins } from '../resources/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const ProductVariantSelector = ({ visible, product, onClose, onSelect, theme }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const handleSelect = (variant) => {
        setSelectedVariant(variant);
    };
    const handleConfirm = () => {
        if (selectedVariant) {
            onSelect({ ...product, selectedVariant, quantity: 1 }); // Default quantity 1
            onClose();
        } else {
            alert('Please select a variant');
        }
    };
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: COLORS[theme].cardBackground }]}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={wp(5)} color={COLORS[theme].textPrimary} />
                    </TouchableOpacity>
                    <Text style={[poppins.semi_bold.h7, { color: COLORS[theme].textPrimary, textAlign: 'center', textTransform: "capitalize" }]}>
                        {product?.name}
                    </Text>
                    <Text numberOfLines={4} style={[poppins.regular.h9, { color: COLORS[theme].textPrimary, marginBottom: hp(2), textTransform: "capitalize" }]}>
                        {product?.description}
                    </Text>
                    <Image
                        source={{ uri: product.image_url }}
                        style={styles.productImage}
                        resizeMode="contain"
                    />

                    <Text style={[poppins.semi_bold.h8, { marginVertical: hp(1.5), color: COLORS[theme].textPrimary }]}>
                        Select Variant
                    </Text>

                    <FlatList
                        data={product.variant_list || []}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.variantItem,
                                    { backgroundColor: selectedVariant?.name === item.name ? COLORS[theme].background : COLORS[theme].cardBackground },
                                    selectedVariant?.name === item.name
                                        ? { borderColor: COLORS[theme].accent, borderWidth: 2 }
                                        : { borderColor: '#ccc', borderWidth: 1 },
                                ]}
                                onPress={() => handleSelect(item)}
                            >
                                <View>
                                    <Text style={[poppins.regular.h8, { color: COLORS[theme].textPrimary }]}>
                                        {item.name} {item.unit} - ${item.price.toFixed(2)}
                                    </Text>
                                    {item.offer_available === "true" && (
                                        <Text style={{ color: 'green', fontSize: wp(3), marginTop: hp(0.5) }}>
                                            Offer: ${item.offer_price.toFixed(2)}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingVertical: hp(1) }}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.actionButton, { borderColor: '#ccc', backgroundColor: COLORS[theme].background }]} onPress={onClose}>
                            <Text style={[poppins.semi_bold.h8, { color: COLORS[theme].textPrimary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS[theme].accent }]} onPress={handleConfirm}>
                            <Text style={[poppins.semi_bold.h8, { color: '#fff' }]}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center', paddingHorizontal: wp(4),
    },
    modalContainer: {
        borderWidth: 1, borderColor:
            '#ccc',
        borderRadius: wp(3),
        padding: wp(4), maxHeight: hp(80),
    }, closeButton: {
        position: 'absolute',
        top: wp(3), right: wp(3),
        zIndex: 1, padding: wp(1),
    }, productImage: {
        width: '100%',
        height: hp(20), borderRadius: wp(2),
        marginBottom: hp(2), backgroundColor: '#f0f0f0',
    }, variantItem: {
        padding: wp(3), borderRadius: wp(2),
        marginVertical: hp(0.5), shadowColor: '#000',
        shadowOpacity: 0.1, shadowRadius: 5,
        elevation: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp(2),
    }, actionButton: {
        paddingVertical: hp(1.5), paddingHorizontal: wp(5),
        borderRadius: wp(2), width: '48%', alignItems: 'center',
    },
});
export default ProductVariantSelector;
