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
  const selectedFile = useRef<FileItem[]>([]);

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
          size: file.size,
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
    if (selectedFile.current.includes(file)) {
      selectedFile.current = selectedFile.current.filter(
        (f) => f.path !== file.path
      );
    } else {
      selectedFile.current.push(file);
    }
    console.log('selectedFile.current', selectedFile.current);
    if (selectedFile.current.length > 0) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, []);

  const restoreSelectedFiles = async () => {
    Alert.alert('Recovery', 'Recovery selected file ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Recovery',
        onPress: async () => {
          try {
            const promises = selectedFile.current.map(
              async (file) => await restoreFile(file.path)
            );
            await Promise.all(promises);
            Alert.alert('Success', 'Recovery file success !');
            loadTrashFiles();
          } catch (error) {
            console.error('Lỗi khi khôi phục nhiều file:', error);
            Alert.alert(
              'Error',
              'Failed to recovery selected files !: ' + error.message
            );
          }
        },
      },
    ]);
  };

  const handleDeleteSelectedFiles = async (): Promise<void> => {
    Alert.alert('Delete permanantly', 'Selected file will be remove ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          selectedFile.current.forEach(async (file) => {
            RNFS.exists(file.path)
              .then((result) => {
                console.log('file exists: ', result);
                if (result) {
                  return RNFS.unlink(file.path)
                    .then(() => {
                      Alert.alert('Success', 'File deleted.');
                      loadTrashFiles();
                    })
                    .catch((err) => {
                      Alert.alert(
                        'Error',
                        'File deleted error: ' + err.message
                      );
                    });
                }
              })
              .catch((err) => {
                Alert.alert('Error', 'File deleted error: ' + err.message);
              });
          });
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
