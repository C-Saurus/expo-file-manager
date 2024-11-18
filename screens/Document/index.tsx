import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useAppSelector } from "../../hooks/reduxHooks";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';

export const DocumentScreen = () => {
    const { colors } = useAppSelector((state) => state.theme.theme);
    const renderScene = SceneMap({
      first: TabDocFiles,
    });
    const layout = useWindowDimensions();
  
    const [index, setIndex] = useState(0);
    const [routes] = useState([
      { key: 'first', title: 'All' },
    ]);
  
    const renderTabBar = (props) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: 'blue' }}
        style={{ backgroundColor: 'white' }}
        activeColor="blue"
      />
    );
  
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
        console.log("item", item)
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

export default function TabDocFiles() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      const docFiles = await getFilesByType('.xml');
      console.log("docFiles", docFiles)
      setFiles(docFiles);
    };
    fetchFiles();
  }, []);

  const toggleSelect = (fileName) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  const renderFileItem = ({ item }) => (
    <TouchableOpacity style={styles.fileItem} onPress={() => toggleSelect(item.name)}>
      <Image source={require('~/../../assets/folder-thumbnails.jpg')} style={styles.avatar} />
      <Text style={styles.fileName}>{item.name}</Text>
      <View style={styles.fileInfo}>
        <Text style={styles.fileSize}>{item.size}</Text>
        <Ionicons
          name={selectedFiles[item.name] ? 'checkbox' : 'checkbox-outline'}
          size={20}
          color="#000"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.uri}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  fileItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, marginRight: 10 },
  fileName: { flex: 1 },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileSize: { marginRight: 10 },
});
