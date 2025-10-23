import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';

const CategoryList = ({ banner }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    return (
        <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
            <FlatList
                showsHorizontalScrollIndicator={false}
                data={banner?.category}
                horizontal
                keyExtractor={(item) => item.category_name}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <Image
                            source={{ uri: item.image_url }}
                            style={styles.profileImage}
                            resizeMode="contain"
                        />
                        <Text
                            style={[
                                poppins.regular.h8,
                                styles.categoryText,
                                { color: COLORS[theme].textPrimary, maxWidth: wp(25) }
                            ]}
                        >
                            {item?.category_name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        paddingVertical: wp(1),
    },
    listContainer: {
        paddingHorizontal: wp(3)
    },
    card: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: wp(2),
        borderRadius: wp(2),
        width: wp(30),
        height: wp(35),
    },
    profileImage: {
        width: wp(26),
        height: wp(26),
    },
    categoryText: {
        textAlign: 'center',
        marginTop: wp(1),
    },
});

export default CategoryList;
