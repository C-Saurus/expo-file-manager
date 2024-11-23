import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { fetchFiles, renameFiles } from '../../stores/document/action';
import { bytesToMB } from '../../utils/Filesize';
import { ReadDirItem } from 'react-native-fs';
import { ActivityIndicator } from 'react-native-paper';
import FileItemCommon from '../../components/Browser/Files/FileItemCommon';
import { setSnack, snackActionPayload } from '../../features/files/snackbarSlice';
import useSelectionChange from '../../hooks/useSelectionChange';
import useNewSelectionChange from '../../hooks/newUseSelectedChange';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { DownloadDialog } from '../../components/Browser/DownloadDialog';
import { NewFolderDialog } from '../../components/Browser/NewFolderDialog';
import { FileTransferDialog } from '../../components/Browser/FileTransferDialog';
import Dialog from 'react-native-dialog';
import axios, { AxiosError } from 'axios';
import moment from 'moment';
import * as mime from 'react-native-mime-types';

export const DocumentScreen = () => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false)
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { docFiles, txtFiles, csvExcelFiles, otherFiles, loading, error } =
    useAppSelector((state) => state.documentFile);
  const layout = useWindowDimensions();

  useEffect(() => {
    if (hasFetchFile.current) return
    if (!docFiles.length && !hasFetchFile.current) {
        dispatch(fetchFiles());
        hasFetchFile.current = true
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
    const [moveDir, setMoveDir] = useState('');
    const [folderDialogVisible, setFolderDialogVisible] = useState(false);
    const [downloadDialogVisible, setDownloadDialogVisible] = useState(false);
    const renameInputRef = useRef<TextInput>(null);
    const [multiImageVisible, setMultiImageVisible] = useState(false);
    const [importProgressVisible, setImportProgressVisible] = useState(false);
    const [newFileActionSheet, setNewFileActionSheet] = useState(false);
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

    const [initialSelectionDone, setInitialSelectionDone] = useState(false);

    useEffect(() => {
      if (renameDialogVisible && Platform.OS === 'android') {
        setTimeout(() => {
          renameInputRef.current?.focus();
        }, 100);
      }
      if (!renameDialogVisible)
        setTimeout(() => {
          setInitialSelectionDone(false);
        }, 500);
    }, [renameDialogVisible]);

    useEffect(() => {
      if (error) {
        handleSetSnack({
          message: `Error ${error}`,
        })
      }
    }, [error])

    const onRename = async () => {
      const directoryPath = renamingFile.path.substring(
        0,
        renamingFile.path.lastIndexOf('/')
      );
      const newPath = `${directoryPath}/${newFileName}`;
      dispatch(renameFiles({ oldPath: renamingFile.path, newPath }));
    };

    const handleDownload = (downloadUrl: string) => {
      axios
        .get(downloadUrl)
        .then((res) => {
          const fileExt = mime.extension(res.headers['content-type']);
          FileSystem.downloadAsync(
            downloadUrl,
            '/DL_' + moment().format('DDMMYHmmss') + '.' + fileExt
          )
            .then(() => {
              setDownloadDialogVisible(false);
              handleSetSnack({
                message: 'Download complete',
              });
            })
            .catch((_) => {
              handleSetSnack({
                message: 'Please provide a correct url',
              });
            });
        })
        .catch((error: AxiosError) =>
          handleSetSnack({
            message: error.message,
          })
        );
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

    const renderEmptyComponent = () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="folder-open" size={64} color="gray" />
        <Text style={styles.emptyText}>Document file do not exist</Text>
      </View>
    );

    return (
      <View style={{ backgroundColor: 'white' }}>
        <FlatList
        data={docFiles}
        keyExtractor={(item) => item.path}
        renderItem={renderFileItemDoc}
        ListEmptyComponent={renderEmptyComponent}
      />
      {/* <FileTransferDialog
        isVisible={destinationDialogVisible}
        setIsVisible={setDestinationDialogVisible}
        moveDir={moveDir}
        setMoveDir={setMoveDir}
        moveSelectedFiles={moveSelectedFiles}
        moveOrCopy={moveOrCopy}
        setMoveOrCopy={setMoveOrCopy}
      /> */}
      {/* <NewFolderDialog
        visible={folderDialogVisible}
        createDirectory={createDirectory}
        setFolderDialogVisible={setFolderDialogVisible}
      /> */}
      <DownloadDialog
        visible={downloadDialogVisible}
        handleDownload={handleDownload}
        setDownloadDialog={setDownloadDialogVisible}
      />
      <Dialog.Container visible={renameDialogVisible}>
        <Dialog.Title style={{ color: 'black' }}>Rename file</Dialog.Title>
        <Dialog.Input
          textInputRef={renameInputRef}
          value={decodeURI(newFileName)}
          onChangeText={(text) => {
            setNewFileName(text);
          }}
          onKeyPress={() => {
            setInitialSelectionDone(true);
          }}
          selection={
            !initialSelectionDone
              ? { start: 0, end: decodeURI(newFileName).split('.')[0].length }
              : undefined
          }
          style={{ color: 'black' }}
        ></Dialog.Input>
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setRenameDialogVisible(false);
          }}
        />
        <Dialog.Button label="Rename" onPress={() => onRename()} />
      </Dialog.Container>

      <ProgressDialog
        visible={importProgressVisible}
        title="Importing Assets"
        message="Please, wait..."
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
});
