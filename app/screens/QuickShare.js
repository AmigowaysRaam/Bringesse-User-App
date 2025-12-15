import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HeaderBar from '../components/header';
import { COLORS } from '../resources/colors';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchData } from '../api/api';

const QuickShare = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const SHARE_MESSAGE = "Hey! Check out this app:";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const result = await fetchData('app/info', 'POST', null, {
        type: 'user',
      });
      setData(result?.data || []);
    } catch (error) {
      console.error('Profile API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error(err));
  };

  const shareApp = (app) => {
    Share.share({
      message: `${SHARE_MESSAGE}\n${app.title}\n${app.appLink}`,
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS[theme].background }}>
      
      {/* Header */}
      <HeaderBar title={t('Share & Connect')} showBackArrow />

      {/* Loader */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS[theme].primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {data && data.length > 0 ? (
            data.map((app) => (
              <View
                key={Math.random().toString(36)}
                style={[
                  styles.card,
                  { backgroundColor: COLORS[theme].card }
                ]}
              >
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => openLink(app.appLink)}
                  activeOpacity={0.85}
                >
                  <View style={styles.leftRow}>
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: COLORS[theme].primary + "22" }
                      ]}
                    >
                      <Image
                        source={{ uri: app.image }}
                        style={{
                          width: wp(15),
                          height: wp(15),
                          borderRadius: wp(3),
                          resizeMode: "cover",
                        }}
                      />
                    </View>

                    <View style={{ marginLeft: wp(4) }}>
                      <Text style={[styles.title, { color: COLORS[theme].primary }]}>
                        {app.title}
                      </Text>
                      <Text style={[styles.desc, { color: COLORS[theme].primary }]}>
                        {app.description}
                      </Text>
                    </View>
                  </View>

                  {/* Share Button */}
                  <TouchableOpacity
                    style={[
                      styles.smallShareBtn,
                      { backgroundColor: COLORS[theme].accent }
                    ]}
                    onPress={() => shareApp(app)}
                  >
                    <Icon
                      name="share-social"
                      size={wp(4)}
                      color={COLORS[theme].white}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>
              {t("No apps available to share.")}
            </Text>
          )}
        </ScrollView>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0),
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    borderWidth: wp(0.3),
    borderColor: "#ccc",
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconWrap: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    ...poppins.semi_bold.h8,
  },

  desc: {
    ...poppins.regular.h9,
    marginTop: hp(0.4),
    width: wp(56),
  },

  smallShareBtn: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  noDataText: {
    textAlign: "center",
    marginTop: hp(3),
    ...poppins.regular.h8,
    color: "#999",
  }
});

export default QuickShare;
