import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './style';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AssetItem } from '../../components/Browser/PickImages/AssetItem';
import { ExtendedAsset } from '../../types';
import moment from 'moment';
import useMultiImageSelection from '../../hooks/useMultiImageSelection';

export const VideoScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Video');
  return (
    <VideoGrid />
  );
};

export const VideoGrid = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSelecting = useMultiImageSelection(assets);
  const [groupedPhotos, setGroupedPhotos] = useState<{
    [key: string]: ExtendedAsset[];
  }>({});
  const currentListVideoSize = useRef<number>(0);

  const openModal = (item) => {
    const indexImg = assets.findIndex(item);
    if (indexImg) {
      setSelectedIndex(indexImg);
      setVisible(true);
    } else {
      console.log('IMG NOT FOUND');
    }
  };

  async function getAlbumAssets(after?: string) {
    console.log('Fetching assets...');
    currentListVideoSize.current = assets.length;
    setLoading(true);
    const options = {
      first: 25,
      mediaType: MediaLibrary.MediaType.video,
      sortBy: MediaLibrary.SortBy.creationTime,
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);
    console.log('albumAssets');
    // Cập nhật assets mới mà không cần nhóm lại
    setAssets((prev) => [...prev, ...albumAssets.assets]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
    setLoading(false);
  }

  useEffect(() => {
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
    const newImage = assets.length - currentListVideoSize.current;
    const newGroupedPhotos = { ...groupedPhotos }; // Tạo bản sao của groupedPhotos
    const newPhotos =
      newImage > 0 ? assets.slice(currentListVideoSize.current) : assets;

    newPhotos.forEach((photo) => {
      const date = moment(photo.creationTime).format('DD/MM/YYYY');
      if (!newGroupedPhotos[date]) {
        newGroupedPhotos[date] = [];
      }
      newGroupedPhotos[date].push(photo);
    });
    setGroupedPhotos(newGroupedPhotos);
  };

  const toggleSelect = (item: ExtendedAsset) => {
    const isSelected =
      selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
    if (!isSelected) {
      setSelectedAssets((prev) => [...prev, item]);
    } else {
      setSelectedAssets((prev) => prev.filter((asset) => asset.id !== item.id));
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

  const playVideo = (item) => {
    navigation.push('VideoPlayer', {
        folderName: "",
        prevDir: "",
        uriValue: item.uri
      });
  }

  const renderPhotoItem = useCallback(
    ({ item }) => (
      <View style={styles.thumbnailContainer}>
        <AssetItem
          item={item}
          toggleSelect={toggleSelect}
          isSelecting={selectedAssets.some((asset) => asset.id === item.id)}
        />
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => playVideo(item)}
        >
          <View style={styles.playIcon} />
        </TouchableOpacity>
      </View>
    ),
    [selectedAssets]
  );

  const renderGroup = ({ item: { date, photos } }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateTitle}>{date}</Text>
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id + item.creationTime + item.name}
        numColumns={3}
      />
    </View>
  );

  const renderFooter = () => {
    if (loading) {
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
      )
    }
    return null;
  };

  const groupedData = Object.entries(groupedPhotos).map(([date, photos]) => ({
    date,
    photos,
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
