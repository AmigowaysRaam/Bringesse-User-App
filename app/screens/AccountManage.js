import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ToastAndroid,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

import HeaderBar from '../components/header';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import { fetchData } from '../api/api';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import FlashMessage, { showMessage } from 'react-native-flash-message';

const AccountManage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const profileD = useSelector(state => state.Auth.profile);
  const siteDetails = useSelector(state => state.Auth.siteDetails);

  const navigation = useNavigation();
  useEffect(()=>{
    // showMessage({ message: 'Phone number verified.', type: 'success' });
  },[])
  const handleDeactivate = async () => {
    if (!profileD?.user_id) return;
    try {
      setLoading(true);
      setShowConfirm(false);
      const data = await fetchData('account/delete', 'POST', {
        userId: profileD?.user_id, status: 2
      }, null);
      // Alert.alert('Account Deactivated', JSON.stringify(data));
      
      if (data?.status == true) {
        AsyncStorage.clear();
        navigation.reset({
          index: 0,
          routes: [{ name: 'GetStartedScreen' }],
        });
        ToastAndroid.show(data?.message, ToastAndroid.SHORT);
    showMessage({ message:data?.message, type: 'success' });
      }
      else {
        ToastAndroid.show('Failed to fetch profile data', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('profile API Error:', error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: COLORS[theme].background }}
    >
            <FlashMessage style={{zIndex:111111}} position="top" />

      <HeaderBar title="Account Deletion" showBackArrow />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS[theme].primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Warning Card */}
          <View style={[styles.card, {
            backgroundColor: COLORS[theme].card,
            borderColor: "#CCC",
          }]}>
            <View style={styles.iconBox}>
              <Icon
                name="warning-outline"
                size={wp(7)}
                color={COLORS[theme].primary}
              />
            </View>
            <Text style={[poppins.semi_bold.h7, styles.title, { color: COLORS[theme].primary }]}>
               Account Delete
            </Text>
            <Text style={[styles.desc, { color: COLORS[theme].primary }]}>
             {siteDetails?.account_delete}
             {/* {JSON.stringify(siteDetails,null,2)} */}
            </Text>
            <TouchableOpacity
              style={[styles.deactivateBtn, { backgroundColor: COLORS[theme].primary }]}
              activeOpacity={0.85}
              onPress={() => setShowConfirm(true)}
            >
              <Text style={[styles.btnText, {
                color: COLORS[theme].background
              }]}>{siteDetails?.deletbtntext}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: COLORS[theme].cardBackground }]}>
            <Icon
              name="alert-circle-outline"
              size={wp(10)}
              color={COLORS[theme].primary}
            />

            <Text style={[styles.modalTitle, { color: COLORS[theme].primary }]}>
              Are you sure?
            </Text>

            <Text style={[styles.modalDesc, { color: COLORS[theme].primary }]}>
             {siteDetails?.delete_confirmation}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: COLORS[theme].primary }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={{ color: COLORS[theme].primary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: COLORS[theme].primary }]}
                onPress={handleDeactivate}
              >
                <Text style={{ color: COLORS[theme].background }}>
                Confirm Deletion
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};
export default AccountManage;
const styles = StyleSheet.create({
  container: {
    padding: wp(4),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: wp(4),
    padding: wp(5),
    borderWidth: wp(0.5)
  },
  iconBox: {
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  title: {
    ...poppins.semi_bold.h4,
    textAlign: 'center',
    marginBottom: hp(1),
  },

  desc: {
    ...poppins.regular.h8,
    textAlign: 'center',
    marginBottom: hp(3),
  },

  deactivateBtn: {
    paddingVertical: hp(1.6),
    borderRadius: wp(2),
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    ...poppins.semi_bold.h6,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: wp(6),
  },

  modalBox: {
    padding: wp(5),
    alignItems: 'center',
    borderWidth: wp(0.5),
    borderColor: "#CCC", borderRadius: wp(4),
  },

  modalTitle: {
    ...poppins.semi_bold.h5,
    marginTop: hp(1.5),
  },

  modalDesc: {
    ...poppins.regular.h8,
    textAlign: 'center',
    marginVertical: hp(2),
  },

  modalActions: {
    flexDirection: 'row',
    marginTop: hp(1),
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: hp(1.4),
    borderRadius: wp(2),
    alignItems: 'center',
    marginRight: wp(2),
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: hp(1.4),
    borderRadius: wp(2),
    alignItems: 'center',
  },
});
