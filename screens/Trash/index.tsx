import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Button,
  Alert,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import RNFS from 'react-native-fs';
import {
  cleanOldFiles,
  ensureTrashFolderExists,
  restoreFile,
  TRASH_FOLDER,
} from '../../utils/Constants';
import { Checkbox } from 'react-native-paper';
import {
  setSnack,
  snackActionPayload,
} from '../../features/files/snackbarSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { bytesToGB, bytesToMB } from '../../utils/Filesize';
import { getCategoryByExtension } from '../../utils/getFileByCategory';
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const getFileExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop();
  return getCategoryByExtension(ext);
};

const TrashScreen = () => {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState([]);
  const navigation = useNavigation<any>();

  const { colors } = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    const loadTrashFiles = async () => {
      try {
        await ensureTrashFolderExists();
        await cleanOldFiles();
        const trashFiles = await RNFS.readDir(TRASH_FOLDER);
        setFiles(
          trashFiles.map((file) => ({
            path: file.path,
            name: file.name,
            size: bytesToGB(file.size),
            timeLeft: calculateDaysLeft(file.mtime),
            selected: false,
            type: getFileExtension(file.path),
          }))
        );
      } catch (error) {
        console.error('[ERROR] failed to load trash folder', error);
      }
    };
    loadTrashFiles();
  }, []);

  const calculateDaysLeft = (mtime) => {
    const days = Math.max(
      30 -
        Math.floor(
          (Date.now() - new Date(mtime).getTime()) / (24 * 60 * 60 * 1000)
        ),
      0
    );
    return `${days} days`;
  };

  const toggleSelectFile = (path) => {
    setFiles((prev) =>
      prev.map((item) => {
        if (item.path === path) {
          return {
            ...item,
            selected: !item.selected,
          };
        }
        return item;
      })
    );
  };

  const handleSetSnack = (data: snackActionPayload) => {
    dispatch(setSnack(data));
  };

  const restoreSelectedFiles = async (selectedFileNames) => {
    try {
      const promises = selectedFileNames.map((fileName) =>
        restoreFile(fileName)
      );
      await Promise.all(promises);

      handleSetSnack({
        message: 'Selected files restored!',
      });
    } catch (error) {
      console.error('Lỗi khi khôi phục nhiều file:', error);
      handleSetSnack({
        message: 'Failed to restore selected files!',
        label: 'error',
      });
    }
  };

  const handleDeleteSelectedFiles = async (): Promise<void> => {
    Alert.alert('Xóa tệp tin', 'Bạn có chắc chắn muốn xóa các tệp đã chọn?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            const { FileDeletionNativeModule } = NativeModules;
            const selectedFiles = files.filter(
              (item) => item.selected === true
            );
            await Promise.all(
              selectedFiles.map(async (file) => {
                try {
                  console.log("DELETE TRASH", file.path);
                  const result = await RNFS.unlink(file.path);
                  await RNFS.scanFile(file.path);
                  console.log(
                    `Deleted successfully: ${file.path} with result: ${result}`
                  );
                } catch (error) {
                  console.error(
                    `Failed to delete: ${file.path} - ${error.message}`
                  );
                }
              })
            );

            const updatedLargeFiles = files
              .filter(
                (file) =>
                  !selectedFiles.some(
                    (selectedFile) => selectedFile.path === file.path
                  )
              )
              .map((item) => {
                return {
                  ...item,
                  selected: false,
                };
              });

            setFiles(updatedLargeFiles);

            Alert.alert('Thành công', 'Các tệp đã được xóa.');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa các tệp: ' + error.message);
          }
        },
      },
    ]);
  };

  const ThumbnailImage = ({ uri }) => {
    return <Image style={styles.image} source={{ uri: `file://${uri}` }} />;
  };

  const ItemThumbnail = ({ item }) => {
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
  };

  const onPressHandler = (item) => {
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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('~/../../assets/trash.png')}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>Thùng rác trống</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={() => onPressHandler(item)}
      >
        <View style={styles.itemThumbnail}>
          <ItemThumbnail item={item} />
        </View>
        <View style={styles.itemDetails}>
          <Text style={[styles.fileName, {color: colors.secondary}]}>{`${item.name}`}</Text>
          <Text style={{ fontSize: 10, color: colors.secondary }}>{`${bytesToMB(item.size)} MB`}</Text>
          <Text style={{ fontSize: 10, color: colors.secondary }}>{`${item.timeLeft} to delete`}</Text>
        </View>
      </TouchableOpacity>
      <Checkbox
          color={colors.primary}
          status={item.selected ? 'checked' : 'unchecked'}
          onPress={() => toggleSelectFile(item.path)}
          uncheckedColor={colors.primary}
        />
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={files.length === 0 ? styles.emptyList : null}
      />
      <View style={styles.btnContainer}>
        <Button
          title="Delete"
          disabled={files.filter((item) => item.selected === true).length <= 0}
          onPress={handleDeleteSelectedFiles}
        />
        <Button
          title="Recovery"
          disabled={files.filter((item) => item.selected === true).length <= 0}
          onPress={restoreSelectedFiles}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeLeft: {
    fontSize: 14,
    color: '#888',
  },
  fileSize: {
    marginRight: 10,
    fontSize: 14,
    color: '#444',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  btnContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  image: {
    margin: 1,
    width: 40,
    height: 50,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  itemThumbnail: {
    width: '18%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '82%',
    overflow: 'hidden',
  },
});

export default TrashScreen;
