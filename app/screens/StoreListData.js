import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native'; // ✅ import this
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';

const StoreListData = ({ banner }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={banner?.store}
        horizontal
        keyExtractor={(item) => item.store_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text
            style={[
              poppins.regular.h6,
              { color: COLORS[theme].primary, alignSelf: 'center', margin: hp(2) },
            ]}
          >
            {t('No Stores Available at this Location')}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('ProductList', { storeId: item.store_id })
            }
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text

              style={[
                poppins.regular.h9,
                styles.categoryText,
                { color: COLORS[theme].black, maxWidth: wp(30), textTransform: 'capitalize' },
              ]}
              numberOfLines={1}
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(2),
    borderRadius: wp(2),
    width: wp(38),
    height: wp(38),
    backgroundColor: '#ddd',
  },
  profileImage: {
    width: wp(35),
    height: wp(26),
    margin: wp(0.5)
  },
  categoryText: {
    textAlign: 'center',
    marginTop: wp(1),
  },
});

export default StoreListData;
