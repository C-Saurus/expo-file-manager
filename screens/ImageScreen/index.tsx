import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
import { TabDocFiles } from '../Document/list';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MediaHeader from '../../components/Header/MediaHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ImageScreen = ({ route, navigation }) => {
  const { fileType } = route.params;
    const { top } = useSafeAreaInsets();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { image, video, audio } = useAppSelector((state) => state.documentFile);
  const [isMediaGranted, setIsMediaGranted] = useState<boolean | null>(null);
  const [openOption, setOpenOption] = useState(false);
  const [viewMode, setViewMode] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'All' },
    { key: 'second', title: 'Your Album' },
  ]);

  const fileMap = {
    photo: image,
    audio: audio,
    video: video,
  };

  const data = useMemo(
    () => fileMap[fileType] || fileMap['default'],
    [video, image, audio, fileType]
  );

  const handleChooseMode = () => {
    if (viewMode === 0) {
      setViewMode(1);
    } else {
      setViewMode(0);
    }
  };

  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Nếu không thể quay lại (root screen), xử lý thêm ở đây nếu cần
      console.log('Cannot go back, you are on the root screen.');
    }
  };

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
  useEffect(() => {
    console.log('ImageScreen');
  }, []);

  console.log('ImageScreen-Rerender');
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

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case 'first':
          return !viewMode ? (
            <PhotosByDate fileType={fileType} selectAll={selectAll} />
          ) : (
            <TabDocFiles data={data} />
          );
        case 'second':
          return <PhotosByAlbum fileType={fileType} />;
        default:
          return null;
      }
    },
    [viewMode, selectAll]
  );
  // const renderScene = SceneMap({
  //   first: PhotosByDate,
  //   second: PhotosByAlbum,
  // });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'blue' }}
      style={{ backgroundColor: 'white' }}
      activeColor="blue"
    />
  );

  return (
    <View style={{ paddingTop: top,  flex: 1,
      width: SIZE, backgroundColor: colors.background}}>
      <MediaHeader
        onBackPress={onBackPress}
        index={index}
        handleChooseMode={handleChooseMode}
        handleChooseOption={() => setOpenOption((prev) => !prev)}
        colors={colors}
        viewMode={viewMode}
        headerTitle={fileType}
      />
      <TabView
        lazy
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export type selectedAlbumType = {
  id: string;
  title: string;
};

const PhotosByAlbum: React.FC<{ fileType: string }> = React.memo(
  ({ fileType }) => {
    const { colors } = useAppSelector((state) => state.theme.theme);
    const [albums, setAlbums] = useState<customAlbum[]>([]);
    const [albumsFetched, setAlbumsFetched] = useState(false);
    const [selectedAlbum, setSelectedAlbum] =
      useState<selectedAlbumType | null>(null);
    const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);

    async function getAlbums() {
      const albums = await MediaLibrary.getAlbumsAsync();
      const albumsPromiseArray = albums.map(
        async (album) =>
          await MediaLibrary.getAssetsAsync({
            album: album,
            first: 10,
            sortBy: MediaLibrary.SortBy.default,
            mediaType: MediaLibrary.MediaType[fileType],
          })
      );
      Promise.all(albumsPromiseArray).then((values) => {
        const nonEmptyAlbums = values
          .filter((item) => item.totalCount > 0)
          .map((item) => {
            const album = albums.find((a) => a.id === item.assets[0].albumId);
            console.log('albums', albums);
            const albumObject: customAlbum = {
              id: album?.id,
              title: album?.title,
              assetCount: album?.assetCount,
              type: album?.type,
              coverImage: fileType === 'audio' ? undefined : item.assets[0].uri,
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
          <Text
            style={{ color: colors.text, fontFamily: 'Poppins_600SemiBold' }}
          >
            No Albums Found
          </Text>
        </View>
      );

    return (
      <View
        style={{ ...styles.container, backgroundColor: colors.background2 }}
      >
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
            <AssetList
              fileType={fileType}
              albumId={selectedAlbum.id}
              toggleSelect={toggleSelect}
            />
          )}
        </View>
      </View>
    );
  }
);

const PhotosByDate: React.FC<{
  fileType: string;
  selectAll: boolean;
}> = React.memo(({ fileType }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
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

  async function getAlbumAssets(after?: string) {
    if (loading) return;
    console.log('Fetching assets...');
    currentImageSize.current = assets.length;
    setLoading(true);
    const options = {
      first: 20,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType[fileType],
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
    if (multiSelectEmit) {
    } else {
      if (fileType === 'audio') {
        navigation.push('AudioPlayer', {
          filename: item.filename,
          uri: item.uri,
        });
      } else if (fileType === 'video') {
        navigation.push('VideoPlayer', {
          folderName: '',
          prevDir: '',
          uriValue: item.uri,
        });
      } else {
        openModal(item);
      }
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
        getItemLayout={(data, index) => ({
          length: SIZE,
          offset: SIZE * index,
          index,
        })}
        onEndReachedThreshold={0.4}
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
