import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import HeaderBar from "../../../components/header";
import FlashMessage from "react-native-flash-message";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ProductTab from "./productTab";
import CategoryTab from "./categoryTab";
import ReviewTab from "./review";

const ProductListScreen = ({ route }) => {
  const { storeId } = route.params;
  const [selectedTab, setSelectedTab] = useState("product");
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://bringesse.com:3003/api/storedetails", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          lon: 78.1616,
          lat: 9.9,
          type: "top",
          store_search: "false",
          search: "",
        }),
      });

      const data = await response.json();
      if (data?.status === "true") {
        setStoreData(data);
      } else {
        console.log("No data found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStoreDetails();
  }, []);

  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  const store = storeData?.data?.[0];

  return (
    <View style={styles.container}>
      <HeaderBar showBackArrow title="Product Details" />
      <FlashMessage position="top" />

      <ScrollView style={{ flex: 1 }}>
     
        {store && (
          <View style={styles.card}>
            <Image
              source={{ uri: store.image_url }}
              style={styles.storeImage}
              resizeMode="cover"
            />
            <Text style={styles.storeName}>{store.store_name}</Text>
            <Text style={styles.address}>{store.address}</Text>

            <View style={styles.row}>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons name="star" color="#00BFA6" size={18} />
                <Text style={styles.iconText}>{store.rating}</Text>
              </View>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons name="map-marker" color="#00BFA6" size={18} />
                <Text style={styles.iconText}>{store.distance} km</Text>
              </View>
              <View style={styles.iconRow}>
                <MaterialCommunityIcons name="clock-outline" color="#00BFA6" size={18} />
                <Text style={styles.iconText}>{store.packing_time} mins</Text>
              </View>
            </View>

            {store.top_store === "true" && (
              <TouchableOpacity style={styles.badge}>
                <Text style={styles.badgeText}>Top Store</Text>
              </TouchableOpacity>
            )}

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>Open: {formatTo12Hour(store.opening_time)}</Text>
              <Text style={styles.timeText}>Close: {formatTo12Hour(store.closing_time)}</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          {["product", "category", "review"].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
              <Text style={[styles.tab, selectedTab === tab && styles.activeTab]}>
                {tab === "product"
                  ? "Product"
                  : tab === "category"
                  ? "Category"
                  : "Reviews"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {selectedTab === "product" && <ProductTab storeData={storeData} />}
        {selectedTab === "category" && <CategoryTab storeData={storeData} />}
        {selectedTab === "review" && <ReviewTab storeId={storeId} />}
      </ScrollView>
    </View>
  );
};

export default ProductListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
  },
  storeImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  storeName: { fontSize: 18, fontWeight: "bold", color: "#222", textAlign: "center" },
  address: { color: "#666", fontSize: 13, textAlign: "center", marginVertical: 4 },
  row: { flexDirection: "row", justifyContent: "space-around", marginVertical: 6 },
  iconRow: { flexDirection: "row", alignItems: "center" },
  iconText: { marginLeft: 4, color: "#333", fontSize: 13 },
  badge: {
    backgroundColor: "#00BFA6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  timeText: { fontSize: 13, color: "#555" },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },
  tab: { fontSize: 15, color: "#777" },
  activeTab: { color: "#00BFA6", fontWeight: "bold" },
});
