import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { wp } from "../../resources/dimensions";
import { COLORS } from "../../resources/colors";
import { poppins } from "../../resources/fonts";

const ProductCard = ({ product, cartItems, addToCart, increaseQty, decreaseQty, setselProdtedData, theme }) => {
  return (
    <View style={{ marginVertical: wp(2), marginHorizontal: wp(2), backgroundColor: COLORS[theme].cardBackground, borderRadius: wp(2), padding: wp(3) }}>
      {/* Product Name */}
      <TouchableOpacity onPress={() => setselProdtedData(product)}>
        <Text style={{ fontSize: wp(4.5), fontWeight: "700", color: COLORS[theme].textPrimary, marginBottom: wp(2) }}>
          {product.name}
        </Text>
      </TouchableOpacity>

      {/* Variants List */}
      <FlatList
        data={product.variant_list}
        keyExtractor={(item, index) => index.toString()}
        horizontal={false}
        renderItem={({ item: variant, index }) => {
          const cartKey = `${product.item_id}_${index}`;
          const inCart = cartItems[cartKey];

          return (
            <View style={{
              flexDirection: "row",
              backgroundColor: "#F9F9F9",
              borderRadius: wp(2),
              marginBottom: wp(2),
              padding: wp(2),
              alignItems: "center",
            }}>
              {/* Product Image */}
              <Image source={{ uri: product.image_url[0] }} style={{ width: wp(22), height: wp(22), borderRadius: wp(1), resizeMode: "cover", marginRight: wp(3) }} />

              {/* Details */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ fontSize: wp(3.5), fontWeight: "600", color: COLORS[theme].textPrimary }}>
                      { product.image_url[0]} {variant.unit}
                    </Text>

                    {/* Price */}
                    {variant.offer_available === "true" ? (
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: wp(1) }}>
                        <Text style={{ textDecorationLine: "line-through", color: "#888", fontSize: 12, marginRight: 6 }}>
                          ₹{variant.price}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: "bold", color: COLORS[theme].textPrimary }}>
                          ₹{variant.totalAmount}
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: "bold", color: COLORS[theme].textPrimary, marginTop: wp(1) }}>
                        ₹{variant.totalAmount}
                      </Text>
                    )}
                  </View>

                  {/* Offer Badge */}
                  {variant.offer_available === "true" && (
                    <Text style={{ color: "#d32f2f", fontWeight: "900", fontSize: wp(3.5) }}>
                      {variant?.offer_percentage} OFF
                    </Text>
                  )}
                </View>

                {/* Add to Cart / Quantity */}
                {inCart ? (
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: wp(2),
                  }}>
                    <TouchableOpacity onPress={() => decreaseQty(cartKey)} style={{
                      backgroundColor: "#E6FAF8",
                      paddingHorizontal: wp(3),
                      paddingVertical: wp(1),
                      borderRadius: wp(1.5),
                    }}>
                      <Text style={{ color: "#009a44", fontSize: wp(5), fontWeight: "bold" }}>-</Text>
                    </TouchableOpacity>

                    <Text style={{ marginHorizontal: wp(3), fontSize: wp(4), fontWeight: "700", color: "#000" }}>
                      {inCart.qty}
                    </Text>

                    <TouchableOpacity onPress={() => increaseQty(cartKey)} style={{
                      backgroundColor: "#E6FAF8",
                      paddingHorizontal: wp(3),
                      paddingVertical: wp(1),
                      borderRadius: wp(1.5),
                    }}>
                      <Text style={{ color: "#009a44", fontSize: wp(5), fontWeight: "bold" }}>+</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => addToCart(product, variant, index)}
                    style={{
                      marginTop: wp(2),
                      borderWidth: 1,
                      borderColor: COLORS[theme].textPrimary,
                      borderRadius: wp(1.5),
                      paddingVertical: wp(2),
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: COLORS[theme].textPrimary, fontWeight: "600" }}>Add to Cart</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default ProductCard;
