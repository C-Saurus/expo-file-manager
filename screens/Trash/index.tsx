import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import RNFS from 'react-native-fs';
import { cleanOldFiles, ensureTrashFolderExists, restoreFile, TRASH_FOLDER } from '../../utils/Constants';
import { Checkbox } from 'react-native-paper';
import { setSnack, snackActionPayload } from '../../features/files/snackbarSlice';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { bytesToGB } from '../../utils/Filesize';

const TrashScreen = () => {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    const loadTrashFiles = async () => {
      try {
        await ensureTrashFolderExists()
        await cleanOldFiles();
        const trashFiles = await RNFS.readDir(TRASH_FOLDER);
        console.log("trashFiles", trashFiles)
        setFiles(trashFiles.map((file) => ({
          path: file.path,
          name: file.name,
          size: bytesToGB(file.size),
          timeLeft: calculateDaysLeft(file.mtime),
        })));
      } catch (error) {
        console.error("[ERROR] failed to load trash folder", error)
      }
    };
    loadTrashFiles();
  }, []);

  const calculateDaysLeft = (mtime) => {
    const days = Math.max(30 - Math.floor((Date.now() - new Date(mtime).getTime()) / (24 * 60 * 60 * 1000)), 0);
    return `${days} ngày còn lại`;
  };

  const toggleSelectFile = (path) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleSetSnack = (data: snackActionPayload) => {
    dispatch(setSnack(data));
  };

  const restoreSelectedFiles = async (selectedFileNames) => {
    try {
      const promises = selectedFileNames.map((fileName) => restoreFile(fileName));
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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image source={require('~/../../assets/trash.jpg')} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Thùng rác trống</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={require('~/../../assets/trash.jpg')} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.timeLeft}>{item.timeLeft}</Text>
      </View>
      <Text style={styles.fileSize}>{item.size}</Text>
      <Checkbox
        status={!!selectedFiles[item.path] ? 'checked': 'unchecked'}
        onPress={() => toggleSelectFile(item.path)}
      />
    </View>
  );

  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.path}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={files.length === 0 ? styles.emptyList : null}
    />
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
});

export default TrashScreen;
