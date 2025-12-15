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
    TouchableWithoutFeedback,
    Animated,
    Easing,
    Keyboard,
} from 'react-native';
import Video from 'react-native-video';
import FlashMessage from 'react-native-flash-message';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { COLORS } from '../resources/colors';
import { useTheme } from '../context/ThemeContext';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

const CartItem = ({ productData, close }) => {
    const { theme } = useTheme();
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mediaItems, setMediaItems] = useState([]);
    const modalAnim = useRef(new Animated.Value(0)).current;
    const closeIconAnim = useRef(new Animated.Value(0)).current;
    const mediaWidth = screenWidth - wp(12);

    useEffect(() => {
        if (!productData) return;
        const images = productData?.image ? [productData.image] : [];
        const videos = productData?.videoUrl ? [productData.videoUrl] : [];
        setMediaItems([...images, ...videos]);
        // Opening animation
        Animated.parallel([
            Animated.timing(modalAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(closeIconAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [productData]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(modalAnim, {
                toValue: 0,
                duration: 100,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(closeIconAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setActiveIndex(0);
            close && close();
        });
    };

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / mediaWidth);
        setActiveIndex(index);
    };

    const goToPrevious = () => {
        if (activeIndex > 0 && scrollRef.current) {
            const newIndex = activeIndex - 1;
            scrollRef.current.scrollTo({ x: newIndex * mediaWidth, animated: true });
            setActiveIndex(newIndex);
        }
    };

    const goToNext = () => {
        if (activeIndex < mediaItems.length - 1 && scrollRef.current) {
            const newIndex = activeIndex + 1;
            scrollRef.current.scrollTo({ x: newIndex * mediaWidth, animated: true });
            setActiveIndex(newIndex);
        }
    };

    if (!productData) return null;

    const modalTranslateY = modalAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
    });
    const modalScale = modalAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
    });
    const modalOpacity = modalAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <>
            <FlashMessage position="top" />
            <Modal visible={!!productData} transparent onRequestClose={handleClose}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalOverlay}
                    >
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    backgroundColor: COLORS[theme].background,
                                    opacity: modalOpacity,
                                    transform: [{ translateY: modalTranslateY }, { scale: modalScale }],
                                },
                            ]}
                        >
                            {/* Close Button */}
                            <Animated.View
                                style={[
                                    styles.closeIconContainer,
                                    { opacity: closeIconAnim },
                                ]}
                            >
                                <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                                    <MaterialCommunityIcons name="close-circle" color={COLORS[theme].accent} size={wp(8)} />
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Product Name */}
                            <Text style={[poppins.bold.h5, { color: COLORS[theme].primary, marginBottom: hp(2), textTransform: 'capitalize', maxWidth: wp(78) }]}>
                                {productData?.name || 'Product'}
                            </Text>

                            {/* Media Carousel */}
                            <View style={[styles.carouselWrapper, { width: mediaWidth, height: hp(25) }]}>
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
                                    scrollEventThrottle={16}
                                    onScroll={handleScroll}
                                >
                                    {mediaItems.length > 0 ? mediaItems.map((item, index) => {
                                        const isVideo = typeof item === 'string' && item.endsWith('.mp4');
                                        return (
                                            <View key={index} style={[styles.mediaContainer, { width: mediaWidth }]}>
                                                {isVideo ? (
                                                    <Video source={{ uri: item }} style={styles.media} controls resizeMode="cover" />
                                                ) : (
                                                    <Image source={{ uri: item }} style={styles.media} resizeMode="cover" />
                                                )}
                                            </View>
                                        );
                                    }) : (
                                        <View style={[styles.mediaContainer, { width: mediaWidth, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Text style={{ color: COLORS[theme].primary }}>No Media</Text>
                                        </View>
                                    )}
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

                            <View style={styles.indicatorContainer}>
                                {mediaItems.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.indicator,
                                            { opacity: activeIndex === index ? 1 : 0.3, backgroundColor: COLORS[theme].accent },
                                        ]}
                                    />
                                ))}
                            </View>

                            <ScrollView
                                contentContainerStyle={{ paddingBottom: hp(4) }}
                                showsVerticalScrollIndicator={false}
                            >
                                {productData.description && (
                                    <Text style={[poppins.regular.h9, { color: COLORS[theme].primary, marginVertical: hp(1) }]}>
                                        {productData.description}
                                    </Text>
                                )}

                                <View style={styles.detailsRow}>
                                    <Text style={[poppins.medium.h6, { color: COLORS[theme].primary }]}>
                                        Qty: {productData.qty || 0} {productData.unit || ''}
                                    </Text>
                                </View>

                                <Text style={[poppins.medium.h6, { color: COLORS[theme].primary, marginTop: hp(1) }]}>
                                    Total: ₹{productData.totalAmount || 0}
                                </Text>
                            </ScrollView>

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
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    modalContainer: {
        width: wp(95),
        padding: wp(4),
        borderRadius: wp(3),
        borderColor: '#CCC',
        borderWidth: 0.5,
        maxHeight: hp(70),
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 8,
    },
    closeIconContainer: {
        position: 'absolute',
        top: wp(2),
        right: wp(2),
        zIndex: 10,
    },
    carouselWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
        borderRadius: wp(2),
        overflow: 'hidden',
    },
    navButton: {
        position: 'absolute',
        top: '40%',
        zIndex: 10,
        padding: wp(2),
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: wp(5),
    },
    mediaContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
        borderRadius: wp(2),
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: hp(1),
    },
    indicator: {
        width: wp(3),
        height: wp(3),
        borderRadius: wp(1.5),
        marginHorizontal: wp(0.5),
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        paddingVertical: hp(1),
        borderRadius: wp(2),
        alignItems: 'center',
        alignSelf: 'center',
        width: wp(30),
        marginTop: hp(2),
    },
});
export default CartItem;