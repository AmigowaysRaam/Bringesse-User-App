/* eslint-disable react-native/no-inline-styles */
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { poppins } from '../../../resources/fonts';
import { hp, wp } from '../../../resources/dimensions';
import { ICON_ASSETS, IMAGE_ASSETS } from '../../../resources/images';
import { Button, Searchbar, TextInput, Icon } from 'react-native-paper';
import { useAuthHoc } from '../../../config/config';
import Icons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BlastedImage from 'react-native-blasted-image';
import UseProfileHook from '../../../hooks/profile-hooks';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import OctiCons from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import { commonStyles } from '../../../resources/styles';

import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const RenderSearchItem = ({ item }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();


  const navigateToProductDetails = data => {
    navigation.navigate('ProductDetailsScreen', { data });
  };

  return (
    <TouchableOpacity
      style={[
        styles.searchItemContainer,
        commonStyles[theme].shadow,
        { backgroundColor: COLORS[theme].viewBackground },
      ]}
      onPress={() => navigateToProductDetails(item)}
      accessible={true}
      accessibilityLabel={`View details for ${item.name}`}>
      <View>
        <BlastedImage
          fallbackSource={IMAGE_ASSETS.wolf_icon}
          source={{ uri: item.image }}
          style={[styles.searchImage, { borderRadius: wp(1) }]}
        />
      </View>
      <View style={styles.itemDetails}>
        <Text
          numberOfLines={3}
          style={[
            poppins.regular.h7,
            { color: COLORS[theme].textPrimary },
            styles.itemName,
          ]}>
          {item?.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text
            style={[
              poppins.medium.h7,
              { color: COLORS[theme].textPrimary, fontWeight: '700' },
            ]}>
            {t('price')} {item.price}
          </Text>
        </View>
        {/* <View style={styles.discountContainer}>
          <Text
            style={[
              poppins.medium.h7,
              { color: COLORS[theme].textPrimary, fontWeight: '700' },
            ]}>
            Discount Price: {item.discount_price} KWD
          </Text>
        </View> */}
        <TouchableOpacity
          onPress={() => navigateToProductDetails(item)}
          style={{
            backgroundColor: COLORS[theme].buttonBg,
            borderRadius: wp(1),
            paddingVertical: wp(1),
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: wp(25),
            marginTop: wp(2),
          }}>
          <Text
            style={[
              poppins.regular.h8,
              { fontWeight: '700', color: COLORS[theme].buttonText },
            ]}>
            {t('shop')} </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const SearchScreen = () => {
  const {
    actions: { SEARCH_PAGE_API_CALL },
  } = useAuthHoc();

  const { theme } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();


  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { profile } = UseProfileHook();

  const fetchSearchResults = async term => {
    if (_.isEmpty(term)) {
      setResults([]);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    SEARCH_PAGE_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          searchterm: term,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          const dataResponse = data?.data?.data || [];
          setResults(dataResponse);
          setLoading(false);
        },
        errorCallback(message) {
          setError(message || 'Something went wrong.');
          setLoading(false);
        },
      },
    });
  };

  const listEmptyItem = () => (
    <View style={styles.emptyContainer}>
      <Icon
        source="cart-remove"
        size={30}
        color={COLORS[theme].tabInActive}
      />
      <Text
        style={[
          poppins.medium.h7,
          styles.emptyText,
          { color: COLORS[theme].textPrimary },
        ]}>
        {t('oops_no_product_to_show')}
      </Text>
      {searchTerm.length !== 0 && (
        <Button
          style={{ backgroundColor: COLORS[theme].buttonBg }}
          labelStyle={[poppins.bold.h6, { color: COLORS[theme].buttonText }]}
          mode="contained"
          onPress={() => setSearchTerm('')}
          rippleColor="white">
          {t('clear')}

        </Button>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Go back">
          <OctiCons
            name="chevron-back"
            color={COLORS[theme].textPrimary}
            size={wp(6)}
          />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={t('search')}
            style={[
              poppins.regular.h6,
              styles.textInput,
              { color: COLORS[theme].textPrimary },
            ]}
            mode="outlined"
            textColor={COLORS[theme].textPrimary}
            value={searchTerm}
            outlineStyle={{
              borderRadius: wp(2),
              backgroundColor: COLORS[theme].viewBackground,
            }}
            inputMode="search"
            onChangeText={text => {
              setSearchTerm(text);
              fetchSearchResults(text);
            }}
            left={
              <TextInput.Icon
                icon={'magnify'}
                color={COLORS[theme].textPrimary}
              />
            }
          />
        </View>

        {!_.isEmpty(searchTerm) && (
          <TouchableOpacity
            onPress={() => {
              setSearchTerm('');
              fetchSearchResults('');
            }}
            accessible={true}
            accessibilityLabel="Clear search">
            <Text
              style={{
                color: COLORS[theme].textPrimary,
                fontWeight: '500',
                fontSize: wp(4),
              }}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} />
      ) : (
        <>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <RenderSearchItem item={item} />}
              style={{ marginTop: wp(2) }}
              ListEmptyComponent={
                loading || _.isEmpty(searchTerm) ? null : listEmptyItem
              }
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: wp(1),
    borderRadius: wp(1),
    padding: wp(2),
    paddingEnd: wp(4),
    marginHorizontal: wp(2),
  },
  itemDetails: {
    flex: 1,
    gap: wp(0.5),
    marginHorizontal: wp(3),
  },
  itemName: {},
  priceContainer: {
    flexDirection: 'row',
  },
  priceLabel: {
    fontWeight: '700',
  },
  priceValue: {
    fontWeight: '700',
  },
  discountContainer: {
    flexDirection: 'row',
  },
  discountLabel: {
    fontWeight: '700',
  },
  discountValue: {
    fontWeight: '700',
  },
  shopButton: {
    backgroundColor: 'black',
    borderRadius: wp(1),
    paddingVertical: wp(1),
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: wp(25),
    marginTop: wp(2),
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(2),
    marginTop: hp(1),
    gap: wp(2),
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    height: wp(10),
  },
  cancelButton: {
    paddingHorizontal: wp(3),
    paddingVertical: wp(2),
  },
  cancelButtonText: {
    color: 'blue',
    fontWeight: '700',
  },
  loadingIndicator: {
    marginTop: wp(10),
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: hp(2),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(4),
    marginTop: hp(5),
  },
  emptyText: {
    // color: COLORS[theme].textPrimary,
    alignSelf: 'center',
  },
  clearButton: {
    width: wp(40),
    marginBottom: wp(8),
    // backgroundColor: COLORS[theme].buttonBg,
  },
});

export default SearchScreen;
