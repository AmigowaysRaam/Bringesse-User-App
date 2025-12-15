import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Text,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    Image,
    ScrollView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Animated,
    Easing
} from 'react-native';
import Video from 'react-native-video';
import FlashMessage from 'react-native-flash-message';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get('window');

const ProductDetailModal = ({ productData, close, addCart }) => {
    const { theme } = useTheme();
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mediaItems, setMediaItems] = useState([]);

    const modalOpacityAnim = useRef(new Animated.Value(0)).current;
    const modalTranslateYAnim = useRef(new Animated.Value(50)).current;
    const modalTranslateXAnim = useRef(new Animated.Value(0)).current; // NEW
    const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
    const closeIconAnim = useRef(new Animated.Value(0)).current;
    const closeIconScaleAnim = useRef(new Animated.Value(0.8)).current;

    const mediaWidth = screenWidth - wp(10);

    // Function to reset animation values
    const resetAnimations = () => {
        modalOpacityAnim.setValue(0);
        modalTranslateYAnim.setValue(50);
        modalTranslateXAnim.setValue(0); // NEW
        modalScaleAnim.setValue(0.8);
        closeIconAnim.setValue(0);
        closeIconScaleAnim.setValue(0.8);
    };

    useEffect(() => {
        if (!productData) return;
    
        resetAnimations();
        setActiveIndex(0);
        setMediaItems([
            ...(productData.image_url || []),
            ...(productData.videoUrl ? [productData.videoUrl] : []),
        ]);
    
        // Open animation: slide in from left
        modalTranslateXAnim.setValue(-screenWidth); // start off-screen left
    
        Animated.parallel([
            Animated.timing(modalOpacityAnim, {
                toValue: 5,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(modalTranslateYAnim, {
                toValue: 0,
                duration: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(modalTranslateXAnim, {
                toValue: 0, // slide into position
                duration: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(modalScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    
        Animated.parallel([
            Animated.timing(closeIconAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(closeIconScaleAnim, {
                toValue: 1,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    
    }, [productData]);
    

    // Close animation (slide to right)
    const handleClose = () => {
        Animated.parallel([
            Animated.timing(modalOpacityAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(modalTranslateXAnim, {
                toValue: screenWidth, // slide out to right
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(modalScaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(closeIconScaleAnim, {
                toValue: 0.5,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(closeIconAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setActiveIndex(0);
            close();
        });
    };

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / mediaWidth);
        setActiveIndex(index);
    };

    const goToPrevious = () => {
        if (activeIndex > 0) {
            const newIndex = activeIndex - 1;
            scrollRef.current.scrollTo({ x: newIndex * mediaWidth, animated: true });
            setActiveIndex(newIndex);
        }
    };

    const goToNext = () => {
        if (activeIndex < mediaItems.length - 1) {
            const newIndex = activeIndex + 1;
            scrollRef.current.scrollTo({ x: newIndex * mediaWidth, animated: true });
            setActiveIndex(newIndex);
        }
    };

    const handleCart = (variant, index) => {
        addCart(productData, variant, index);
        handleClose();
    };

    if (!productData) return null;

    return (
        <>
            <FlashMessage position="top" />
            <Modal
                visible={!!productData}
                transparent
                onRequestClose={handleClose}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalOverlay}
                    >
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    backgroundColor: COLORS[theme].background,
                                    opacity: modalOpacityAnim,
                                    transform: [
                                        { translateY: modalTranslateYAnim },
                                        { translateX: modalTranslateXAnim }, // NEW
                                        { scale: modalScaleAnim },
                                    ],
                                },
                            ]}
                        >
                            {/* Header */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text
                                    style={[
                                        poppins.medium.h6,
                                        { color: COLORS[theme].primary, marginBottom: hp(1), textTransform: 'capitalize' },
                                    ]}
                                >
                                    {productData?.name}
                                </Text>

                                {/* Close Button */}
                                <Animated.View
                                    style={[
                                        styles.closeIconContainer,
                                        {
                                            opacity: closeIconAnim,
                                            transform: [{ scale: closeIconScaleAnim }],
                                        },
                                    ]}
                                >
                                    <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                                        <MaterialCommunityIcons name="close" color="#000" size={wp(7)} />
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>

                            {/* Media Carousel */}
                            <View style={[styles.carouselWrapper, { width: mediaWidth }]}>
                                <TouchableOpacity
                                    onPress={goToPrevious}
                                    style={[styles.navButton, { left: 0 }]}
                                    disabled={activeIndex === 0}
                                >
                                    <MaterialIcon
                                        name="arrow-back-ios"
                                        size={wp(4)}
                                        color={activeIndex === 0 ? 'gray' : COLORS[theme].primary}
                                    />
                                </TouchableOpacity>

                                <ScrollView
                                    ref={scrollRef}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    scrollEventThrottle={16}
                                    onScroll={handleScroll}
                                    keyboardShouldPersistTaps="handled"
                                    nestedScrollEnabled={true}
                                >
                                    {mediaItems.map((item, index) => {
                                        const isVideo = item.endsWith('.mp4');
                                        return (
                                            <View key={index} style={[styles.mediaContainer, { width: mediaWidth }]}>
                                                {isVideo ? (
                                                    <Video
                                                        source={{ uri: item }}
                                                        style={styles.media}
                                                        controls
                                                        resizeMode="contain"
                                                    />
                                                ) : (
                                                    <Image
                                                        source={{ uri: item }}
                                                        style={styles.media}
                                                        resizeMode="contain"
                                                    />
                                                )}
                                            </View>
                                        );
                                    })}
                                </ScrollView>

                                <TouchableOpacity
                                    onPress={goToNext}
                                    style={[styles.navButton, { right: 0 }]}
                                    disabled={activeIndex === mediaItems.length - 1}
                                >
                                    <MaterialIcon
                                        name="arrow-forward-ios"
                                        size={wp(4)}
                                        color={activeIndex === mediaItems.length - 1 ? 'gray' : COLORS[theme].primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Carousel Indicators */}
                            <View style={styles.indicatorContainer}>
                                {mediaItems.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.indicator,
                                            { opacity: activeIndex === index ? 1 : 0.3, backgroundColor: COLORS[theme].primary },
                                        ]}
                                    />
                                ))}
                            </View>

                            <ScrollView
                                contentContainerStyle={{ paddingBottom: hp(5) }}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Description and Stock */}
                                {productData?.description !== '' && (
                                    <Text
                                        style={[
                                            poppins.regular.h9,
                                            { color: COLORS[theme].primary, marginVertical: wp(1), textTransform: "capitalize" },
                                        ]}
                                    >
                                        {productData?.description}
                                    </Text>
                                )}
                                <Text style={[poppins.regular.h9, { color: COLORS[theme].primary, marginTop: wp(1) }]}>
                                    Stock: {productData.stock_available ? 'Available' : 'Out of Stock'}
                                </Text>
                                {productData.noOfDaysToReturn !== '0' && (
                                    <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>
                                        Returns within: {productData.noOfDaysToReturn} days
                                    </Text>
                                )}

                                {/* Variants List */}
                                {productData.variant_list?.length > 0 && (
                                    <View style={{ marginTop: hp(2), marginHorizontal: wp(1) }}>
                                        {productData.variant_list.map((variant, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    marginBottom: hp(2),
                                                    flexDirection: "row",
                                                    justifyContent: "space-between",
                                                    borderBottomWidth: wp(0.5),
                                                    borderColor: "#ccc",
                                                    paddingBottom: wp(2)
                                                }}
                                            >
                                                <View>
                                                    <Text style={[poppins.regular.h8, { color: COLORS[theme].primary }]}>
                                                        {variant.name} - ₹{variant.totalAmount} / {variant.unit}
                                                    </Text>
                                                    <Text style={[poppins.regular.h9, { color: COLORS[theme].primary }]}>
                                                        GST: {variant.gst}% (CGST: {variant.cGstInPercent}% + SGST: {variant.sGstInPercent}%)
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleCart(variant, index)}
                                                    style={{
                                                        backgroundColor: COLORS[theme].accent,
                                                        justifyContent: "center",
                                                        paddingHorizontal: wp(2),
                                                        height: wp(9),
                                                        borderRadius: wp(2)
                                                    }}
                                                >
                                                    <Text style={[poppins.regular.h8, { color: COLORS[theme].white }]}>
                                                        Add to Cart
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>

                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={handleClose}
                                style={[styles.saveButton, { backgroundColor: COLORS[theme].accent }]}
                            >
                                <Text style={[poppins.regular.h6, { color: COLORS[theme].white }]}>Close</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: wp(98),
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: wp(0.5),
        borderColor: '#CCC',
        height: hp(91),
    },
    carouselWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(1),
    },
    navButton: {
        position: 'absolute',
        top: '40%',
        zIndex: 10,
        padding: wp(2),
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: wp(5),
    },
    mediaContainer: { height: hp(20) },
    media: {
        width: '100%',
        height: '100%',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: hp(1),
    },
    indicator: {
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        marginHorizontal: wp(0.5),
    },
    saveButton: {
        paddingVertical: wp(1),
        borderRadius: wp(2),
        alignItems: 'center',
        alignSelf: 'center',
        width: wp(30),
    },
    closeIconContainer: {
        position: 'relative',
        zIndex: 1,
        alignSelf: 'center',
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProductDetailModal;
