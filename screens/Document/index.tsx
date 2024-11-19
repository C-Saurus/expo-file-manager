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
import FileItemCommon from '../../components/Browser/Files/FileItemCommon';
import { setSnack, snackActionPayload } from '../../features/files/snackbarSlice';
import useSelectionChange from '../../hooks/useSelectionChange';
import useNewSelectionChange from '../../hooks/newUseSelectedChange';

export const DocumentScreen = () => {
  const dispatch = useAppDispatch();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { docFiles, txtFiles, csvExcelFiles, otherFiles, loading, error } =
    useAppSelector((state) => state.documentFile);
  const layout = useWindowDimensions();

  useEffect(() => {
    if (!docFiles.length) {
        dispatch(fetchFiles());
    }
  }, [dispatch, docFiles]);

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
    txt: TabTxtFiles,
    // csvExcel: TabCsvExcelFiles,
    // others: TabOtherFiles,
  });

  const [index, setIndex] = useState(0); // Tab index
  const [routes] = useState([
    { key: 'doc', title: 'DOC' },
    { key: 'txt', title: 'TXT' },
    // { key: 'csvExcel', title: 'CSV/Excel' },
    // { key: 'others', title: 'Others' },
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
    const dispatch = useAppDispatch()
    const [selectedFiles, setSelectedFiles] = useState<ReadDirItem[]>([]);
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [renamingFile, setRenamingFile] = useState<ReadDirItem>();
    const [destinationDialogVisible, setDestinationDialogVisible] =
      useState(false);
    const [moveOrCopy, setMoveOrCopy] = useState('');
    const { multiSelect, allSelected } = useNewSelectionChange(docFiles, selectedFiles);

    const handleSetSnack = (data: snackActionPayload) => {
        dispatch(setSnack(data));
      };

    const deleteSelectedFiles = async (file?: ReadDirItem) => {
        const filestoBeDeleted = file ? [file] : selectedFiles;
        // const deleteProms = filestoBeDeleted.map((file) =>
        //   FileSystem.deleteAsync(file.path)
        // );
        // Promise.all(deleteProms)
        //   .then((_) => {
        //     handleSetSnack({
        //       message: 'Files deleted!',
        //     });
        //     setSelectedFiles([]);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      };

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
        <FileItemCommon
        item={item}
        toggleSelect={toggleSelect}
        multiSelect={multiSelect}
        setTransferDialog={setDestinationDialogVisible}
        setMoveOrCopy={setMoveOrCopy}
        deleteSelectedFiles={deleteSelectedFiles}
        setRenamingFile={setRenamingFile}
        setRenameDialogVisible={setRenameDialogVisible}
        setNewFileName={setNewFileName}
      ></FileItemCommon>
    );

    return (
      <View style={{ backgroundColor: 'white' }}>
        <FlatList
        data={docFiles}
        keyExtractor={(item) => item.path}
        renderItem={renderFileItemDoc}
      />
      </View>
    );
  };

  const TabTxtFiles = () => {
    const { txtFiles, loading, error } =
    useAppSelector((state) => state.documentFile);
    const dispatch = useAppDispatch()
    const [selectedFiles, setSelectedFiles] = useState<ReadDirItem[]>([]);
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [renamingFile, setRenamingFile] = useState<ReadDirItem>();
    const [destinationDialogVisible, setDestinationDialogVisible] =
      useState(false);
    const [moveOrCopy, setMoveOrCopy] = useState('');
    const { multiSelect, allSelected } = useNewSelectionChange(txtFiles, selectedFiles);

    const handleSetSnack = (data: snackActionPayload) => {
        dispatch(setSnack(data));
      };

    const deleteSelectedFiles = async (file?: ReadDirItem) => {
        const filestoBeDeleted = file ? [file] : selectedFiles;
        // const deleteProms = filestoBeDeleted.map((file) =>
        //   FileSystem.deleteAsync(file.path)
        // );
        // Promise.all(deleteProms)
        //   .then((_) => {
        //     handleSetSnack({
        //       message: 'Files deleted!',
        //     });
        //     setSelectedFiles([]);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      };

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
        <FileItemCommon
        item={item}
        toggleSelect={toggleSelect}
        multiSelect={multiSelect}
        setTransferDialog={setDestinationDialogVisible}
        setMoveOrCopy={setMoveOrCopy}
        deleteSelectedFiles={deleteSelectedFiles}
        setRenamingFile={setRenamingFile}
        setRenameDialogVisible={setRenameDialogVisible}
        setNewFileName={setNewFileName}
      ></FileItemCommon>
    );

    return (
      <View style={{ backgroundColor: 'white' }}>
        <FlatList
        data={txtFiles}
        keyExtractor={(item) => item.path}
        renderItem={renderFileItemDoc}
      />
      </View>
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
