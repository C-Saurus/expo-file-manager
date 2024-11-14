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
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './style';
import { useAppSelector } from '../../hooks/reduxHooks';
import { customAlbum, ExtendedAsset } from '../../types';
import useMultiImageSelection from '../../hooks/useMultiImageSelection';
import { AlbumList } from '../../components/Browser/PickImages/AlbumList';
import { AssetList } from '../../components/Browser/PickImages/AssetList';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import moment from 'moment';
import { AssetItem } from '../../components/Browser/PickImages/AssetItem';

const Tab = createBottomTabNavigator();

export const AudioScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Hình ảnh');
  return (
    <View style={styles.containerNav}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Âm thanh</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Âm thanh' ? styles.activeTab : null,
          ]}
          onPress={() => setSelectedTab('Âm thanh')}
        >
          <Text style={styles.tabText}>Âm thanh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Album' ? styles.activeTab : null,
          ]}
          onPress={() => setSelectedTab('Album')}
        >
          <Text style={styles.tabText}>Album</Text>
        </TouchableOpacity>
      </View>
      {selectedTab === 'Âm thanh' ? <AudiosByDate /> : <AudiosByAlbum />}
    </View>
  );
};

export type selectedAlbumType = {
  id: string;
  title: string;
};

export const AudiosByAlbum = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [isMediaGranted, setIsMediaGranted] = useState<boolean | null>(null);
  const [albums, setAlbums] = useState<customAlbum[]>([]);
  const [albumsFetched, setAlbumsFetched] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<selectedAlbumType | null>(
    null
  );
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isSelecting = useMultiImageSelection(assets);

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

  async function getAlbumAssets(albumId: string, after?: string | undefined) {
    setLoading(true);
    const options = {
      album: albumId,
      first: 25,
      sortBy: MediaLibrary.SortBy.creationTime,
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);
    setAssets((prev) => [...prev, ...albumAssets.assets]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
    setLoading(false);
  }

  const toggleSelect = (item: ExtendedAsset) => {
    const isSelected =
      selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
    if (!isSelected) setSelectedAssets((prev) => [...prev, item]);
    else
      setSelectedAssets((prev) => [
        ...prev.filter((asset) => asset.id != item.id),
      ]);
    setAssets(
      assets.map((i) => {
        if (item.id === i.id) {
          i.selected = !i.selected;
        }
        return i;
      })
    );
  };

  // const unSelectAll = () => {
  //   setAssets(
  //     assets.map((i) => {
  //       i.selected = false;
  //       return i;
  //     })
  //   );
  // };

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
          if (result.granted) getAlbums();
        })
        .catch((err) => {
          console.log(err);
        });
    };
    requestMediaPermission();
  }, []);

  useEffect(() => {
    if (selectedAlbum) getAlbumAssets(selectedAlbum.id);
  }, [selectedAlbum]);

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
                setAssets([]);
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
            assets={assets}
            albumId={selectedAlbum.id}
            getAlbumAssets={getAlbumAssets}
            hasNextPage={hasNextPage}
            endCursor={endCursor}
            toggleSelect={toggleSelect}
            isSelecting={isSelecting}
            loading={loading}
          />
        )}
      </View>
    </View>
  );
};

const AudiosByDate: React.FC = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isSelecting = useMultiImageSelection(assets);
  const [groupedAudios, setGroupedAudios] = useState<{
    [key: string]: ExtendedAsset[];
  }>({});
  const currentImageSize = useRef<number>(0);

  async function getAlbumAssets(after?: string) {
    console.log('Fetching assets...');
    currentImageSize.current = assets.length;
    setLoading(true);
    const options = {
      first: 25,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType.audio,
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);
    console.log('albumAssets', albumAssets);
    // Cập nhật assets mới mà không cần nhóm lại
    setAssets((prev) => [...prev, ...albumAssets.assets]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
    setLoading(false);
  }

  useEffect(() => {
    getAlbumAssets();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      groupAudiosByDate(); // Gọi hàm này chỉ khi assets thay đổi
    }
  }, [assets]);

  const groupAudiosByDate = () => {
    console.log('currentImageSize', currentImageSize.current);
    const newImage = assets.length - currentImageSize.current;
    const newGroupedAudios = { ...groupedAudios }; // Tạo bản sao của groupedAudios
    const newAudios =
      newImage > 0 ? assets.slice(currentImageSize.current) : assets;

    newAudios.forEach((audio) => {
      const date = moment(audio.creationTime).format('DD/MM/YYYY');
      if (!newGroupedAudios[date]) {
        newGroupedAudios[date] = [];
      }
      newGroupedAudios[date].push(audio);
    });

    Object.entries(groupedAudios).map(([date, photos], index) => {
      console.log('photos', photos);
    });
    const key = Object.keys(groupedAudios);
    console.log("groupedAudios['02/11/2024']", groupedAudios['02/11/2024']);
    console.log('key', key);
    setGroupedAudios(newGroupedAudios);
  };

  const toggleSelect = (item: ExtendedAsset) => {
    const isSelected =
      selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
    if (!isSelected) {
      setSelectedAssets((prev) => [...prev, item]);
    } else {
      setSelectedAssets((prev) => prev.filter((asset) => asset.id !== item.id));
    }
    setAssets((prev) =>
      prev.map((i) => {
        if (item.id === i.id) {
          i.selected = !i.selected;
        }
        return i;
      })
    );
  };

  const renderAudioItem = useCallback(
    ({ item }) => (
      <AssetItem
        item={item}
        toggleSelect={toggleSelect}
        isSelecting={selectedAssets.some((asset) => asset.id === item.id)}
      />
    ),
    [selectedAssets]
  );

  const renderGroup = ({ item: { date, audios } }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateTitle}>{date}</Text>
      <FlatList
        data={audios}
        renderItem={renderAudioItem}
        keyExtractor={(item) => item.id + item.creationTime + item.name}
        numColumns={3}
      />
    </View>
  );

  const renderFooter = () => {
    if (loading) {
      <View
        style={{
          ...styles.container,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>;
    }
    return null;
  };

  const groupedData = Object.entries(groupedAudios).map(([date, audios]) => ({
    date,
    audios,
  }));

  return (
    <View style={{ ...styles.container, backgroundColor: colors.background2 }}>
      <FlatList
        data={groupedData}
        renderItem={renderGroup}
        keyExtractor={(item) => item.date}
        onEndReached={() => {
          if (hasNextPage) getAlbumAssets(endCursor); // Tải thêm ảnh nếu có
        }}
        onEndReachedThreshold={0.9}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};
