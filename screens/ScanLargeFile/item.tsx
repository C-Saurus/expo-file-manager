import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
import { styles } from './style';
import { bytesToMB } from '../../utils/Filesize';
import { Checkbox } from 'react-native-paper';
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/reduxHooks';
import { StackNavigationProp } from '@react-navigation/stack';

export const Item: React.FC<any> = React.memo(({ item, handleSelectFile }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [select, setSelect] = useState(false);
  const handleSelect = () => {
    setSelect((prev) => !prev);
    handleSelectFile(item);
  };
  const onPressHandler = (item) => {
    console.log('itemmmmm', item.type);
    if (item.type === 'image') {
      navigation.push('ImageGalleryView', {
        folderName: item.name,
        prevDir: ``,
        uriValue: `file://${item.path}`,
      });
    } else if (item.type === 'video') {
      navigation.push('VideoPlayer', {
        folderName: item.name,
        prevDir: ``,
        uriValue: `file://${item.path}`,
      });
    } else if (item.type === 'audio') {
      navigation.push('AudioPlayer', {
        folderName: item.name,
        prevDir: ``,
        uriValue: `file://${item.path}`,
      });
    } else {
      navigation.push('MiscFileView', {
        folderName: item.path,
      });
    }
  };
  const ThumbnailImage = ({ uri }) => {
    return <Image style={styles.image} source={{ uri: `file://${uri}` }} />;
  };

  const ItemThumbnail = useCallback(({ item }) => {
    console.log('item.type', item.type);
    switch (item.type) {
      case 'image':
      case 'video':
        return <ThumbnailImage uri={item.path} />;
      case 'audio':
        return (
          <FontAwesome5 name="file-audio" size={35} color={colors.primary} />
        );
      case 'font':
        return <FontAwesome5 name="font" size={35} color={colors.primary} />;
      case 'application':
        return (
          <MaterialCommunityIcons
            name={'file-outline'}
            size={35}
            color={colors.primary}
          />
        );
      case 'text':
        return (
          <MaterialCommunityIcons
            name={'file-outline'}
            size={35}
            color={colors.primary}
          />
        );
      default:
        return <Feather name="file" size={35} color={colors.primary} />;
    }
  }, [])

  return (
    <View style={styles.fileItem}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={() => onPressHandler(item)}
      >
        <View style={styles.itemThumbnail}>
          <ItemThumbnail item={item} />
        </View>
        <View style={[styles.itemDetails]}>
          <Text
            numberOfLines={2}
            style={[styles.fileName, { color: colors.primary }]}
          >
            {item.path}
          </Text>
          <Text style={{ fontSize: 10, color: colors.primary }}>{`${bytesToMB(
            item.size
          )} MB`}</Text>
        </View>
      </TouchableOpacity>
      <Checkbox
        color={colors.primary}
        uncheckedColor={colors.primary}
        status={select ? 'checked' : 'unchecked'}
        onPress={handleSelect}
      />
    </View>
  );
});
