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
  toggleSelect: (asset: ExtendedAsset, multiSelect?: boolean) => void;
};

export const AssetItem = ({
  item: asset,
  toggleSelect,
}: AssetProps) => {
  return (
    <View style={styles.thumbnailContainer}>
      <TouchableOpacity
        key={asset.id}
        style={styles.assetContainer}
        activeOpacity={0.8}
        onPress={() => toggleSelect(asset, true)}
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
          <TouchableOpacity onPress={() => toggleSelect(asset, true)}>
            <View style={[styles.checkCircleBG, {backgroundColor: asset.selected ? '#0595F5' : 'gray'}]}>
            {asset.selected && (
              <Ionicons name="checkmark-done-outline" size={20} color="blue" />
            )}
            </View>
          </TouchableOpacity>
        </View>
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
    opacity: 0.5,
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
