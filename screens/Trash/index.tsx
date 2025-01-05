import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Button,
  Alert,
  NativeModules,
} from 'react-native';
import RNFS from 'react-native-fs';
import {
  cleanOldFiles,
  ensureTrashFolderExists,
  restoreFile,
  TRASH_FOLDER,
} from '../../utils/Constants';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { bytesToGB } from '../../utils/Filesize';
import { getCategoryByExtension } from '../../utils/getFileByCategory';
import { Item } from './item';
import { FileItem } from '../../constants/interface';
import { styles } from './style';
import Toast from 'react-native-toast-message';

const getFileExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop();
  return getCategoryByExtension(ext);
};

const TrashScreen = () => {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState<boolean>(false);
  const selectedFile = useRef<string[]>([]);

  const { colors } = useAppSelector((state) => state.theme.theme);
  const loadTrashFiles = async () => {
    try {
      await ensureTrashFolderExists();
      await cleanOldFiles();
      const trashFiles = await RNFS.readDir(TRASH_FOLDER);
      console.log('trashFiles', trashFiles);
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
  useEffect(() => {
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

  const handleSelectFile = useCallback((file: FileItem) => {
    if (selectedFile.current.includes(file.path)) {
      selectedFile.current = selectedFile.current.filter(
        (f) => f !== file.path
      );
    } else {
      selectedFile.current.push(file.path);
    }
    console.log('selectedFile.current', selectedFile.current);
    if (selectedFile.current.length > 0) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, []);

  const restoreSelectedFiles = async (selectedFileNames) => {
    try {
      const promises = selectedFileNames.map(async (fileName) =>
        await restoreFile(fileName)
      );
      await Promise.all(promises);
      Toast.show({
        text1: 'Delete selected files success!',
        type: 'info'
      })
      loadTrashFiles()
    } catch (error) {
      console.error('Lỗi khi khôi phục nhiều file:', error);
      Toast.show({
        text1: 'Failed to restore selected files!',
        type: 'info'
      })
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
                  console.log('DELETE TRASH', file.path);
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
            loadTrashFiles()
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa các tệp: ' + error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Item item={item} handleSelectFile={handleSelectFile} />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require('~/../../assets/trash.png')}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>Thùng rác trống</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background2 }]}>
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
          disabled={!selected}
          onPress={handleDeleteSelectedFiles}
        />
        <Button
          title="Recovery"
          disabled={!selected}
          onPress={restoreSelectedFiles}
        />
      </View>
    </View>
  );
};

export default TrashScreen;
