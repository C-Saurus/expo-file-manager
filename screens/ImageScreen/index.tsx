import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Linking,
  AlertButton,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  FlatList,
  Touchable,
  Modal,
  Dimensions,
  Image,
  useWindowDimensions,
  ImageBackground,
  Animated,
  PanResponder,
  InteractionManager,
} from 'react-native';
import {
  Entypo,
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './style';
import { useAppSelector } from '../../hooks/reduxHooks';
import { customAlbum, ExtendedAsset } from '../../types';
import useMultiImageSelection from '../../hooks/useMultiImageSelection';
import { AlbumList } from '../../components/Browser/PickImages/AlbumList';
import { AssetList } from '../../components/Browser/PickImages/AssetList';
import moment from 'moment';
import { AssetItem } from '../../components/Browser/PickImages/AssetItem';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { SIZE } from '../../utils/Constants';

export const ImageScreen = ({ navigation }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [isMediaGranted, setIsMediaGranted] = useState<boolean | null>(null);
  const [openOption, setOpenOption] = useState(false);
  const [viewMode, setViewMode] = useState(0)
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'All' },
    { key: 'second', title: 'Your Album' },
  ]);

  const handleChooseOption = () => {
    setOpenOption(!openOption);
  };

  const handleChooseMode = () => {
    if (viewMode === 0) {
      setViewMode(1)
    } else {
      setViewMode(0);
    }
  };

  useEffect(() => {
    // Cập nhật headerRight khi màn hình này được render
    navigation.setOptions({
      headerRight: () => (
        (index === 0 && (
          <View style={styles.headerIconContainer}>
          {viewMode === 0 ? (
            <TouchableOpacity onPress={handleChooseMode}>
              <FontAwesome name="th-list" size={24} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleChooseMode}>
              <FontAwesome name="th" size={24} color="black" />
            </TouchableOpacity>
          )}
          {viewMode === 1 && (
            <TouchableOpacity style={{ marginLeft: 12 }} onPress={handleChooseOption}>
              <Entypo name="dots-three-vertical" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
        ))
      ),
      headerRightContainerStyle: {
        marginRight: 15,
      },
    });
  }, [navigation, openOption, viewMode, index]);

  useEffect(() => {
    const requestMediaPermission = async () => {
      MediaLibrary.requestPermissionsAsync()
        .then((result) => {
          setIsMediaGranted(result.granted);
          if (!result.granted || result.accessPrivileges === 'limited') {
            const alertOptions: AlertButton[] = [
              {
                text: 'Go to App Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
              {
                text: 'Nevermind',
                onPress: () => {},
                style: 'cancel',
              },
            ];
            if (result.canAskAgain && result.accessPrivileges !== 'limited')
              alertOptions.push({
                text: 'Request again',
                onPress: () => requestMediaPermission(),
              });
            Alert.alert(
              'Denied Media Access',
              'App needs access to all media library',
              [...alertOptions]
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    requestMediaPermission();
  }, []);

  const layout = useWindowDimensions();

  if (!isMediaGranted && isMediaGranted !== null)
    return (
      <View
        style={{
          ...styles.noAccessContainer,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ ...styles.noAccessText, color: colors.primary }}>
          {'Media Access Denied'}
        </Text>
        <Button title="Go to Settings" onPress={() => Linking.openSettings()} />
      </View>
    );

  const renderScene = SceneMap({
    first: PhotosByDate,
    second: PhotosByAlbum,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'blue' }}
      style={{ backgroundColor: 'white' }}
      activeColor="blue"
    />
  );

  return (
    <TabView
      lazy
      renderTabBar={renderTabBar}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
};

export type selectedAlbumType = {
  id: string;
  title: string;
};

const PhotosByAlbum = React.memo(() => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [albums, setAlbums] = useState<customAlbum[]>([]);
  const [albumsFetched, setAlbumsFetched] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<selectedAlbumType | null>(
    null
  );
  const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);

  async function getAlbums() {
    const albums = await MediaLibrary.getAlbumsAsync();
    const albumsPromiseArray = albums.map(
      async (album) =>
        await MediaLibrary.getAssetsAsync({
          album: album,
          first: 10,
          sortBy: MediaLibrary.SortBy.default,
        })
    );
    Promise.all(albumsPromiseArray).then((values) => {
      const nonEmptyAlbums = values
        .filter((item) => item.totalCount > 0)
        .map((item) => {
          const album = albums.find((a) => a.id === item.assets[0].albumId);
          const albumObject: customAlbum = {
            id: album?.id,
            title: album?.title,
            assetCount: album?.assetCount,
            type: album?.type,
            coverImage: item.assets[0].uri,
          };
          return albumObject;
        });
      setAlbums(nonEmptyAlbums);
      setAlbumsFetched(true);
    });
  }

  useEffect(() => {
    getAlbums();
  }, []);

  const toggleSelect = (item: ExtendedAsset) => {
    const isSelected =
      selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
    if (!isSelected) setSelectedAssets((prev) => [...prev, item]);
    else
      setSelectedAssets((prev) => [
        ...prev.filter((asset) => asset.id != item.id),
      ]);
  };

  // const unSelectAll = () => {
  //   setAssets(
  //     assets.map((i) => {
  //       i.selected = false;
  //       return i;
  //     })
  //   );
  // };

  if (!albumsFetched)
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (albumsFetched && albums.length === 0)
    return (
      <View
        style={{ ...styles.container, backgroundColor: colors.background2 }}
      >
        <Text style={{ color: colors.text, fontFamily: 'Poppins_600SemiBold' }}>
          No Albums Found
        </Text>
      </View>
    );

  return (
    <View style={{ ...styles.container, backgroundColor: colors.background2 }}>
      <View style={styles.header}>
        <View>
          {selectedAlbum?.title && (
            <Text style={{ ...styles.title, color: colors.primary }}>
              {selectedAlbum?.title}
            </Text>
          )}
        </View>
        <View style={styles.backButtonContainer}>
          {selectedAlbum && (
            <TouchableOpacity
              onPress={() => {
                setSelectedAlbum(null);
                setSelectedAssets([]);
              }}
            >
              <Feather name="chevron-left" size={32} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.listContainer}>
        {albumsFetched && !selectedAlbum && (
          <AlbumList albums={albums} setSelectedAlbum={setSelectedAlbum} />
        )}
        {selectedAlbum && (
          <AssetList albumId={selectedAlbum.id} toggleSelect={toggleSelect} />
        )}
      </View>
    </View>
  );
});

const PhotosByDate = React.memo(() => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSelecting = useMultiImageSelection(assets);
  const [multiSelect, setMultiSelect] = useState(false);
  const [groupedPhotos, setGroupedPhotos] = useState<{
    [key: string]: ExtendedAsset[];
  }>({});
  const currentImageSize = useRef<number>(0);
  const flatListRef = useRef(null);

  // Animated value for dragging
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx); // Chỉ xử lý vuốt dọc
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy); // Di chuyển theo cử chỉ vuốt
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100) {
        // Nếu vuốt đủ xa, đóng modal
        Animated.timing(translateY, {
          toValue: Dimensions.get('window').height,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      } else {
        // Nếu vuốt không đủ xa, trả lại vị trí ban đầu
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Scroll to selectedIndex initially
  const handleModalShow = () => {
    if (flatListRef.current) {
      // Đảm bảo chỉ số hợp lệ
      const validIndex = Math.max(
        0,
        Math.min(selectedIndex, assets.length - 1)
      );
      flatListRef.current.scrollToIndex({ index: validIndex, animated: false });
    }
  };

  async function getAlbumAssets(after?: string) {
    if (loading) return;
    console.log('Fetching assets...');
    currentImageSize.current = assets.length;
    setLoading(true);
    const options = {
      first: 20,
      sortBy: MediaLibrary.SortBy.creationTime,
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);

    // Cập nhật assets mới mà không cần nhóm lại
    setAssets((prev) => [...prev, ...albumAssets.assets]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
  }

  useEffect(() => {
    console.log('Photo');
    getAlbumAssets();
    return () => {
      setAssets([]);
      setGroupedPhotos({});
    };
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      groupPhotosByDate(); // Gọi hàm này chỉ khi assets thay đổi
    }
  }, [assets]);

  const groupPhotosByDate = () => {
    const newImage = assets.length - currentImageSize.current;
    const newGroupedPhotos = { ...groupedPhotos }; // Tạo bản sao của groupedPhotos
    const newPhotos =
      newImage > 0 ? assets.slice(currentImageSize.current) : assets;

    newPhotos.forEach((photo) => {
      const date = moment(photo.creationTime).format('DD/MM/YYYY');
      if (!newGroupedPhotos[date]) {
        newGroupedPhotos[date] = [];
      }
      newGroupedPhotos[date].push(photo);
    });
    setGroupedPhotos(newGroupedPhotos);
    setLoading(false);
  };

  const toggleSelect = (item: ExtendedAsset, multiSelectEmit?: boolean) => {
    if (multiSelect !== multiSelectEmit) {
      setMultiSelect(multiSelectEmit);
    }

    if (multiSelect || multiSelectEmit) {
      const isSelected =
        selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
      if (!isSelected) {
        setSelectedAssets((prev) => [...prev, item]);
      } else {
        setSelectedAssets((prev) =>
          prev.filter((asset) => asset.id !== item.id)
        );
      }
    } else {
      openModal(item);
    }

    // setAssets((prev) =>
    //   prev.map((i) => {
    //     if (item.id === i.id) {
    //       i.selected = !i.selected;
    //     }
    //     return i;
    //   })
    // );
  };

  const showDetails = (item) => {};

  const openModal = (item) => {
    const res = assets.filter((asset) => {
      return asset.id === item.id;
    });
    const indexImg = assets.findIndex((asset) => {
      return asset.id === item.id;
    });
    setSelectedIndex(indexImg);
    setVisible(true);
  };

  const renderPhotoItem = useCallback(
    ({ item }) =>
      item?.id ? (
        <AssetItem
          item={item}
          toggleSelect={toggleSelect}
          isSelecting={multiSelect}
        />
      ) : (
        <View style={styles.emptyItem}></View>
      ),
    [selectedAssets, assets]
  );

  const renderGroup = ({ item: { date, photos } }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateTitle}>{date}</Text>
      <FlatList
        data={photos.length >= 3 ? photos : [...photos, {}, {}].slice(0, 3)}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id + item.creationTime + item.name}
        numColumns={3}
      />
    </View>
  );

  const renderFooter = () => {
    if (loading || !groupedData) {
      return (
        <View
          style={{
            ...styles.overlay,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return null;
  };

  const groupedData = Object.entries(groupedPhotos).map(([date, photos]) => ({
    date,
    photos,
  }));

  const renderImageDetailItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        {/* Hiển thị ảnh full màn */}
        <ImageBackground source={{ uri: item.uri }} style={styles.thumbnail}>
          {/* Nút "<" để đóng modal */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setVisible(false)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Thanh công cụ */}
          <View style={styles.bottomBar}>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialIcons name="edit" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="share-social-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    ),
    []
  );

  const renderModal = useCallback(() => {
    return (
      <Modal
        visible={visible}
        onRequestClose={() => setVisible(false)}
        presentationStyle={'overFullScreen'}
        animationType={'slide'}
      >
        <FlatList
          data={assets}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={true}
          keyExtractor={(item) => item.id}
          initialScrollIndex={selectedIndex}
          getItemLayout={(data, index) => ({
            length: SIZE,
            offset: SIZE * index,
            index,
          })}
          renderItem={renderImageDetailItem}
        />
      </Modal>
    );
  }, [selectedIndex, assets, visible]);

  return (
    <View style={{ ...styles.container, backgroundColor: colors.background2 }}>
      <FlatList
        data={groupedData}
        renderItem={renderGroup}
        keyExtractor={(item) => item.date}
        onEndReached={() => {
          if (hasNextPage) getAlbumAssets(endCursor); // Tải thêm ảnh nếu có
        }}
        onEndReachedThreshold={0.5}
      />
      {renderModal()}
      {(loading || !groupedData) && (
        <View
          style={{
            ...styles.overlay,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
});
