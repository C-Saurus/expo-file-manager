import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SIZE } from '../../../utils/Constants';
import { AssetItem } from './AssetItem';
import { ExtendedAsset } from '../../../types';
import * as MediaLibrary from 'expo-media-library';
import { useAppSelector } from '../../../hooks/reduxHooks';

type AssetListProps = {
  fileType?: string
  albumId?: string;
  toggleSelect: (asset: ExtendedAsset) => void;
};

export const AssetList = ({
  fileType,
  albumId,
  toggleSelect,
}: AssetListProps) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [loading, setLoading] = useState<boolean>(false);
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setAssets([])
      setHasNextPage(null)
      setEndCursor(null)
    }
  }, [])

  async function getAlbumAssets(albumId: string, after?: string | undefined) {
    setLoading(true);
    const options = {
      album: albumId,
      first: 20,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType[fileType]
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);
    setAssets((prev) => [...prev, ...albumAssets.assets]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
    setLoading(false);
  }

  useEffect(() => {
    if (albumId) getAlbumAssets(albumId);
  }, [albumId]);

  return (
    <View style={{ flex: 1}}>
      <FlatList
      style={styles.albumList}
      contentContainerStyle={styles.contentContainer}
      numColumns={3}
      data={assets}
      renderItem={({ item }) => (
        <AssetItem
          item={item}
          toggleSelect={toggleSelect}
          isSelecting={false}
        />
      )}
      keyExtractor={(item) => `${albumId}-${item.id}`}
      onEndReached={() => {
        if (hasNextPage) getAlbumAssets(albumId, endCursor);
      }}
      onEndReachedThreshold={0.5}
    />
    {
      (loading) && (
        <View
        style={{
          ...styles.overlay,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      )
    }
    </View>
  );
};

const styles = StyleSheet.create({
  albumList: {
    width: SIZE,
  },
  contentContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleSheet.absoluteFillObject, // Phủ toàn bộ màn hình
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Màu nền mờ
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Đảm bảo overlay nằm trên cùng
  },
});
