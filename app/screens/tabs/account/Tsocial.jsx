import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { wp, hp } from '../../../resources/dimensions'; // Adjust the path as needed
import { ActivityIndicator } from 'react-native-paper'; // Import Button and Appbar components
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '../../../components/header';
import { useAuthHoc, useQuery } from '../../../config/config';
import LoaderView from '../../../components/loader';
import UseProfileHook from '../../../hooks/profile-hooks';
import { useTheme } from '../../../context/ThemeContext';
import { COLORS } from '../../../resources/colors';
import Icons from 'react-native-vector-icons/Ionicons';
import { poppins } from '../../../resources/fonts';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';


const Tsocial = ({ route }) => {

  const navigation = useNavigation();
  const { profileId, isOtherUser } = route.params || {};
  const [viewMode, setViewMode] = useState('Following');
  const { currentUserId } = route.params;
  const [followersdata, setFollowersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = UseProfileHook();
  const [foryoudata, setForyoudata] = useState([]);
  const imageRef = useRef(null);
  const likeImageRef = useRef(null);
  const { t } = useTranslation();

  const [likedList, setLikesData] = useState([]);
  const [isLIkeLoading, setIsLIkeLoading] = useState(false);





  const {
    reducerConstants: { MY_FOLLOWERS_STORIES_API, MY_FOLLOWING_STORIES_API },
    reducerName,
    actions: { MY_FOLLOWERS_STORIES_API_CALL, MY_FOLLOWING_STORIES_API_CALL, ADD_STORY_LIKE_API_CALL, GET_STORY_LIKED_LIST_CALL },
  } = useAuthHoc();

  const handleFollowPress = id => {
    console.log(`Follow button pressed for ${id}`);
    followuserFn(id);
  };

  const [followersData, foryouData] = useQuery(reducerName, [
    {
      key: MY_FOLLOWERS_STORIES_API,
      requiredKey: ['loader', 'data'],
      default: {},
      initialLoaderState: true,
    },
    {
      key: MY_FOLLOWING_STORIES_API,
      requiredKey: ['loader', 'data'],
      default: [],
      initialLoaderState: true,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    fetchData(); // Initial call

    const unsubscribe = navigation.addListener('focus', fetchData); // Re-fetch on focus
    return unsubscribe; // Clean up listener
  }, [navigation, profile]);
  const fetchData = () => {
    getfollowersStories();
    getfollowingstories();
  };

  function getfollowersStories() {
    if (profile.id) {
      MY_FOLLOWERS_STORIES_API_CALL({
        task: { clearData: true },
        request: {
          payload: {
            userid: profile.id,
            locale: 'en',
          },
        },
        callback: {
          successCallback({ message, data }) {
            if (data.data) {
              setFollowersData(data.data.data.stories_data);
              setIsLoading(false);
            }
            // if (data.data.success) {
            //   const successMessage = data.data.message;
            //   //  Message
            //   showMessage({
            //     message: 'Success',
            //     description: successMessage,
            //     type: 'success',
            //     icon: 'success', // Optional: show success icon
            //   });
            //  getFollowersList();
            // }
          },
          errorCallback(message) {
            console.log('error', message);
          },
        },
      });
    }
  }
  function getfollowingstories() {
    if (profile.id) {
      MY_FOLLOWING_STORIES_API_CALL({
        task: { clearData: true },
        request: {
          payload: {
            userid: profile.id,
            locale: 'en',
          },
        },
        callback: {
          successCallback({ message, data }) {
            if (data.data) {
              console.log('for you', data.data.data.stories_data);
              setForyoudata(data.data.data.stories_data);
              setIsLoading(false);
            }
          },
          errorCallback(message) {
            console.log('error', message);
          },
        },
      });
    }
  }

  function handleNavigateToProfile(id) {
    if (profile.id !== id) {
      navigation.push('user-profile', {
        profileId: id,
        isOtherUser: true,
      });
    }
  }

  const toggleLike = async storyId => {

    const params = {
      userid: profileId || profile.id,
      storyid: storyId,
      locale: 'en',
    };

    // Optimistically update the local state
    setFollowersData(prevStories =>
      prevStories.map(story =>
        story.id === storyId ? { ...story, liked: !story.liked } : story,
      ),
    );

    await ADD_STORY_LIKE_API_CALL({
      request: { payload: params },
      callback: {
        successCallback({ message, data }) {
          if (data.data.success) {
            fetchData();
          }
        },
        errorCallback(message) {
          console.log('Error liking story:', message);
          setFollowersData(prevStories =>
            prevStories.map(story =>
              story.id === storyId ? { ...story, liked: !story.liked } : story,
            ),
          );
        },
      },
    });
  };

  function handleShowLiked(item) {

    // alert(JSON.stringify(item))
    setModalVisible(true);

    setIsLIkeLoading(true)
    GET_STORY_LIKED_LIST_CALL({
      request: {
        payload: {
          userid: profile.id,
          locale: 'en',
          storyid: item.id
        },
      },
      callback: {
        successCallback({ message, data }) {
          console.log(data?.data.data, "data?.data?.invites")
          setLikesData(data?.data?.data)
          setIsLIkeLoading(false)
        },
        errorCallback(message) {
          console.log('Error claiming reward:', message);
          setIsLIkeLoading(false)

        },
      },
    })
  }

  const onGestureEvent = (event) => {
    const { translationY } = event.nativeEvent;
    // If the swipe down exceeds a threshold, close the modal
    if (translationY > 80) {
      // setModalVisible(false);
    }
  };
  const onHandlerStateChange = (event) => {
    const { state, translationY } = event.nativeEvent;

    // Handle the state change event: if the gesture is completed, check if we reached the threshold
    if (state === 5 && translationY > 50) {
      setModalVisible(false);
    }
  };

  const RenderPost = ({ item, index, viewRef, onLike, isOtheruser }) => (
    <View style={{ flexDirection: 'column', justifyContent: 'flex-start', }}>
      <View>
        <TouchableOpacity onPress={() => {
          navigation.navigate('user-profile', {
            profileId: item.user_id,
            isOtherUser: true,
          });
        }} style={{ flexDirection: 'row', margin: 10, alignItems: 'center' }}>
          <Image source={{ uri: item.user_image }} style={[styles.profilePic, { height: wp(7), width: wp(7) }]} />
          <Text
            style={[
              poppins.medium.h8,
              {
                color: COLORS[theme].textPrimary,
                paddingHorizontal: wp(2),
              },
            ]}>
            {item.first_name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('story-preview-screen', { publicImgIndex: item.navigate_index, publicProfileId: item.user_id })
          }}
        >
          <View style={{
            height: hp(70),
            width: wp(100),
            justifyContent: "center",
            alignSelf: "center"
          }}>
            <Image source={{ uri: item?.image }} style={{
              // height: hp(50),
              width: wp(100),
              flex: 1,
              resizeMode: "cover",
              justifyContent: "center",
              alignSelf: "center"
            }} />
          </View>
        </TouchableOpacity>
        <View style={{
          marginTop: wp(1)
        }}>
          <View
            style={{
              // position: 'absolute',
              alignItems: 'center',
              flexDirection: 'row',
              marginHorizontal: wp(2),
              marginBottom: wp(1)
            }}>{
              <TouchableOpacity
                onPress={onLike}>
                <MaterialIcon
                  name={item.liked ? 'heart' : 'heart-outline'}
                  color={item.liked ? 'red' : COLORS[theme].textPrimary}
                  size={wp(4)}
                />
              </TouchableOpacity>
            }
            <Text
              style={[
                {
                  fontSize: wp(3),
                  color: COLORS[theme].textPrimary,
                  paddingHorizontal: 4,
                },
              ]}>
              {item.likecounts}
            </Text>
          </View>
          <Text
            style={[
              {
                fontSize: wp(2.5),
                color: COLORS[theme].textPrimary,
                marginHorizontal: wp(2),
              },
            ]}>
            {item?.timestamp}
          </Text>
        </View>
        {
          item.likecounts > 0 &&
          <TouchableOpacity style={{
            marginBottom: wp(2)
          }}
            onPress={() => handleShowLiked(item)}
          >
            <Text style={[poppins.medium.h6, { fontSize: wp(3), color: COLORS[theme].textPrimary, marginHorizontal: wp(2) }]}>
              {`${t('liked_by')} `}
              <Text style={[poppins.bold.h8, { fontWeight: 'bold', color: COLORS[theme].textPrimary }]}>{item.last_like}</Text>
              <Text>
                {` ${item?.likecounts > 1 ? `${t('and')}` : ""}`}
              </Text>
              <Text style={[poppins.bold.h8, { fontWeight: 'bold', color: COLORS[theme].textPrimary }]}>
                {` ${item?.likecounts > 1 ? `${parseFloat(item?.likecounts) - 1} ${t('others')}` : ""} `}
              </Text>
            </Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );

  const { theme } = useTheme();

  return (
    <>
      <SafeAreaView
        style={[styles.container, {
          opacity: modalVisible ? 0.2 : 1,
          backgroundColor: modalVisible ? 'rgba(0, 0, 0, 8)' : COLORS[theme].background,

        },]}>
        <FlashMessage position="top" />
        <HeaderBar showTitleOnly title={t('T-Social')} showBackArrow={false} />
        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={() => navigation.navigate('SearchUser')}>
          <Icons name="search" color={COLORS[theme].textPrimary} size={24} />
        </TouchableOpacity>

        <View
          style={[
            styles.iconContainer,
            { marginTop: wp(2), paddingVertical: wp(2) },
          ]}>
          <TouchableOpacity onPress={() => setViewMode('Following')}>
            <View
              style={{
                width: wp(45),
                justifyContent: 'center',
                alignItems: 'center', // Center content vertically
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Text
                  style={[
                    poppins.medium.h8,
                    {
                      color: COLORS[theme].textPrimary,
                      textAlign: 'center',
                    },
                  ]}>
                  {t('following')}
                </Text>
              </View>

              <View
                style={{
                  marginTop: wp(1),
                  height: wp(0.5),
                  width: wp(20),
                  backgroundColor:
                    viewMode === 'Following' ? COLORS[theme].accent : null,
                }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('For you')}>
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
                    },
                  ]}>{t('for_you')}
                </Text>
              </View>

              <View
                style={{
                  marginTop: wp(1),
                  height: wp(0.5),
                  width: wp(20),
                  backgroundColor:
                    viewMode === 'For you' ? COLORS[theme].accent : null,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        {
          isLoading ? (
            <View style={{ marginTop: hp(10) }}>
              <LoaderView />
            </View>) :
            viewMode === 'Following' ?
              (
                <FlatList
                  data={followersdata}
                  style={{}}
                  renderItem={({ item, index }) => (

                    <RenderPost
                      item={item}
                      index={index}
                      viewRef={imageRef}
                      onLike={() => toggleLike(item.id)}
                      isOtheruser={isOtherUser}
                    />
                  )}
                  contentContainerStyle={{}}
                  keyExtractor={item => item.id.toString()}
                  ListEmptyComponent={
                    !followersData.loader ? (
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
              )
              :
              viewMode === 'For you' && (
                <>
                  <FlatList
                    data={foryoudata} renderItem={({ item, index }) => (
                      <RenderPost
                        item={item}
                        index={index}
                        viewRef={imageRef}
                        onLike={() => toggleLike(item.id)}
                        isOtheruser={isOtherUser}
                      />
                    )}
                    keyExtractor={item => item.id}
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
                          {t('no_posts')}
                        </Text>
                      </View>
                    }
                  />
                </>
              )
        }

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <GestureHandlerRootView style={styles.modalContainer}>
              <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
                <View style={[styles.modalOverlay, {
                }]}>
                  <View style={[styles.modalContent, { backgroundColor: "#FFF" }]}>
                    <View style={{ backgroundColor: "#DCDCDC", height: wp(1.5), width: wp(25), alignSelf: "center", marginTop: wp(4), borderRadius: wp(2) }} />
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: wp(85), marginTop: wp(5), marginBottom: wp(2) }}>
                      <Text style={[styles.modalText,
                      poppins.bold.h4, { textTransform: "capitalize" }
                      ]}>{t('likes')}</Text>
                      <MaterialIcon
                        onPress={() => setModalVisible(false)}
                        name={'close'}
                        color={"#000"}
                        size={wp(8)}
                      />
                    </View>
                    {/* FlatList with profile pic and name */}
                    {
                      isLIkeLoading ?
                        <ActivityIndicator color='#000' style={{ marginVertical: wp(20) }} />
                        :
                        <FlatList
                          data={likedList}
                          renderItem={({ item }) => (
                            <View style={styles.profileItem}>

                              <Image source={{ uri: item?.image }} style={styles.profilePic} />

                              <Text numberOfLines={1} style={[
                                poppins.regular.h7,
                                styles.profileName, { maxWidth: wp(50), textTransform: "capitalize" }]}>{item?.user_name}</Text>
                              <TouchableOpacity
                                style={{
                                  backgroundColor: '#0095f6',
                                  paddingHorizontal: wp(3),
                                  paddingVertical: wp(1),
                                  borderRadius: wp(1),
                                  maxWidthwidth: wp(20),
                                  position: "absolute",
                                  right: wp(0)
                                }}
                                onPress={() => {
                                  navigation.navigate('user-profile', {
                                    profileId: item?.id,
                                    isOtherUser: true,
                                  })
                                    , setModalVisible(false)
                                }
                                }
                              >
                                <Text style={[poppins.medium.h9, { fontWeight: '600', textTransform: 'capitalize', color: "#FFF" }]}>
                                  {t('profile')}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          keyExtractor={(item) => item.id}
                        />
                    }
                  </View>
                </View>
              </PanGestureHandler>
            </GestureHandlerRootView >
          </TouchableWithoutFeedback>

        </Modal>
      </SafeAreaView >


    </>
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
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out the icons evenly
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
    margin: hp(0.5), // Adjust margin based on height percentage
    backgroundColor: '#1e1e1e', // Dark mode for list items
    borderRadius: wp(2), // Adjust border radius based on width percentage
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: wp(1), // Adjust shadow radius based on width percentage
    elevation: 2,
    justifyContent: 'space-between',
  },
  profilePic: {
    width: wp(7.5),// Adjust width based on width percentage
    height: wp(12), // Adjust height to match width for a circle
    borderRadius: wp(6), // Half of width for a circle
    marginRight: wp(2), // Adjust margin based on width percentage
  },

  infoContainer: {
    flex: 1, // Takes up the available space
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space out name and button
    alignItems: 'center',
  },
  name: {
    fontSize: wp(4.5), // Adjust font size based on width percentage
    color: '#fff', // White text for dark mode
  },
  followButton: {
    marginLeft: wp(2), // Adjust margin based on width percentage
  },
  modalOverlay: {
    width: wp(100),
    position: "absolute",
    bottom: wp(0.1),

  },

  modalContent: {
    width: wp(100),
    height: hp(70),
    borderTopRightRadius: wp(8),
    borderTopLeftRadius: wp(8),
    alignItems: 'center',
  },
  modalText: {
    // marginBottom: 20,
    color: "#000"
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(85),
    marginVertical: wp(2)
  },
  profilePic: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
  },
  profileName: {
    color: '#000',
    marginHorizontal: wp(4)
  },
});

export default Tsocial;
