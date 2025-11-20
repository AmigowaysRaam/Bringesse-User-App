import React, { useEffect, useState } from "react";
import {
  View,  Text,  StyleSheet,  Image,  TextInput,
  FlatList,  TouchableOpacity,  ActivityIndicator,} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import HeaderBar from "../../../components/header";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchData } from "../../../api/api";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../../../resources/colors";
import { ThemeProvider, useTheme } from "../../../context/ThemeContext";
import { poppins } from "../../../resources/fonts";
import { useSelector } from "react-redux";

// ✅ Separate StoreCard component
const StoreCard = ({ item, navigation }) => {
  const { theme } = useTheme();
  const profileDetails = useSelector(state => state.Auth.profileDetails);

  const [selectedVariant, setSelectedVariant] = useState(
    item.variants && item.variants.length > 0 ? item.variants[0] : null
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProductList", { storeId: item.store_id })
      }
    >
      <Image
        source={{ uri: item.image_url || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={[poppins.regular.h6,styles.name]}>{item.name || "Unnamed Store"}</Text>
        {/* ⭐ Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.iconText}>
            <MaterialCommunityIcons name="star-outline" size={16} color="#000" />
            <Text style={styles.infoText}>{item.rating || "0.0"}</Text>
          </View>

          <View style={styles.iconText}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#000" />
            <Text style={styles.infoText}>
              {item.distance ? `${item.distance} km` : "N/A"}
            </Text>
          </View>

          <View style={styles.iconText}>
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={16}
              color="#000"
            />
            <Text style={styles.infoText}>{item.time || "—"}</Text>
          </View>
        </View>

        {/* 🏷️ Tag */}
        {item.tag ? (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        ) : null}

        {/* 🧃 Variant Selection */}
        {item.variants && item.variants.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Select Variant:
            </Text>

            <View style={styles.variantSelect}>
              <Picker
                selectedValue={selectedVariant?._id}
                onValueChange={(value) => {
                  const variant = item.variants.find((v) => v._id === value);
                  setSelectedVariant(variant);
                }}
                style={{ flex: 1 }}
              >
                {item.variants.map((variant) => (
                  <Picker.Item
                    key={variant._id}
                    label={variant.lname}
                    value={variant._id}
                  />
                ))}
              </Picker>
            </View>

            {selectedVariant && (
              <Text style={{ marginTop: 6, color: "#333" }}>
                💰 Price: ₹{selectedVariant.price}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ✅ Main Component
const CategoryStore = () => {
  const route = useRoute();
  const { categoryId } = route.params || {};
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const profileDetails = useSelector(state => state.Auth.profileDetails);
  

  const fetchStores = async () => {
    try {
      console.log("CategoryId:", categoryId);
      setLoading(true);

      const payload = {
        category_id: categoryId,
        lon: profileDetails?.primary_address?.lon,
        lat: profileDetails?.primary_address?.lat,
        limit: "10",
        offset: "0",
        search: search.trim(),
      };

      const data = await fetchData("categorystore", "POST", payload);
      console.log("Payload:", payload);
      console.log("Response Data:", data);

      if (data?.status === "true") {
        setStores(data?.store_list || []);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Error fetching category stores:", error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStores();
  }, [categoryId,search]);
  return (
    <View style={[styles.container, {
      backgroundColor: COLORS[theme].background
    }]}>
      <HeaderBar showBackArrow title={"Stores"} />

      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#aaa" />
        <TextInput
          placeholder="Search stores..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchStores}
          style={[styles.searchInput,{
            color:"#000"
          }]}
          placeholderTextColor={COLORS[theme].black}

        />
      </View>

      {/* 🏪 Store Count or Loader */}
      {loading ? (
        <ActivityIndicator size="large" color="#00BFFF" style={{ marginTop: 20 }} />
      ) : (
        <Text style={styles.storeCount}>Stores</Text>
      )}

      {/* 🛍️ Store List */}
      <FlatList
        data={stores}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => <StoreCard item={item} navigation={navigation} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: "center", marginTop: 30, color: "#777" }}>
              No stores found.
            </Text>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  storeCount: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color:"#000",
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  iconText: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#000",
    marginLeft: 4,
  },
  tagContainer: {
    backgroundColor: "#E6F8E9",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  tagText: {
    color: "#00A651",
    fontWeight: "600",
    fontSize: 13,
  },
  variantSelect: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});

export default CategoryStore;
