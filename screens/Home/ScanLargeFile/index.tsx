import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Button } from 'react-native';
import RNFS, { hash } from 'react-native-fs';
import { styles } from './style';
import { bytesToMB } from '../../../utils/Filesize';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { FileItem } from '../../../constants/interface';

const getFileExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop(); // Tách phần mở rộng
  return ext ? ext.toLowerCase() : ''; // Đảm bảo phần mở rộng là chữ thường
};

const LargeFilesScanner = ({ route, navigation }) => {
  const { mode } = route.params;
  const [largeFiles, setLargeFiles] = useState<FileItem[]>([]);
  const [duplicateFiles, setDuplicateFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    startScanning()
  }, [mode]);

  const startScanning = async () => {
    switch (mode) {
      case '1':
        await scanLargeFiles(RNFS.ExternalStorageDirectoryPath);
        break;
      case '2':
        await scanDuplicateFiles();
        break;
      default:
        break
    }
    setIsScanning(false);
  };

  const scanLargeFiles = async (path: string) => {
    try {
      const items = await RNFS.readDir(path);
      for (const item of items) {
        if (item.isFile()) {
          const stats = await RNFS.stat(item.path);
          if (stats.size >= 50 * 1024 * 1024) { // 50MB
            setLargeFiles(prev => [
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
          type: getFileExtension(item.name)
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
      if (files.length > 1) {
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
          if (files.length > 1) {
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
        return largeFiles
      case 2:
        return duplicateFiles
      default:
        return largeFiles
    }
  }

  const handleSelectFile = (file: FileItem) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter((f) => f !== file));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleDeleteSelectedFiles = async (): Promise<void> => {
    Alert.alert(
      'Xóa tệp tin',
      'Bạn có chắc chắn muốn xóa các tệp đã chọn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          onPress: async () => {
            try {
              await Promise.all(selectedFiles.map(async (file) => {
                await RNFS.unlink(file.path); // Xóa file bằng RNFS
              }));
              setLargeFiles(largeFiles.filter(file => !selectedFiles.includes(file)));
              setSelectedFiles([]);
              Alert.alert('Thành công', 'Các tệp đã được xóa.');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa các tệp: ' + error.message);
            }
          }
        },
      ]
    );
  };

  if (isScanning) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang dọn dẹp...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Tệp tin lớn hơn 50MB</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedFiles()}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Checkbox
              status={!!selectedFiles.includes(item) ? 'checked' : 'unchecked'}
              onPress={() => handleSelectFile(item)}
            />
            <Text style={styles.fileName}>{`${item.name} - ${bytesToMB(item.size)} MB`}</Text>
          </View>
        )}
      />
      <Button title="Xóa các tệp đã chọn" disabled={selectedFiles.length <= 0} onPress={handleDeleteSelectedFiles} />
    </View>
  );
};

export default LargeFilesScanner;