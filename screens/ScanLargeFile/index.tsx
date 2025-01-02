import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Button,
  NativeModules,
  Image,
} from 'react-native';
import RNFS, { hash } from 'react-native-fs';
import { styles } from './style';
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { FileItem } from '../../constants/interface';
import { bytesToMB } from '../../utils/Filesize';
import { getCategoryByExtension } from '../../utils/getFileByCategory';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Item } from './item';

const getFileExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop();
  return getCategoryByExtension(ext);
};

const LargeFilesScanner = ({ route, navigation }) => {
  const { mode } = route.params;
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [largeFiles, setLargeFiles] = useState<FileItem[]>([]);
  const [duplicateFiles, setDuplicateFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState(false);
  const selectedFile = useRef<string[]>([]);

  useEffect(() => {
    try {
      startScanning();
    } catch (error) {
      console.log('Scanning Error', error);
    }
    return () => {
      setDuplicateFiles([]);
      setLargeFiles([]);
      selectedFile.current = [];
    };
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    switch (mode) {
      case 0:
        await scanLargeFiles(RNFS.ExternalStorageDirectoryPath);
        break;
      case 1:
        await scanDuplicateFiles();
        break;
      default:
        break;
    }
    setIsScanning(false);
  };

  const scanLargeFiles = async (path: string) => {
    try {
      if (path.includes('/Android/data') || path.includes('/Android/obb')) {
        console.warn(`Skipping restricted directory: ${path}`);
        return;
      }

      const items = await RNFS.readDir(path);
      for (const item of items) {
        if (item.isFile()) {
          const stats = await RNFS.stat(item?.path);
          if (stats && stats?.size >= 1024 * 1024) {
            // 50MB
            setLargeFiles((prev) => [
              ...prev,
              {
                name: item.name,
                size: item.size,
                path: item.path,
                type: getFileExtension(item.name),
              },
            ]);
          }
        } else if (item.isDirectory()) {
          await scanLargeFiles(item.path);
        }
      }
    } catch (error) {
      console.error(`Error reading ${path}: ${error.message}`);
    }
  };

  const scanAllFiles = async (dirPath: string): Promise<FileItem[]> => {
    const items = await RNFS.readDir(dirPath);
    if (dirPath.includes('/Android/data') || dirPath.includes('/Android/obb')) {
      console.warn(`Skipping restricted directory: ${dirPath}`);
      return [];
    }
    if (!items.length) {
      return [];
    }
    let files: FileItem[] = [];
    for (const item of items) {
      if (item.isFile()) {
        const file: FileItem = {
          name: item.name,
          size: item.size,
          path: item.path,
          type: getFileExtension(item.name),
        };
        console.log('file', file);
        files.push(file);
      } else if (item.isDirectory()) {
        console.log('xxx');
        const subFiles = await scanAllFiles(item.path);
        files = [...files, ...subFiles];
      }
    }
    return files;
  };

  const scanDuplicateFiles = async (): Promise<void> => {
    const allFiles = await scanAllFiles(RNFS.ExternalStorageDirectoryPath);
    console.log('allFiles', allFiles);
    const fileMap: { [key: string]: FileItem[] } = {};
    for (const file of allFiles) {
      const key = `${file.type}`; // Tạo key dựa trên loại và kích thước

      if (!fileMap[key]) {
        fileMap[key] = [];
      }
      fileMap[key].push(file);
    }
    console.log('scanDuplicateFiles', fileMap);
    // So sánh các file cùng loại và cùng kích thước
    const duplicates: FileItem[] = [];
    for (const files of Object.values(fileMap)) {
      if (files?.length > 1) {
        const hashPromises = files.map(async (file) => {
          const fileHash = await hash(file.path, 'md5'); // Tính hash file
          return { ...file, hash: fileHash };
        });

        const hashedFiles = await Promise.all(hashPromises);
        const hashMap: { [key: string]: FileItem[] } = {};

        for (const hashedFile of hashedFiles) {
          if (!hashMap[hashedFile.hash]) {
            hashMap[hashedFile.hash] = [];
          }
          hashMap[hashedFile.hash].push(hashedFile);
        }

        // Thêm vào danh sách trùng lặp
        for (const files of Object.values(hashMap)) {
          if (files?.length > 1) {
            duplicates.push(...files);
          }
        }
      }
    }

    setDuplicateFiles(duplicates);
    setIsScanning(false);
  };

  const sortedFiles = () => {
    switch (mode) {
      case 0:
        largeFiles.sort((a, b) => b.size - a.size);
        return largeFiles;
      case 1:
        return duplicateFiles;
      default:
        return largeFiles;
    }
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

  const handleDeleteSelectedFiles = async (): Promise<void> => {
    Alert.alert('Xóa tệp tin', 'Bạn có chắc chắn muốn xóa các tệp đã chọn?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            console.log('listtttttttttttt', selectedFile.current);
            const { FileDeletionNativeModule } = NativeModules;
            await Promise.all(
              selectedFile.current.map(async (file) => {
                try {
                  const result = await FileDeletionNativeModule.deleteMediaFile(
                    file,
                    (res: any) => {
                      console.log('res FileDeletionNativeModule', res);
                    }
                  );
                  console.log(
                    `Deleted successfully: ${file} with result: ${result}`
                  );
                  if (result) {
                    Alert.alert('Thành công', 'Các tệp đã được xóa.');
                  } else {
                    Alert.alert('Lỗi', 'Không thể xóa các tệp');
                  }
                } catch (error) {
                  console.error(`Failed to delete: ${file} - ${error.message}`);
                }
              })
            );

            const updatedLargeFiles = largeFiles.filter(
              (file) =>
                !selectedFile.current.some(
                  (selectedFilePath) => selectedFilePath === file.path
                )
            );

            setLargeFiles(updatedLargeFiles);
            selectedFile.current = [];

            Alert.alert('Thành công', 'Các tệp đã được xóa.');
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

  if (isScanning) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang dọn dẹp...</Text>
      </View>
    );
  }

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="folder-open" size={64} color="gray" />
      <Text style={styles.emptyText}>
        Không tìm file {mode === 0 ? 'lớn hơn 50MB' : 'trùng lặp'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sortedFiles()}
        keyExtractor={(item) => item.path}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
      />
      <Button
        title="Xóa các tệp đã chọn"
        disabled={!selected}
        onPress={handleDeleteSelectedFiles}
      />
    </View>
  );
};

export default LargeFilesScanner;
