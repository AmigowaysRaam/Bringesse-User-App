import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ImageBackground, Platform,
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
    const [expanded, setExpanded] = useState(false);
    const [isLongDesc, setIsLongDesc] = useState(false);
    const isOpen = store?.isActive == 'true'
    const isFood = store?.isFood === 'true';
    // Auto-collapse after 5 seconds
    useEffect(() => {
        let timer;
        if (expanded) {
            // timer = setTimeout(() => setExpanded(false), 5000);
        }
        return () => clearTimeout(timer);
    }, [expanded]);
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setExpanded(prev => !prev)}
        >
            <View style={[styles.card, {
                backgroundColor: COLORS[theme].background
            }]}>
                {/* IMAGE BACKGROUND */}
                <ImageBackground
                    source={{ uri: store?.image_url || 'https://via.placeholder.com/300' }}
                    style={styles.imageBg}
                    imageStyle={{ borderRadius: wp(3), opacity: 1 }}
                >
                    {/* Dark overlay for text readability */}
                    <View style={styles.overlay} />

                    {/* INFO */}
                    <View style={styles.infoContainer}>
                        {/* Name & Icon */}
                        <View style={styles.nameRow}>
                            <Text
                                numberOfLines={1}
                                style={[styles.name, {
                                    color: COLORS[theme].white,
                                    textShadowColor: 'rgba(0,0,0,0.9)',
                                    textShadowOffset: { width: 1, height: 2 },
                                    textShadowRadius: 2,
                                    fontSize: wp(6),
                                    fontWeight: '500',
                                }]}
                            >
                                {store?.name}
                            </Text>
                            <MaterialCommunityIcon
                                name={isFood ? 'silverware-fork-knife' : 'store'}
                                size={wp(5)}
                                color={isFood ? '#FF7F66' : COLORS[theme].white}
                                style={{ marginLeft: wp(1) }}
                            />
                        </View>

                        {/* Rating */}
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcon name="star" size={wp(4)} color="#EBBE4D" />
                            <Text style={[styles.infoText, { color: COLORS[theme].white }]}>
                                {store?.rating || '0.0'}
                            </Text>
                        </View>

                        {/* DESCRIPTION */}
                        {store?.description && (
                            <>
                                <Text
                                    style={[styles.description, { color: COLORS[theme].white }]}
                                    numberOfLines={!expanded ? 2 : undefined}
                                    onTextLayout={(e) => {
                                        if (e.nativeEvent.lines.length > 2) setIsLongDesc(true);
                                    }}
                                >
                                    {store.description}
                                </Text>
                            </>
                        )}
                        {/* <Text
                            style={[styles.description, { color: COLORS[theme].white }]}
                            numberOfLines={!expanded ? 2 : undefined}
                            onTextLayout={(e) => {
                                if (e.nativeEvent.lines.length > 2) setIsLongDesc(true);
                            }}
                        >
                            {JSON.stringify(store, null, 2)}
                        </Text> */}

                        {expanded && (
                            <>
                                {store?.location != '' &&
                                    <Text style={[styles.extraInfo, { color: COLORS[theme].white }]}>
                                        {store?.location}
                                    </Text>
                                }
                                <View style={styles.row}>
                                    <MaterialCommunityIcon
                                        name="map-marker-distance"
                                        size={wp(3.5)}
                                        color={COLORS[theme].white}
                                    />
                                    <Text style={[styles.infoText, { color: COLORS[theme].white }]}>
                                        {store?.distance}
                                    </Text>
                                </View>

                                <View style={styles.statusRow}>
                                    <Text style={[styles.dot, { color: COLORS[theme].white }]}>•</Text>
                                    <Text style={[styles.infoText, { color: COLORS[theme].white }]}>
                                        {store?.packing_time} min
                                    </Text>
                                    <Text
                                        style={[styles.statusText, { color: isOpen ? 'green' : 'red' }]}
                                    >
                                        {isOpen ? 'Open' : 'Closed'}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </ImageBackground>
                <MaterialCommunityIcon
                    style={{ alignSelf: "center" }}
                    name="chevron-down"
                    size={wp(7)}
                    color={COLORS[theme].textPrimary}
                />
            </View>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    card: {
        padding: wp(1),
        overflow: 'hidden', margin: wp(2),

    },
    imageBg: {
        width: '100%', justifyContent: 'flex-end',
        paddingVertical: wp(4),
    }, overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)', // Dark overlay for readability
        borderRadius: wp(3),
    }, infoContainer: {
        zIndex: 1, padding: wp(3)
    },
    nameRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    name: {
        fontFamily: poppins.semi_bold.fontFamily, textTransform: 'capitalize',
    }, ratingRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: wp(1),
    },
    infoText: { marginLeft: wp(0.8), fontSize: wp(3.2) },
    description: { marginTop: wp(1), fontSize: wp(3.4), fontFamily: poppins.regular.fontFamily },
    viewMore: { marginTop: wp(1), fontSize: wp(3), fontWeight: '600' },
    extraInfo: { marginTop: wp(1), fontSize: wp(3.2), fontFamily: poppins.regular.fontFamily },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: wp(1) },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: wp(1) },
    dot: { marginHorizontal: wp(1), fontSize: wp(3.5) },
    statusText: { marginLeft: wp(1), fontSize: wp(3), fontWeight: '600' },
});
export default StoreDetailCard;
