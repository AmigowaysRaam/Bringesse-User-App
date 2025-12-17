import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { Link } from '@react-navigation/native';
import { Text } from 'react-native-paper';
const CarouselData = ({ banner }) => {

    const { theme } = useTheme();
    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
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
    const handleNav = (url) => {
        Linking.openURL(url);
    }
    return (
        <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                pagingEnabled
                scrollEventThrottle={16}
                onScrollEndDrag={() => clearInterval(currentIndex)}
            >
                {banner?.admin_banner.map((item, index) => (
                    <TouchableOpacity onPress={() => handleNav(item?.site_url)} key={item.id} style={styles.card}>
                        <Image
                            source={{ uri: item.image_url }}
                            style={styles.profileImage}
                        />
                        {/* <Text style={{color:"green"}}>{item?.site_url}</Text> */}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: hp(1),
    },
    scrollContainer: {
        flexDirection: 'row', // Ensure horizontal scrolling
    }, card: {
        width: wp(100), height: wp(45),
        justifyContent: 'center', alignItems: 'center',
    },
    profileImage: {
        width: '100%', height: "100%", // Image height adjusted similarly
        borderRadius: wp(1), resizeMode: "contain",
    },
    textContainer: {
        position: 'absolute',
        bottom: hp(2), left: 0, right: 0, alignItems: 'center',
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