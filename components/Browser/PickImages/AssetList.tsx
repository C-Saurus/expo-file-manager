import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SIZE } from '../../../utils/Constants';
import { AssetItem } from './AssetItem';
import { ExtendedAsset } from '../../../types';

type AssetListProps = {
  assets: ExtendedAsset[];
  albumId?: string;
  hasNextPage: boolean;
  endCursor: string;
  isSelecting: boolean;
  loading?: boolean
  getAlbumAssets: (albumId: string, after?: string | undefined) => void;
  toggleSelect: (asset: ExtendedAsset) => void;
};

export const AssetList = ({
  assets,
  albumId,
  hasNextPage,
  endCursor,
  isSelecting,
  loading,
  getAlbumAssets,
  toggleSelect,
}: AssetListProps) => {
  console.log("assets", assets)

  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }
    return null;
  };

  return (
    <FlatList
      style={styles.albumList}
      contentContainerStyle={styles.contentContainer}
      numColumns={3}
      data={assets}
      renderItem={({ item }) => (
        <AssetItem
          item={item}
          toggleSelect={toggleSelect}
          isSelecting={isSelecting}
        />
      )}
      keyExtractor={(item) => item.albumId + item.name}
      onEndReached={() => {
        if (hasNextPage) getAlbumAssets(endCursor);
      }}
      onEndReachedThreshold={0.9}
      ListFooterComponent={renderFooter}
    />
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
});
