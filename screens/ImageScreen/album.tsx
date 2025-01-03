import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './style';
import { useAppSelector } from '../../hooks/reduxHooks';
import { customAlbum, ExtendedAsset } from '../../types';
import { AlbumList } from '../../components/Browser/PickImages/AlbumList';
import { AssetList } from '../../components/Browser/PickImages/AssetList';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type selectedAlbumType = {
  id: string;
  title: string;
};

export const PhotosByAlbum: React.FC<{ fileType: string }> = React.memo(
  ({ fileType }) => {
    const navigation = useNavigation<StackNavigationProp<any>>();
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
            />
          )}
        </View>
      </View>
    );
  }
);
