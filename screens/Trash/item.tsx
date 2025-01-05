import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { TouchableOpacity, View } from 'react-native';
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
import { styles } from './style';
import { fileIcons } from '../../utils/Constants';

export const Item: React.FC<any> = React.memo(({ item, handleSelectFile }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [select, setSelect] = useState(false);

  const toggleSelectFile = () => {
    setSelect((prev) => !prev);
    handleSelectFile(item);
  };
  const onPressHandler = (item) => {
    console.log('itemmmmm', item.type);
    if (item.type === 'image') {
      navigation.push('FullScreenImageScreen', {
        folderName: item.name,
        prevDir: ``,
        uri: `file://${item.path}`,
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
      case 'pdf':
        return (
          <MaterialCommunityIcons
            name={'file-pdf-box'}
            size={35}
            color={colors.text}
          />
        );
      case 'text':
        return (
          <MaterialCommunityIcons
            name={'file-outline'}
            size={35}
            color={colors.text}
          />
        );
      default:
        return <Feather name="file" size={35} color={colors.text} />;
    }
  }, []);

  return (
    <View style={[styles.itemContainer]}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={() => onPressHandler(item)}
      >
        <View style={styles.itemThumbnail}>
          <ItemThumbnail item={item} />
        </View>
        <View style={styles.itemDetails}>
          <Text
            style={[styles.fileName, { color: colors.text }]}
          >{`${item.name}`}</Text>
          <Text style={{ fontSize: 10, color: colors.text }}>{`${bytesToMB(
            item.size
          )} MB`}</Text>
          <Text
            style={{ fontSize: 10, color: colors.text }}
          >{`${item.timeLeft} to delete`}</Text>
        </View>
      </TouchableOpacity>
      <Checkbox
        color={colors.primary}
        status={select ? 'checked' : 'unchecked'}
        onPress={() => toggleSelectFile()}
        uncheckedColor={colors.primary}
      />
    </View>
  );
});
