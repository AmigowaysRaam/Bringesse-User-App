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
import FlashMessage, { showMessage } from 'react-native-flash-message';

const FollowersPage = ({ route }) => {
  const navigation = useNavigation();
  const { currentUserId } = route.params;
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFollowIds, setLoadingFollowIds] = useState([]); // Track loading state for each user
  const { profile } = UseProfileHook();

  const {
    reducerConstants: { GET_PROFILE_USER_FOLLOWERS_API },
    reducerName,
    actions: { GET_PROFILE_USER_FOLLOWERS_API_CALL, ADD_USER_FOLLOW_API_CALL },
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
            const successMessage = data.data.message;
            showMessage({
              message: 'Success',
              description: successMessage,
              type: 'success',
              icon: 'success', // Optional: show success icon
            });
            getFollowersList();
          }
          setLoadingFollowIds((prev) => prev.filter((userId) => userId !== id)); // Remove user from loading state
        },
        errorCallback(message) {
          console.log('error', message);
          setLoadingFollowIds((prev) => prev.filter((userId) => userId !== id)); // Remove user from loading state
        },
      },
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getFollowersList();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    getFollowersList();
  }, [currentUserId]);

  function getFollowersList() {
    GET_PROFILE_USER_FOLLOWERS_API_CALL({
      request: {
        payload: {
          userid: profile?.id,
          currentuserid: currentUserId,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data) {
            setFollowers(data.data.data);
            setIsLoading(false);
          }
        },
        errorCallback(message) {
          console.log('ErrorFetching Data in FollowersScreen', message);
        },
      },
    });
  }

  function handleNavigateToProfile(id) {
    if (profile.id !== id) {
      navigation.push('user-profile', {
        profileId: id,
        isOtherUser: true,
      });
    }
  }

  const renderItem = ({ item }) => {
    const idCheck = profile?.id !== item.id;
    const isFollow = item.is_following;

    return (
      <TouchableOpacity onPress={() => handleNavigateToProfile(item.id)}>
        <View style={[styles.itemContainer]}>
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
                  {
                    flex: 1,
                    flexWrap: 'wrap',
                    maxWidth: wp(45),
                    marginTop: wp(-2),
                    color: COLORS[theme].textPrimary,
                  },
                ]}>
                {`@${item?.user_name}`}
              </Text>
            </View>
            {idCheck && (
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
                onPress={() => handleFollowPress(item?.id)}>
                {loadingFollowIds.includes(item.id) ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[poppins.semi_bold.h7, { color: '#FFF', lineHeight: wp(7) }]}>
                    {item.is_following == 1 ? t('following') : t('follow')}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS[theme].background }]}>
      <HeaderBar showTitleOnly title={t('followers')} />
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
              uppercase={false}
              data={followers}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                  <Text variant="bodyLarge" style={styles.statCount}>
                    {t('no_followers')}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </ScrollView>
      <FlashMessage position="top" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
  },
  header: {
    backgroundColor: '#1c1c1e', // Darker shade for the header
  },
  headerTitle: {
    color: '#fff', // White text for header
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingBottom: hp(5), // Adjust padding for scroll content
  },
  listContainer: {
    paddingHorizontal: wp(2), // Adjust padding based on width percentage
  },
  searchIconContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
    margin: hp(0.5), // Adjust margin based on height percentage
    padding: wp(1), // Adjust padding based on height percentage
    borderRadius: wp(2), // Adjust border radius based on width percentage
    justifyContent: 'space-between',
    paddingHorizontal: wp(1),
  },
  profilePic: {
    width: wp(11), // Adjust width based on width percentage
    height: wp(11), // Adjust height to match width for a circle
    borderRadius: wp(6), // Half of width for a circle
    marginRight: wp(4),
  },
  infoContainer: {
    flex: 1, // Takes up the available space
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space out name and button
    alignItems: 'center',
  },
  name: {
    fontWeight: '500',
  },
  followButton: {
    marginLeft: wp(2), // Adjust margin based on width percentage
  },
});

export default FollowersPage;
