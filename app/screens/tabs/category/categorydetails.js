import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  ToastAndroid,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import HeaderBar from "../../../components/header";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchData } from "../../../api/api";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../../../resources/colors";
import { useTheme } from "../../../context/ThemeContext";
import { poppins } from "../../../resources/fonts";
import { useSelector } from "react-redux";
import { hp, wp } from "../../../resources/dimensions";

/* 🔥 Stroke Text Style */
const strokeText = {
  textShadowColor: "rgba(0,0,0,0.95)",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 4,
};

const StoreCard = ({ item, index, navigation }) => {
  const { theme } = useTheme();
  const [selectedVariant, setSelectedVariant] = useState(
    item?.variants?.[0] || null
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [25, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={item.isActive !== "true"}
        onPress={() =>
          item.isActive === "true" &&
          navigation.navigate("ProductList", {
            storeId: item.store_id,
            variant: selectedVariant,
          })
        }
      >
        <ImageBackground
          source={{ uri: item.image_url || "https://via.placeholder.com/800" }}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <View style={styles.overlay} />

          <View style={styles.cardInner}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
              />
            </View>

            <View style={styles.cardContent}>
              <Text
                numberOfLines={1}
                style={[poppins.semi_bold.h5, styles.name, strokeText]}
              >
                {item.name}
              </Text>

              <Text style={[styles.subText, strokeText]}>
                {item.location}
              </Text>

              <Text style={[styles.subText, strokeText]}>
                {item.store_status}
              </Text>

              <View style={styles.infoRow}>
                <InfoItem icon="star" text={item.rating || "0.0"} />
                <InfoItem icon="map-marker" text={item.distance || "N/A"} />
                <InfoItem icon="clock-outline" text={item.time || "--"} />
              </View>

              {item.tag && (
                <View style={styles.tag}>
                  <Text style={[styles.tagText, strokeText]}>{item.tag}</Text>
                </View>
              )}

              {item?.variants?.length > 0 && (
                <View style={styles.variantBox}>
                  <Picker
                    selectedValue={selectedVariant?._id}
                    onValueChange={(value) => {
                      const v = item.variants.find(x => x._id === value);
                      setSelectedVariant(v);
                    }}
                  >
                    {item.variants.map(v => (
                      <Picker.Item
                        key={v._id}
                        label={`${v.lname} • ₹${v.price}`}
                        value={v._id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

const InfoItem = ({ icon, text }) => (
  <View style={styles.infoItem}>
    <MaterialCommunityIcons name={icon} size={wp(4)} color="#fff" />
    <Text style={[styles.infoText, strokeText]}>{text}</Text>
  </View>
);

const CategoryStore = () => {
  const route = useRoute();
  const { categoryId } = route.params || {};
  const navigation = useNavigation();
  const { theme } = useTheme();
  const profileDetails = useSelector(state => state.Auth.profileDetails);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const fetchStores = async (isLoadMore = false) => {
    // if (!profileDetails?.primary_address || Object.keys(profileDetails?.primary_address).length === 0) {
    //   ToastAndroid.show('Add Address Before Shopping', ToastAndroid.SHORT);
    //   navigation.navigate('SelectLocation');
    //   return;
    // }
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      const payload = {
        category_id: categoryId,
        lon: Number(profileDetails?.primary_address?.lon) || 0,
        lat: Number(profileDetails?.primary_address?.lat) || 0,
        limit: limit.toString(),
        offset: offset.toString(),
        search: search.trim(),
      };
      const data = await fetchData("categorystore", "POST", payload);
      if (data) {
        // Alert.alert("TEST", JSON.stringify(data, null, 2))
      }
      const newStores = data?.status === "true" ? data.store_list : [];
      if (isLoadMore) setStores(prev => [...prev, ...newStores]);
      else setStores(newStores);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchStores();
  }, [categoryId, search]);

  const loadMore = () => {
    if (!loadingMore && stores.length >= limit) {
      setOffset(prev => prev + limit);
      fetchStores(true);
    }
  };
  return (
    <View style={[styles.container, {
      backgroundColor: COLORS[theme].background
    }]}>
      <HeaderBar showBackArrow title="Stores" />


      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={wp(6)} color={COLORS[theme].black} />
        <TextInput
          placeholder="Search nearby stores"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS[theme].black}
          style={[styles.searchInput, { color: COLORS[theme].black }]}
        />
      </View>
      {
        !profileDetails?.primary_address || Object.keys(profileDetails?.primary_address).length == 0 && 
        (
          <View
            style={{
              paddingVertical: hp(1.5),
              paddingHorizontal: wp(5),
              borderRadius: wp(10),
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 10,
            }}
          >
            <Text
              style={{
                color: '#FF0000',
                fontFamily: poppins.medium.fontFamily,
                fontSize: 16,
              }}
            >
              Add Address Before Shopping !
            </Text>
          </View>
        )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: hp(4) }} />
      ) : (
        <FlatList
          data={stores}
          renderItem={({ item, index }) => (
            <StoreCard item={item} index={index} navigation={navigation} />
          )}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={{ paddingBottom: hp(4) }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<>
            <Text style={[poppins.semi_bold.h5, {
              color: COLORS[theme].primary, alignSelf: "center", marginVertical: hp(5)
            }]}>{'No Items'}</Text>
          </>}
          ListFooterComponent={loadingMore && <ActivityIndicator style={{ marginVertical: hp(2) }} />}
        />
      )}
    </View>
  );
};

export default CategoryStore;

/* 🔥 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    height: hp(6),
    marginBottom: hp(2),
  },

  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: wp(4),
  },

  card: {
    height: hp(15.5),
    borderRadius: wp(4),
    marginBottom: hp(2),
    overflow: "hidden",
  },
  cardImage: {
    borderRadius: wp(4),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  cardInner: {
    flexDirection: "row",
    padding: wp(4),
  },
  imageWrapper: {
    width: wp(26),
    height: wp(26),
    borderRadius: wp(3),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
    marginLeft: wp(4),
    justifyContent: "space-between",
  },
  name: {
    color: "#fff",
    fontSize: wp(4),
    textTransform: "capitalize"
  },
  subText: {
    color: "#fff",
    fontSize: wp(3.5),
    textTransform: "capitalize"
  },
  infoRow: {
    flexDirection: "row",
    marginTop: hp(0.5),
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(4),
  },
  infoText: {
    color: "#fff",
    fontSize: wp(3.4),
    marginLeft: wp(1),
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
    alignSelf: "flex-start",
  },
  tagText: {
    color: "#fff",
    fontSize: wp(3.3),
    fontWeight: "700",
  },
  variantBox: {
    marginTop: hp(1),
    borderRadius: wp(2),
    backgroundColor: "#fff",
    overflow: "hidden",
  },
});
