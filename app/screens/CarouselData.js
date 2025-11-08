import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';

const CarouselData = ({ banner }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    // Automatically scroll to the next item
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % banner?.admin_banner.length;
                scrollViewRef.current?.scrollTo({ x: wp(100) * nextIndex, animated: true });
                return nextIndex;
            });
        }, 2000);
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [banner?.admin_banner.length]);

    return (
        <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                pagingEnabled
                scrollEventThrottle={16}
                onScrollEndDrag={() => clearInterval(currentIndex)} // Stop autoplay on manual drag
            >
                {banner?.admin_banner.map((item, index) => (
                    <View key={item.id} style={styles.card}>
                        <Image
                            source={{ uri: item.image_url }}
                            style={styles.profileImage}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: hp(2),
    },
    scrollContainer: {
        flexDirection: 'row', // Ensure horizontal scrolling
    },
    card: {
        width: wp(100), // Full width of the screen
        height: wp(40), // Adjust the height based on your desired aspect ratio
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: '100%', // Image takes full width
        height: "100%", // Image height adjusted similarly
        borderRadius: wp(1),
    },
    textContainer: {
        position: 'absolute',
        bottom: hp(2),
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background overlay for the text
        paddingVertical: hp(1),
    },
    categoryText: {
        fontSize: wp(6),
        textAlign: 'center',
    },
});

export default CarouselData;
