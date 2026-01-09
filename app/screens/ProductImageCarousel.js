import React, { useState, useRef, useEffect } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Video from 'react-native-video';
import { hp, wp } from '../resources/dimensions';
import { poppins } from '../resources/fonts';
const { width } = Dimensions.get('window');
const ProductImageCarousel = ({ images = [], video = '', theme, variant = {} }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const mediaItems = video ? [...images, video] : images;
  // Auto scroll
  useEffect(() => {
    if (!mediaItems.length) return;
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= mediaItems.length) nextIndex = 0; 
    }, 2000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [activeIndex, mediaItems.length]);
  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };
  return (
    <View style={styles.container}>
      {/* <Text>{JSON.stringify(variant['item_outOfStock '])}</Text> */}
      <FlatList
        ref={flatListRef}
        data={mediaItems}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.mediaWrapper, {
          }]}>
            {variant["itemOutofStock "] == '1' &&
              <View style={{
                backgroundColor: "red", position: "absolute",
                borderRadius: wp(1),
                zIndex: 1, opacity: 0.8
              }}>
                <Text style={[poppins.regular.h7, {
                  color: "#FFF",
                  paddingHorizontal: wp(4),
                }]}>
                  Out of Stock
                </Text>
              </View>
            }
            {typeof item === 'string' && item.endsWith('.mp4') ? (
              <Video
                source={{ uri: item }}
                style={styles.media}
                resizeMode="contain"
                controls
                paused={false}
                repeat={true}
              />
            ) : (
              <>
                <Image
                  source={{ uri: item }}
                  style={[styles.media, styles.backgroundImage]}
                  blurRadius={wp(12)}
                />
                <Image
                  source={{ uri: item }}
                  style={styles.media}
                  resizeMode="contain"
                />
              </>
            )}
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {mediaItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: activeIndex === index ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: wp(2),
    flex: 1,
  },
  mediaWrapper: {
    width: wp(90),
    height: wp(40),
    borderRadius: wp(1),
    overflow: 'hidden',
    marginRight: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  pagination: {
    position: 'absolute',
    bottom: 6,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#fff',
    marginHorizontal: wp(0.3),
    borderWidth: wp(0.1), borderColor: "#ccc"
  },
});

export default ProductImageCarousel;
