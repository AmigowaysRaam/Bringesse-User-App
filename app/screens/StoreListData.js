import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';

const StoreListData = ({ banner }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    console?.log(banner, "banner")
    return (
        <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>

            <FlatList
                showsHorizontalScrollIndicator={true}
                data={banner?.store}
                horizontal
                keyExtractor={(item) => item.store_id}
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
                                { color: COLORS[theme].black, maxWidth: wp(25) }
                            ]}
                        >
                            {item?.store_name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        marginVertical: hp(3),
    },
    listContainer: { paddingHorizontal: wp(3) },
    card: {
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        marginHorizontal: wp(2), borderRadius: wp(2), width: wp(40),
        height: wp(40), backgroundColor: "#ddd",
    },
    profileImage: {
        width: wp(26),
        height: wp(26),
    },
    categoryText: {
        textAlign: 'center', marginTop: wp(1),
    },
});

export default StoreListData;
