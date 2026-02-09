import React, { useEffect, useState } from "react";
import { View, Text,  FlatList,  TouchableOpacity,  Image,  StyleSheet, ActivityIndicator} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import HeaderBar from "../../../components/header";
import { useTheme } from "../../../context/ThemeContext";
import { COLORS } from "../../../resources/colors";
import { wp, hp } from "../../../resources/dimensions";
import { poppins } from "../../../resources/fonts";
import { useSelector } from "react-redux";
import { StoreCard } from "../../StoreListData";
import { fetchData } from "../../../api/api";

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
   const { categoryId } = route.params || {};
  const { theme } = useTheme();



  const categories = useSelector(state => state.Auth.categories || []);
const selectedCategoryId = useSelector(state => state.Auth.selectedCategoryId);

const [selectedCategory, setSelectedCategory] = useState(null);

useEffect(() => {
  if (categories.length > 0) {
    const initial =
      categories.find(c => c.category_id === selectedCategoryId) ||
      categories[0];
    setSelectedCategory(initial);
  }
}, [categories, selectedCategoryId]);


// // rightstore  api

const [stores, setStores] = useState([]);
const [loadingStores, setLoadingStores] = useState(false);

useEffect(() => {
  const loadStores = async () => {
    if (!selectedCategory) return;
    setLoadingStores(true);
    try {
      const payload = {
        category_id: categoryId, //
        limit: "10",
        offset: "0",
      };
      const res = await fetchData("categorystore", "POST", payload);
      console.log("STORE RESPONSE", res);
      setStores(res?.status === "true" ? res.store_list : []);
    } catch (e) {
      console.log("STORE ERROR", e);
      setStores([]);
    } finally {
      setLoadingStores(false);
    }
  };

  loadStores();
}, [selectedCategory]);




useEffect(() => {
  console.log("SELECTED CATEGORY 👉", selectedCategory);
}, [selectedCategory]);






  /*  SET INITIAL CATEGORY */
  useEffect(() => {
    if (categories.length > 0) {
      const initial =
        categories.find(c => c.category_id === selectedCategoryId) ||
        categories[0];
      setSelectedCategory(initial);
    }
  }, [categories, selectedCategoryId]);

  /*  EMPTY STATE */
  if (!categories.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No categories found</Text>
      </View>
    );
  }

  /* LEFT CATEGORY ITEM */
  const renderLeft = ({ item }) => {
    const active = item.category_id === selectedCategory?.category_id;

    return (
      <TouchableOpacity
        style={[styles.mainItem, active && styles.mainItemActive,{borderLeftColor:COLORS[theme].accent,backgroundColor:COLORS[theme].inputBackground}]}
        onPress={() => setSelectedCategory(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.mainImage}
        />
        <Text
          numberOfLines={2}
          style={[
            styles.mainText,
            { color: COLORS[theme].textPrimary },
          ]}
        >
          {item.category_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <HeaderBar title="Categories" showBackArrow />

      <View style={styles.body}>
        {/* LEFT PANEL */}
        <View style={{width:wp(28),backgroundColor:COLORS[theme].viewBackground}}>
          <FlatList
            data={categories}
            keyExtractor={item => item.category_id.toString()}
            renderItem={renderLeft}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* RIGHT PANEL */}
<View style={styles.right}>
  <Text style={[styles.heading,{color:COLORS[theme].textPrimary}]}>
    {selectedCategory?.category_name}
  </Text>

  {loadingStores ? (
    <ActivityIndicator />
  ) : (
    <FlatList
      data={stores}
      keyExtractor={(item) => item.store_id.toString()}
      renderItem={({ item }) => (
        <StoreCard item={item} navigation={navigation} />
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 20 ,color:COLORS[theme].textPrimary}}>
          No stores found
        </Text>
      }
    />
  )}
</View>

      </View>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  body: {
    flex: 1,
    flexDirection: "row",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: wp(4),
    color: "#888",
  },
  mainItem: {
    alignItems: "center",
    paddingVertical: hp(2),
    paddingHorizontal: wp(2),
  },

  mainItemActive: {
    // backgroundColor: "#fff",
    borderLeftWidth: 4,
    // borderLeftColor: "#2a7fff",
  },

  mainImage: {
    width: wp(12),
    height: wp(12),
    resizeMode: "contain",
    marginBottom: hp(0.5),
  },

  mainText: {
    fontSize: wp(3),
    textAlign: "center",
    fontFamily: poppins.medium.fontFamily,
  },

  /* RIGHT */
  right: {
    flex: 1,
    padding: wp(4),
  },

  heading: {
    marginBottom: hp(2),
  },

  bigCard: {
    // backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: "center",
    elevation: 4,
  },

  bigImage: {
    width: wp(40),
    height: wp(40),
    resizeMode: "contain",
    marginBottom: hp(1),
  },

  bigText: {
    fontSize: wp(4),
    fontFamily: poppins.semi_bold.fontFamily,
  },
});