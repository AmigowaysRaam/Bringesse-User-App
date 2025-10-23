import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView, // Added ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderBar from '../../../components/header';
import { poppins } from '../../../resources/fonts';
import { hp, wp } from '../../../resources/dimensions';
import { IMAGE_ASSETS } from '../../../resources/images';
import BlastedImage from 'react-native-blasted-image';
import { useAuthHoc } from '../../../config/config';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import UseProfileHook from '../../../hooks/profile-hooks';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Button, Dialog, Portal, Text as PaperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../../../resources/styles';
import FlashMessage, { showMessage } from 'react-native-flash-message';

const RenderProductItem = ({ item, theme, t, showDialog }) => {
  return (
    <View
      style={[
        styles.productContainer,
        commonStyles[theme].shadow,
        { backgroundColor: COLORS[theme].cardBackground, borderRadius: wp(1) },
      ]}>
      <BlastedImage
        fallbackSource={IMAGE_ASSETS.wolf_icon}
        source={{ uri: item.image }}
        style={[
          styles.productImage,
          {
            borderColor: COLORS[theme].cardBackground,
          },
        ]}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={[
            poppins.medium.h7,
            {
              fontWeight: '700',
              color: COLORS[theme].textPrimary,
              marginTop: hp(0.5),
            },
          ]}>
          {item.title}
        </Text>
        <Text
          style={[
            poppins.medium.h8,
            {
              color: COLORS[theme].textPrimary,
              maxWidth: wp(40),
              fontWeight: 700,
            },
          ]}>{`${item.points} ` + t('points')}
        </Text>
      </View>
      {item?.show_claim_button && (
        <Button
          style={{
            width: wp(40),
            margin: wp(2),
            backgroundColor: COLORS[theme].accent,
          }}
          labelStyle={([poppins.bold.h6], { color: COLORS[theme].black })}
          mode="contained"
          uppercase={false}
          rippleColor="white"
          onPress={() => showDialog(item.product_id)}  // Show confirmation dialog
        >
          {t('claim_rewards')}
        </Button>
      )}
    </View>
  );
};
// [{"date": "18-11-2024", "points": 60, "product": "Shaker(Blue)", "status": "Requested"}] data.data.data
const RenderRewardsTableItem = ({ item, index, navigation, theme, t }) => {
  return (
    <View
      style={[
        styles.rowItemContainer,
        {
          backgroundColor: COLORS[theme].cardBackground,
          borderWidth: wp(0.1),
          borderColor: COLORS[theme].textPrimary,
        },
      ]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}>
        <Text
          style={[
            {
              color: COLORS[theme].textPrimary,
              flex: 1,
              textAlign: 'left',
            },
          ]}
          variant="titleLarge">
          {item?.date}
        </Text>
        <Text
          style={[
            {
              color: COLORS[theme].textPrimary,
              flex: 1,
              textAlign: 'left',
            },
          ]}
          variant="titleLarge">
          {item?.product}
        </Text>
        <Text
          style={[
            {
              color: COLORS[theme].textPrimary,
              flex: 1,
              textAlign: 'center',
            },
          ]}
          variant="titleLarge">
          {item?.points}
        </Text>
        <Text
          style={[
            {
              color: COLORS[theme].textPrimary,
            },
          ]}
          variant="titleLarge">
          {item?.status}
        </Text>
      </View>
    </View>
  );
};

const RewardsScreen = () => {
  const { profile } = UseProfileHook();
  const [rewardProducts, setRewardProductData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rewardPoints, setRewardPoints] = useState(null);
  const [visible, setVisible] = useState(false); // State to control dialog visibility
  const [selectedProductId, setSelectedProductId] = useState(null); // Store selected product ID
  const [rewardProductsTable, setRewardProductDataTable] = useState([]);

  const {
    reducerConstants: { GET_REWARD_PRODUCT_API, CLAIM_REWARD_API },
    actions: { GET_REWARD_PRODUCT_API_CALL, CLAIM_REWARD_API_CALL },
  } = useAuthHoc();

  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    fnGetRewardProductList();
  }, [profile.id]);

  function fnGetRewardProductList() {
    setIsLoading(true);
    GET_REWARD_PRODUCT_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          setRewardPoints(data.data.data.points);
          setRewardProductData(data?.data?.data?.reward_products_data);
          setRewardProductDataTable(data.data.data?.rewards_data);
          setIsLoading(false);
          console.log(data.data.data?.rewards_data, 'data.data.data');
        },
        errorCallback(message) {
          console.log('Error fetching reward products:', message);
        },
      },
    });
  }

  // Show confirmation dialog
  const showDialog = (productId) => {
    setSelectedProductId(productId); // Store selected product ID
    setVisible(true); // Show the dialog
  };

  // Hide confirmation dialog
  const hideDialog = () => {
    setVisible(false); // Close the dialog
  };

  // Function that handles reward claim after confirmation
  const handleClaimReward = () => {
    CLAIM_REWARD_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          productid: selectedProductId,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          console.log('Reward claimed successfully:', data);
          // setRewardPoints(data.newPoints);
          showMessage({
            message: data?.data?.message,
            type: 'success',
          });
          fnGetRewardProductList();
        },
        errorCallback(message) {
          console.log('Error claiming reward:', message);
        },
      },
    });

    hideDialog(); // Close the dialog after claim
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      <HeaderBar showTitleOnly title={t('rewards')} showBackArrow={true} />
      <View style={{ paddingBottom: hp(3), marginHorizontal: wp(4) }}>
        <Text
          style={[
            poppins.bold.medium,
            {
              color: COLORS[theme].textPrimary,
              fontWeight: '600',
            },
          ]}
          variant="titleLarge">
          {t('rewards')}
        </Text>
        <View
          style={{
            width: wp(35),
            backgroundColor: COLORS[theme].accent,
            height: hp(0.8),
          }}
        />
      </View>
      <FlashMessage position="Top" />

      {rewardPoints !== null && (
        <View style={{ marginHorizontal: wp(3) }}>
          <Text style={[poppins.medium.h7, { color: COLORS[theme].textPrimary }]}>
            {t('you_have') + ' '}
            <Text style={[poppins.medium.h6, { color: COLORS[theme].accent }]}>
              {rewardPoints}
            </Text>
            {' ' + t('points')}
          </Text>
        </View>
      )}

      <View style={{ marginHorizontal: wp(4) }}>
        <Text
          style={[
            poppins.regular.h3,
            {
              color: COLORS[theme].textPrimary,
            },
          ]}
          variant="titleLarge">
          {t('reward_products')}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size={'medium'} style={{ marginTop: wp(10) }} />
      ) : (
        <FlatList
          style={{ paddingHorizontal: wp(4), marginVertical: wp(2) }}
          data={rewardProducts}
          renderItem={({ item }) => (
            <RenderProductItem
              item={item}
              theme={theme}
              navigation={navigation}
              t={t}
              showDialog={showDialog} // Pass showDialog function to RenderProductItem
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row} // Style for the row to add spacing between columns
          showsVerticalScrollIndicator={false}
        />
      )}

      {
        !isLoading &&


        <View style={{ marginVertical: wp(5) }}>
          <View style={{ marginHorizontal: wp(5) }}>
            <Text
              style={[
                poppins.regular.h3,
                {
                  color: COLORS[theme].textPrimary,
                },
              ]}
              variant="titleLarge">
              {t('your_rewards')}
            </Text>
          </View>
          <View
            style={[
              styles.rowItemContainer,
              {
                backgroundColor: COLORS[theme].background,
                borderWidth: wp(0.1),
                borderColor: COLORS[theme].textPrimary,
              },
            ]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <Text
                style={[
                  poppins.bold.h7,
                  styles.contactUsTitle,
                  { color: COLORS[theme].textPrimary },
                ]}
                variant="titleLarge">
                {t('date')}
              </Text>
              <Text
                style={[
                  poppins.bold.h7,
                  styles.contactUsTitle,
                  { color: COLORS[theme].textPrimary },
                ]}
                variant="titleLarge">
                {t('product')}
              </Text>
              <Text
                style={[
                  poppins.bold.h7,
                  styles.contactUsTitle,
                  { color: COLORS[theme].textPrimary },
                ]}
                variant="titleLarge">
                {t('points')}
              </Text>
              <Text
                style={[
                  poppins.bold.h7,
                  styles.contactUsTitle,
                  { color: COLORS[theme].textPrimary },
                ]}
                variant="titleLarge">
                {t('status')}
              </Text>
            </View>
          </View>

          <FlatList
            data={rewardProductsTable}
            renderItem={({ item, index }) => (
              <RenderRewardsTableItem
                item={item}
                theme={theme}
                navigation={navigation}
                t={t}
              />
            )}
            keyExtractor={(item) => item.id}
          />

        </View>



      }

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: COLORS[theme].background }}>
          <Dialog.Content>
            <MaterialCommunityIcon
              style={[{ textAlign: 'center' }]}
              name="checkbox-marked-circle-outline"
              size={wp(12)}
              color={COLORS[theme].primary}
            />
            <Text
              style={[
                poppins.medium.h4,
                {
                  fontWeight: '700',
                  color: COLORS[theme].textPrimary,
                  marginTop: hp(0.5),
                  textAlign: 'center',
                },
              ]}>
              {t('claim_reward')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              style={{
                width: wp(40),
                margin: wp(1),
                backgroundColor: COLORS[theme].tabInActive,
              }}
              labelStyle={([poppins.bold.h6], { color: COLORS[theme].buttonText })}
              mode="contained"
              uppercase={false}
              rippleColor="white"
              onPress={hideDialog}>
              {t('cancel')}
            </Button>
            <Button
              style={{
                width: wp(40),
                margin: wp(1),
                backgroundColor: COLORS[theme].primary,
              }}
              labelStyle={([poppins.bold.h6], { color: COLORS[theme].buttonText })}
              mode="contained"
              uppercase={false}
              rippleColor="white"
              onPress={handleClaimReward}>
              {t('yes')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

export default RewardsScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  productContainer: {
    width: wp(45), // Width of each product item (adjust as needed)
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1),
    paddingBottom: wp(1),
  },

  rowItemContainer: {
    gap: wp(4),
    paddingHorizontal: wp(2),
    marginHorizontal: wp(4),
    paddingVertical: wp(2),
  },
  contactItemContainer: {
    paddingVertical: wp(3),
    marginVertical: wp(0.45),
    gap: wp(4),
    paddingHorizontal: wp(2),
    marginHorizontal: wp(4),
  },
  productImage: {
    width: wp(45),
    height: wp(40),
    marginBottom: hp(1),
  },
});
