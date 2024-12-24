import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  Permission,
  NativeModules,
  Image,
} from 'react-native';
import RNFS, { hash } from 'react-native-fs';
import { styles } from './style';
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { FileItem } from '../../constants/interface';
import { bytesToMB } from '../../utils/Filesize';
import { getCategoryByExtension } from '../../utils/getFileByCategory';
import { useAppSelector } from '../../hooks/reduxHooks';

const getFileExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop();
  return getCategoryByExtension(ext);
};

const LargeFilesScanner = ({ route, navigation }) => {
  const { mode } = route.params;
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [largeFiles, setLargeFiles] = useState<FileItem[]>([]);
  const [duplicateFiles, setDuplicateFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    console.log('mode', mode);
    try {
      startScanning();
    } catch (error) {
      console.log('Scanning Error', error);
    }
    return () => {
      setDuplicateFiles([]);
      setSelectedFiles([]);
      setLargeFiles([]);
    };
  }, [mode]);

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
          if (stats && stats?.size >= 50 * 1024 * 1024) {
            // 50MB
            setLargeFiles((prev) => [
              ...prev,
              { name: item.name, size: stats.size, path: item.path },
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
    let files: FileItem[] = [];

    for (const item of items) {
      if (item.isFile()) {
        const file: FileItem = {
          name: item.name,
          size: item.size,
          path: item.path,
          type: getFileExtension(item.name),
        };
        files.push(file);
      } else if (item.isDirectory()) {
        // Đệ quy quét thư mục con
        const subFiles = await scanAllFiles(item.path);
        files = [...files, ...subFiles];
      }
    }
    return files;
  };

  const scanDuplicateFiles = async (): Promise<void> => {
    const allFiles = await scanAllFiles(RNFS.ExternalDirectoryPath);
    const fileMap: { [key: string]: FileItem[] } = {};

    for (const file of allFiles) {
      const key = `${file.type}-${file.size}`; // Tạo key dựa trên loại và kích thước

      if (!fileMap[key]) {
        fileMap[key] = [];
      }
      fileMap[key].push(file);
    }

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
      case 1:
        largeFiles.sort((a, b) => b.size - a.size);
        return largeFiles;
      case 2:
        return duplicateFiles;
      default:
        return largeFiles;
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

  const handleSelectFile = (file: FileItem) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter((f) => f !== file));
    } else {
      setSelectedFiles([...selectedFiles, file]);
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
            await Promise.all(
              selectedFiles.map(async (file) => {
                try {
                  const result = await FileDeletionNativeModule.deleteMediaFile(
                    file.path,
                    (res: any) => {
                      console.log('res', res);
                    }
                  );
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

            const updatedLargeFiles = largeFiles.filter(
              (file) =>
                !selectedFiles.some(
                  (selectedFile) => selectedFile.path === file.path
                )
            );

            setLargeFiles(updatedLargeFiles);
            setSelectedFiles([]);

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

  const ItemThumbnail = (item) => {
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
    <View style={styles.container}>
      <FlatList
        data={sortedFiles()}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Checkbox
              status={!!selectedFiles.includes(item) ? 'checked' : 'unchecked'}
              onPress={() => handleSelectFile(item)}
            />
            <TouchableOpacity onPress={() => onPressHandler(item)}>
              <View style={styles.itemThumbnail}>
                <ItemThumbnail item={item} />
              </View>
              <Text style={styles.fileName}>{`${item.name} - ${bytesToMB(
                item.size
              )} MB`}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={renderEmptyComponent}
      />
      <Button
        title="Xóa các tệp đã chọn"
        disabled={selectedFiles.length <= 0}
        onPress={handleDeleteSelectedFiles}
      />
    </View>
  );
};

export default LargeFilesScanner;
