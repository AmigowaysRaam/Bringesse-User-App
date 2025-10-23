/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Dimensions,
  Modal,
  Alert
} from 'react-native';
import { Text, IconButton, Button, ActivityIndicator, Portal, Dialog, Button as PaperButton, Paragraph } from 'react-native-paper';
import { hp, wp } from '../../../resources/dimensions';
import { useAuthHoc, useQuery } from '../../../config/config';
import { useNavigation } from '@react-navigation/native';
import UseProfileHook from '../../../hooks/profile-hooks';
import BlastedImage from 'react-native-blasted-image';
import { ImageViewer, ImageWrapper } from 'react-native-reanimated-viewer';
import { COLORS } from '../../../resources/colors';
import { useTheme } from '../../../context/ThemeContext';
import { height, poppins } from '../../../resources/fonts';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../../../components/header';
import { useTranslation } from 'react-i18next';
import { ICON_ASSETS, IMAGE_ASSETS } from '../../../resources/images';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import Icons from 'react-native-vector-icons/Ionicons';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ZoomViewer from 'react-native-image-zoom-viewer';
import Toast from 'react-native-toast-message';


const ProfileComponent = ({
  profile,
  colorScheme,
  navigation,
  profileId,
  userStoriesData,
  isOtherUser,
  userProfileData,
  t
}) => {

  // Helper function to get image aspect ratio dynamically
  const getImageAspectRatio = (uri) => {
    return new Promise((resolve, reject) => {
      Image.getSize(uri, (imageWidth, imageHeight) => {
        const aspectRatio = imageWidth / imageHeight;
        resolve(aspectRatio);
      }, (error) => reject(error));
    });
  };

  const DynamicImage = ({ item, index }) => {
    const [aspectRatio, setAspectRatio] = useState(null);
    const [imageWidth, setImageWidth] = useState(wp(4));  // Default width to 8% of the screen width

    useEffect(() => {
      getImageAspectRatio(item)  // Get the aspect ratio of the image
        .then((ratio) => {
          setAspectRatio(ratio);
          setImageWidth(wp(4));  // Set image width dynamically (you can adjust this)
        })
        .catch((error) => console.log('Error fetching image size', error));
    }, [item]);

    // Dynamically calculate height based on aspect ratio (height will be adjusted automatically)
    const imageHeight = aspectRatio ? imageWidth / aspectRatio : undefined;  // height is dynamically calculated

    return (

      <View style={{ backgroundColor: COLORS[colorScheme].background }}>
        <Image
          key={index}
          source={{ uri: item }}
          style={{
            width: imageWidth,
            height: imageHeight, // Dynamic height based on aspect ratio
            marginHorizontal: wp(1),
            // backgroundColor:COLORS[colorScheme].background
          }}
          resizeMode="contain" // Maintain aspect ratio
        />
      </View>
    );
  };

  return (
    <>
      <View style={stylesForProfile.profileContainer}>
        {/* Profile image */}
        <TouchableOpacity
        //  onLongPress={() => console.log(profile?.image_profile)}
        >
          <Image
            source={{ uri: profile?.image_profile }}
            style={stylesForProfile.avatar}
          />
        </TouchableOpacity>

        {/* User info */}
        <View style={stylesForProfile.userInfoContainer}>
          <View style={stylesForProfile.nameRow}>
            {
              profile?.first_name ?
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      position: 'relative',
                      marginVertical: wp(1),
                      maxWidth: wp(80)
                    }}
                  >
                    {
                      <Text numberOfLines={1} style={[poppins.bold.h8, {
                        color: COLORS[colorScheme].textPrimary,
                        textTransform: 'capitalize',
                        maxWidth: wp(60)
                      }]}>
                        {`${profile?.first_name} ${profile?.last_name} `}
                        { }
                      </Text>
                    }
                    {/* {userProfileData?.user_badges?.map((item, index) => (
                      <Image
                        key={index}
                        source={{ uri: item }}
                        style={{
                          borderRadius: wp(25),
                          width: wp(3),
                          height: wp(3),
                          marginHorizontal: wp(1),
                        }}
                      />
                    ))} */}
                    {userProfileData?.top_user_badge?.map((item, index) => (
                      <DynamicImage key={index} item={item} index={index} />

                    ))}

                  </View>
                  <View
                    style={{
                      flexDirection: 'row', // Keep items in a row
                      alignItems: 'center',  // Vertically center the items
                      justifyContent: 'space-between',  // Space between items
                      width: '99%',  // Make the container take the full width
                      marginLeft: wp(-0.5)
                    }}
                  >
                    {/* Counts Container - takes 70% of the space */}
                    <View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'space-between' }}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.push('FollowersScreen', {
                            currentUserId: profileId,
                          });
                        }}
                      >
                        <View>
                          <Text style={[poppins.medium.h9, { color: COLORS[colorScheme].textPrimary }]}>
                            {` ${profile?.followers_count || 0} ${t('followers')}`}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Following Count */}
                      <TouchableOpacity
                        onPress={() => {
                          navigation.push('FollowingScreen', {
                            currentUserId: profileId,
                          });
                        }}>
                        <View>
                          <Text style={[poppins.medium.h9, { color: COLORS[colorScheme].textPrimary }]}>
                            {` ${profile?.followings_count || 0} ${t('following')}`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Edit Icon Container - takes 25% of the space */}
                    <View style={{
                      flex: 0.25,
                      alignItems: "flex-end"  // Vertically align the icon with the counts
                    }}>
                      {!isOtherUser && (
                        <TouchableOpacity
                          onPress={() => navigation.navigate('Edit-Profile')}
                          style={{
                            justifyContent: 'center',  // Center the icon in the container
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: COLORS[colorScheme].ashGrey,
                              borderRadius: wp(2),
                              alignItems: "center",
                              justifyContent: "center",
                              paddingHorizontal: wp(2.5),
                              paddingVertical: wp(1)
                            }}
                          >
                            <MaterialCommunityIcon
                              name="account-edit-outline"
                              size={wp(5)}
                              color={COLORS[colorScheme].black}
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
                :
                <ActivityIndicator />
            }
          </View>
        </View>
      </View >

      <View>
        <View style={{
          marginBottom: wp(0),
          marginTop: wp(1),
          width: wp(45),
          alignItems: 'flex-start',
          marginLeft: wp(2)
        }}>
          {userProfileData?.bio != '' && userProfileData?.bio != null &&
            <Text
              numberOfLines={4}
              variant="headlineMedium"
              style={[poppins.regular.h8, { color: COLORS[colorScheme].textPrimary, textTransform: "capitalize" }]}>
              {`${userProfileData?.bio}`}
            </Text>
          }
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            marginTop: wp(1.5),
            alignItems: 'flex-start',
            justifyContent: "flex-start",
          }}>

          {
            // Instagram Profile
            profile?.instagram !== '' && profile?.instagram != null &&
            <TouchableOpacity
              style={{
                marginHorizontal: wp(2),  // Set horizontal margin here
              }}
              onPress={() => Linking.openURL(`https://www.instagram.com/${profile?.instagram}`)} // Directly navigate to Instagram
            >
              <MaterialCommunityIcon
                style={[{ textAlign: 'center' }]}
                name="instagram"
                size={wp(4)}
                color={colorScheme === 'light' ? '#000' : "#e4405f"}
              />
            </TouchableOpacity>
          }

          {
            // Twitter Profile
            profile?.twitter !== '' && profile?.twitter != null &&
            <TouchableOpacity
              style={{
                marginHorizontal: wp(2),  // Set horizontal margin herea
                marginTop: wp(0.5)
              }}
              onPress={() => Linking.openURL(`https://twitter.com/${profile?.twitter}`)} // Navigate to Twitter
            >
              {colorScheme === 'light' ?
                <ICON_ASSETS.xIconDark height={wp(3)} width={wp(3)} />
                :
                <ICON_ASSETS.xIcon height={wp(3)} width={wp(3)} />
              }
            </TouchableOpacity>
          }
          {
            profile?.snapchat !== '' && profile?.snapchat != null &&
            <TouchableOpacity
              style={{
                marginHorizontal: wp(2)  // Set horizontal margin here
              }}
              onPress={() => Linking.openURL(`https://www.snapchat.com/add/${profile?.snapchat}`)} // Navigate to Snapchat
            >
              <MaterialCommunityIcon
                style={[{ textAlign: 'center' }]}
                name="snapchat"
                size={wp(4)}
                color={colorScheme === 'light' ? '#000' : "#e6e300"}
              />
            </TouchableOpacity>
          }
        </View>
      </View>
    </>
  );
};

const stylesForProfile = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(2),
    marginTop: wp(4),
  },

  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(12) / 2,
    marginVertical: wp(2)

  },
  userInfoContainer: {
    flex: 1,
    paddingLeft: wp(0.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'colomn',
    justifyContent: 'space-around',
    paddingLeft: wp(3),
  },
  username: {
    fontWeight: 'bold',
    paddingHorizontal: wp(4),
    fontSize: wp(4),
  },

  followInfo: {
    marginTop: wp(0.5),
    fontSize: wp(3.5),
    fontWeight: '700',
    marginLeft: wp(2),
  },
  ordersCount: {
    marginTop: wp(1),
    fontSize: wp(3.5),
  },
});

const RenderPost = ({ item, index, viewRef, onLike, isOtheruser, navigation, isCloseChange, handleSendImage }) => {
  return (
    <View >
      {
        isOtheruser ?
          <TouchableOpacity onPress={() => isOtheruser && navigation.navigate('story-preview-screen', { publicImgIndex: index, publicProfileId: item.user_id })}>
            <View>
              <BlastedImage source={{ uri: item.image }} style={[styles.postCard]} />
              <View
                style={{
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  bottom: wp(2),
                  left: wp(2),
                }}>
                {
                  !isOtheruser &&
                  <MaterialIcon
                    name={item.liked ? 'heart' : 'heart-outline'}
                    color={item.liked ? 'red' : 'white'}
                    size={wp(5)}
                  />
                }
              </View>
            </View>

            {isOtheruser && (
              <View style={{ margin: wp(1) }}>
                <TouchableOpacity
                  style={stylesforRender.heartButtonContainer}
                  onPress={onLike}>
                  <IconButton
                    icon={item.liked ? 'heart' : 'heart-outline'}
                    iconColor={item.liked ? 'red' : 'white'}
                    size={wp(4)}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[stylesforRender.likeCountContaioner, { margin: wp(1) }]}>
              <Text
                style={[
                  poppins.medium.h9,
                  {
                    color: 'white',
                    marginRight: wp(3.5),

                  },
                ]}>
                {item.likecounts}

              </Text>
            </View>
          </TouchableOpacity>
          :
          <TouchableOpacity
            onPress={() => { handleSendImage(item, index) }}
          //  onPress={() => isOtheruser && navigation.navigate('story-preview-screen', { publicImgIndex: index, publicProfileId: item.user_id })}
          >
            {/* <ImageWrapper
              key={item.image}
              viewerRef={viewRef}
              index={index}
              source={item.image ? { uri: item.image } : ""}
            > */}
            <BlastedImage source={item.image ? { uri: item.image } : ""} style={styles.postCard} />
            <View
              style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                bottom: wp(2),
                left: wp(2),
              }}>
              {
                !isOtheruser &&
                <MaterialIcon
                  name={item.liked ? 'heart' : 'heart-outline'}
                  color={item.liked ? 'red' : 'white'}
                  size={wp(4)}
                />
              }
              <Text
                style={[
                  {
                    color: item.liked ? 'red' : 'white',
                    fontSize: wp(2.5),
                    paddingHorizontal: wp(1),
                    marginTop: wp(0.5),
                  },
                ]}>
                {item.likecounts}
              </Text>
            </View>
            {isOtheruser && (
              <TouchableOpacity
                style={stylesforRender.heartButtonContainer}
                onPress={onLike}>
                <IconButton
                  icon={item.liked ? 'heart' : 'heart-outline'}
                  iconColor={item.liked ? 'red' : 'white'}
                  size={wp()}
                />
              </TouchableOpacity>
            )}
            {/* </ImageWrapper> */}
          </TouchableOpacity>
      }
    </View >
  );
};


const RenderLikedPost = ({ item, index, viewRef }) => {

  return (
    <ImageWrapper
      key={item.image}
      viewerRef={viewRef}
      index={index}
      source={item.image ? { uri: item.image } : ""}
    >
      <Image source={item.image ? { uri: item.image } : ""} style={styles.postCard} />
    </ImageWrapper>
  );
};

// const EditProfileButton = ({ theme, navigation, t }) => {
//   return (
//     <Button
//       style={{
//         // width: wp(90),
//         width: wp(45),
//         marginTop: wp(4),
//         backgroundColor: COLORS[theme].buttonBg,
//         borderRadius: wp(1),
//       }}
//       uppercase={false}
//       labelStyle={[poppins.semi_bold.h8, { color: COLORS[theme].buttonText }]}
//       mode="contained"
//       onPress={() => {
//         navigation.navigate('Edit-Profile');
//       }}
//       rippleColor="white">
//       {t('edit_profile')}
//     </Button>
//   );
// };


const ChallangeButton = ({ theme, navigation, t, profile }) => {
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('challangeList', {
            currentProfile: profile,
            tabIndex: 0
          });
        }}
        style={{
          backgroundColor: COLORS[theme].ashGrey,

          borderRadius: wp(1),
          justifyContent: 'center',
          alignItems: 'center',
          width: wp(25),
          height: wp(5.5),
          marginVertical: wp(2),
          marginHorizontal: wp(2)
        }}
      >
        <Text
          numberOfLines={1}
          style={[
            poppins.regular.h9,
            , {
              color: COLORS[theme].black,
              // fontSize: wp(2)
              lineHeight: wp(3.5)
            }]}
        >
          {t('my_challenges')}
        </Text>
      </TouchableOpacity>
    </>

  );
};

const AccountScreen = ({ route }) => {

  const { profileId, isOtherUser, showBack } = route.params || {};
  const { profile } = UseProfileHook();
  const navigation = useNavigation();

  const [viewMode, setViewMode] = useState('my-story');

  const [userProfileData, setUserProfileData] = useState([]);
  const [userStoriesData, setUserStoriesData] = useState([]);
  const imageRef = useRef(null);
  const likeImageRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [followBtnLoader, setfollowBtnLoader] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isOwnModalVisible, setIsOwnModalVisible] = useState(false);
  const [selectedOwnImage, setSelectedOwnImage] = useState(null);

  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const openImage = (image, index) => {
    setSelectedImage({ image, index });
    setIsModalVisible(true);
  };


  function fnhandleSendImage(image, index) {
    setSelectedOwnImage({ image, index });
    setIsOwnModalVisible(true);
    // console.log(JSON.stringify(selectedOwnImage.image.likecounts))
  }

  const handleSwipeChange = (index) => {
    // Update the selected image based on the new index
    const image = userStoriesData[index];
    setSelectedOwnImage({ image, index });
    // alert(JSON.stringify(userStoriesData[index].likecounts))
  };


  useEffect(() => {
    const fetchData = () => {
      getUserStoryData();
      getUserProfileData();
    };
    fetchData(); // Initial call
    const unsubscribe = navigation.addListener('focus', fetchData); // Re-fetch on focus
    return unsubscribe; // Clean up listener
  }, [navigation, profileId, profile]);

  const {
    reducerConstants: { GET_STORY_USERS_LIST_PROFILE, APP_GET_LIKED_STORIES },
    reducerName,
    actions: {
      GET_STORY_USERS_LIST_PROFILE_CALL,
      ADD_STORY_LIKE_API_CALL,
      GET_PUBLIC_VIEW_PROFILE_CALL,
      APP_GET_LIKED_STORIES_CALL,
      ADD_USER_FOLLOW_API_CALL,
      DELETE_STORY_API_CALL
    },
  } = useAuthHoc();

  const [userStoryData, likedStories] = useQuery(reducerName, [
    {
      key: GET_STORY_USERS_LIST_PROFILE,
      requiredKey: ['loader', 'data'],
      default: {},
      initialLoaderState: true,
    },
    {
      key: APP_GET_LIKED_STORIES,
      requiredKey: ['loader', 'data'],
      default: [],
      initialLoaderState: true,
    },
  ]);


  const fnDeleteStory = (storyId) => {

    Alert.alert(
      t('are_you_sure_to_delete'), // Using translation for the message
      '',// Using translation for the title 
      [
        {
          text: t('cancel'), // Translated cancel button
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: t('yes'), // Translated "Yes" button
          onPress: () =>
            fnDeleteStoryApiCall(storyId)
        },
      ],
      { cancelable: false }
    );
  }

  function fnDeleteStoryApiCall(sId) {

    // alert(sId),

    const payLoad = {
      userid: profile.id || profileId,
      storyid: sId,
      locale: 'en',
    };

    DELETE_STORY_API_CALL({
      request: { payload: payLoad },
      callback: {
        successCallback({ message, data }) {
          if (data.data.success) {

            // Toast.show({
            //   type: 'success',  // You can use 'success', 'error', 'info', etc.
            //   position: 'top',  // Positioning can be 'top', 'bottom', or 'center'
            //   text1: data.data.message,  // Main text
            //   visibilityTime: 2000,  // Duration for which the toast is visible
            //   autoHide: true,  // Toast hides automatically after the specified time
            // });

            showMessage({
              message: data.data.message,
              // description: ,
              type: 'success',
              icon: 'success',
              duration: 2000
            });
            getUserStoryData();
          }
        },
        errorCallback(message) {
          console.log('Error Deleting story:', message);
        },
      },
    });


    setIsOwnModalVisible(false)
  }


  const toggleLike = async storyId => {
    const params = {
      userid: profile.id || profileId,
      storyid: storyId,
      locale: 'en',
    };


    // Optimistically update the local state
    setUserStoriesData(prevStories =>
      prevStories.map(story =>
        story.id === storyId ? { ...story, liked: !story.liked } : story,
      ),
    );

    await ADD_STORY_LIKE_API_CALL({
      request: { payload: params },
      callback: {
        successCallback({ message, data }) {
          if (data.data.success) {
            const likedStatus = data.data.liked === 1;
            setUserStoriesData(prevStories =>
              prevStories.map(story =>
                story.id === storyId ? { ...story, liked: likedStatus } : story,
              ),
            );
            getUserStoryData();
          }
        },
        errorCallback(message) {
          console.log('Error liking story:', message);
          setUserStoriesData(prevStories =>
            prevStories.map(story =>
              story.id === storyId ? { ...story, liked: !story.liked } : story,
            ),
          );
        },
      },
    });
  };

  const getUserProfileData = () => {
    if (profileId || profile.id) {
      GET_PUBLIC_VIEW_PROFILE_CALL({
        request: {
          payload: {
            userid: profile.id,
            publicuserid: profileId || profile.id,
            locale: 'en',
            profilePage: 1
          },
        },
        callback: {
          successCallback({ message, data }) {
            if (data.data) {
              setUserProfileData(data.data.data.user_data);
            }
          },
          errorCallback(message) { },
        },
      });
    }
  };

  // console.log('profileid',  profileId, profile.id)
  const getUserStoryData = () => {

    if (profileId || profile.id) {
      APP_GET_LIKED_STORIES_CALL({
        task: { clearData: true },
        request: {
          payload: {
            userid: profileId || profile.id,
            locale: 'en',
          },
        },
      });

      GET_STORY_USERS_LIST_PROFILE_CALL({
        task: { clearData: true },
        request: {
          payload: {
            userid: profile.id,
            storyuserid: profileId || profile.id,
            locale: 'en',
          },
        },
        callback: {
          successCallback({ message, data }) {
            if (data.data) {
              setUserStoriesData(data.data.data.stories_data);
            }
          },
          errorCallback(message) {

          },
        },
      });
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    getUserStoryData();
    getUserProfileData();
    setRefreshing(false);
  };

  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isImageViewerVisible, setImageViewerVisible] = useState(true);

  // useEffect(() => {
  //   showMessage({
  //     message: 'Success',
  //     description: "successMessage",
  //     type: 'success',
  //     icon: 'success',
  //     duration: 100000
  //   });
  //   Toast.show({
  //     type: 'success',  // You can use 'success', 'error', 'info', etc.
  //     position: 'top',  // Positioning can be 'top', 'bottom', or 'center'
  //     text1: " data.data.message",  // Main text
  //     visibilityTime: 50000,  // Duration for which the toast is visible
  //     autoHide: true,  // Toast hides automatically after the specified time
  //   });
  // }, [])

  function fnHandleFollow() {

    setfollowBtnLoader(true)
    ADD_USER_FOLLOW_API_CALL({
      request: {
        payload: {
          userid: profile.id,
          tofollowuserid: profileId,
          locale: 'en',
        },
      },
      callback: {
        successCallback({ message, data }) {
          if (data.data.success) {
            const successMessage = data.data.message;
            Toast.show({
              type: 'success',  // You can use 'success', 'error', 'info', etc.
              position: 'top',  // Positioning can be 'top', 'bottom', or 'center'
              text1: successMessage,  // Main text
              visibilityTime: 2000,  // Duration for which the toast is visible
              autoHide: true,  // Toast hides automatically after the specified time
            });
            showMessage({
              message: 'Success',
              description: successMessage,
              type: 'success',
              icon: 'success', // Optional: show success icon
            });
            getUserStoryData();
            getUserProfileData();
            setfollowBtnLoader(false)
            // onRefresh();
          }
        },
        errorCallback(message) {
          setfollowBtnLoader(false)
          console.log('error', message);
        },

      },

    });
  }
  return (
    <>
      <View>
        {/* <FlashMessage position="top" zIndex={10000} /> */}

      </View>
      <GestureHandlerRootView
        style={[styles.container, { backgroundColor: COLORS[theme].background }]}>

        <View style={styles.headerContainer}>
          {isOtherUser ? <HeaderBar align={true} showTitleOnly showBackArrow title={''} /> : (showBack && <HeaderBar align={true} showTitleOnly showBackArrow title={t('my_account')} />)}
          {/* <HeaderBar align={true} showTitleOnly showBackArrow title={t('my_account')} /> */}
        </View>
        <ScrollView
          style={[styles.container, { marginTop: wp(-2) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>

          <View style={{ marginHorizontal: wp(4) }}>

            <ProfileComponent
              userStoriesData={userStoriesData}
              profile={userProfileData}
              colorScheme={theme}
              navigation={navigation}
              profileId={profileId || profile.id}
              isOtherUser={isOtherUser}
              userProfileData={userProfileData}
              t={t}
            />

            <Toast style={{ zIndex: 999 }} zIndex={100000} />
            <FlashMessage position="top" zIndex={10000} />

            {!isOtherUser ? (
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <ChallangeButton
                  t={t}
                  theme={theme}
                  navigation={navigation}
                  profileId={profileId || profile.id}
                  profile={userProfileData}
                />
              </View>
            ) :
              <>
                <View
                  style={{
                    flexDirection: 'row', justifyContent: "flex-start", gap: wp(2), marginHorizontal: wp(2), marginBottom: wp(2)
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      fnHandleFollow()
                    }}
                    style={{
                      backgroundColor: COLORS[theme].ashGrey,
                      borderRadius: wp(1),
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: wp(20),
                      marginTop: wp(3),
                      height: wp(7)
                    }}
                  >
                    <Text
                      style={[poppins.regular.h8, {
                        color: COLORS[theme].black,
                        lineHeight: wp(7.5)
                      }]}
                    >
                      {
                        followBtnLoader ?
                          <ActivityIndicator color={COLORS[theme].black} size={wp(3)} />
                          :
                          userProfileData.followed ? t('unfollow') : t('follow')
                      }
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('challanges', {
                        currentProfile: userProfileData
                      });
                    }}
                    style={{
                      backgroundColor: COLORS[theme].ashGrey,
                      borderRadius: wp(1),
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: wp(32),
                      marginTop: wp(3),
                      height: wp(7)
                    }}
                  >
                    <Text
                      style={[poppins.regular.h8, {
                        color: COLORS[theme].black,
                        lineHeight: wp(7.5),
                        textTransform: "capitalize"


                      }]}
                    >
                      {t('invite_challenges')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      navigation.push('chatconversationScreen', {
                        touserId: profileId,
                      });
                    }}
                    style={{
                      backgroundColor: COLORS[theme].ashGrey,
                      borderRadius: wp(1),
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: wp(10),
                      marginTop: wp(3),
                      height: wp(7)
                    }}
                  >
                    <Icons
                      name="mail-unread-outline"
                      color={COLORS[theme].black}
                      size={wp(4)}
                    />

                  </TouchableOpacity>

                </View>
              </>
            }

            <FlatList
              style={{ marginHorizontal: wp(1) }}
              data={userProfileData?.bottom_user_badge}
              renderItem={({ item }) => (
                <View style={[styles.imageContainer, {
                  borderColor: COLORS[theme].ashGrey, borderWidth: wp(0.5),
                  // height: wp(18),
                  // width: wp(18),
                  borderRadius: wp(2),
                  margin: wp(1),
                  padding: wp(0.5),
                  backgroundColor: '#FFF'

                }]}>
                  <BlastedImage
                    source={{ uri: item }}
                    style={[styles.achivedPostCard]} // Optional: Add border-radius for rounded corners
                    resizeMode="cover"
                  />
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              horizontal={true} // Horizontal scroll
              showsHorizontalScrollIndicator={false} // Hide horizontal scroll indicator
            />


            {!isOtherUser &&




              <View
                style={[
                  styles.iconContainer,
                  { marginTop: wp(5) },
                ]}>
                <TouchableOpacity onPress={() => setViewMode('my-story')}>
                  <View
                    style={{
                      width: wp(45),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* <Image
                    tintColor={COLORS[theme].textPrimary}
                    resizeMode="contain"
                    source={IMAGE_ASSETS.Mask_group}
                    style={{
                      width: wp(5),
                      height: hp(6),
                      marginHorizontal: wp(2)
                    }}
                  /> */}
                      <Text
                        style={[
                          poppins.medium.h8,
                          {
                            color: COLORS[theme].textPrimary,
                            textAlign: 'center',
                            textTransform: "capitalize"

                          },
                        ]}>
                        {t('my_story')}
                      </Text>
                    </View>

                    <View
                      style={{
                        height: wp(0.7),
                        width: wp(30),
                        backgroundColor:
                          viewMode === 'my-story' ? COLORS[theme].accent : null,
                      }}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewMode('liked-story')}>
                  <View
                    style={{
                      width: wp(45),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={[
                          poppins.medium.h8,
                          {
                            color: COLORS[theme].textPrimary,
                            textAlign: 'center',
                            textTransform: "capitalize"
                          },
                        ]}>
                        {t('liked_story')}
                      </Text>
                    </View>
                    <View
                      style={{
                        marginTop: wp(0),
                        height: wp(0.7),
                        width: wp(30),
                        backgroundColor:
                          viewMode === 'liked-story' ? COLORS[theme].accent : null,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            }

            {userStoriesData && viewMode === 'my-story' && (
              <FlatList
                data={userStoriesData}
                style={{}}
                renderItem={({ item, index }) => (
                  <RenderPost
                    handleSendImage={fnhandleSendImage}
                    item={item}
                    index={index}
                    viewRef={imageRef}
                    onLike={() => toggleLike(item.id)}
                    isOtheruser={isOtherUser}
                    navigation={navigation}
                  />
                )}
                keyExtractor={item => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.grid}
                ListEmptyComponent={
                  !userStoryData.loader ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginVertical: wp(10),
                      }}>
                      <Text style={{ color: COLORS[theme].textPrimary }}>
                        {t('no_posts')}
                      </Text>
                    </View>
                  ) : null
                }
              />
            )}

            {likedStories && viewMode === 'liked-story' && (
              <FlatList
                data={likedStories?.data || []}
                style={{}}
                renderItem={({ item, index }) => (
                  // <RenderLikedPost
                  //   item={item}
                  //   index={index}
                  //   viewRef={likeImageRef}
                  // />
                  <TouchableOpacity onPress={() => openImage(item, index)}>
                    <BlastedImage source={{ uri: item.image }} style={styles.postCard} />
                  </TouchableOpacity>


                )}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                contentContainerStyle={styles.grid}
                ListEmptyComponent={
                  !userStoryData.loader ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginVertical: wp(10),
                      }}>
                      <Text style={{ color: COLORS[theme].textPrimary }}>
                        {t('no_posts')}                    </Text>
                    </View>
                  ) : null
                }
              />
            )}
            <ImageViewer
              renderLoader={() => null} // Disable the default loader
              ref={likeImageRef}
              data={likedStories?.data.map(el => ({
                key: `key-${el.image}`,
                source: { uri: el.image },
              }))}
              renderCustomComponent={({ item }) => (
                <>
                  <IconButton
                    icon={'close'}
                    iconColor={'white'}
                    size={wp(7)}
                    style={stylesforRender.heartButton}
                  />
                </>
              )}
            />
            <View style={{ flex: 1 }}>
              <ImageViewer
                ref={imageRef}
                data={userStoriesData.map(el => ({
                  key: `key-${el.image}`,
                  source: { uri: el.image },
                  id: el.id,
                  isLiked: el.liked,
                  likecounts: el.likecounts,
                }))}
                renderCustomComponent={({ item }) => (
                  <>
                    {!isOtherUser && (
                      <>
                        <View
                          style={[styles.closeButton, { pointerEvents: 'none' }]}
                        >
                          <IconButton
                            icon={'close'}
                            iconColor={'white'}
                            size={wp(7)}
                            style={stylesforRender.heartButton}
                          />
                        </View>
                        <TouchableOpacity
                          style={[
                            stylesforRender.ViewerheartButtonContainer,
                            {
                              alignItems: 'center',
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }
                          ]}
                          onPress={() =>
                            toggleLike(item?.id)}>
                          <IconButton
                            icon={item?.isLiked ? 'heart' : 'heart-outline'}
                            iconColor={item?.isLiked ? 'red' : 'white'}
                            size={wp(5)}
                            style={{
                              marginRight: wp(-1),
                            }}
                          />
                          <Text
                            style={[
                              poppins.medium.h7,
                              {
                                color: 'white',
                                marginRight: wp(5),
                                marginTop: wp(1)
                              }
                            ]}>
                            {item?.likecounts}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}
                renderImage={({ source }) => (
                  <View
                  >
                    <Image
                      source={source}
                      resizeMode="stretch"
                    />
                  </View>
                )}
              />
            </View>
          </View>
        </ScrollView >
        {selectedImage && (
          <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setIsModalVisible(false)} >
            {/* <View style={{ flex: 1, height: hp(100) }}> */}
            <ZoomViewer
              renderIndicator={() => (
                null
              )}
              renderHeader={() => (
                // <CustomComponent />
                <View
                  style={[styles.closeButton, { marginHorizontal: wp(10), marginVertical: wp(1) }]}
                >
                  <IconButton
                    onPress={() => setIsModalVisible(false)}
                    icon={'close-circle'}
                    iconColor={'white'}
                    size={wp(8)}
                    style={stylesforRender.heartButton}
                  />
                </View>
              )}
              index={selectedImage.index}
              imageUrls={likedStories?.data.map((item) => ({ url: item.image }))} // All images as urls
              // onClick={() => setIsModalVisible(false)}
              enableSwipeDown={true}
              onSwipeDown={() => setIsModalVisible(false)}
            />
          </Modal>
        )}

        {selectedOwnImage && (
          <Modal visible={isOwnModalVisible} transparent={true} onRequestClose={() => setIsOwnModalVisible(false)}>
            <View style={{
              flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
              // width: '100%', height: '100%',
            }}>
              <ZoomViewer
                handleLongPressWithIndex={() => {
                  null
                }}
                renderIndicator={() => (
                  null
                )}
                renderHeader={() => (
                  <View
                    style={[styles.closeButton, { borderRadius: wp(10), marginHorizontal: wp(8), marginVertical: wp(1), flexDirection: "row", gap: wp(1) }]}
                  >
                    <View style={{ backgroundColor: "rgba(0,0,0,0.4)", borderRadius: wp(10), width: wp(8), height: wp(8), justifyContent: "center", alignItems: "center" }}>
                      <IconButton
                        onPress={() => setIsOwnModalVisible(false)}
                        icon={'close-circle'}
                        iconColor={'white'}
                        size={wp(6)}
                        style={{ justifyContent: "center", alignSelf: 'center' }}
                      />
                    </View>

                    <View style={{ backgroundColor: "rgba(0,0,0,0.4)", borderRadius: wp(10), width: wp(8), height: wp(8), justifyContent: "center", alignItems: "center" }}>
                      <IconButton
                        onPress={() => fnDeleteStory(selectedOwnImage?.image?.id)}
                        icon={'delete-circle'}
                        iconColor={'white'}
                        size={wp(6)}
                        style={stylesforRender.heartButton}
                      />
                    </View>
                  </View>
                )}
                index={selectedOwnImage.index}
                imageUrls={userStoriesData?.map((item) => ({ url: item.image }))}
                enableSwipeDown={true}
                onSwipeDown={() => setIsOwnModalVisible(false)}
                onChange={(index) => handleSwipeChange(index)}
                imageStyle={{
                  width: wp(100),    // Set width to 100% of the screen width
                  height: hp(90),    // Set height to 90% of the screen height
                  resizeMode: 'contain'  // This will ensure the image is scaled proportionally
                }}
              />
              <View
                style={[{ flexDirection: "row", position: 'absolute', bottom: wp(8), right: wp(4), alignItems: "center", justifyContent: 'start', backgroundColor: 'rgba(0,0,0,0.4)', marginHorizontal: wp(6), borderRadius: wp(6), width: wp(11), height: wp(11) }]}
              >
                <IconButton
                  onPress={() => {
                    {
                      const updatedImage = { ...selectedOwnImage.image, liked: !selectedOwnImage.image.liked };
                      setSelectedOwnImage({ ...selectedOwnImage, image: updatedImage });
                      updatedImage.likecounts = updatedImage.liked ? updatedImage.likecounts + 1 : updatedImage.likecounts - 1, toggleLike(selectedOwnImage?.image?.id)
                    }
                  }}
                  icon={selectedOwnImage?.image?.liked ? 'heart' : 'heart-outline'}
                  iconColor={selectedOwnImage?.image?.liked ? 'red' : 'white'}
                  size={wp(4)}
                />
                {
                  <Text
                    style={[
                      poppins.medium.h9,
                      {
                        color: 'white',
                        marginLeft: wp(-1.8),
                        maxWidth: wp(8),
                        alignSelf: "center"
                      },
                    ]}
                  >
                    {selectedOwnImage?.image?.likecounts}
                  </Text>
                }
              </View>
            </View>
          </Modal>
        )}

      </GestureHandlerRootView >




    </>
  );
};

const stylesforRender = StyleSheet.create({
  heartButtonContainer: {
    position: 'absolute',
    bottom: hp(0), // Adjust bottom padding as needed
    right: wp(1), // Adjust right padding as needed
  },

  likeCountContaioner: {
    position: 'absolute',
    bottom: hp(1), // Adjust bottom padding as needed
    right: wp(-2),
  },


  ViewerheartButtonContainer: {
    position: 'absolute',
    bottom: hp(5), // Adjust bottom padding as needed
    right: wp(1), // Adjust right padding as needed
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verticalLine: {
    width: wp(0.2), // Width of the vertical line
    height: '98%',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out the icons evenly
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: wp(15), // Adjust as needed
    right: wp(0), // Adjust as needed
    zIndex: 1, // Ensure it's above other components
  },

  avatar: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    borderWidth: 2,
    borderColor: '#ddd',
    margin: wp(5),
  },
  username: {
    fontWeight: 'bold',
    color: '#FFF',
  },

  bio: {
    color: 'gray',
    textAlign: 'center',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  userNameBio: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: wp(5),
  },

  postCard: {
    margin: wp(0.5),
    height: wp(30),
    width: wp(30),
  },

  achivedPostCard: {
    height: wp(17),
    width: wp(17),
    alignSelf: "center",
    justifyContent: 'center',
  },
  postImage: {
    height: hp(20),
    width: wp(30),
  },
  editProfile: {
    width: '45%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: wp(1),
  },
  backButton: {
    marginRight: wp(1.5),
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
  },
});

export default AccountScreen;