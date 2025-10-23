import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { wp, hp } from '../../../resources/dimensions'; // Adjust the path as needed
import { ActivityIndicator } from 'react-native-paper'; // Import Button and Appbar components
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../../components/header';
import { useAuthHoc } from '../../../config/config';
import UseProfileHook from '../../../hooks/profile-hooks';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import Icons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { poppins } from '../../../resources/fonts';
import Toast from 'react-native-toast-message';

const FollowingScreen = ({ route }) => {


  const navigation = useNavigation();
  const { currentUserId } = route.params;
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFollowIds, setLoadingFollowIds] = useState([]); // Track loading state for each user
  const { profile } = UseProfileHook();
  const { t } = useTranslation();

  const {
    reducerConstants: { GET_PROFILE_USER_FOLLOWERS_API },
    reducerName,
    actions: { GET_PROFILE_USER_FOLLOWING_API_CALL, ADD_USER_FOLLOW_API_CALL },
  } = useAuthHoc();

  const handleFollowPress = (id) => {
    setLoadingFollowIds((prev) => [...prev, id]); // Add user to loading state
    followuserFn(id);
  };

  function followuserFn(id) {
    ADD_USER_FOLLOW_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          tofollowuserid: id,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data.data.success) {
            console.log('userFollow', data.data);
            const successMessage = data.data.message;
            Toast.show({
              type: 'success',  // You can use 'success', 'error', 'info', etc.
              position: 'top',  // Positioning can be 'top', 'bottom', or 'center'
              text1: successMessage,  // Main text
              visibilityTime: 2000,  // Duration for which the toast is visible
              autoHide: true,
              // Custom styling for toast
              style: {
                backgroundColor: 'green',  // Green background color (success)
              },
              
              // Custom text styling for text1 (Main text)
              text1Style: {
                color: 'green',  // White text color
              }
            });

            getFollowersList();
          }
          setLoadingFollowIds((prev) => prev.filter((userId) => userId !== id)); // Remove user from loading state
        },
        errorCallback(message) {
          console.log('error', message);
          setLoadingFollowIds((prev) => prev.filter((userId) => userId !== id)); // Remove user from loading state on error
        },
      },
    });
  }



  useEffect(() => {

    // Toast.show({
    //   type: 'success',  // You can use 'success', 'error', 'info', etc.
    //   position: 'top',  // Positioning can be 'top', 'bottom', or 'center'
    //   text1: "successMessage",  // Main text
    //   visibilityTime: 4000,  // Duration for which the toast is visible
    //   autoHide: true,
    //   // Custom styling for toast
    //   style: {
    //     backgroundColor: 'green',  // Green background color (success)
    //   },
      
    //   // Custom text styling for text1 (Main text)
    //   text1Style: {
    //     color: 'green',  // White text color
    //   }
    // });




    const unsubscribe = navigation.addListener('focus', () => {
      getFollowersList();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getFollowersList();
  }, [currentUserId]);

  function getFollowersList() {
    console.log(currentUserId, 'profileId');
    GET_PROFILE_USER_FOLLOWING_API_CALL({
      request: {
        payload: {
          userid: profile?.id,
          currentuserid: currentUserId,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data.data) {
            console.log(data.data.data, 'data.data');
            setFollowers(data.data.data);
            setIsLoading(false);
          }
        },
        errorCallback(message) { },
      },
    });
  }

  function handleNavigateToProfile(id) {
    if (profile?.id !== id) {
      navigation.push('user-profile', {
        profileId: id,
        isOtherUser: true,
      });
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNavigateToProfile(item.id)}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.user_image }} style={styles.profilePic} />
        <View style={styles.infoContainer}>
          <View>
            <Text
              numberOfLines={1}
              style={[
                poppins.regular.h7,
                styles.name,
                { flex: 1, flexWrap: 'wrap', maxWidth: wp(45), color: COLORS[theme].textPrimary },
              ]}>
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                poppins.regular.h9,
                { marginTop: wp(-2), flex: 1, flexWrap: 'wrap', maxWidth: wp(42), color: COLORS[theme].textPrimary },
              ]}>
              {`@${item?.user_name}`}
            </Text>
          </View>
          {profile?.id !== item.id && (
            <TouchableOpacity
              style={{
                backgroundColor: '#0095f6',
                paddingHorizontal: wp(3),
                paddingVertical: wp(1),
                borderRadius: wp(1),
                width: wp(25),
                maxWidth: wp(35),
                position: 'absolute',
                right: wp(0),
                alignItems: 'center',
              }}
              onPress={() => handleFollowPress(item.id)}>
              {loadingFollowIds.includes(item.id) ? (
                <ActivityIndicator size={wp(5)} color="#FFF" style={{ padding: wp(1) }} />
              ) : (
                <Text style={[poppins.bold.h8, { color: '#FFF', lineHeight: wp(7) }]}>
                  {item?.is_following == 1 ? t('un_follow') : t('follow')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <HeaderBar showTitleOnly title={t('Following')} />
      <TouchableOpacity style={styles.searchIconContainer} onPress={() => navigation.navigate('SearchUser')}>
        <Icons name="search" color={COLORS[theme].textPrimary} size={24} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {isLoading ? (
          <View style={{ marginTop: hp(10) }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <FlatList
              data={followers}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View
                  style={[
                    {
                      flex: 1,
                      marginVertical: hp(5),
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}>
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.statCount,
                      { color: COLORS[theme].textPrimary },
                    ]}>
                    {t('no_followings')}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </ScrollView>
      <Toast />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1c1c1e',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingBottom: hp(10),
  },
  listContainer: {
    paddingHorizontal: wp(4),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.4),
    padding: wp(1),
    borderRadius: wp(2),
    justifyContent: 'space-between',
    marginTop: hp(0.4),
  },
  profilePic: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(6),
    marginRight: wp(4),
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontWeight: '500',
  },
  followButton: {
    marginLeft: wp(2),
  },
  searchIconContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
});

export default FollowingScreen;
