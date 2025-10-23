import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import { useAuthHoc } from '../config/config';
import UseProfileHook from './profile-hooks';

const UseCartHook = () => {

  const [cart, setCart] = useState(new Map());
  const { profile } = UseProfileHook();

  useEffect(() => {
    getCartData();
    getMyCartData();

  }, []);

  function getCartData() {
    // //sync with cloud
    // AsyncStorage.getItem('cart')
    //   .then(cartString => {
    //     if (cartString !== null) {
    //       // Value is successfully retrieved
    //       // console.log('carthookkk getitemcart', cartString);

    //       if (!_.isEmpty(cartString)) {
    //         let obj = JSON.parse(cartString);
    //         setCart(new Map(Object.entries(obj)));
    //       }
    //     } else {
    //       // No value found for the key

    //       console.log('No value found');
    //     }
    //   })
    //   .catch(error => {
    //     // Error while retrieving data
    //     console.error('Error retrieving data:', error);
    //   });
  }

  function updateCartItemsInLocal(data) {
    // let obj = Object.fromEntries(data);
    // console.log('insert', JSON.stringify(obj));
    // AsyncStorage.setItem('cart', JSON.stringify(obj));
  }

  function addToCartItem(item, callback) {

    // var dummy = new Map(cart);
    // const itemId = `p_${item.id}`;
    // console.log('udpating_item', itemId);
    // if (dummy.has(itemId)) {
    //   console.log('udpating_item2', itemId);
    //   let existingItem = dummy.get(itemId);
    //   let newItem = {
    //     ...existingItem,
    //     buyQuantity: existingItem.buyQuantity + item.buyQuantity,
    //   };
    //   dummy.set(`p_${item.id}`, newItem);
    //   updateCartOnApi(
    //     { ...item.payload, quantity: newItem.buyQuantity },
    //     callback,
    //   );
    // } else {
    //   dummy.set(`p_${item.id}`, item);
    //   updateCartOnApi({ ...item.payload, quantity: item.buyQuantity }, callback);
    // }
    // updateCartItemsInLocal(dummy);
    // setCart(new Map(dummy));
  }

  const {
    reducerName,
    actions: { ADD_PRODUCT_CART_API_CALL, GET_MY_CART_API_CALL },
    reducerConstants: { },
  } = useAuthHoc();

  function updateCartOnApi(payload, callback) {
    // ADD_PRODUCT_CART_API_CALL({
    //   request: {
    //     payload,
    //   },
    //   callback: {
    //     successCallback({ data }) {
    //       if (data) {
    //         console.log('adding first cart item', data)
    //         getMyCartData();
    //         if (callback) {
    //           callback();
    //         }
    //       }
    //     },
    //     errorCallback(error) {
    //       console.error('Error adding product to cart:', error);
    //     },
    //   },
    // });
  }

  function getMyCartData() {

    // GET_MY_CART_API_CALL({
    //   request: {
    //     payload: {
    //       userid: profile.id,
    //       locale: 'en',
    //     },
    //     callback: {
    //       successCallback({ data }) {
    //         // alert(JSON.stringify(data))
    //       }
    //     }
    //   },
    // });
  }

  function clearCart() {
    // setCart(new Map());
    // AsyncStorage.setItem('cart', '');

  }

  async function removeFromCartItem(id) {
    // var dummy = new Map(cart);
    // let existingItem = dummy.get(`p_${id}`);
    // updateCartOnApi({ ...existingItem.payload, quantity: 0 });
    // dummy.delete(`p_${id}`);
    // updateCartItemsInLocal(dummy);
    // setCart(new Map(dummy));
  }

  async function updateItem(item) {
    // const payload = { ...item.payload, quantity: item.buyQuantity };
    // console.log('asdas', item);
    // updateCartOnApi(payload);
    // var dummy = new Map(cart);
    // dummy.set(`p_${item.id}`, item);
    // updateCartItemsInLocal(dummy);
    // setCart(new Map(dummy));
  }

  return {
    cartList: cart,
    addToCartItem,
    removeFromCartItem,
    updateItem,
    getCartData,
    getMyCartData,
    clearCart,
  };
};

export default UseCartHook;
