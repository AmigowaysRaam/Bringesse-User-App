import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text,
    StyleSheet, TouchableOpacity,
    Image, Animated, Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const StoreDetailCard = ({ store }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const scaleYAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-20)).current;
    const [isLongDesc, setIsLongDesc] = useState(false);
    const [showDesc, setShowDesc] = useState(false);
    const descAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleYAnim, {
                toValue: 1,
                friction: 6,
                tension: 70,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const toggleDescription = () => {
        Animated.timing(descAnim, {
            toValue: showDesc ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
        setShowDesc(!showDesc);
    };
    const descHeight = descAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, wp(14)],
    });
    const isOpen = store?.live_status === 1;
    const isFood = store?.isFood === 'true';

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    backgroundColor: COLORS[theme].background,
                    borderColor: '#ccc',
                    opacity: opacityAnim,
                    transform: [
                        { translateY: translateYAnim },
                        { scaleY: scaleYAnim },
                    ],
                },
            ]}
        >
            {/* Image */}
            <TouchableOpacity activeOpacity={0.9}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={{
                            uri: store?.image_url || 'https://via.placeholder.com/150',
                        }}
                        style={styles.image}
                    />

                    {store?.top_store === 'true' && (
                        <View style={styles.topBadge}>
                            <Text style={styles.topText}>TOP</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Info */}
            <View style={styles.infoContainer}>
                {/* Name + Food Icon */}
                <View style={styles.nameRow}>
                    <Text
                        numberOfLines={1}
                        style={[
                            poppins.semi_bold.h7,
                            styles.name,
                            { color: COLORS[theme].textPrimary },
                        ]}
                    >
                        {store?.name}
                    </Text>

                    <MaterialCommunityIcon
                        name={isFood ? 'silverware-fork-knife' : 'store'}
                        size={wp(4)}
                        color={isFood ? '#FF7F66' : COLORS[theme].textPrimary}
                        style={{ marginLeft: wp(1) }}
                    />
                </View>

                <Text
                    numberOfLines={1}
                    style={[
                        poppins.regular.h9,
                        { color: COLORS[theme].textPrimary, fontSize: wp(2.1) },
                    ]}
                >
                    {store?.location}
                </Text>

                {/* Rating & Distance */}
                <View style={styles.row}>
                    <MaterialCommunityIcon name="star" size={wp(3.4)} color="#FFC107" />
                    <Text style={[styles.infoText, { color: COLORS[theme].textPrimary }]}>
                        {store?.rating || '0.0'}
                    </Text>

                    <Text style={styles.dot}>•</Text>

                    <MaterialCommunityIcon
                        name="map-marker-distance"
                        size={wp(3.4)}
                        color={COLORS[theme].textPrimary}
                    />
                    <Text style={[styles.infoText, { color: COLORS[theme].textPrimary }]}>
                        {store?.distance}
                    </Text>
                </View>

                {/* Status */}
                <View style={styles.statusRow}>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: isOpen ? 'green' : '#e43725' },
                        ]}
                    >
                        <Text style={[poppins.regular.h9, { color: '#fff' }]}>
                            {isOpen ? t('Open') : t('Closed')}
                        </Text>
                    </View>

                    <Text style={styles.dot}>•</Text>

                    <Text style={[styles.infoText, { color: COLORS[theme].textPrimary }]}>
                        {store?.packing_time} min
                    </Text>
                </View>
                {store?.description ? (
                    <>
                        <Text
                            style={[
                                poppins.regular.h8,
                                {
                                    color: COLORS[theme].textPrimary, marginTop: hp(1),
                                },
                            ]}
                            numberOfLines={showDesc ? undefined : 2}
                            onTextLayout={(e) => {
                                if (e.nativeEvent.lines.length > 2) {
                                    setIsLongDesc(true);
                                }
                            }}
                        >
                            {store?.description}
                        </Text>

                        {isLongDesc && (
                            <TouchableOpacity onPress={() => setShowDesc(!showDesc)}>
                                <Text style={styles.viewMore}>
                                    {showDesc ? t('View Less') : t('View More')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : null}

            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: wp(3),
        marginVertical: wp(1.8),
        marginHorizontal: wp(1.2),
        borderRadius: wp(3),
        borderWidth: wp(0.25),
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: { elevation: 3 },
        }),
    },
    imageWrapper: { position: 'relative' },
    image: {
        width: wp(18),
        height: wp(18),
        borderRadius: wp(1),
        borderWidth: wp(0.1),
        borderColor: '#ddd',
        resizeMode: 'contain',
    },
    topBadge: {
        position: 'absolute',
        top: wp(0.8),
        right: wp(0),
        backgroundColor: '#FF7F66',
        paddingHorizontal: wp(1.6),
        paddingVertical: wp(0.4),
        borderRadius: wp(2),
    },
    topText: {
        color: '#fff',
        fontSize: wp(2),
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        marginLeft: wp(4),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: { textTransform: 'capitalize' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(0.8),
    },
    infoText: {
        marginLeft: wp(0.6),
        fontSize: wp(3),
    },
    dot: {
        marginHorizontal: wp(1.2),
        fontSize: wp(3.5),
        color: '#999',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: wp(1),
    },
    statusBadge: {
        paddingHorizontal: wp(2),
        borderRadius: wp(1),
    },
    viewMore: {
        marginTop: wp(1),
        color: '#FF7F66',
        fontSize: wp(3),
        fontWeight: '600',
    },
    descContainer: {
        overflow: 'hidden',
        marginTop: wp(0.5),
    },
});
export default StoreDetailCard;