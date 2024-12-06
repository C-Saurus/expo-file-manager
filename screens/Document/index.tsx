import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { FlatList } from 'react-native-gesture-handler';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { fetchFiles, removeFileToTrash, renameFiles } from '../../stores/document/action';
import { ReadDirItem } from 'react-native-fs';
import { ActivityIndicator } from 'react-native-paper';
import FileItemCommon from '../../components/Browser/Files/FileItemCommon';
import {
  setSnack,
  snackActionPayload,
} from '../../features/files/snackbarSlice';
import useNewSelectionChange from '../../hooks/newUseSelectedChange';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { DownloadDialog } from '../../components/Browser/DownloadDialog';
import Dialog from 'react-native-dialog';
import axios, { AxiosError } from 'axios';
import moment from 'moment';
import * as mime from 'react-native-mime-types';
import { TRASH_FOLDER } from '../../utils/Constants';
import RNFS from 'react-native-fs';

export const DocumentScreen = ({ navigation  }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false)
  const [selectAll, setSelectAll] = useState(false);
  const [sortType, setSortType] = useState(0);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { docFiles, txtFiles, csvExcelFiles, otherFiles, loading, error } =
    useAppSelector((state) => state.documentFile);
  const layout = useWindowDimensions();

  const handleChooseOption = () => {
    setOpenOption(!openOption)
  }

  useEffect(() => {
    // Cập nhật headerRight khi màn hình này được render
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleChooseOption} >
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {
        marginRight: 15,
      },
    });
  }, [navigation, openOption]);

  useEffect(() => {
    if (hasFetchFile.current) return;
    if (!docFiles.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, docFiles]);

  const renderScene = SceneMap({
    doc: () => <TabDocFiles data={docFiles} selectAll={selectAll} sortType={sortType} />,
    txt: () => <TabDocFiles data={txtFiles} selectAll={selectAll} sortType={sortType} />,
    csvExcel: () => <TabDocFiles data={csvExcelFiles} selectAll={selectAll} sortType={sortType} />,
    others: () => <TabDocFiles data={otherFiles} selectAll={selectAll} sortType={sortType} />,
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
    <>
    <TabView
      lazy={true}
      lazyPreloadDistance={1}
      renderTabBar={renderTabBar}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
    <Modal
    animationType="fade"
    transparent={true}
    visible={openOption}
    onRequestClose={() => setOpenOption(false)}
  >
    <Pressable
      style={styles.overlay}
      onPress={() => setOpenOption(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalItem} onPress={() => setSortType(1)}>
          <Text style={styles.modalText}>Sắp xếp theo tên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalItem} onPress={() => setSortType(2)}>
          <Text style={styles.modalText}>Sắp xếp theo dung lượng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalItem} onPress={() => setSortType(3)}>
          <Text style={styles.modalText}>Sắp xếp theo thời gian tạo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalItem}
          onPress={() => setSelectAll(!selectAll)}
        >
          <View style={styles.checkboxContainer}>
            <Ionicons
              name={
                selectAll ? 'checkbox-outline' : 'square-outline'
              }
              size={20}
              color="#fff"
            />
            <Text style={styles.modalText}>Chọn tất cả</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Modal></>
    
  );
};

type TabDocFilesProps = {
  data: ReadDirItem[]; // Mảng các object với thuộc tính 'name'
  selectAll: boolean;      // Trạng thái Select All
  sortType: number;        // Loại sắp xếp
};

const TabDocFiles: React.FC<TabDocFilesProps> = React.memo(({ data, selectAll, sortType }) => {
  const { loading, error } = useAppSelector(
    (state) => state.documentFile
  );
  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<ReadDirItem[]>([]);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingFile, setRenamingFile] = useState<ReadDirItem>();
  const [destinationDialogVisible, setDestinationDialogVisible] =
    useState(false);
  const [moveOrCopy, setMoveOrCopy] = useState('');
  const { multiSelect, allSelected } = useNewSelectionChange(
    data,
    selectedFiles
  );
  const [moveDir, setMoveDir] = useState('');
  const [initialSelectionDone, setInitialSelectionDone] = useState(false);
  const renameInputRef = useRef<TextInput>(null);

  const handleSetSnack = (data: snackActionPayload) => {
    dispatch(setSnack(data));
  };

  const deleteSelectedFiles = async (file?: ReadDirItem) => {
    const filestoBeDeleted = file ? [file] : selectedFiles;

    if (!filestoBeDeleted.length) {
      console.warn('Không có file nào được chọn để xóa');
      return false;
    }

    dispatch(removeFileToTrash({filestoBeDeleted, fileType: 'docx'}))
    setSelectedFiles([]);
    try {
      handleSetSnack({
        message: 'Files deleted!',
      });

      
      return true;
    } catch (error) {
      console.error('Lỗi khi di chuyển file:', error);
      handleSetSnack({
        message: 'Failed to delete files!',
        label: 'error',
      });
      return false;
    }
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
        label: 'error'
      });
    }
  }, [error]);

  const onRename = async () => {
    const directoryPath = renamingFile.path.substring(
      0,
      renamingFile.path.lastIndexOf('/')
    );
    const newPath = `${directoryPath}/${newFileName}`;
    dispatch(renameFiles({ oldPath: renamingFile.path, newPath }));
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
        data={data}
        keyExtractor={(item) => item.path}
        renderItem={renderFileItemDoc}
        initialNumToRender={10} // Render một số lượng item ban đầu
        windowSize={5}
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
    </View>
  );
});

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
  menuButton: {
    marginRight: 10,
  },
  overlay: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 10, // Điều chỉnh vị trí modal so với nút header
    right: 35,
    backgroundColor: '#fff', // Màu nền modal
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5, // Tạo bóng mờ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c7cecfdd', // Đường kẻ giữa các mục
  },
  modalText: {
    fontSize: 16,
    color: '#000', // Màu chữ trắng
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
