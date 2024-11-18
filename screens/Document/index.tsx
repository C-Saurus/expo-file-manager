import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { fetchFiles } from '../../stores/document/action';
import { bytesToMB } from '../../utils/Filesize';
import { ReadDirItem } from 'react-native-fs';
import { ActivityIndicator } from 'react-native-paper';

export const DocumentScreen = () => {
  const dispatch = useAppDispatch();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { docFiles, txtFiles, csvExcelFiles, otherFiles, loading, error } =
    useAppSelector((state) => state.documentFile);
  const layout = useWindowDimensions();

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

//   const TabTxtFiles = () => (
//     <FlatList
//       data={txtFiles}
//       keyExtractor={(item) => item.path}
//       renderItem={renderFileItem}
//     />
//   );

//   const TabCsvExcelFiles = () => (
//     <FlatList
//       data={csvExcelFiles}
//       keyExtractor={(item) => item.path}
//       renderItem={renderFileItem}
//     />
//   );

//   const TabOtherFiles = () => (
//     <FlatList
//       data={otherFiles}
//       keyExtractor={(item) => item.path}
//       renderItem={renderFileItem}
//     />
//   );

  const renderScene = SceneMap({
    doc: TabDocFiles,
    // txt: TabTxtFiles,
    // csvExcel: TabCsvExcelFiles,
    // others: TabOtherFiles,
  });

  const [index, setIndex] = useState(0); // Tab index
  const [routes] = useState([
    { key: 'doc', title: 'DOC' },
    { key: 'txt', title: 'TXT' },
    { key: 'csvExcel', title: 'CSV/Excel' },
    { key: 'others', title: 'Others' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'blue' }}
      style={{ backgroundColor: 'white' }}
      activeColor="blue"
      inactiveColor="gray"
    />
  );

  if (loading) {
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <TabView
      lazy
      renderTabBar={renderTabBar}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
};

export async function getFilesByType(fileType) {
  const files = [];
  const directory = FileSystem.documentDirectory;

  const items = await FileSystem.readDirectoryAsync(directory);
  for (const item of items) {
    console.log('item', item);
    if (item.endsWith(fileType)) {
      const fileInfo = await FileSystem.getInfoAsync(directory + item);
      files.push({
        name: item,
        size: (fileInfo.size / 1024).toFixed(2) + ' KB', // Dung lượng file
        uri: fileInfo.uri,
        type: fileType,
      });
    }
  }
  return files;
}

const TabDocFiles = () => {
    const { docFiles, loading, error } =
    useAppSelector((state) => state.documentFile);
    const [selectedFiles, setSelectedFiles] = useState<ReadDirItem[]>([]);

    const toggleSelect = (item: ReadDirItem) => {
      const isSelected =
        selectedFiles.findIndex((file) => file.path === item.path) !== -1;
      if (!isSelected) {
        setSelectedFiles((prev) => [...prev, item]);
      } else {
        setSelectedFiles((prev) =>
          prev.filter((file) => file.path !== item.path)
        );
      }
    };

    const renderFileItemDoc = ({ item }) => (
      <TouchableOpacity
        style={styles.fileItem}
        onPress={() => toggleSelect(item.name)}
      >
        <Image
          source={require('~/../../assets/folder-thumbnails.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.fileName}>{item.name}</Text>
        <View style={styles.fileInfo}>
          <Text style={styles.fileSize}>{bytesToMB(item.size)} MB</Text>
          <Ionicons
            name={selectedFiles[item.path] ? 'checkbox' : 'checkbox-outline'}
            size={20}
            color="#000"
          />
        </View>
      </TouchableOpacity>
    );

    return (
      <FlatList
        data={docFiles}
        keyExtractor={(item) => item.path}
        renderItem={renderFileItemDoc}
      />
    );
  };

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  fileItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, marginRight: 10 },
  fileName: { flex: 1 },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileSize: { marginRight: 10 },
});
