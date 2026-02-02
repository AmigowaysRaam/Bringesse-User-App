import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';

export const WishlistContext = createContext();

const STORAGE_KEY = '@wishlist_items';

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  //  Load wishlist on app start
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setWishlistItems(JSON.parse(data));
      }
    } catch (e) {
      console.log('Wishlist load error', e);
    }
  };

  const saveWishlist = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.log('Wishlist save error', e);
    }
  };

  //  Check if item is wishlisted
  const isWishlisted = (itemId) => {
    return wishlistItems.some(item => item.item_id === itemId);
  };

  //  Add to wishlist
  const addToWishlist = async (item) => {
    try {
      const updated = [...wishlistItems, item];
      setWishlistItems(updated);
      await saveWishlist(updated);
      ToastAndroid.show('Added to wishlist ', ToastAndroid.SHORT);
    } catch (e) {
      console.log('Add wishlist error', e);
    }
  };

  //  Remove from wishlist
  const removeFromWishlist = async (itemId) => {
    try {
      const updated = wishlistItems.filter(
        item => item.item_id !== itemId
      );
      setWishlistItems(updated);
      await saveWishlist(updated);
      ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
    } catch (e) {
      console.log('Remove wishlist error', e);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};