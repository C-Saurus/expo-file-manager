import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZE } from '../../../utils/Constants';
import { ExtendedAsset } from '../../../types';
import { MediaType } from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
const audioThumbnails = require('~/../../assets/audio-thubnails.jpg');
const ITEM_SIZE = SIZE / 3;

type AssetProps = {
  item: ExtendedAsset;
  itemType?: string;
  selectAll?: boolean;
  toggleSelect: (arg0: ExtendedAsset, arg1?: boolean) => void;
};

export const AssetItem: React.FC<AssetProps> = React.memo(
  ({
    item: asset,
    itemType,
    selectAll,
    toggleSelect,
  }) => {
    const navigation = useNavigation<any>();
    const [selected, setSelected] = useState(false)

    useEffect(() => {
      console.log("selectAll")
      if (!selectAll) {
        setSelected(false)
      }
    }, [selectAll])

    const onPressHandler = (item) => {
      if (itemType === 'image') {
        navigation.push('ImageGalleryView', {
          folderName: item.filename,
          prevDir: ``,
          uriValue: item.uri,
        });
      } else if (itemType === 'video') {
        navigation.push('VideoPlayer', {
          folderName: item.filename,
          prevDir: ``,
          uriValue: item.uri,
        });
      } else if (itemType === 'audio') {
        navigation.push('AudioPlayer', {
          folderName: item.filename,
          prevDir: ``,
          uriValue: item.uri,
        });
      }
    };
    return (
      <View style={styles.thumbnailContainer}>
        <TouchableOpacity
          key={asset.id}
          style={styles.assetContainer}
          activeOpacity={0.8}
          onPress={() => onPressHandler(asset)}
        >
          <View>
            <Image
              style={styles.assetImage}
              source={
                asset.mediaType === MediaType.audio
                  ? audioThumbnails
                  : { uri: asset.uri }
              }
            />
            {asset.mediaType === MediaType.audio && (
              <Text
                style={{
                  display: 'flex',
                  alignContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                numberOfLines={1}
              >
                {asset.filename}
              </Text>
            )}
          </View>

          {asset.mediaType === MediaType.video && (
            <View style={styles.playButton}>
              <View style={styles.playIcon} />
            </View>
          )}
          <View style={styles.checkCircleContainer}>
            <TouchableOpacity onPress={() => {
              toggleSelect(asset, true)
              setSelected((prev) => !prev)
            }}>
              <View
                style={[
                  styles.checkCircleBG,
                  {
                    backgroundColor: (selected || selectAll) ? '#0595F5' : 'gray',
                    opacity: (selected || selectAll) ? 1 : 0.5,
                  },
                ]}
              >
                {(selected || selectAll) && (
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="blue"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  assetContainer: {
    width: ITEM_SIZE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  assetImage: {
    width: ITEM_SIZE * 0.95,
    height: ITEM_SIZE * 0.95,
    resizeMode: 'cover',
    borderRadius: 10,
    backgroundColor: '#caa9e0dd',
  },
  checkCircleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
  },
  checkCircleBG: {
    width: 20,
    height: 20,
    marginRight: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  thumbnailContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'white',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
