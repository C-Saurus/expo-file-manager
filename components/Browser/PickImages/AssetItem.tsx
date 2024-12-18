import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZE } from '../../../utils/Constants';
import { ExtendedAsset } from '../../../types';
import { MediaType } from 'expo-media-library';
const audioThumbnails = require('~/../../assets/audio-thubnails.jpg');
const ITEM_SIZE = SIZE / 3;

type AssetProps = {
  item: ExtendedAsset;
  isSelecting: boolean;
  toggleSelect: (asset: ExtendedAsset, multiSelect?: boolean) => void;
};

export const AssetItem = ({
  item: asset,
  isSelecting,
  toggleSelect,
}: AssetProps) => {
  return (
    <View style={styles.thumbnailContainer}>
      <TouchableOpacity
        key={asset.id}
        style={styles.assetContainer}
        activeOpacity={0.8}
        onLongPress={() => toggleSelect(asset, true)}
        onPress={() => {
          isSelecting ? toggleSelect(asset, true) : toggleSelect(asset);
        }}
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

        {
          asset.mediaType === MediaType.video && (
            <View
              style={styles.playButton}
            >
              <View style={styles.playIcon} />
            </View>
          )
        }

        {isSelecting && (
          <View style={styles.checkCircleContainer}>
            <View style={styles.checkCircleBG}></View>
            {asset.selected && (
              <Ionicons name="checkmark-done" size={20} color="white" />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

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
    bottom: 5,
    right: 0,
    width: 24,
    height: 24,
  },
  checkCircleBG: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'gray',
    borderWidth: 1.5,
    borderColor: 'white',
    opacity: 0.9,
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
