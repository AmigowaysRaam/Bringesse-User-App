import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Text,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Animated,
    Easing
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const ProductVariantModal = ({ productData, close, addCart }) => {
    const { theme } = useTheme();
    const scrollRef = useRef(null);

    const [activeIndex, setActiveIndex] = useState(0);

    /** Animation Values */
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    const closeIconAnim = useRef(new Animated.Value(0)).current;  // For close icon animation
    const closeIconScaleAnim = useRef(new Animated.Value(0.8)).current; // Scale effect for close icon

    /** Trigger open animation */
    useEffect(() => {
        if (productData) {
            // Open animation for modal
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 350,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Close Icon Animation
            Animated.timing(closeIconAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            Animated.timing(closeIconScaleAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [productData]);

    /** Closing animation */
    const handleClose = () => {
        // Close animation for modal
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            close();
            setActiveIndex(0);
        });

        // Close Icon Animation
        Animated.timing(closeIconAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        Animated.timing(closeIconScaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    if (!productData) return null;

    const mediaWidth = screenWidth - wp(10);

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / mediaWidth);
        setActiveIndex(index);
    };

    const handleCart = (variant, index) => {
        addCart(productData, variant, index);
        handleClose();
    };

    return (
        <>
            <FlashMessage position="top" />
            <Modal visible={!!productData} transparent animationType="none">
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlay}>
                        {/* ✨ Animated Close Icon (Top-Center Outside Modal) */}
                        <Animated.View
                            style={[
                                styles.closeIconContainer,
                                {
                                    opacity: closeIconAnim,
                                    transform: [{ scale: closeIconScaleAnim }],
                                    backgroundColor: COLORS[theme].accent
                                }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="close" size={wp(8)} color="#fff" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Animated Container */}
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    backgroundColor: COLORS[theme].background,
                                    opacity: opacityAnim,
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ]
                                }
                            ]}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={{ flex: 1 }}
                            >
                                <ScrollView
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled={true}
                                >
                                    {/* PRODUCT DESCRIPTION */}
                                    {productData?.description ? (
                                        <Text
                                            style={[
                                                poppins.regular.h8,
                                                styles.description,
                                                { color: COLORS[theme].primary }
                                            ]}
                                        >
                                            {productData.description}
                                        </Text>
                                    ) : null}

                                    <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>
                                        Stock: {productData.stock_available ? 'Available' : 'Out of Stock'}
                                    </Text>

                                    {productData.noOfDaysToReturn !== '0' && (
                                        <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>
                                            Returns within: {productData.noOfDaysToReturn} days
                                        </Text>
                                    )}

                                    {/* VARIANT LIST */}
                                    {productData.variant_list?.length > 0 && (
                                        <View style={{ marginTop: hp(2) }}>
                                            {productData.variant_list.map((variant, index) => (
                                                <View key={index} style={styles.variantRow}>
                                                    <View>
                                                        <Text
                                                            style={[
                                                                poppins.regular.h8,
                                                                styles.variantTitle,
                                                                { color: COLORS[theme].primary }
                                                            ]}
                                                        >
                                                            {variant.name} - ₹{variant.totalAmount} / {variant.unit}
                                                        </Text>

                                                        <Text
                                                            style={[
                                                                poppins.regular.h9,
                                                                { color: COLORS[theme].primary }
                                                            ]}
                                                        >
                                                            GST: {variant.gst}% (CGST: {variant.cGstInPercent}% + SGST: {variant.sGstInPercent}%)
                                                        </Text>
                                                    </View>

                                                    <TouchableOpacity
                                                        onPress={() => handleCart(variant, index)}
                                                        style={[styles.addBtn, { backgroundColor: COLORS[theme].accent }]}
                                                    >
                                                        <Text style={[poppins.regular.h8, { color: COLORS[theme].white }]}>
                                                            Add
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                </ScrollView>
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>

            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        paddingBottom: hp(1),
        alignItems: "center"
    },

    /** ✨ Animated Close Button */
    closeIconContainer: {
        position: "absolute",
        top: hp(5),
        zIndex: 999,
        alignSelf: "center",
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        width: wp(95),
        height: hp(50),
        borderRadius: wp(4),
        padding: wp(4),
        borderWidth: 0,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 8,
    },

    scrollContent: {
        paddingBottom: hp(7),
    },

    description: {
        marginBottom: wp(2),
        textTransform: "capitalize"
    },

    variantRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: wp(3),
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },

    variantTitle: {
        marginBottom: wp(1),
        fontWeight: "600"
    },
    addBtn: {
        height: wp(9),
        borderRadius: wp(2),
        justifyContent: "center",
        paddingHorizontal: wp(3)
    },
    closeBtn: {
        marginTop: hp(1),
        paddingVertical: wp(3),
        borderRadius: wp(2),
        alignItems: 'center',
        alignSelf: 'center',
        width: wp(40)
    }
});

export default ProductVariantModal;
